import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app
from app.services.translation import translate_text, detect_and_translate

client = TestClient(app)

def test_translation_services():
    res = translate_text("Hello, how can I help you today?", target_language="Spanish")
    assert isinstance(res, str)
    assert len(res) > 0

    detection = detect_and_translate("Hola, necesito cancelar mi pedido.")
    assert detection["language"].lower() in ["spanish", "english"]

def test_translation_api():
    response = client.post("/api/chat/translate", json={"text": "Hello support team", "target_language": "French"})
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "translated_text" in response.json()
