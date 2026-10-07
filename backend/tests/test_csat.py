import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app

client = TestClient(app)

def test_csat_flow():
    # Submit 5-star CSAT rating
    payload = {
        "ticket_id": "TKT-CSAT-TEST-001",
        "rating": 5,
        "feedback": "Outstanding support! Solved my issue in minutes.",
        "conversation_id": "conv-csat-001"
    }
    res = client.post("/api/csat/rating", json=payload)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Check stats endpoint
    stats_res = client.get("/api/csat/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_ratings"] >= 1
    assert stats["average_csat"] >= 1.0
