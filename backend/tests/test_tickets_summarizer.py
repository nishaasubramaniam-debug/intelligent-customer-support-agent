import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app
from app.tools.escalation_tool import in_memory_tickets

client = TestClient(app)

def test_tickets_summarizer_and_messaging():
    # Insert a dummy ticket into in_memory_tickets
    dummy_ticket = {
        "ticket_id": "TCK-TEST-999",
        "customer_message": "Need to cancel order ORD1002 immediately",
        "reason": "Customer requested cancellation",
        "status": "Escalated",
        "conversation_id": "conv-test-999",
        "created_at": "2026-10-06T12:00:00Z",
        "messages": [
            {"sender": "customer", "text": "Please cancel my order ORD1002", "timestamp": "2026-10-06T12:00:00Z"}
        ]
    }
    in_memory_tickets.append(dummy_ticket)

    # Test GET /api/tickets/TCK-TEST-999
    res = client.get("/api/tickets/TCK-TEST-999")
    assert res.status_code == 200
    assert res.json()["ticket_id"] == "TCK-TEST-999"

    # Test POST /api/tickets/TCK-TEST-999/message
    msg_res = client.post("/api/tickets/TCK-TEST-999/message", json={"sender": "admin", "text": "I can help with that."})
    assert msg_res.status_code == 200
    assert msg_res.json()["success"] is True

    # Test POST /api/tickets/TCK-TEST-999/summarize-suggest
    sum_res = client.post("/api/tickets/TCK-TEST-999/summarize-suggest")
    assert sum_res.status_code == 200
    data = sum_res.json()
    assert data["success"] is True
    assert "summary" in data
    assert "suggested_reply" in data
