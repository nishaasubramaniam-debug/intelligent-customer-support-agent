import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.agent import run_agent
from app.services.memory import conversation_memory


def main():

    print("\n" + "=" * 60)
    print("AI AGENT + MONGODB MEMORY TEST")
    print("=" * 60)

    conversation_id = "mongodb_agent_test_001"

    
    # Message 1
    

    message_1 = "My order number is ORD1001."

    print("\nCustomer:")
    print(message_1)

    result_1 = run_agent(
        message=message_1,
        conversation_id=conversation_id,
        order_id="ORD1001"
    )

    print("\nAgent:")
    print(result_1["response"])

    print("\nIntent:")
    print(result_1["intent"])

    print("\nTool Used:")
    print(result_1["tool_used"])

    
    # Message 2
    

    message_2 = "When will it arrive?"

    print("\n" + "-" * 60)

    print("\nCustomer:")
    print(message_2)

    result_2 = run_agent(
        message=message_2,
        conversation_id=conversation_id
    )

    print("\nAgent:")
    print(result_2["response"])

    print("\nIntent:")
    print(result_2["intent"])

    print("\nTool Used:")
    print(result_2["tool_used"])

    
    # Check MongoDB memory
    

    history = conversation_memory.get_history(
        conversation_id
    )

    remembered_order_id = (
        conversation_memory.get_order_id(
            conversation_id
        )
    )

    print("\n" + "-" * 60)

    print("\nMongoDB Conversation History:")

    for message in history:

        print(
            f"{message['role']}: "
            f"{message['content']}"
        )

    print("\nRemembered Order ID:")
    print(remembered_order_id)

    
    # Cleanup

    conversation_memory.clear_conversation(
        conversation_id
    )

    print("\nTest conversation removed from MongoDB.")

    print("\n" + "=" * 60)
    print("AI Agent + MongoDB Memory test completed.")
    print("=" * 60)


if __name__ == "__main__":
    main()