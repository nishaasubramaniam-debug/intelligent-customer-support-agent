import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.agent import run_agent
from app.services.memory import conversation_memory


def main():
    print("\n" + "=" * 60)
    print("AI AGENT + CONVERSATION MEMORY TEST")
    print("=" * 60)

    conversation_id = "conversation_001"

    
    # First customer message
    

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

    
    # Second customer message
    

    message_2 = "When will it arrive?"

    print("\nCustomer:")
    print(message_2)

    result_2 = run_agent(
        message=message_2,
        conversation_id=conversation_id
    )

    print("\nAgent:")
    print(result_2["response"])

    
    # Display stored conversation
    

    history = conversation_memory.get_history(
        conversation_id
    )

    print("\n" + "-" * 60)
    print("STORED CONVERSATION")
    print("-" * 60)

    for item in history:
        print(
            f"{item['role']}: "
            f"{item['content']}"
        )

    print("\nTotal Messages:")
    print(len(history))

    print("\n" + "=" * 60)
    print("AI Agent + conversation memory test completed.")
    print("=" * 60)


if __name__ == "__main__":
    main()
