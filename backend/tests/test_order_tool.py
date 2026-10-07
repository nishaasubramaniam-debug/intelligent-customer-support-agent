import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.tools.order_tool import get_order_status


def main():
    print("\n" + "=" * 60)
    print("ORDER STATUS TOOL TEST")
    print("=" * 60)

    test_order_ids = [
        "ORD1001",
        "ORD1002",
        "ORD9999"
    ]

    for order_id in test_order_ids:

        result = get_order_status(order_id)

        print("\nOrder ID:")
        print(order_id)

        print("Tool Response:")
        print(result)

    print("\n" + "=" * 60)
    print("Order status tool test completed successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()