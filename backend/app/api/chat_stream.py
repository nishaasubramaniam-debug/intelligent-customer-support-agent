from typing import Optional
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest
from app.services.agent import run_agent_stream

router = APIRouter(
    prefix="/api/chat",
    tags=["Chat Streaming"]
)


@router.get("/stream")
async def stream_chat_get(
    message: str,
    conversation_id: str = "default-conversation",
    order_id: Optional[str] = None,
    email: Optional[str] = None,
    language: Optional[str] = "English"
):
    """
    Stream customer support responses via GET query parameters (SSE).
    """
    def event_generator():
        generator = run_agent_stream(
            message=message,
            conversation_id=conversation_id,
            order_id=order_id,
            email=email,
            language=language or "English"
        )

        for chunk in generator:
            if chunk:
                yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )


@router.post("/stream")
async def stream_chat_post(
    request: ChatRequest
):
    """
    Stream customer support responses via POST JSON payload.
    """
    def event_generator():
        generator = run_agent_stream(
            message=request.message,
            conversation_id=request.conversation_id,
            order_id=request.order_id,
            email=request.email,
            language=getattr(request, "language", "English") or "English"
        )

        for chunk in generator:
            if chunk:
                yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )