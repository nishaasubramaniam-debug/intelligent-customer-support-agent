from pymongo import MongoClient
from pymongo.errors import (
    ConnectionFailure,
    ServerSelectionTimeoutError
)

from app.core.config import settings

_client_instance = None
_db_instance = None


def get_client():
    global _client_instance
    if _client_instance is None:
        if not settings.MONGODB_URI:
            raise ValueError(
                "MONGODB_URI is not configured. "
                "Please add it to the .env file."
            )
        _client_instance = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000,
            socketTimeoutMS=2000,
            tls=True
        )
    return _client_instance


def get_database():
    """
    Return the MongoDB database instance with lazy initialization.
    """
    global _db_instance
    if _db_instance is None:
        client_obj = get_client()
        _db_instance = client_obj[settings.MONGODB_DATABASE]
    return _db_instance


def test_database_connection():
    """
    Test the MongoDB connection.
    """
    try:
        client_obj = get_client()
        client_obj.admin.command("ping")
        print("MongoDB Connected Successfully")
        return True
    except (
        ConnectionFailure,
        ServerSelectionTimeoutError
    ) as error:
        print("MongoDB Connection Failed")
        print(f"Error: {error}")
        return False


def initialize_database():
    """
    Create collections and indexes required
    by the customer support application.
    """
    try:
        db = get_database()
        db.conversations.create_index(
            "conversation_id",
            unique=True
        )

        db.messages.create_index(
            "conversation_id"
        )

        db.tickets.create_index(
            "ticket_id",
            unique=True
        )

        db.tickets.create_index(
            "status"
        )

        db.users.create_index(
            "email",
            unique=True
        )

        print(
            "MongoDB collections and indexes "
            "initialized successfully."
        )
    except Exception as err:
        print("Database index initialization warning:", err)