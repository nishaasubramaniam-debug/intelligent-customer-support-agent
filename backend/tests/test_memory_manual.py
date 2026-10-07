import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.memory import conversation_memory


def main():
    print("\n" + "=" * 60)
    print("CONVERSATION MEMORY TEST")
    print("=" * 60)

    conversation_id = "conversation_001"

    # Add customer message
    conversation_memory.add_message(
        conversation_id,
        "user",
        "My order number is ORD1001."
    )

    # Add agent response
    conversation_memory.add_message(
        conversation_id,
        "assistant",
        "Thank you. I have noted your order number."
    )

    # Add another customer message
    conversation_memory.add_message(
        conversation_id,
        "user",
        "When will it arrive?"
    )

    # Get conversation history
    history = conversation_memory.get_history(
        conversation_id
    )

    print("\nConversation ID:")
    print(conversation_id)

    print("\nConversation History:")

    for message in history:
        print(
            f"{message['role']}: "
            f"{message['content']}"
        )

    print("\nTotal Messages:")
    print(len(history))

    # Test clearing conversation
    conversation_memory.clear_conversation(
        conversation_id
    )

    cleared_history = conversation_memory.get_history(
        conversation_id
    )

    print("\nAfter Clearing:")
    print(cleared_history)

    print("\n" + "=" * 60)
    print("Conversation memory test completed successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()