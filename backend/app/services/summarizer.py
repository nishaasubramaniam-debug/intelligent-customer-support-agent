import json
from app.services.llm import generate_llm_response
from app.services.rag import search_knowledge_base

def summarize_and_suggest(ticket: dict) -> dict:
    """
    Generates an AI Auto-Summary and Smart Response Suggestion for a ticket.
    """
    customer_msg = ticket.get("customer_message", "")
    reason = ticket.get("reason", "")
    messages = ticket.get("messages", [])

    # Reconstruct thread context
    thread_text = ""
    for m in messages:
        sender = "Support Staff" if m.get("sender") == "admin" else "Customer"
        thread_text += f"{sender}: {m.get('text', '')}\n"

    if not thread_text:
        thread_text = f"Customer: {customer_msg}"

    # Search Knowledge Base for relevant context
    documents = search_knowledge_base(customer_msg or reason, k=2)
    kb_context = "\n\n".join([doc.page_content for doc in documents])

    prompt = f"""
You are an AI Support Copilot for human customer service agents.
Analyze the following customer support ticket and live conversation thread, then generate a structured response.

Ticket Information:
- Customer Initial Message: "{customer_msg}"
- Escalation Reason: "{reason}"
- Conversation Thread:
{thread_text}

Relevant Company Knowledge Base Policies:
{kb_context}

Output format requirements:
Provide your response strictly in valid JSON format matching this schema:
{{
  "summary": "<1-2 sentence executive summary of the issue and current status>",
  "key_points": ["<Key point 1>", "<Key point 2>", "<Key point 3>"],
  "suggested_reply": "<A polite, professional, complete support response that the human agent can send directly to the customer>"
}}

Respond ONLY with the JSON string, no extra markdown wrapper.
"""

    try:
        res = generate_llm_response(prompt)
        content = res.text if hasattr(res, "text") and res.text else str(res)
        if isinstance(content, list):
            content = "".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
        
        # Clean JSON markdown blocks if present
        clean_content = content.strip()
        if clean_content.startswith("```json"):
            clean_content = clean_content[7:]
        if clean_content.startswith("```"):
            clean_content = clean_content[3:]
        if clean_content.endswith("```"):
            clean_content = clean_content[:-3]
        clean_content = clean_content.strip()

        data = json.loads(clean_content)
        return {
            "success": True,
            "summary": data.get("summary", "Customer support request escalated to human staff."),
            "key_points": data.get("key_points", [f"Issue: {customer_msg}"]),
            "suggested_reply": data.get("suggested_reply", f"Hello! I am reviewing your request regarding '{customer_msg}' and will assist you shortly.")
        }
    except Exception as err:
        print("AI Summarizer LLM invocation error, falling back:", err)
        # Fallback intelligent summary
        return {
            "success": True,
            "summary": f"Customer is requesting assistance regarding: '{customer_msg}'. Escalation reason: {reason}.",
            "key_points": [
                f"Customer Query: {customer_msg}",
                f"Reason: {reason}",
                "Requires Support Staff Verification"
            ],
            "suggested_reply": f"Hello! Thank you for reaching out to support. I am reviewing your request regarding '{customer_msg}' and will be happy to assist you directly."
        }
