import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.agent import run_agent


def main():
    print("\n" + "=" * 60)
    print("AI AGENT TEST")
    print("=" * 60)

    test_cases = [
        {
            "message": "Where is my order?",
            "order_id": "ORD1001",
            "email": None
        },
        {
            "message": "How long does standard shipping take?",
            "order_id": None,
            "email": None
        },
        {
            "message": "I want to return my product.",
            "order_id": None,
            "email": None
        },
        {
            "message": "I want to speak to a human agent.",
            "order_id": None,
            "email": None
        }
    ]

    for case in test_cases:

        print("\n" + "-" * 60)

        print("\nCustomer:")
        print(case["message"])

        try:
            result = run_agent(
                message=case["message"],
                order_id=case["order_id"],
                email=case["email"]
            )

            print("\nDetected Intent:")
            print(result["intent"])

            print("\nAI Response:")
            print(result["response"])

            print("\nTool Used:")
            print(result["tool_used"])

            print("\nSources:")
            for source in result["sources"]:
                print("-", source)

        except Exception as e:

            print("\nAgent Error:")
            print(e)

    print("\n" + "=" * 60)
    print("AI Agent test completed.")
    print("=" * 60)


if __name__ == "__main__":
    main()