import sys
from pathlib import Path

# Add the backend directory to Python's import path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.rag import search_knowledge_base


query = "How many days do I have to return a product?"

results = search_knowledge_base(query, k=3)

print("\n" + "=" * 60)
print("RAG SEARCH TEST")
print("=" * 60)

print(f"\nQuery: {query}\n")

for index, document in enumerate(results, start=1):

    print(f"--- Result {index} ---")

    print(document.page_content)

    print(
        f"\nSource: "
        f"{document.metadata.get('source', 'Unknown')}"
    )

    print()