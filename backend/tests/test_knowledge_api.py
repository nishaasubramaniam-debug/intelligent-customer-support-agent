import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app

client = TestClient(app)

def test_knowledge_base_crud():
    # 1. List documents
    list_res = client.get("/api/knowledge/")
    assert list_res.status_code == 200
    assert list_res.json()["success"] is True

    # 2. Create document
    doc_payload = {
        "filename": "test_warranty.txt",
        "content": "Our products come with a 1-year limited hardware warranty covering manufacturing defects."
    }
    create_res = client.post("/api/knowledge/", json=doc_payload)
    assert create_res.status_code == 200
    assert create_res.json()["success"] is True
    assert create_res.json()["filename"] == "test_warranty.txt"

    # 3. Read specific document
    get_res = client.get("/api/knowledge/test_warranty.txt")
    assert get_res.status_code == 200
    assert "1-year limited hardware warranty" in get_res.json()["content"]

    # 4. Update document
    update_payload = {
        "filename": "test_warranty.txt",
        "content": "Our products come with an extended 2-year full hardware warranty covering all defects."
    }
    update_res = client.put("/api/knowledge/test_warranty.txt", json=update_payload)
    assert update_res.status_code == 200
    assert update_res.json()["success"] is True

    # Verify update
    get_updated = client.get("/api/knowledge/test_warranty.txt")
    assert "2-year full hardware warranty" in get_updated.json()["content"]

    # 5. Force Re-index
    reindex_res = client.post("/api/knowledge/reindex")
    assert reindex_res.status_code == 200
    assert reindex_res.json()["success"] is True

    # 6. Delete document
    del_res = client.delete("/api/knowledge/test_warranty.txt")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Verify deletion
    get_del = client.get("/api/knowledge/test_warranty.txt")
    assert get_del.status_code == 404
