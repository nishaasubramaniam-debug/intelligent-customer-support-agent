import re

URGENT_KEYWORDS = [
    "angry", "frustrated", "furious", "unacceptable", "terrible", "horrible",
    "scam", "sue", "lawyer", "police", "legal", "fraud", "disgusting",
    "immediately", "refund now", "cancel now", "worst", "waste", "cheat"
]

HIGH_KEYWORDS = [
    "cancel", "refund", "delayed", "wrong item", "damaged", "broken",
    "missing", "not delivered", "charged twice", "double charge", "urgent"
]

def analyze_sentiment(customer_message: str, history: list | None = None) -> dict:
    """
    Analyzes customer sentiment and calculates ticket urgency level.
    """
    text = (customer_message or "").lower().strip()
    
    # Check history text if available
    history_text = ""
    if history and isinstance(history, list):
        for item in history:
            if isinstance(item, dict) and item.get("role") == "user":
                history_text += " " + str(item.get("content", "")).lower()

    combined_text = (text + " " + history_text).strip()

    urgency_reasons = []
    
    # Keyword detection
    urgent_matches = [kw for kw in URGENT_KEYWORDS if kw in combined_text]
    high_matches = [kw for kw in HIGH_KEYWORDS if kw in combined_text]

    score = 0.0
    
    if urgent_matches:
        score -= 0.8
        urgency_reasons.append(f"Strong dissatisfaction keywords detected ({', '.join(urgent_matches[:2])})")
    elif high_matches:
        score -= 0.4
        urgency_reasons.append(f"High-priority issue keywords ({', '.join(high_matches[:2])})")

    # Positive check
    if any(w in combined_text for w in ["thank", "thanks", "great", "awesome", "good", "appreciate"]):
        score += 0.5

    # Determine sentiment label and urgency
    if score <= -0.6 or len(urgent_matches) > 0:
        sentiment = "Angry"
        urgency_level = "URGENT"
        if not urgency_reasons:
            urgency_reasons.append("Extreme negative customer sentiment detected")
    elif score <= -0.3 or len(high_matches) > 0:
        sentiment = "Frustrated"
        urgency_level = "HIGH"
        if not urgency_reasons:
            urgency_reasons.append("Customer issue requires prioritized agent review")
    elif score >= 0.3:
        sentiment = "Positive"
        urgency_level = "NORMAL"
    else:
        sentiment = "Neutral"
        urgency_level = "NORMAL"

    return {
        "sentiment": sentiment,
        "sentiment_score": round(score, 2),
        "urgency_level": urgency_level,
        "urgency_reasons": urgency_reasons or ["Standard support request"]
    }
