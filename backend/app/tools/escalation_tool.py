from datetime import datetime, timezone
from app.core.database import get_database

# In-memory ticket storage fallback
in_memory_tickets = []


from app.services.sentiment import analyze_sentiment

def escalate_to_human(
    customer_message: str,
    reason: str,
    conversation_id: str | None = None
) -> dict:
    """
    Escalate a customer issue to a human support agent
    and store the support ticket in MongoDB with in-memory fallback.
    """

    ticket_id = (
        "TKT-"
        + datetime.now(timezone.utc).strftime(
            "%Y%m%d%H%M%S%f"
        )[:18]
    )

    sentiment_res = analyze_sentiment(customer_message)

    ticket = {
        "ticket_id": ticket_id,
        "conversation_id": conversation_id,
        "customer_message": customer_message,
        "reason": reason,
        "status": "Escalated",
        "sentiment": sentiment_res["sentiment"],
        "sentiment_score": sentiment_res["sentiment_score"],
        "urgency_level": sentiment_res["urgency_level"],
        "urgency_reasons": sentiment_res["urgency_reasons"],
        "messages": [
            {
                "sender": "customer",
                "text": customer_message,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    }


    # Trigger automated notification (Feature 7)
    try:
        from app.services.notifications import notify_ticket_escalation
        notify_ticket_escalation(ticket)
    except Exception as notif_err:
        print("Notification trigger warning:", notif_err)

    # Store in memory cache
    in_memory_tickets.insert(0, ticket)

    # Attempt MongoDB insertion
    try:
        db = get_database()
        db.tickets.insert_one(ticket)
    except Exception as err:
        print(f"MongoDB ticket save warning: {err}. Using in-memory fallback.")

    return {
        "success": True,
        "ticket_id": ticket_id,
        "status": "Escalated",
        "message": (
            "Your issue has been escalated to a "
            "human support agent."
        ),
        "reason": reason,
        "customer_message": customer_message
    }