def get_account_info(email: str) -> dict:
    """
    Get basic customer account information from account records.
    """

    accounts = {
        "customer1@example.com": {
            "name": "John",
            "account_status": "Active"
        },
        "customer2@example.com": {
            "name": "Sarah",
            "account_status": "Active"
        },
        "customer3@example.com": {
            "name": "David",
            "account_status": "Inactive"
        }
    }

    email = email.strip().lower()

    if email in accounts:
        return {
            "success": True,
            "email": email,
            "name": accounts[email]["name"],
            "account_status": accounts[email]["account_status"]
        }

    return {
        "success": False,
        "email": email,
        "message": "Account not found."
    }