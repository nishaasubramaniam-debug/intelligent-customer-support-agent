import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.intent import detect_intent


def main():
    print("\n" + "=" * 60)
    print("INTENT DETECTION TEST")
    print("=" * 60)

    test_messages = [
        "Where is my order?",
        "I want to return my product.",
        "How long does shipping take?",
        "I was charged twice for my order.",
        "I want to speak to a human agent.",
    ]

    for message in test_messages:

        intent = detect_intent(message)

        print("\nCustomer:")
        print(message)

        print("Detected Intent:")
        print(intent)

    print("\n" + "=" * 60)
    print("Intent detection test completed successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()