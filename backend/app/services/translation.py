import json
from app.services.llm import generate_llm_response

SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "hi": "Hindi",
    "ja": "Japanese",
    "zh": "Chinese"
}

def translate_text(text: str, target_language: str = "English") -> str:
    """
    Translates input text into the target language using Gemini LLM.
    """
    if not text or not text.strip():
        return text

    prompt = f"""
You are a professional customer support translation engine.
Translate the following text accurately into {target_language}.
Maintain professional, polite support tone and format.

Text to translate:
"{text}"

Output ONLY the translated text string with no extra explanations or markdown wrapper.
"""
    try:
        res = generate_llm_response(prompt)
        translated = res.text if hasattr(res, "text") and res.text else str(res)
        return translated.strip()
    except Exception as err:
        print("Translation warning fallback:", err)
        return text

def detect_and_translate(text: str) -> dict:
    """
    Detects language of text and provides English translation.
    """
    if not text or not text.strip():
        return {"language": "English", "english_text": text, "is_english": True}

    prompt = f"""
Analyze the following customer text:
"{text}"

Identify the language name (e.g., English, Spanish, French, German, Hindi, Japanese, Chinese) and provide an accurate English translation.

Output strictly in valid JSON:
{{
  "language": "<Language Name>",
  "is_english": true/false,
  "english_text": "<English translation>"
}}
"""
    try:
        res = generate_llm_response(prompt)
        content = res.text if hasattr(res, "text") and res.text else str(res)
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        data = json.loads(content.strip())
        return data
    except Exception as err:
        print("Language detection error:", err)
        return {"language": "English", "english_text": text, "is_english": True}
