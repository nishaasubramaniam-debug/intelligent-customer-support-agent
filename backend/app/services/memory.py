from datetime import datetime, timezone
from typing import List, Optional
import re

from app.core.database import get_database


class ConversationMemory:
    """
    Persistent conversation memory using MongoDB with in-memory fallback.
    """

    def __init__(self):
        self.in_memory_messages = {}
        self.in_memory_conversations = {}

    def _get_db(self):
        try:
            return get_database()
        except Exception:
            return None

    def create_conversation(
        self,
        conversation_id: str
    ):
        db = self._get_db()
        if db is not None:
            try:
                existing = db.conversations.find_one({"conversation_id": conversation_id})
                if not existing:
                    db.conversations.insert_one({
                        "conversation_id": conversation_id,
                        "created_at": datetime.now(timezone.utc),
                        "updated_at": datetime.now(timezone.utc)
                    })
            except Exception as err:
                print(f"Mongo create_conversation warning: {err}")

        if conversation_id not in self.in_memory_conversations:
            self.in_memory_conversations[conversation_id] = {
                "conversation_id": conversation_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str
    ):
        self.create_conversation(conversation_id)

        msg_obj = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "timestamp": datetime.now(timezone.utc)
        }

        # Try Mongo insert
        db = self._get_db()
        if db is not None:
            try:
                db.messages.insert_one(msg_obj)
                db.conversations.update_one(
                    {"conversation_id": conversation_id},
                    {"$set": {"updated_at": datetime.now(timezone.utc)}}
                )
            except Exception as err:
                print(f"Mongo add_message warning: {err}")

        # In-memory store
        if conversation_id not in self.in_memory_messages:
            self.in_memory_messages[conversation_id] = []
        self.in_memory_messages[conversation_id].append({
            "role": role,
            "content": content
        })

    def get_history(
        self,
        conversation_id: str
    ) -> List[dict]:
        db = self._get_db()
        if db is not None:
            try:
                messages = db.messages.find({"conversation_id": conversation_id}).sort("timestamp", 1)
                history = []
                for message in messages:
                    history.append({
                        "role": message["role"],
                        "content": message["content"]
                    })
                if history:
                    return history
            except Exception as err:
                print(f"Mongo get_history warning: {err}")

        return self.in_memory_messages.get(conversation_id, [])

    def save_order_id(
        self,
        conversation_id: str,
        order_id: str
    ):
        if not order_id:
            return
        order_clean = order_id.strip().upper()

        db = self._get_db()
        if db is not None:
            try:
                db.conversations.update_one(
                    {"conversation_id": conversation_id},
                    {"$set": {"last_order_id": order_clean}},
                    upsert=True
                )
            except Exception as err:
                print(f"Mongo save_order_id warning: {err}")

        if conversation_id not in self.in_memory_conversations:
            self.in_memory_conversations[conversation_id] = {"conversation_id": conversation_id}
        self.in_memory_conversations[conversation_id]["last_order_id"] = order_clean

    def get_order_id(
        self,
        conversation_id: str
    ) -> Optional[str]:
        # First check stored conversation record
        db = self._get_db()
        if db is not None:
            try:
                conv = db.conversations.find_one({"conversation_id": conversation_id})
                if conv and conv.get("last_order_id"):
                    return conv["last_order_id"]
            except Exception:
                pass

        if conversation_id in self.in_memory_conversations:
            stored = self.in_memory_conversations[conversation_id].get("last_order_id")
            if stored:
                return stored

        # Fallback to history regex
        history = self.get_history(conversation_id)
        for message in reversed(history):
            match = re.search(r"\bORD\d{3,}\b", message["content"], re.IGNORECASE)
            if match:
                return match.group(0).upper()
        return None

    def clear_conversation(
        self,
        conversation_id: str
    ):
        db = self._get_db()
        if db is not None:
            try:
                db.messages.delete_many({"conversation_id": conversation_id})
                db.conversations.delete_one({"conversation_id": conversation_id})
            except Exception as err:
                print(f"Mongo clear_conversation warning: {err}")

        if conversation_id in self.in_memory_messages:
            del self.in_memory_messages[conversation_id]
        if conversation_id in self.in_memory_conversations:
            del self.in_memory_conversations[conversation_id]


conversation_memory = ConversationMemory()