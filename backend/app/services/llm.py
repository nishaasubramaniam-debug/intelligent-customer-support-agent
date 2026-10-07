from google import genai
from app.core.config import settings

MODEL_NAME = "gemini-3.5-flash-lite"


def get_client():
    if not settings.GOOGLE_API_KEY:
        raise ValueError(
            "GOOGLE_API_KEY is not configured. "
            "Please add it to the .env file."
        )

    return genai.Client(
        api_key=settings.GOOGLE_API_KEY
    )


def get_llm():
    if not settings.GOOGLE_API_KEY:
        raise ValueError(
            "GOOGLE_API_KEY is not configured. "
            "Please add it to the .env file."
        )

    return get_client()


def stream_llm_response(prompt: str):
    """
    Stream Gemini LLM responses using the Google GenAI SDK.
    """
    llm = get_llm()
    for chunk in llm.models.generate_content_stream(
        model=MODEL_NAME,
        contents=prompt,
    ):
        if chunk.text:
            yield chunk.text


def generate_llm_response(prompt: str):
    llm = get_llm()
    return llm.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )