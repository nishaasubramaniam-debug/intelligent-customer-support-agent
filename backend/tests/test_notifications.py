import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.notifications import (
    send_email_notification,
    send_sms_notification,
    notify_ticket_escalation,
    notify_ticket_resolution
)

def test_notification_dispatchers():
    res1 = send_email_notification("customer@test.com", "Test Subject", "Test Body")
    assert res1["success"] is True

    res2 = send_sms_notification("+15550199", "Ticket TKT-100 updated")
    assert res2["success"] is True

    res3 = notify_ticket_escalation({"ticket_id": "TKT-TEST-888", "customer_message": "Need help with order"})
    assert res3["success"] is True

    res4 = notify_ticket_resolution({"ticket_id": "TKT-TEST-888"}, "Resolved by admin.")
    assert res4["success"] is True
