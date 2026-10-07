# Intelligent Customer Support Agent

## 1. Project Overview

The Intelligent Customer Support Agent is an AI-powered customer support application designed to automate common customer service conversations while providing accurate, contextual, and actionable responses.

The system accepts customer messages through a web-based chat interface and processes them through an intelligent backend agent. The agent identifies the customer's intent, uses conversation history when required, retrieves relevant information from the company knowledge base, calls appropriate business tools for transactional requests, and generates a customer-facing response.

The application is designed around the following customer support scenarios:

* Order status enquiries
* Return and refund requests
* Shipping-related questions
* Payment-related issues
* Account-related questions
* General customer support questions
* Requests that require human assistance
* Questions requiring information from a company knowledge base

The project combines a modern web interface with a FastAPI backend, an LLM-based reasoning layer, retrieval-augmented generation, conversation memory, and tool calling.

---

# 2. Project Objectives

The main objectives of the project are:

1. Build an AI agent capable of handling customer conversations.
2. Detect the intent behind customer messages.
3. Maintain conversation history for contextual responses.
4. Retrieve relevant information from a company knowledge base.
5. Use business tools when customer requests require structured information.
6. Provide order and account information through tool calling.
7. Escalate conversations when the AI agent cannot safely resolve an issue.
8. Provide streaming responses through the chat API.
9. Provide a professional web-based customer support interface.
10. Separate application components so that the system can be maintained and extended easily.

---

# 3. Problem Statement

Traditional customer support systems require human agents to manually handle repetitive requests such as:

* "Where is my order?"
* "How long does shipping take?"
* "Can I return this product?"
* "I was charged twice."
* "What is your refund policy?"
* "I need to speak with a human agent."

Handling these requests manually can increase response time and workload.

The Intelligent Customer Support Agent addresses this problem by automatically processing customer messages and determining what type of assistance is required.

For example, when a customer asks:

```text
Where is my order?
```

and provides:

```text
ORD1001
```

the system can identify the request as an order-status query, call the order-status tool, retrieve the order information, and return:

```text
Your order ORD1001 is currently Shipped.
Estimated delivery: 2 days.
```

This approach allows the system to combine natural-language understanding with structured business operations.

---

# 4. System Goals

The system is designed to achieve the following goals:

## 4.1 Natural Language Understanding

The customer should be able to communicate naturally instead of selecting predefined options.

Example:

```text
Can you tell me where my package is?
```

The system should understand that the customer is asking about order status.

## 4.2 Intent Detection

The system identifies the purpose of the customer's message.

Example intents include:

```text
order_status
return_refund
shipping
payment
human_support
```

## 4.3 Context Awareness

The system maintains conversation history so that subsequent messages can be interpreted in context.

For example:

```text
Customer:
Where is my order?

Agent:
Please provide your order number.

Customer:
ORD1001
```

The second message should be interpreted in relation to the previous conversation.

## 4.4 Knowledge Retrieval

The system can retrieve relevant information from a company knowledge base instead of depending only on the model's general knowledge.

## 4.5 Tool Calling

The agent can call application tools when structured business data is required.

Example:

```text
Customer:
Where is my order ORD1001?
```

The agent can call:

```text
order_status_tool
```

and use the returned information to construct the response.

## 4.6 Human Escalation

If the system cannot safely or confidently resolve an issue, it can indicate that human assistance is required.

---

# 5. High-Level Architecture

The application follows a layered architecture.

```text
                         Customer
                            |
                            v
                  Frontend Chat Interface
                            |
                            v
                    FastAPI Chat API
                            |
                            v
                    AI Support Agent
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
    Intent Detection   Conversation      Tool Calling
                           Memory             |
          |                 |                 |
          |                 v                 +-------> Order Tool
          |            MongoDB               |
          |                                   +-------> Account Tool
          v
    Agent Decision
          |
          +----------------------+
          |                      |
          v                      v
    Knowledge Base          Business Tools
       Retrieval
          |                      |
          +----------+-----------+
                     |
                     v
                LLM Response
                     |
                     v
              Streaming API
                     |
                     v
              Frontend Chat
                     |
                     v
                  Customer
```

---

# 6. Application Workflow

The complete request-processing workflow is:

```text
Customer enters message
        |
        v
Frontend sends request
        |
        v
FastAPI receives request
        |
        v
Conversation history is loaded
        |
        v
Customer intent is detected
        |
        v
Agent determines required action
        |
        +--------------------+
        |                    |
        v                    v
Knowledge retrieval       Tool calling
        |                    |
        +---------+----------+
                  |
                  v
             LLM processing
                  |
                  v
          Response generated
                  |
                  v
        Conversation saved
                  |
                  v
        Response returned
                  |
                  v
          Frontend displays
```

---

# 7. Major Components

The project consists of the following major components:

1. Frontend application
2. FastAPI backend
3. AI agent
4. Intent detection
5. Large Language Model integration
6. Retrieval-Augmented Generation
7. Embedding system
8. Vector store
9. Conversation memory
10. Business tools
11. Human escalation
12. Streaming response system

---

# 8. Technology Stack

## Frontend

The frontend uses:

* Next.js
* React
* JavaScript
* JSX
* Tailwind CSS
* Axios

The frontend provides the customer-facing chat interface.

## Backend

The backend uses:

* Python
* FastAPI
* Uvicorn
* Pydantic

FastAPI provides the REST API layer between the frontend and AI agent.

## AI and LLM

The AI layer uses:

* Google Gemini
* `google-genai`
* `langchain-google-genai`
* LangChain components

The LLM is responsible for natural-language processing and response generation.

## Retrieval-Augmented Generation

The RAG layer is responsible for:

* Document loading
* Document processing
* Text chunking
* Embedding generation
* Vector search
* Relevant document retrieval
* Context construction

## Database

MongoDB is used for persistent application data, including conversation history and related application information.

The Python MongoDB integration is provided through PyMongo.

---

# 9. Project Directory Structure

The project is separated into frontend and backend applications.

```text
intelligent-customer-support-agent/
|
+-- backend/
|   |
|   +-- app/
|   |   |
|   |   +-- api/
|   |   |   |
|   |   |   +-- chat.py
|   |   |
|   |   +-- core/
|   |   |   |
|   |   |   +-- config.py
|   |   |   +-- database.py
|   |   |
|   |   +-- services/
|   |   |   |
|   |   |   +-- agent.py
|   |   |   +-- intent.py
|   |   |   +-- llm.py
|   |   |   +-- memory.py
|   |   |   +-- tools.py
|   |   |   +-- rag.py
|   |   |
|   |   +-- main.py
|   |
|   +-- scripts/
|   |   |
|   |   +-- ingest_documents.py
|   |
|   +-- tests/
|   |   |
|   |   +-- test_rag_manual.py
|   |   +-- test_intent_manual.py
|   |   +-- test_agent_memory_manual.py
|   |
|   +-- .env
|   +-- requirements.txt
|   +-- venv/
|
+-- frontend/
    |
    +-- app/
    |   |
    |   +-- page.js
    |   +-- globals.css
    |   +-- layout.tsx
    |   |
    |   +-- chat/
    |   +-- admin/
    |
    +-- components/
    |   |
    |   +-- ChatWindow.jsx
    |   +-- ChatInput.jsx
    |   +-- MessageBubble.jsx
    |   +-- EscalationBadge.jsx
    |
    +-- public/
    +-- package.json
    +-- next.config.ts
    +-- tsconfig.json
    +-- package-lock.json
```

The exact files may evolve as additional features are implemented.

---

# 10. Backend Architecture

The backend follows a layered architecture.

```text
API Layer
    |
    v
Agent Service
    |
    +---- Intent Service
    |
    +---- Memory Service
    |
    +---- RAG Service
    |
    +---- Tool Service
    |
    +---- LLM Service
    |
    v
External Services
    |
    +---- Gemini
    +---- MongoDB
```

This separation prevents the main FastAPI application from becoming overloaded with AI, database, and business logic.

---

# 11. FastAPI Application

The main FastAPI application is responsible for starting the API server and registering routers.

The application entry point is:

```text
backend/app/main.py
```

The main application should primarily handle:

* FastAPI initialization
* Middleware
* CORS configuration
* Router registration
* Application startup configuration

Business logic should remain inside service modules.

---

# 12. Chat API

The chat API provides endpoints for customer conversations.

The main chat router is:

```text
backend/app/api/chat.py
```

A streaming endpoint is available at:

```text
POST /api/chat/stream
```

Example request:

```text
POST http://127.0.0.1:8000/api/chat/stream
```

Parameters:

```text
message
conversation_id
order_id
email
```

Example:

```text
message=Where is my order?
conversation_id=stream-test-003
order_id=ORD1001
```

The response can be streamed to the client.

---

# 13. Streaming Responses

The application supports streaming responses so that the frontend does not necessarily have to wait for the complete AI response before displaying output.

The streaming workflow is:

```text
Customer Message
       |
       v
FastAPI
       |
       v
Agent / LLM
       |
       v
Generated response chunks
       |
       v
StreamingResponse
       |
       v
Frontend
       |
       v
Incremental display
```

The endpoint uses FastAPI's:

```python
StreamingResponse
```

This is useful for AI applications because users can see the response as it is generated.

---

# 14. Large Language Model Integration

The project integrates Google Gemini through the Google GenAI ecosystem and LangChain integration.

The relevant packages include:

```text
google-genai
langchain-google-genai
```

The LLM service is separated into its own module so that the rest of the application does not need to directly manage model configuration.

A centralized LLM service allows the project to change models or configuration without rewriting the entire application.

---

# 15. Environment Configuration

Sensitive configuration values should not be hardcoded into source files.

The backend uses environment variables.

Example `.env` structure:

```env
GOOGLE_API_KEY=your_google_api_key
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=your_database_name
```

Actual credentials should never be committed to GitHub.

The `.env` file should be included in `.gitignore`.

Example:

```text
.env
venv/
__pycache__/
.next/
node_modules/
```

---

# 16. API Key Security

The Google API key is required for communicating with the Gemini API.

The application loads the key through the backend configuration system.

The key should never be:

* Hardcoded in React components
* Exposed in browser JavaScript
* Uploaded to GitHub
* Included in screenshots
* Included in README examples

The frontend should communicate with the backend rather than directly exposing the Google API key.

---

# 17. Intent Detection

Intent detection is one of the core components of the system.

The purpose of intent detection is to determine what the customer is trying to accomplish.

Example:

```text
Customer:
Where is my order?
```

Detected intent:

```text
order_status
```

Another example:

```text
Customer:
I want to return the product.
```

Detected intent:

```text
return_refund
```

Another example:

```text
Customer:
I was charged twice for the same order.
```

Detected intent:

```text
payment
```

The intent service allows the agent to determine which workflow should be executed.

---

# 18. Supported Intent Categories

The current project uses intent categories such as:

```text
order_status
return_refund
shipping
payment
human_support
```

## Order Status

Used when the customer wants information about an existing order.

Example:

```text
Where is my order?
```

## Return and Refund

Used when the customer wants to return a product or asks about refunds.

Example:

```text
How can I return a product?
```

## Shipping

Used for general shipping questions.

Example:

```text
How long does standard shipping take?
```

## Payment

Used for payment-related problems.

Example:

```text
I was charged twice for my order.
```

## Human Support

Used when the customer explicitly requests human assistance or when the issue requires escalation.

Example:

```text
I want to talk to a human agent.
```

---

# 19. AI Agent

The central decision-making component is the agent service.

The agent receives:

```text
Customer message
Conversation ID
Order ID
Email
```

It then determines:

1. Customer intent
2. Whether conversation history is required
3. Whether knowledge retrieval is required
4. Whether a business tool is required
5. Whether human escalation is required
6. What response should be returned

The agent service coordinates the other components instead of implementing every capability itself.

---

# 20. Tool Calling

Tool calling allows the AI agent to access structured application functionality.

This is important because an LLM should not invent transactional information.

For example, if the customer asks:

```text
Where is my order ORD1001?
```

the LLM should not guess the order status.

Instead, the agent calls:

```text
order_status_tool
```

The tool returns structured information.

Example:

```json
{
  "success": true,
  "order_id": "ORD1001",
  "status": "Shipped",
  "estimated_delivery": "2 days"
}
```

The agent then converts that structured result into a customer-friendly response.

---

# 21. Order Status Tool

The order status tool is used to retrieve order information.

Example input:

```text
ORD1001
```

Example result:

```text
Status: Shipped
Estimated delivery: 2 days
```

Customer-facing response:

```text
Your order ORD1001 is currently Shipped.
Estimated delivery: 2 days.
```

Another example:

```text
ORD1002
```

can return:

```text
Status: Processing
Estimated delivery: 3 to 5 days
```

If the order does not exist, the system should return an appropriate error response rather than inventing information.

---

# 22. Account Tool

The account tool can be used when the customer needs account-related information.

Example input:

```text
customer1@example.com
```

Example account information:

```text
Name: John
Status: Active
```

Another account can return:

```text
Name: David
Status: Inactive
```

Unknown accounts should return a not-found result.

---

# 23. Retrieval-Augmented Generation

Retrieval-Augmented Generation, commonly called RAG, allows the system to answer questions using information stored in a company knowledge base.

Instead of relying only on the LLM's internal knowledge, the application retrieves relevant documents and provides them as context to the model.

The general process is:

```text
Company Documents
       |
       v
Document Loading
       |
       v
Text Extraction
       |
       v
Text Chunking
       |
       v
Embeddings
       |
       v
Vector Store
       |
       v
Similarity Search
       |
       v
Relevant Context
       |
       v
LLM
       |
       v
Final Answer
```

---

# 24. RAG Document Ingestion

The document ingestion process prepares company documents for retrieval.

The process generally includes:

1. Loading documents
2. Extracting text
3. Splitting documents into smaller chunks
4. Generating embeddings
5. Storing embeddings
6. Making the information searchable

The ingestion process should be executed whenever the knowledge base changes significantly.

Example command:

```powershell
python scripts/ingest_documents.py
```

---

# 25. Why Text Chunking Is Required

Large documents should not normally be sent to the model as one complete block.

Chunking divides documents into smaller pieces.

For example:

```text
Company Policy Document
        |
        +-- Chunk 1
        +-- Chunk 2
        +-- Chunk 3
        +-- Chunk 4
```

When a customer asks a question, the system searches these chunks and retrieves the most relevant ones.

This improves retrieval efficiency and reduces unnecessary context.

---

# 26. Embeddings

Embeddings convert text into numerical representations.

For example:

```text
"How can I return a product?"
```

is transformed into a numerical vector.

Similar meanings produce vectors that are closer together in vector space.

This allows the system to perform semantic search instead of depending only on exact keyword matches.

---

# 27. Vector Search

When a customer asks a knowledge-base question:

```text
What is your return policy?
```

the system creates an embedding for the query.

It then searches the vector store for the most relevant document chunks.

The retrieved context is passed to the LLM.

The resulting process is:

```text
Question
   |
   v
Query Embedding
   |
   v
Vector Search
   |
   v
Relevant Documents
   |
   v
LLM Context
   |
   v
Answer
```

---

# 28. Conversation Memory

Conversation memory allows the system to remember previous messages associated with a conversation.

Each conversation can be identified using a:

```text
conversation_id
```

Example:

```text
stream-test-003
```

The conversation can contain:

```text
User message
Assistant response
User message
Assistant response
```

This information can be stored in MongoDB.

---

# 29. Conversation Memory Workflow

```text
New Customer Message
        |
        v
Conversation ID
        |
        v
MongoDB
        |
        v
Previous Messages
        |
        v
Agent Context
        |
        v
New Response
        |
        v
Save Updated Conversation
```

This allows the agent to maintain context between messages.

---

# 30. Example Conversation

```text
Customer:
Where is my order?

Agent:
Please provide your order number.

Customer:
ORD1001

Agent:
Your order ORD1001 is currently Shipped.
Estimated delivery: 2 days.
```

The second customer message does not necessarily contain the complete original question, but the conversation history allows the system to understand the context.

---

# 31. Human Escalation

Not every customer problem should be handled automatically.

The application supports human escalation for cases such as:

* Customer explicitly requests a human
* The AI cannot determine the correct answer
* The issue requires manual investigation
* The available tools cannot resolve the problem
* The request involves an unsupported operation

The frontend can display an escalation status using the escalation component.

---

# 32. Frontend Application

The frontend is built using Next.js and React.

The main user interface contains:

* Application header
* AI availability indicator
* Customer support workspace
* Conversation ID
* Chat history
* Conversation panel
* Order ID input
* Email input
* Message input
* Send button
* AI response area
* Escalation status

The frontend communicates with the FastAPI backend using HTTP requests.

---

# 33. Frontend Components

## ChatWindow

The `ChatWindow` component manages the primary conversation interface.

Responsibilities include:

* Maintaining messages
* Managing conversation IDs
* Loading saved conversations
* Saving conversations
* Sending customer messages
* Receiving backend responses
* Managing loading state
* Managing escalation status
* Managing order ID
* Managing email

## ChatInput

The `ChatInput` component handles customer message entry.

It provides:

* Text input
* Send action
* Enter-key support
* Loading state

## MessageBubble

The `MessageBubble` component displays individual messages.

It distinguishes between:

```text
user
assistant
```

messages.

## EscalationBadge

The `EscalationBadge` component displays whether a conversation requires human support.

---

# 34. Frontend Conversation Storage

The frontend currently uses browser local storage for conversation history.

The storage key is:

```text
chat_conversations
```

This allows conversations to remain available after refreshing the browser.

Example structure:

```json
[
  {
    "id": "conversation-001",
    "title": "Where is my order?",
    "messages": [],
    "escalationStatus": null
  }
]
```

The backend conversation memory provides persistent server-side storage, while frontend local storage supports the user interface's local conversation history.

---

# 35. Professional User Interface

The interface is designed for a professional customer support environment.

The main design principles are:

* Clear information hierarchy
* Minimal visual clutter
* Consistent spacing
* Readable typography
* Strong contrast
* Clear status indicators
* Responsive layout
* Distinct user and assistant messages
* Clear conversation history
* Simple message composition

The interface should remain usable on:

* Desktop
* Laptop
* Tablet
* Mobile devices

---

# 36. Frontend and Backend Communication

The frontend communicates with the backend through:

```text
http://localhost:8000
```

The Next.js application runs separately, normally on:

```text
http://localhost:3000
```

The development architecture is therefore:

```text
Browser
   |
   +----------------------------+
   |                            |
   v                            v
Next.js                       FastAPI
Port 3000                     Port 8000
   |                            |
   |                            v
   |                         AI Agent
   |                            |
   |                  +---------+---------+
   |                  |         |         |
   |                  v         v         v
   |               Gemini    MongoDB    Tools
   |
   +--------------------------+
```

---

# 37. CORS

Because the frontend and backend run on different ports, Cross-Origin Resource Sharing must be configured correctly.

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://127.0.0.1:8000
```

The FastAPI backend should allow the frontend origin during development.

For production, CORS should be restricted to the actual deployed frontend domain.

---

# 38. Backend Setup

Navigate to the backend:

```powershell
cd C:\Users\nisha\intelligent-customer-support-agent\backend
```

Create or activate the virtual environment:

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell activation is unavailable, the Python executable inside the environment can be called directly:

```powershell
.\venv\Scripts\python.exe
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

---

# 39. Environment Setup

Create:

```text
backend/.env
```

Add the required configuration values.

Example:

```env
GOOGLE_API_KEY=your_api_key
MONGODB_URI=your_mongodb_uri
DATABASE_NAME=your_database_name
```

Replace the placeholder values with the actual credentials.

Do not commit this file to Git.

---

# 40. Starting the Backend

From:

```text
C:\Users\nisha\intelligent-customer-support-agent\backend
```

run:

```powershell
uvicorn app.main:app --reload
```

Expected output:

```text
Uvicorn running on http://127.0.0.1:8000
Application startup complete.
```

---

# 41. Backend Health Check

Open:

```text
http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

This confirms that the FastAPI application is running.

---

# 42. FastAPI Documentation

FastAPI automatically provides interactive API documentation.

Open:

```text
http://127.0.0.1:8000/docs
```

The documentation can be used to test endpoints without requiring the frontend.

---

# 43. Testing the Order Tool

A direct agent test can be performed using Python.

Example:

```powershell
python -c "from app.services.agent import run_agent; result=run_agent(message='Where is my order?', conversation_id='stream-direct-test-002', order_id='ORD1001', email=None); print(result)"
```

Expected result:

```text
{
  'conversation_id': 'stream-direct-test-002',
  'intent': 'order_status',
  'response': 'Your order ORD1001 is currently Shipped. Estimated delivery: 2 days.',
  'tool_used': 'order_status_tool'
}
```

The exact representation may differ depending on the implementation.

---

# 44. Testing the Streaming Endpoint

The streaming endpoint can be tested through the FastAPI documentation or a command-line request.

Example:

```bash
curl -X POST \
"http://127.0.0.1:8000/api/chat/stream?message=Where%20is%20my%20order%3F&conversation_id=stream-test-003&order_id=ORD1001" \
-H "accept: */*" \
-d ""
```

Expected response:

```text
Your order ORD1001 is currently Shipped. Estimated delivery: 2 days.
```

---

# 45. Frontend Setup

Open a second terminal.

Navigate to:

```powershell
cd C:\Users\nisha\intelligent-customer-support-agent\frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Expected output:

```text
Next.js
Local: http://localhost:3000
```

Open:

```text
http://localhost:3000
```

---

# 46. Running the Complete Application

Two terminals should normally be running.

## Terminal 1 — Backend

```powershell
cd C:\Users\nisha\intelligent-customer-support-agent\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

## Terminal 2 — Frontend

```powershell
cd C:\Users\nisha\intelligent-customer-support-agent\frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# 47. Complete Request Example

Customer enters:

```text
Where is my order?
```

Order ID:

```text
ORD1001
```

The frontend sends the request to the backend.

The backend:

```text
Receives message
      |
      v
Loads conversation
      |
      v
Detects order_status
      |
      v
Calls order_status_tool
      |
      v
Receives order information
      |
      v
Generates response
      |
      v
Saves conversation
      |
      v
Returns response
```

Final response:

```text
Your order ORD1001 is currently Shipped.
Estimated delivery: 2 days.
```

---

# 48. Example Shipping Query

Customer:

```text
How long does standard shipping take?
```

Intent:

```text
shipping
```

The system can retrieve the relevant shipping information and provide a concise response.

Example:

```text
Standard shipping typically takes 3 to 7 business days.
```

---

# 49. Example Return Query

Customer:

```text
How can I return a product?
```

Intent:

```text
return_refund
```

The agent should use the available knowledge-base information rather than inventing a return policy.

The retrieved policy is supplied to the LLM as context.

---

# 50. Example Payment Query

Customer:

```text
I was charged twice for my order.
```

Intent:

```text
payment
```

The agent can identify this as a payment-related issue and provide the appropriate support response or escalate it when necessary.

---

# 51. Error Handling

The application should handle failures at multiple levels.

Potential failures include:

* Invalid API credentials
* Model unavailable
* API quota exceeded
* MongoDB authentication failure
* MongoDB connection failure
* Backend unavailable
* Frontend unable to reach backend
* Invalid order ID
* Unknown customer account
* Knowledge-base retrieval failure
* Tool execution failure
* Streaming failure

The application should return user-friendly messages rather than exposing internal stack traces to customers.

---

# 52. MongoDB Authentication Errors

A common backend error is:

```text
pymongo.errors.OperationFailure:
bad auth : authentication failed
```

This normally indicates a problem with MongoDB credentials or the connection string.

The MongoDB connection should be tested independently before testing conversation memory.

Example:

```powershell
python -c "from app.core.database import client; print(client.admin.command('ping'))"
```

A successful connection returns:

```text
{'ok': 1}
```

---

# 53. Gemini Model Errors

The AI service can fail if the configured model is unavailable for the API account or project.

For example, an unavailable model may return:

```text
404 NOT_FOUND
```

The model configuration should therefore be centralized in the LLM service or application configuration.

This prevents model changes from requiring modifications across multiple files.

---

# 54. API Quota Errors

Gemini API usage can be restricted by account or project quotas.

A quota error can appear as:

```text
429 RESOURCE_EXHAUSTED
```

This is different from an invalid API key.

The application should distinguish between:

```text
Authentication errors
Model availability errors
Quota errors
Temporary service errors
```

This allows better error messages and retry behavior.

---

# 55. Frontend Network Errors

If the frontend displays:

```text
AxiosError: Network Error
```

the first things to verify are:

1. FastAPI is running.
2. Backend is listening on port 8000.
3. Frontend is using the correct backend URL.
4. CORS is configured correctly.
5. The `/health` endpoint is reachable.

The backend can be tested at:

```text
http://127.0.0.1:8000/health
```

The frontend normally runs at:

```text
http://localhost:3000
```

---

# 56. Next.js Hydration Errors

Next.js can report hydration errors when server-rendered content differs from client-rendered content.

One common cause is generating changing values during rendering.

For example:

```javascript
Date.now()
```

or:

```javascript
Math.random()
```

should not be used directly in server-rendered markup when the value is expected to remain identical between server and client.

Conversation IDs should be generated in an appropriate client-side lifecycle or supplied through stable state.

---

# 57. Conversation ID Management

Each conversation requires a unique identifier.

Example:

```text
conversation-001
```

The conversation ID allows the application to associate messages with a specific conversation.

It is used by:

* Frontend conversation state
* Backend chat requests
* Conversation memory
* MongoDB records
* Conversation history

A stable conversation ID is important for maintaining context.

---

# 58. Local Storage Management

During development, old conversation data may remain in the browser.

The application uses:

```text
chat_conversations
```

for frontend conversation storage.

To clear development test data, open the browser console and execute:

```javascript
localStorage.removeItem("chat_conversations");
location.reload();
```

This should only be used when intentionally clearing local development history.

---

# 59. Testing Strategy

Testing is performed at multiple levels.

## Component Testing

Individual services can be tested separately.

Examples:

```text
Intent detection
LLM service
RAG retrieval
Database connection
Tools
Conversation memory
```

## Integration Testing

Multiple components can be tested together.

Example:

```text
Agent
+
Intent
+
Tool
+
Memory
```

## API Testing

FastAPI endpoints can be tested using:

```text
Swagger UI
curl
browser requests
```

## Frontend Testing

The complete application can be tested through:

```text
http://localhost:3000
```

---

# 60. Recommended Test Cases

The following scenarios should be tested.

| Test Case           | Input                         | Expected Behavior          |
| ------------------- | ----------------------------- | -------------------------- |
| Order status        | Where is my order? + ORD1001  | Order status returned      |
| Processing order    | Where is order ORD1002?       | Processing status returned |
| Unknown order       | ORD9999                       | Order-not-found response   |
| Shipping            | How long is shipping?         | Shipping information       |
| Return              | How can I return a product?   | Return information         |
| Payment             | I was charged twice           | Payment support            |
| Human support       | I want a human agent          | Escalation                 |
| Account             | Account status request        | Account tool               |
| Unknown account     | Unknown email                 | Account-not-found response |
| Conversation memory | Multiple related messages     | Previous context retained  |
| Streaming           | Streaming endpoint request    | Response streamed          |
| Invalid backend     | Frontend with backend stopped | Friendly connection error  |

---

# 61. Example Tool Test Data

## Order ORD1001

```text
Order ID: ORD1001
Status: Shipped
Estimated delivery: 2 days
```

## Order ORD1002

```text
Order ID: ORD1002
Status: Processing
Estimated delivery: 3 to 5 days
```

## Unknown Order

```text
Order ID: ORD9999
Result: Order not found
```

## Account

```text
customer1@example.com
Name: John
Status: Active
```

```text
customer3@example.com
Name: David
Status: Inactive
```

---

# 62. Advantages of the Architecture

The architecture provides several advantages.

## Modularity

Each responsibility is separated into its own service.

## Maintainability

Changes to the LLM do not require rewriting the API layer.

## Scalability

Additional tools can be added without redesigning the entire application.

## Extensibility

Additional intents, knowledge sources, and business operations can be added.

## Context Awareness

Conversation memory allows multi-turn conversations.

## Accuracy

Tool calling allows the system to retrieve structured information instead of guessing transactional information.

## User Experience

Streaming responses provide a more interactive experience.

---

# 63. Security Considerations

The production version should implement stronger security controls.

Important considerations include:

* Protect API keys
* Never expose secret keys to the frontend
* Validate all incoming parameters
* Validate order IDs
* Validate email addresses
* Restrict CORS
* Add authentication and authorization
* Rate-limit public APIs
* Sanitize user input
* Protect database credentials
* Log security events
* Avoid exposing internal exceptions
* Use HTTPS in production
* Protect administrative endpoints

---

# 64. Production Considerations

The current application is suitable for development and demonstration.

Before production deployment, additional infrastructure should be considered.

Recommended production components include:

```text
Frontend
    |
    v
Production Web Hosting
    |
    v
HTTPS
    |
    v
FastAPI Backend
    |
    +---- MongoDB
    |
    +---- Gemini API
    |
    +---- Vector Database
```

Production configuration should use environment variables and deployment secrets instead of local `.env` files.

---

# 65. Logging

The backend should maintain useful application logs.

Examples include:

```text
Incoming request
Detected intent
Tool selected
Tool result
RAG retrieval
Conversation ID
Escalation event
API error
```

Sensitive information such as API keys and passwords must never be logged.

---

# 66. Future Enhancements

Possible future improvements include:

## Authentication

Add customer login and secure sessions.

## Admin Dashboard

Provide support agents with a dashboard showing:

* Active conversations
* Escalated conversations
* Customer information
* Order information
* Conversation history

## Ticket Management

Automatically create support tickets for escalated conversations.

## Advanced RAG

Improve retrieval using:

* Hybrid search
* Metadata filtering
* Re-ranking
* Multiple knowledge sources

## Analytics

Add metrics such as:

* Number of conversations
* Most common intents
* Escalation rate
* Average response time
* Tool usage
* Customer satisfaction

## Feedback

Allow customers to rate responses.

## Multilingual Support

Support multiple customer languages.

## Authentication and Authorization

Add role-based access for:

```text
Customer
Support Agent
Administrator
```

## Production Monitoring

Add application monitoring and error tracking.

---

# 67. Example End-to-End Scenario

Consider the following conversation.

```text
Customer:
Where is my order?
```

The system detects:

```text
intent = order_status
```

The agent determines that an order identifier is required.

```text
Agent:
Please provide your order number.
```

Customer:

```text
ORD1001
```

The agent calls:

```text
order_status_tool
```

The tool returns:

```json
{
  "success": true,
  "order_id": "ORD1001",
  "status": "Shipped",
  "estimated_delivery": "2 days"
}
```

The agent produces:

```text
Your order ORD1001 is currently Shipped.
Estimated delivery: 2 days.
```

The conversation is then saved to memory.

This demonstrates the complete workflow:

```text
Natural Language
      |
      v
Intent Detection
      |
      v
Agent Decision
      |
      v
Tool Calling
      |
      v
Structured Data
      |
      v
LLM Response
      |
      v
Conversation Memory
      |
      v
Customer
```

---

# 68. Project Development Phases

The project can be developed in the following phases.

## Phase 1 — Project Setup

* Create backend
* Create frontend
* Configure virtual environment
* Install dependencies
* Configure environment variables

## Phase 2 — Backend

* Create FastAPI application
* Configure CORS
* Create API routes
* Configure database
* Create service structure

## Phase 3 — LLM

* Configure Gemini
* Create LLM service
* Test model connection
* Implement response generation

## Phase 4 — Intent Detection

* Define intents
* Implement intent classification
* Test common customer messages

## Phase 5 — Tools

* Implement order tool
* Implement account tool
* Connect tools to agent
* Test tool responses

## Phase 6 — Conversation Memory

* Configure MongoDB
* Save messages
* Retrieve history
* Test multi-turn conversations

## Phase 7 — RAG

* Prepare knowledge documents
* Implement ingestion
* Generate embeddings
* Store vectors
* Implement retrieval

## Phase 8 — Agent

* Combine intent detection
* Combine memory
* Combine RAG
* Combine tools
* Implement escalation

## Phase 9 — Streaming

* Implement streaming endpoint
* Connect frontend
* Display streaming responses

## Phase 10 — Frontend

* Create professional chat interface
* Add conversation history
* Add customer information
* Add order information
* Add escalation indicators

## Phase 11 — Testing

* Unit tests
* Integration tests
* API tests
* Frontend testing
* Error handling

## Phase 12 — Deployment

* Deploy frontend
* Deploy backend
* Configure environment variables
* Configure production database
* Configure API access
* Test production system

---

# 69. Project Status

The project currently contains the core architecture required for an intelligent customer support system.

Implemented areas include:

* FastAPI backend
* Next.js frontend
* Gemini integration
* Intent detection
* Agent service
* Order status tool
* Account tool
* MongoDB conversation memory
* Streaming chat endpoint
* Frontend chat interface
* Conversation history
* Escalation component
* RAG-oriented architecture
* Development API documentation

Further development can focus on UI refinement, production-ready RAG integration, stronger error handling, authentication, analytics, and deployment.

---

# 70. Conclusion

The Intelligent Customer Support Agent demonstrates how modern AI technologies can be combined with conventional backend services to build an automated customer support platform.

The system does not rely solely on an LLM. Instead, it combines multiple components:

```text
LLM
+
Intent Detection
+
RAG
+
Conversation Memory
+
Tool Calling
+
Human Escalation
+
FastAPI
+
MongoDB
+
Next.js
```

This architecture allows the application to handle natural-language conversations while also interacting with structured business data.

The project provides a foundation for a scalable customer support platform that can be expanded with authentication, advanced retrieval, ticket management, analytics, multilingual support, and production deployment.

---

# 71. Quick Start

For development, start the backend first.

```powershell
cd C:\Users\nisha\intelligent-customer-support-agent\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Verify:

```text
http://127.0.0.1:8000/health
```

Then start the frontend in a second terminal:

```powershell
cd C:\Users\nisha\intelligent-customer-support-agent\frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

The complete development environment is then:

```text
Frontend
http://localhost:3000

Backend
http://127.0.0.1:8000

API Documentation
http://127.0.0.1:8000/docs

Health Check
http://127.0.0.1:8000/health
```

---

# 72. Final System Architecture

```text
                       INTELLIGENT CUSTOMER
                         SUPPORT AGENT
                              |
                              v
                    +-------------------+
                    |   Next.js Client  |
                    |   React Interface |
                    +---------+---------+
                              |
                              | HTTP / Streaming
                              v
                    +-------------------+
                    |    FastAPI API    |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    |    Agent Service  |
                    +---------+---------+
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
      Intent Detection   Conversation      Tool Calling
                            Memory               |
             |                |                  |
             |                v                  +---- Order Tool
             |             MongoDB               |
             |                                   +---- Account Tool
             v
      Agent Decision
             |
             +-------------------+
             |                   |
             v                   v
       RAG Retrieval        Human Escalation
             |
             v
       Knowledge Base
             |
             v
        Gemini LLM
             |
             v
      Generated Response
             |
             v
      Streaming / API
             |
             v
       Next.js Client
             |
             v
          Customer
```

This architecture separates the user interface, API layer, AI reasoning, retrieval, memory, and business operations, making the application easier to understand, test, maintain, and extend.
