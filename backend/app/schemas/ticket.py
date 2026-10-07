from pydantic import BaseModel
from typing import Optional


class TicketResponse(BaseModel):
    ticket_id: str
    conversation_id: Optional[str] = None
    customer_message: str
    reason: str
    status: str