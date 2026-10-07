import sys
from pathlib import Path

# Add the backend directory to Python's import path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.rag import create_vector_store


if __name__ == "__main__":
    print("=" * 60)
    print("KNOWLEDGE BASE INGESTION")
    print("=" * 60)

    try:
        create_vector_store()

        print("=" * 60)
        print("Knowledge base ingestion completed successfully.")
        print("=" * 60)

    except Exception as e:
        print("=" * 60)
        print("Knowledge base ingestion failed.")
        print(f"Error: {e}")
        print("=" * 60)