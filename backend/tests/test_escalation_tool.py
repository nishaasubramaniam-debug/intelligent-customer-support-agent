import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.tools.escalation_tool import escalate_to_human


def main():
    print("\n" + "=" * 60)
    print("HUMAN ESCALATION TOOL TEST")
    print("=" * 60)

    customer_message = (
        "I was charged twice and I need someone to help me."
    )

    reason = (
        "Payment issue requires human support."
    )

    result = escalate_to_human(
        customer_message,
        reason
    )

    print("\nCustomer Message:")
    print(customer_message)

    print("\nEscalation Reason:")
    print(reason)

    print("\nTool Response:")
    print(result)

    print("\n" + "=" * 60)
    print("Human escalation tool test completed successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()