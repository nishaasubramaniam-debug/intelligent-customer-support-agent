from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    conversation_id: str = Field(
        ...,
        min_length=1
    )

    message: str = Field(
        ...,
        min_length=1
    )

    order_id: Optional[str] = None

    email: Optional[str] = None

    language: Optional[str] = "English"


class ChatResponse(BaseModel):
    conversation_id: str
    intent: str
    response: str
    tool_used: Optional[str] = None
    tool_result: Optional[dict] = None
    sources: list[str] = []