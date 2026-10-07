import os
import re
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.services.rag import (
    KNOWLEDGE_BASE_PATH,
    reindex_vector_store,
    extract_text_from_pdf,
    scrape_url_to_text
)

router = APIRouter(
    prefix="/api/knowledge",
    tags=["Knowledge Base"]
)


class KnowledgeDocumentPayload(BaseModel):
    filename: str
    content: str


class ScrapeUrlPayload(BaseModel):
    url: str
    custom_title: str | None = None


def sanitize_filename(name: str) -> str:
    name = name.strip()
    ext = Path(name).suffix.lower()
    if ext not in [".txt", ".md", ".pdf"]:
        name += ".txt"
    clean = "".join(c for c in name if c.isalnum() or c in ("-", "_", "."))
    if not clean or clean in (".txt", ".md", ".pdf"):
        raise HTTPException(status_code=400, detail="Invalid filename")
    return clean


@router.get("/")
async def list_knowledge_documents():
    docs = []
    if KNOWLEDGE_BASE_PATH.exists():
        for file_path in KNOWLEDGE_BASE_PATH.iterdir():
            if not file_path.is_file():
                continue
            ext = file_path.suffix.lower()
            if ext not in [".txt", ".md", ".pdf"]:
                continue

            try:
                stat = file_path.stat()
                file_type = ext[1:]
                
                if ext == ".pdf":
                    text = extract_text_from_pdf(file_path)
                else:
                    text = file_path.read_text(encoding="utf-8")

                title = file_path.stem.replace("_", " ").title()
                is_web_scraped = file_path.name.startswith("web_") or "Source URL" in text[:300]

                docs.append({
                    "filename": file_path.name,
                    "title": title,
                    "file_type": file_type,
                    "source_type": "scraped_web" if is_web_scraped else ("uploaded_pdf" if ext == ".pdf" else "document"),
                    "size_bytes": stat.st_size,
                    "char_count": len(text),
                    "line_count": len(text.splitlines()),
                    "content": text,
                    "updated_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()
                })
            except Exception as err:
                print(f"Error reading knowledge doc {file_path}: {err}")

    # Sort alphabetically by title
    docs.sort(key=lambda x: x["title"])

    return {
        "success": True,
        "documents": docs,
        "count": len(docs)
    }


@router.get("/{filename}")
async def get_knowledge_document(filename: str):
    clean_name = sanitize_filename(filename)
    target_path = KNOWLEDGE_BASE_PATH / clean_name

    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")

    ext = target_path.suffix.lower()
    if ext == ".pdf":
        text = extract_text_from_pdf(target_path)
    else:
        text = target_path.read_text(encoding="utf-8")

    stat = target_path.stat()

    return {
        "success": True,
        "filename": target_path.name,
        "title": target_path.stem.replace("_", " ").title(),
        "file_type": ext[1:],
        "content": text,
        "updated_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()
    }


@router.post("/")
async def create_knowledge_document(payload: KnowledgeDocumentPayload):
    clean_name = sanitize_filename(payload.filename)
    target_path = KNOWLEDGE_BASE_PATH / clean_name

    target_path.write_text(payload.content, encoding="utf-8")

    # Re-index vector store automatically
    reindex_result = reindex_vector_store()

    return {
        "success": True,
        "message": f"Document '{clean_name}' created successfully.",
        "filename": clean_name,
        "reindex": reindex_result
    }


@router.post("/upload")
async def upload_knowledge_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    filename = sanitize_filename(file.filename)
    ext = Path(filename).suffix.lower()

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    target_path = KNOWLEDGE_BASE_PATH / filename

    if ext == ".pdf":
        target_path.write_bytes(file_bytes)
    else:
        text_content = file_bytes.decode("utf-8", errors="ignore")
        target_path.write_text(text_content, encoding="utf-8")

    reindex_result = reindex_vector_store()

    return {
        "success": True,
        "message": f"Document '{filename}' uploaded and indexed successfully.",
        "filename": filename,
        "size_bytes": len(file_bytes),
        "file_type": ext[1:],
        "reindex": reindex_result
    }


@router.post("/scrape")
async def scrape_and_ingest_url(payload: ScrapeUrlPayload):
    url = payload.url.strip()
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    try:
        scraped = scrape_url_to_text(url)
    except Exception as err:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(err)}")

    title = payload.custom_title.strip() if payload.custom_title else scraped.get("title", "Web Page")

    slug = re.sub(r"[^\w\-_]", "_", title.lower()).strip("_")
    slug = re.sub(r"_+", "_", slug)[:50]
    filename = f"web_{slug}.md"
    filename = sanitize_filename(filename)

    md_content = f"# {title}\n\n**Source URL**: [{url}]({url})\n\n---\n\n{scraped['content']}\n"

    target_path = KNOWLEDGE_BASE_PATH / filename
    target_path.write_text(md_content, encoding="utf-8")

    reindex_result = reindex_vector_store()

    return {
        "success": True,
        "message": f"Webpage scraped and saved as '{filename}'.",
        "filename": filename,
        "title": title,
        "source_url": url,
        "char_count": len(md_content),
        "reindex": reindex_result
    }


@router.put("/{filename}")
async def update_knowledge_document(filename: str, payload: KnowledgeDocumentPayload):
    clean_name = sanitize_filename(filename)
    target_path = KNOWLEDGE_BASE_PATH / clean_name

    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")

    target_path.write_text(payload.content, encoding="utf-8")

    # Re-index vector store automatically
    reindex_result = reindex_vector_store()

    return {
        "success": True,
        "message": f"Document '{clean_name}' updated successfully.",
        "filename": clean_name,
        "reindex": reindex_result
    }


@router.delete("/{filename}")
async def delete_knowledge_document(filename: str):
    clean_name = sanitize_filename(filename)
    target_path = KNOWLEDGE_BASE_PATH / clean_name

    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")

    os.remove(target_path)

    # Re-index vector store automatically
    reindex_result = reindex_vector_store()

    return {
        "success": True,
        "message": f"Document '{clean_name}' deleted successfully.",
        "reindex": reindex_result
    }


@router.post("/reindex")
async def force_reindex():
    result = reindex_vector_store()
    return result

