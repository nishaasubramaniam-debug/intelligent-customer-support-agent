import io
import re
from html.parser import HTMLParser
from pathlib import Path
import httpx
import pypdf
from langchain_core.documents import Document

try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma

from app.core.config import settings


BASE_DIR = Path(__file__).resolve().parent.parent.parent
KNOWLEDGE_BASE_PATH = BASE_DIR / "knowledge_base"
KNOWLEDGE_BASE_PATH.mkdir(parents=True, exist_ok=True)

# Singleton Caches
_embeddings_instance = None
_vector_store_instance = None


class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed = []
        self.ignore_tags = {"script", "style", "head", "meta", "noscript", "svg", "link"}
        self.current_tag = None

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag.lower()

    def handle_data(self, d):
        if self.current_tag not in self.ignore_tags:
            text = d.strip()
            if text:
                self.fed.append(text)

    def get_data(self):
        return " ".join(self.fed)


def extract_text_from_pdf(file_path_or_bytes) -> str:
    """Extract text from a PDF file path or raw PDF bytes."""
    if isinstance(file_path_or_bytes, (str, Path)):
        reader = pypdf.PdfReader(str(file_path_or_bytes))
    else:
        reader = pypdf.PdfReader(io.BytesIO(file_path_or_bytes))

    extracted_pages = []
    for idx, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            extracted_pages.append(text.strip())
    return "\n\n".join(extracted_pages)


def scrape_url_to_text(url: str) -> dict:
    """Fetch content from a webpage URL and extract cleaned text."""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    }
    with httpx.Client(timeout=15.0, follow_redirects=True) as client:
        response = client.get(url, headers=headers)
        response.raise_for_status()
        html_content = response.text

    title_match = re.search(r"<title>(.*?)</title>", html_content, re.IGNORECASE | re.DOTALL)
    raw_title = title_match.group(1).strip() if title_match else url

    parser = HTMLTextExtractor()
    parser.feed(html_content)
    raw_extracted = parser.get_data()

    clean_text = re.sub(r"\s+", " ", raw_extracted).strip()

    return {
        "url": url,
        "title": raw_title,
        "content": clean_text
    }


def load_documents():
    """Load and parse .txt, .md, and .pdf documents from the knowledge_base directory."""
    documents = []
    if KNOWLEDGE_BASE_PATH.exists():
        for file_path in KNOWLEDGE_BASE_PATH.iterdir():
            if not file_path.is_file():
                continue
            ext = file_path.suffix.lower()
            if ext in [".txt", ".md"]:
                try:
                    text = file_path.read_text(encoding="utf-8")
                    documents.append(
                        Document(
                            page_content=text,
                            metadata={
                                "source": file_path.name,
                                "path": str(file_path),
                                "file_type": ext[1:]
                            },
                        )
                    )
                except Exception as e:
                    print(f"Error reading text/md file {file_path}: {e}")
            elif ext == ".pdf":
                try:
                    pdf_text = extract_text_from_pdf(file_path)
                    documents.append(
                        Document(
                            page_content=pdf_text,
                            metadata={
                                "source": file_path.name,
                                "path": str(file_path),
                                "file_type": "pdf"
                            },
                        )
                    )
                except Exception as e:
                    print(f"Error reading PDF file {file_path}: {e}")
    return documents


def split_documents(documents, chunk_size=500, chunk_overlap=100):
    chunks = []
    for doc in documents:
        text = doc.page_content
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]
            chunks.append(Document(page_content=chunk_text, metadata=doc.metadata))
            start += chunk_size - chunk_overlap
            if start >= len(text):
                break
    return chunks


def create_embeddings():
    global _embeddings_instance
    if _embeddings_instance is None:
        from langchain_community.embeddings import FakeEmbeddings
        _embeddings_instance = FakeEmbeddings(size=384)
    return _embeddings_instance


def create_vector_store():
    global _vector_store_instance
    documents = load_documents()
    chunks = split_documents(documents)
    embeddings = create_embeddings()

    _vector_store_instance = Chroma.from_documents(
        documents=chunks if chunks else [Document(page_content="Initial Support Document", metadata={"source": "default.txt"})],
        embedding=embeddings,
        persist_directory=settings.CHROMA_PERSIST_DIRECTORY,
        collection_name="customer_support"
    )
    return _vector_store_instance


def get_vector_store():
    global _vector_store_instance
    if _vector_store_instance is None:
        embeddings = create_embeddings()
        _vector_store_instance = Chroma(
            collection_name="customer_support",
            embedding_function=embeddings,
            persist_directory=settings.CHROMA_PERSIST_DIRECTORY
        )
    return _vector_store_instance


def reindex_vector_store():
    global _vector_store_instance
    documents = load_documents()
    chunks = split_documents(documents)
    embeddings = create_embeddings()

    try:
        if chunks:
            _vector_store_instance = Chroma.from_texts(
                texts=[c.page_content for c in chunks],
                embedding=embeddings,
                metadatas=[c.metadata for c in chunks],
                collection_name="customer_support"
            )
        else:
            _vector_store_instance = Chroma.from_texts(
                texts=["Default Support Policy"],
                embedding=embeddings,
                metadatas=[{"source": "default.txt"}],
                collection_name="customer_support"
            )
    except Exception as err:
        print(f"Chroma reindex warning, fallback to doc reload: {err}")

    return {
        "success": True,
        "document_count": len(documents),
        "chunk_count": len(chunks)
    }


def search_knowledge_base(query: str, k: int = 3):
    try:
        vector_store = get_vector_store()
        results = vector_store.similarity_search(query, k=k)
        return results
    except Exception as err:
        print(f"RAG search error: {err}")
        return []