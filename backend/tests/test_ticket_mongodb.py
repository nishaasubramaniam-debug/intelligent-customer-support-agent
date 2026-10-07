import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.agent import run_agent
from app.core.database import get_database


def main():

    print("\n" + "=" * 60)
    print("HUMAN ESCALATION + MONGODB TICKET TEST")
    print("=" * 60)

    conversation_id = "ticket_test_001"

    customer_message = (
        "I want to speak to a human support agent."
    )

    print("\nCustomer:")
    print(customer_message)

    result = run_agent(
        message=customer_message,
        conversation_id=conversation_id
    )

    print("\nAgent:")
    print(result["response"])

    print("\nIntent:")
    print(result["intent"])

    print("\nTool Used:")
    print(result["tool_used"])

    print("\nTool Result:")
    print(result["tool_result"])

    
    # Check MongoDB
    

    db = get_database()

    ticket = db.tickets.find_one(
        {
            "conversation_id": conversation_id
        },
        sort=[
            ("created_at", -1)
        ]
    )

    print("\n" + "-" * 60)

    print("\nMongoDB Ticket:")

    if ticket:

        print("Ticket ID:")
        print(ticket["ticket_id"])

        print("\nStatus:")
        print(ticket["status"])

        print("\nReason:")
        print(ticket["reason"])

        print("\nConversation ID:")
        print(ticket["conversation_id"])

        print("\nTicket successfully stored in MongoDB.")

    else:

        print("Ticket was not found in MongoDB.")

    # Cleanup

    db.tickets.delete_many(
        {
            "conversation_id": conversation_id
        }
    )

    db.messages.delete_many(
        {
            "conversation_id": conversation_id
        }
    )

    db.conversations.delete_many(
        {
            "conversation_id": conversation_id
        }
    )

    print("\nTest data removed from MongoDB.")

    print("\n" + "=" * 60)
    print("Human escalation ticket test completed.")
    print("=" * 60)


if __name__ == "__main__":
    main()