import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.tools.account_tool import get_account_info


def main():
    print("\n" + "=" * 60)
    print("ACCOUNT TOOL TEST")
    print("=" * 60)

    test_emails = [
        "customer1@example.com",
        "customer3@example.com",
        "unknown@example.com"
    ]

    for email in test_emails:

        result = get_account_info(email)

        print("\nEmail:")
        print(email)

        print("Tool Response:")
        print(result)

    print("\n" + "=" * 60)
    print("Account tool test completed successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()