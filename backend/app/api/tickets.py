from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.database import get_database
from app.tools.escalation_tool import in_memory_tickets

router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)


@router.get("/")
async def get_tickets():
    tickets_list = []

    try:
        db = get_database()
        mongo_tickets = list(
            db["tickets"]
            .find({}, {"_id": 0})
            .sort("created_at", -1)
        )
        tickets_list = mongo_tickets
    except Exception as error:
        print("MongoDB fetch warning, using in-memory tickets:", repr(error))
        tickets_list = in_memory_tickets

    # Ensure in-memory tickets are present if MongoDB returned nothing
    if not tickets_list and in_memory_tickets:
        tickets_list = in_memory_tickets

    return {
        "tickets": tickets_list,
        "count": len(tickets_list)
    }


@router.get("/{ticket_id}")
async def get_ticket_by_id(ticket_id: str):
    try:
        db = get_database()
        ticket = db["tickets"].find_one({"ticket_id": ticket_id}, {"_id": 0})
        if ticket:
            return ticket
    except Exception as error:
        print("MongoDB fetch warning, checking in-memory:", repr(error))

    for ticket in in_memory_tickets:
        if ticket.get("ticket_id") == ticket_id:
            return ticket

    raise HTTPException(
        status_code=404,
        detail="Ticket not found"
    )



@router.put("/{ticket_id}")
async def update_ticket_status(
    ticket_id: str,
    status: str,
    admin_response: str | None = None
):
    allowed_statuses = [
        "Escalated",
        "In Progress",
        "Resolved"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Allowed values: "
                "Escalated, In Progress, Resolved"
            )
        )

    conversation_id = None

    # Update in-memory
    updated_in_memory = False
    for ticket in in_memory_tickets:
        if ticket.get("ticket_id") == ticket_id:
            ticket["status"] = status
            if admin_response:
                ticket["admin_response"] = admin_response
            conversation_id = ticket.get("conversation_id")
            updated_in_memory = True

    # Try Mongo update
    try:
        db = get_database()
        update_fields = {"status": status}
        if admin_response:
            update_fields["admin_response"] = admin_response

        existing_ticket = db["tickets"].find_one({"ticket_id": ticket_id})
        if existing_ticket and not conversation_id:
            conversation_id = existing_ticket.get("conversation_id")

        result = db["tickets"].update_one(
            {"ticket_id": ticket_id},
            {"$set": update_fields}
        )
        if result.matched_count > 0:
            updated_in_memory = True
    except Exception as error:
        print("Mongo update warning:", repr(error))

    if not updated_in_memory:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if status == "Resolved":
        try:
            from app.services.notifications import notify_ticket_resolution
            notify_ticket_resolution({"ticket_id": ticket_id}, admin_response or "Ticket resolved.")
        except Exception as notif_err:
            print("Resolution notification error:", notif_err)

    # Save to memory if admin provided a response and conversation_id exists
    if admin_response and conversation_id:
        try:
            from app.services.memory import conversation_memory
            conversation_memory.add_message(
                conversation_id,
                "assistant",
                f"[Human Support Agent]: {admin_response}"
            )
        except Exception as mem_err:
            print("Memory save warning:", mem_err)

    return {
        "message": "Ticket status updated successfully",
        "ticket_id": ticket_id,
        "status": status,
        "admin_response": admin_response
    }


class TicketMessagePayload(BaseModel):
    sender: str
    text: str


@router.post("/{ticket_id}/message")
async def add_ticket_message(
    ticket_id: str,
    payload: TicketMessagePayload
):
    msg_obj = {
        "sender": payload.sender,
        "text": payload.text,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    updated = False
    conversation_id = None

    for t in in_memory_tickets:
        if t.get("ticket_id") == ticket_id:
            if "messages" not in t or not isinstance(t["messages"], list):
                t["messages"] = []
            t["messages"].append(msg_obj)
            if payload.sender == "admin":
                t["admin_response"] = payload.text
                if t.get("status") == "Escalated":
                    t["status"] = "In Progress"
            conversation_id = t.get("conversation_id")
            updated = True

    try:
        db = get_database()
        existing = db["tickets"].find_one({"ticket_id": ticket_id})
        if existing:
            if not conversation_id:
                conversation_id = existing.get("conversation_id")

            update_data = {"$push": {"messages": msg_obj}}
            set_fields = {}
            if payload.sender == "admin":
                set_fields["admin_response"] = payload.text
                if existing.get("status") == "Escalated":
                    set_fields["status"] = "In Progress"

            if set_fields:
                update_data["$set"] = set_fields

            db["tickets"].update_one({"ticket_id": ticket_id}, update_data)
            updated = True
    except Exception as err:
        print("Mongo message save error:", err)

    if not updated:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if conversation_id:
        try:
            from app.services.memory import conversation_memory
            prefix = "[Human Support Agent]" if payload.sender == "admin" else "[Customer]"
            conversation_memory.add_message(
                conversation_id,
                "assistant" if payload.sender == "admin" else "user",
                f"{prefix}: {payload.text}"
            )
        except Exception as mem_err:
            print("Memory save error:", mem_err)

    return {"success": True, "ticket_id": ticket_id, "message": msg_obj}


@router.post("/{ticket_id}/summarize-suggest")
async def summarize_ticket(ticket_id: str):
    ticket_found = None

    # Search in-memory
    for t in in_memory_tickets:
        if t.get("ticket_id") == ticket_id:
            ticket_found = t
            break

    # Search MongoDB if not found
    if not ticket_found:
        try:
            db = get_database()
            ticket_found = db["tickets"].find_one({"ticket_id": ticket_id}, {"_id": 0})
        except Exception as err:
            print("Mongo fetch error for summarize:", err)

    if not ticket_found:
        raise HTTPException(status_code=404, detail="Ticket not found")

    from app.services.summarizer import summarize_and_suggest
    result = summarize_and_suggest(ticket_found)
    return result


@router.post("/{ticket_id}/analyze-sentiment")
async def analyze_ticket_sentiment(ticket_id: str):
    ticket_found = None
    for t in in_memory_tickets:
        if t.get("ticket_id") == ticket_id:
            ticket_found = t
            break

    if not ticket_found:
        try:
            db = get_database()
            ticket_found = db["tickets"].find_one({"ticket_id": ticket_id}, {"_id": 0})
        except Exception as err:
            print("Mongo fetch error for sentiment:", err)

    if not ticket_found:
        raise HTTPException(status_code=404, detail="Ticket not found")

    from app.services.sentiment import analyze_sentiment
    msg = ticket_found.get("customer_message", "")
    messages = ticket_found.get("messages", [])
    history_user_msgs = [{"role": "user", "content": m.get("text")} for m in messages if m.get("sender") == "customer"]

    sentiment_res = analyze_sentiment(msg, history_user_msgs)

    # Update in memory
    for t in in_memory_tickets:
        if t.get("ticket_id") == ticket_id:
            t.update(sentiment_res)

    try:
        db = get_database()
        db["tickets"].update_one({"ticket_id": ticket_id}, {"$set": sentiment_res})
    except Exception as err:
        print("Mongo update error for sentiment:", err)

    return {"success": True, "ticket_id": ticket_id, **sentiment_res}