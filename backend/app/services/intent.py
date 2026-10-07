from app.services.llm import get_llm


def detect_intent(message: str, history: list | None = None) -> str:
    """
    Fast, deterministic intent detection with LLM fallback.
    Order of evaluation prioritized by specificity.
    """
    text = message.lower().strip()

    # Check if user is confirming an offer for human support transfer
    if history and len(history) > 0:
        last_assistant_msg = ""
        for item in reversed(history):
            if item.get("role") == "assistant":
                last_assistant_msg = item.get("content", "").lower()
                break

        if any(
            phrase in last_assistant_msg
            for phrase in [
                "human support",
                "connect you",
                "transfer you",
                "support team",
                "escalate"
            ]
        ):
            if any(
                affirm in text
                for affirm in [
                    "yes",
                    "okie",
                    "ok",
                    "sure",
                    "please",
                    "yep",
                    "yeah",
                    "proceed",
                    "do it",
                    "transfer"
                ]
            ):
                return "human_support"

    # 1. Human support
    if any(
        phrase in text
        for phrase in [
            "human",
            "agent",
            "customer service",
            "representative",
            "speak to someone",
            "talk to someone",
            "real person",
            "speak to a person",
            "support person",
            "manager",
            "escalate",
            "ticket",
            "transfer",
            "connect me",
            "connect to human"
        ]
    ):
        return "human_support"


    # 2. Payment & Billing (Check before generic order keywords)
    if any(
        phrase in text
        for phrase in [
            "charged",
            "payment",
            "paid",
            "billing",
            "transaction",
            "invoice",
            "credit card",
            "debit card",
            "bank",
            "receipt",
            "double charge",
            "charged twice",
            "duplicate charge"
        ]
    ):
        return "payment"

    # 3. Return & Refund
    if any(
        word in text
        for word in [
            "return",
            "refund",
            "money back",
            "send back",
            "cancel order",
            "cancellation",
            "exchange",
            "damaged",
            "defective"
        ]
    ):
        return "return_refund"

    # 4. Account
    if any(
        word in text
        for word in [
            "account",
            "profile",
            "login",
            "password",
            "sign in",
            "membership"
        ]
    ):
        return "account"

    # 5. Complaint
    if any(
        word in text
        for word in [
            "complaint",
            "complain",
            "issue",
            "problem",
            "bad",
            "terrible",
            "worst",
            "horrible",
            "upset",
            "angry"
        ]
    ):
        return "complaint"

    # 6. Shipping & Delivery Guidelines
    if any(
        phrase in text
        for phrase in [
            "shipping time",
            "delivery time",
            "how long delivery",
            "how long shipping",
            "shipping cost",
            "shipping fee",
            "postage",
            "address change",
            "change address"
        ]
    ):
        return "shipping"

    # 7. Order Status & Tracking
    if any(
        phrase in text
        for phrase in [
            "where is my order",
            "track my order",
            "order status",
            "track order",
            "where is the order",
            "when will my order arrive",
            "ord1",
            "ord2",
            "ord3",
            "ord4"
        ]
    ):
        return "order_status"

    # 8. Common Greetings & General Inquiries
    if any(
        text.startswith(greeting)
        for greeting in [
            "hi",
            "hello",
            "hey",
            "good morning",
            "good afternoon",
            "good evening",
            "help",
            "what can you do",
            "who are you"
        ]
    ):
        return "general_question"

    # 9. Fallback LLM Classification
    try:
        llm = get_llm()
        prompt = f"""Classify the customer message into exactly one category: order_status, return_refund, shipping, account, payment, complaint, general_question, human_support.

Message: {message}

Category:"""
        response = llm.invoke(prompt)
        result = str(response.content).strip().lower()

        valid_intents = {
            "order_status",
            "return_refund",
            "shipping",
            "account",
            "payment",
            "complaint",
            "general_question",
            "human_support"
        }

        for valid in valid_intents:
            if valid in result:
                return valid

    except Exception as err:
        print(f"Intent LLM fallback warning: {err}")

    return "general_question"