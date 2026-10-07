import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.core.database import (
    test_database_connection,
    initialize_database
)


def main():

    print("\n" + "=" * 60)
    print("MONGODB DATABASE SETUP TEST")
    print("=" * 60)

    connected = test_database_connection()

    if not connected:
        print("\nMongoDB connection failed.")
        print("=" * 60)
        return

    print("\nInitializing database...")

    initialize_database()

    print("\nDatabase setup completed successfully.")

    print("=" * 60)


if __name__ == "__main__":
    main()