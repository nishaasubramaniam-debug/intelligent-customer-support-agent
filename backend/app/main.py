from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.chat import router as chat_router
from app.api.chat_stream import router as chat_stream_router
from app.api.tickets import router as tickets_router
from app.api.auth import router as auth_router
from app.api.knowledge import router as knowledge_router
from app.api.csat import router as csat_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered customer support agent with "
        "RAG, intent detection, conversation memory, "
        "tool calling and human escalation."
    )
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(chat_stream_router)
app.include_router(tickets_router)
app.include_router(auth_router)
app.include_router(knowledge_router)
app.include_router(csat_router)

@app.get("/")
async def root():
    return {
        "message": "Intelligent Customer Support Agent API",
        "status": "running",
        "version": settings.APP_VERSION
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }