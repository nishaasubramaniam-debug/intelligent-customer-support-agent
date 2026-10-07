from app.services.intent import detect_intent
from app.services.rag import search_knowledge_base
from app.services.llm import get_llm


def generate_answer(message: str) -> dict:
    """
    Generate a customer support answer using
    intent detection, RAG and Gemini.
    """

    # Step 1: Detect customer intent
    intent = detect_intent(message)

    # Step 2: Search the knowledge base
    documents = search_knowledge_base(message, k=3)

    # Step 3: Prepare retrieved context
    context_parts = []

    for document in documents:
        context_parts.append(document.page_content)

    context = "\n\n".join(context_parts)

    # Step 4: Create prompt for Gemini
    prompt = f"""
You are an intelligent customer support agent.

Customer intent:
{intent}

Customer question:
{message}

Relevant company knowledge:
{context}

Instructions:
- Answer the customer's question clearly and professionally.
- Use the company knowledge provided above.
- Do not invent company policies or information.
- If the knowledge does not contain enough information, say that
  the issue may require further assistance.
- Keep the answer concise and helpful.

Generate only the final customer support response.
"""

    # Step 5: Generate answer using Gemini
    llm = get_llm()

    response = llm.invoke(prompt)

    # Handle Gemini response content
    if isinstance(response.content, list):

        text_parts = []

        for item in response.content:

            if isinstance(item, dict):
                text = item.get("text", "")

                if text:
                    text_parts.append(text)

            elif isinstance(item, str):
                text_parts.append(item)

        answer = "".join(text_parts).strip()

    else:
        answer = str(response.content).strip()

    return {
        "intent": intent,
        "answer": answer,
        "sources": [
            document.metadata.get("source", "Unknown")
            for document in documents
        ]
    }