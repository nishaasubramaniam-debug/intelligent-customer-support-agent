from fastapi import APIRouter, HTTPException

from app.schemas.chat import (
    ChatRequest,
    ChatResponse
)

from app.services.agent import run_agent


router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"]
)


@router.post(
    "/",
    response_model=ChatResponse
)
async def chat(
    request: ChatRequest
):
    """
    Process a customer message using the AI agent.
    """

    try:

        result = run_agent(
            message=request.message,
            conversation_id=request.conversation_id,
            order_id=request.order_id,
            email=request.email,
            language=getattr(request, "language", "English") or "English"
        )

        return result

    except Exception as error:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.post("/translate")
async def translate_endpoint(payload: dict):
    text = payload.get("text", "")
    target = payload.get("target_language", "English")
    
    from app.services.translation import translate_text, detect_and_translate
    
    if payload.get("detect"):
        return detect_and_translate(text)
        
    translated = translate_text(text, target_language=target)
    return {"success": True, "original_text": text, "target_language": target, "translated_text": translated}