import re
import json
from app.services.intent import detect_intent
from app.services.rag import search_knowledge_base
from app.services.llm import get_llm, stream_llm_response
from app.services.memory import conversation_memory

from app.tools.order_tool import get_order_status
from app.tools.account_tool import get_account_info
from app.tools.escalation_tool import escalate_to_human


from app.services.translation import translate_text

def run_agent(
    message: str,
    conversation_id: str,
    order_id: str | None = None,
    email: str | None = None,
    language: str = "English"
) -> dict:
    """
    Main AI customer support agent.
    """

    # Get previous conversation history
    history = conversation_memory.get_history(conversation_id)

    # Get previously remembered order ID
    remembered_order_id = conversation_memory.get_order_id(conversation_id)

    # Clean current message
    clean_message = message.strip().upper()

    is_pure_order_id = bool(
        clean_message.startswith("ORD") and clean_message[3:].isdigit()
    )

    # Intent Detection
    if is_pure_order_id:
        previous_user_messages = [
            item["content"] for item in history if item["role"] == "user"
        ]
        if previous_user_messages:
            previous_message = previous_user_messages[-1].lower()
            if "return" in previous_message or "refund" in previous_message:
                intent = "return_refund"
            elif "payment" in previous_message or "charged" in previous_message or "billing" in previous_message:
                intent = "payment"
            elif "complaint" in previous_message:
                intent = "complaint"
            elif "shipping" in previous_message or "delivery" in previous_message:
                intent = "shipping"
            else:
                intent = "order_status"
        else:
            intent = "order_status"
    else:
        intent = detect_intent(message, history)


    # Order ID Resolution
    if order_id:
        order_id = order_id.strip().upper()
    else:
        match = re.search(r"ORD\d+", clean_message)
        if match:
            order_id = match.group(0)
        elif remembered_order_id:
            order_id = remembered_order_id

    # HUMAN SUPPORT ESCALATION
    if intent == "human_support":
        escalation_result = escalate_to_human(
            customer_message=message,
            reason="Customer requested human support.",
            conversation_id=conversation_id
        )

        response = (
            f"I have escalated your request to a human support agent. "
            f"Your support ticket is {escalation_result['ticket_id']}."
        )

        conversation_memory.add_message(conversation_id, "user", message)
        conversation_memory.add_message(conversation_id, "assistant", response)

        return {
            "conversation_id": conversation_id,
            "intent": intent,
            "response": response,
            "tool_used": "escalation_tool",
            "tool_result": escalation_result,
            "sources": []
        }

    # ORDER STATUS RESOLUTION & CONTEXT INGESTION
    order_info_text = "No active order specified."

    if order_id:
        conversation_memory.save_order_id(conversation_id, order_id)
        order_result = get_order_status(order_id)

        if order_result.get("success"):
            order_info_text = (
                f"Order {order_result['order_id']} status is '{order_result['status']}'. "
                f"Estimated delivery: {order_result.get('estimated_delivery', 'N/A')}."
            )
        else:
            order_info_text = f"Order ID {order_id} was not found in database."

        # Return direct tool status ONLY if user typed pure Order ID or asked specifically for order tracking status
        if is_pure_order_id or intent == "order_status":
            if order_result["success"]:
                response = (
                    f"Your order {order_result['order_id']} is currently {order_result['status']}. "
                    f"Estimated delivery: {order_result['estimated_delivery']}."
                )
            else:
                response = (
                    f"I couldn't find an order with ID {order_id}. "
                    "Please check your order ID and try again."
                )

            conversation_memory.add_message(conversation_id, "user", message)
            conversation_memory.add_message(conversation_id, "assistant", response)

            return {
                "conversation_id": conversation_id,
                "intent": intent,
                "response": response,
                "tool_used": "order_status_tool",
                "tool_result": order_result,
                "sources": []
            }

    # ACCOUNT INFORMATION TOOL
    if intent == "account" and email:
        account_result = get_account_info(email)

        if account_result["success"]:
            response = f"Your account is currently {account_result['account_status']}."
        else:
            response = f"I couldn't find an account associated with {email}."

        conversation_memory.add_message(conversation_id, "user", message)
        conversation_memory.add_message(conversation_id, "assistant", response)

        return {
            "conversation_id": conversation_id,
            "intent": intent,
            "response": response,
            "tool_used": "account_tool",
            "tool_result": account_result,
            "sources": []
        }

    # RAG KNOWLEDGE SEARCH & GEMINI AI GENERATION
    documents = search_knowledge_base(message, k=3)

    context_parts = [document.page_content for document in documents]
    context = "\n\n".join(context_parts)

    history_text = ""
    for item in history:
        history_text += f"{item['role']}: {item['content']}\n"

    llm = get_llm()

    prompt = f"""
You are Nexus AI, a highly intelligent, natural, helpful, and versatile AI Customer Support Assistant (powered by advanced conversational AI like ChatGPT and Gemini).

Conversation Memory & History:
{history_text}

Detected Customer Intent: {intent}
Associated Order Information: {order_info_text}

Current Customer Message:
"{message}"

Relevant Company Knowledge Base Documents (ChromaDB Vector Retrieval):
{context}

Core Response Instructions:
1. **Conversational AI Excellence (ChatGPT / Gemini Style)**:
   - Be warm, professional, helpful, and conversational.
   - Directly answer whatever specific question, request, or inquiry the customer is asking.
2. **Order & Cancellation Handling**:
   - If Associated Order Information is provided above (e.g. Order ORD1002 status is Processing or Shipped), incorporate this live status directly into your answer.
   - For order cancellation questions: If the order status is "Processing" (not shipped yet), inform the customer that their order can be cancelled before dispatch, and ask if they would like you to connect them with human support to complete the cancellation right away. If "Shipped", explain that shipped orders cannot be cancelled mid-transit, but can be returned within 7 days of delivery.
3. **Knowledge Base Grounding**:
   - When specific company policies (returns, refunds, shipping times, payment rules, FAQ) are present in the Company Knowledge Base above, strictly follow and cite those official guidelines.
4. **Helpful & Smart Guidance**:
   - Provide clear, friendly, standard step-by-step guidance.
   - NEVER say "I don't have information in my knowledge base" or refuse to assist.
5. **Format & Tone**:
   - Keep responses clean, natural, well-formatted, and easy to read.

Return your direct customer response below:
"""

    try:
        response = llm.invoke(prompt)
    except Exception as error:
        print(f"LLM invoke warning: {error}")
        if context and len(context.strip()) > 10:
            final_response = (
                f"Based on our company policy:\n\n{context}\n\n"
                "If you need further assistance, please feel free to ask or request human support."
            )
        else:
            final_response = (
                "I'm currently experiencing high demand or a temporary service interruption from the AI model. "
                "Please try again in a few moments, or ask to speak with a human support agent."
            )
        conversation_memory.add_message(conversation_id, "user", message)
        conversation_memory.add_message(conversation_id, "assistant", final_response)
        return {
            "conversation_id": conversation_id,
            "intent": intent,
            "response": final_response,
            "tool_used": None,
            "tool_result": None,
            "sources": [document.metadata.get("source", "Unknown") for document in documents]
        }

    if isinstance(response.content, list):
        text_parts = []
        for item in response.content:
            if isinstance(item, dict):
                value = item.get("text", "")
                if value:
                    text_parts.append(value)
            elif isinstance(item, str):
                text_parts.append(item)
        final_response = "".join(text_parts).strip()
    else:
        final_response = str(response.content).strip()

    if language and language.lower() != "english":
        final_response = translate_text(final_response, target_language=language)

    conversation_memory.add_message(conversation_id, "user", message)
    conversation_memory.add_message(conversation_id, "assistant", final_response)

    return {
        "conversation_id": conversation_id,
        "intent": intent,
        "response": final_response,
        "tool_used": None,
        "tool_result": None,
        "sources": [document.metadata.get("source", "Unknown") for document in documents]
    }


def run_agent_stream(
    message: str,
    conversation_id: str,
    order_id: str | None = None,
    email: str | None = None,
    language: str = "English"
):
    def format_sse(event_type: str, value) -> str:
        return f"data: {json.dumps({'type': event_type, 'value': value})}\n\n"

    history = conversation_memory.get_history(conversation_id)
    remembered_order_id = conversation_memory.get_order_id(conversation_id)
    clean_message = message.strip().upper()

    is_pure_order_id = bool(
        clean_message.startswith("ORD") and clean_message[3:].isdigit()
    )

    if is_pure_order_id:
        previous_user_messages = [
            item["content"] for item in history if item["role"] == "user"
        ]
        if previous_user_messages:
            previous_message = previous_user_messages[-1].lower()
            if "return" in previous_message or "refund" in previous_message:
                intent = "return_refund"
            elif "payment" in previous_message or "charged" in previous_message or "billing" in previous_message:
                intent = "payment"
            elif "complaint" in previous_message:
                intent = "complaint"
            elif "shipping" in previous_message or "delivery" in previous_message:
                intent = "shipping"
            else:
                intent = "order_status"
        else:
            intent = "order_status"
    else:
        intent = detect_intent(message, history)


    yield format_sse("intent", intent)

    if order_id:
        order_id = order_id.strip().upper()
    else:
        match = re.search(r"ORD\d+", clean_message)
        if match:
            order_id = match.group(0)
        elif remembered_order_id:
            order_id = remembered_order_id

    # HUMAN SUPPORT ESCALATION
    if intent == "human_support":
        escalation_result = escalate_to_human(
            customer_message=message,
            reason="Customer requested human support.",
            conversation_id=conversation_id
        )

        response = (
            f"I have escalated your request to a human support agent. "
            f"Your support ticket is {escalation_result['ticket_id']}."
        )

        conversation_memory.add_message(conversation_id, "user", message)
        conversation_memory.add_message(conversation_id, "assistant", response)

        yield format_sse("tool", "escalate_to_human")
        yield format_sse("escalation", escalation_result)
        yield format_sse("token", response)
        return

    # ORDER STATUS RESOLUTION & CONTEXT INGESTION
    order_info_text = "No active order specified."

    if order_id:
        conversation_memory.save_order_id(conversation_id, order_id)
        order_result = get_order_status(order_id)

        if order_result.get("success"):
            order_info_text = (
                f"Order {order_result['order_id']} status is '{order_result['status']}'. "
                f"Estimated delivery: {order_result.get('estimated_delivery', 'N/A')}."
            )
        else:
            order_info_text = f"Order ID {order_id} was not found in database."

        # Return direct tool status ONLY if user typed pure Order ID or asked specifically for order tracking status
        if is_pure_order_id or intent == "order_status":
            if order_result["success"]:
                response = (
                    f"Your order {order_result['order_id']} is currently {order_result['status']}. "
                    f"Estimated delivery: {order_result['estimated_delivery']}."
                )
            else:
                response = (
                    f"I couldn't find an order with ID {order_id}. "
                    "Please check your order ID and try again."
                )

            conversation_memory.add_message(conversation_id, "user", message)
            conversation_memory.add_message(conversation_id, "assistant", response)

            yield format_sse("tool", "get_order_status")
            yield format_sse("token", response)
            return

    # ACCOUNT TOOL
    if intent == "account" and email:
        account_result = get_account_info(email)

        if account_result["success"]:
            response = f"Your account is currently {account_result['account_status']}."
        else:
            response = f"I couldn't find an account associated with {email}."

        conversation_memory.add_message(conversation_id, "user", message)
        conversation_memory.add_message(conversation_id, "assistant", response)

        yield format_sse("tool", "get_account_info")
        yield format_sse("token", response)
        return

    # RAG KNOWLEDGE SEARCH & GEMINI AI GENERATION
    documents = search_knowledge_base(message, k=3)

    sources = [
        doc.metadata.get("source", "knowledge_base")
        for doc in documents
        if hasattr(doc, "metadata")
    ]

    context_parts = [document.page_content for document in documents]
    context = "\n\n".join(context_parts)

    yield format_sse("tool", "knowledge_base")
    if sources:
        yield format_sse("sources", sources)

    history_text = ""
    for item in history:
        history_text += f"{item['role']}: {item['content']}\n"

    prompt = f"""
You are Nexus AI, a highly intelligent, natural, helpful, and versatile AI Customer Support Assistant (powered by advanced conversational AI like ChatGPT and Gemini).

Conversation Memory & History:
{history_text}

Detected Customer Intent: {intent}
Associated Order Information: {order_info_text}

Current Customer Message:
"{message}"

Relevant Company Knowledge Base Documents (ChromaDB Vector Retrieval):
{context}

Core Response Instructions:
1. **Conversational AI Excellence (ChatGPT / Gemini Style)**:
   - Be warm, professional, helpful, and conversational.
   - Directly answer whatever specific question, request, or inquiry the customer is asking.
2. **Order & Cancellation Handling**:
   - If Associated Order Information is provided above (e.g. Order ORD1002 status is Processing or Shipped), incorporate this live status directly into your answer.
   - For order cancellation questions: If the order status is "Processing" (not shipped yet), inform the customer that their order can be cancelled before dispatch, and ask if they would like you to connect them with human support to complete the cancellation right away. If "Shipped", explain that shipped orders cannot be cancelled mid-transit, but can be returned within 7 days of delivery.
3. **Knowledge Base Grounding**:
   - When specific company policies (returns, refunds, shipping times, payment rules, FAQ) are present in the Company Knowledge Base above, strictly follow and cite those official guidelines.
4. **Helpful & Smart Guidance**:
   - Provide clear, friendly, standard step-by-step guidance.
   - NEVER say "I don't have information in my knowledge base" or refuse to assist.
5. **Format & Tone**:
   - Keep responses clean, natural, well-formatted, and easy to read.

Return your direct customer response below:
"""

    full_response = ""

    try:
        for chunk in stream_llm_response(prompt):
            full_response += chunk
            yield format_sse("token", chunk)
    except Exception as error:
        print(f"Stream LLM error: {error}")
        fallback_response = (
            "I'm currently experiencing high demand or a temporary service interruption from the AI model. "
            "Please try again in a few moments, or ask to speak with a human support agent."
        )
        full_response = fallback_response
        yield format_sse("token", fallback_response)

    conversation_memory.add_message(conversation_id, "user", message)
    conversation_memory.add_message(conversation_id, "assistant", full_response)