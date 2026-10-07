import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.sentiment import analyze_sentiment

def test_angry_sentiment_and_urgent_flag():
    res = analyze_sentiment("I am furious and angry! Refund my ORD1002 immediately, this is terrible scam!")
    assert res["sentiment"] == "Angry"
    assert res["urgency_level"] == "URGENT"
    assert len(res["urgency_reasons"]) > 0

def test_frustrated_sentiment_and_high_flag():
    res = analyze_sentiment("My order ORD1002 is delayed and wrong item was received.")
    assert res["sentiment"] in ["Frustrated", "Angry"]
    assert res["urgency_level"] in ["HIGH", "URGENT"]

def test_positive_sentiment():
    res = analyze_sentiment("Thank you so much! Great service, appreciate the help.")
    assert res["sentiment"] == "Positive"
    assert res["urgency_level"] == "NORMAL"
