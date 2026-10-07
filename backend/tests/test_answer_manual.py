import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.answer import generate_answer


def main():
    print("\n" + "=" * 60)
    print("RAG + GEMINI + INTENT TEST")
    print("=" * 60)

    test_messages = [
        "How many days do I have to return a product?",
        "How long does standard shipping take?",
        "What information should I never share with support?",
    ]

    for message in test_messages:

        print("\nCustomer:")
        print(message)

        try:
            result = generate_answer(message)

            print("\nDetected Intent:")
            print(result["intent"])

            print("\nAI Response:")
            print(result["answer"])

            print("\nSources:")
            for source in result["sources"]:
                print("-", source)

        except Exception as e:
            print("\nError:")
            print(e)

    print("\n" + "=" * 60)
    print("RAG + Gemini + Intent test completed.")
    print("=" * 60)


if __name__ == "__main__":
    main()