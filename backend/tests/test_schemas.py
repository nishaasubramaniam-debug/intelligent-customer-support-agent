import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.schemas.chat import ChatRequest
from app.schemas.ticket import TicketResponse
from app.schemas.document import DocumentResponse


def main():

    print("\n" + "=" * 60)
    print("PYDANTIC SCHEMA TEST")
    print("=" * 60)

    chat_request = ChatRequest(
        conversation_id="conversation_001",
        message="Where is my order?",
        order_id="ORD1001"
    )

    print("\nChat Request:")
    print(chat_request.model_dump())

    ticket = TicketResponse(
        ticket_id="TKT-001",
        conversation_id="conversation_001",
        customer_message="I want to speak to a human.",
        reason="Customer requested human support.",
        status="Escalated"
    )

    print("\nTicket:")
    print(ticket.model_dump())

    document = DocumentResponse(
        filename="returns.txt",
        status="success",
        message="Document processed successfully."
    )

    print("\nDocument:")
    print(document.model_dump())

    print("\n" + "=" * 60)
    print("Pydantic schema test completed successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()