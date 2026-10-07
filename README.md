# 🤖 Intelligent Customer Support Agent

An enterprise-grade, full-stack AI Customer Support Platform powered by **Gemini 3.5 Flash LLM**, **LangChain**, **ChromaDB Vector RAG**, **FastAPI**, and **Next.js 16 (Turbopack)**.

The system handles customer conversations 24/7, searches company knowledge bases using vector similarity, detects user intent, executes autonomous business tools, and escalates complex issues to human support staff with live two-way handover.

---

## 🌟 Key Features

### 1. Conversational AI & Real-Time Streaming
* **Server-Sent Events (SSE)**: Streams AI responses token-by-token for zero-latency feedback.
* **Multi-Turn Session Memory**: Retains conversation history, active order IDs (e.g. `ORD1001`), and customer profile context.
* **Multilingual Translation**: Automatically detects user language and translates AI answers seamlessly.

### 2. Retrieval-Augmented Generation (RAG) Knowledge Base
* **ChromaDB Vector Store**: Semantic similarity vector retrieval for policy grounding.
* **Multi-Format Document Ingestion**: Ingests `.pdf`, `.md`, and `.txt` files directly into vector embeddings.
* **Live Web Page Scraper**: Ingests live webpage URLs (e.g., `https://example.com/shipping-policy`) into ChromaDB without re-deploying code.

### 3. Intent Detection & Autonomous Tool Calling
* **Intent Classification Engine**: Classifies user queries into `order_status`, `return_refund`, `payment`, `shipping`, `complaint`, `account`, or `human_support`.
* **Order Status Tool** (`order_tool.py`): Fetches live fulfillment status, tracking IDs, and estimated delivery dates.
* **Account Verification Tool** (`account_tool.py`): Verifies customer profile data and subscription status.
* **Escalation Tool** (`escalation_tool.py`): Automatically creates structured MongoDB support tickets.

### 4. Staff Operations Console & Human Handover
* **Urgency & Customer Sentiment Radar**: Detects negative customer sentiment and flags critical escalations.
* **AI Support Copilot**: Summarizes ticket history and suggests smart response text for support agents.
* **Real-Time Two-Way Messaging**: Allows human support agents to send live replies directly back to customer chat windows.

### 5. CSAT Ratings & Analytics
* **Customer Feedback System**: Customers can rate resolution quality (1 to 5 stars) and submit feedback comments.
* **Operations Analytics**: Real-time CSAT metrics and satisfaction percentages on the Admin Console.

---

## 🏗 System Architecture

```text
                                 ┌─────────────────────────────────┐
                                 │     Customer Chat UI (/chat)    │
                                 └────────────────┬────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │      FastAPI Backend Engine     │
                                 └────────────────┬────────────────┘
                                                  │
             ┌──────────────────────────┬─────────┴──────────┬──────────────────────────┐
             ▼                          ▼                    ▼                          ▼
┌──────────────────────────┐ ┌────────────────────┐ ┌─────────────────┐ ┌──────────────────────────┐
│ Intent & Memory Engine   │ │ ChromaDB Vector RAG│ │ Tool Execution  │ │ Staff Operations Console │
│ (intent.py & memory.py)  │ │ (rag.py)           │ │ (order/account) │ │ (/admin)                 │
└──────────────────────────┘ └────────────────────┘ └─────────────────┘ └──────────────────────────┘
```

---

## 📁 Repository Structure

```text
intelligent-customer-support-agent/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST & SSE Streaming Routers (chat, tickets, knowledge, csat)
│   │   ├── core/            # Database & App Settings Configuration
│   │   ├── services/        # Agent Orchestration, RAG, Intent Engine, LLM, Memory, Sentiment, Summarizer
│   │   ├── tools/           # Autonomous Business Tools (Order status, Account, Ticket Escalation)
│   │   └── main.py          # FastAPI Application Entry Point
│   ├── knowledge_base/      # Dynamic Policy Documents (.pdf, .md, .txt)
│   ├── tests/               # Pytest Automated Test Suite (12 passing tests)
│   └── requirements.txt     # Python Dependencies
├── frontend/
│   ├── app/                 # Next.js App Router (Landing Page, Customer Chat, Staff Admin, Auth)
│   ├── components/          # Reusable UI Components (ChatWindow, MessageBubble, Navbar, EscalationBadge)
│   └── context/             # Authentication & Global Session State
├── NexusTech_Warranty_and_Return_Policy_2026.pdf  # Sample PDF for testing Knowledge Base Ingestion
└── README.md                # System Documentation
```

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm
* Google Gemini API Key (`GOOGLE_API_KEY`)

---

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate virtual environment and install dependencies:
   ```bash
   .\venv\Scripts\activate
   pip install -r requirements.txt
   pip install python-multipart reportlab
   ```

3. Configure your environment variables in `backend/.env`:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   MONGODB_URI=mongodb://localhost:27017
   ```

4. Launch the FastAPI backend server:
   ```bash
   python start_app.py
   ```
   * The API server will start at `http://127.0.0.1:8000`

---

### Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   * The web application will open at `http://localhost:3000`

---

## 🧪 Testing & Verification

### Run Backend Pytest Suite
```bash
cd backend
.\venv\Scripts\python.exe -m pytest
```
* Runs 12 automated unit tests covering RAG search, document uploads, web scraping, CSAT ratings, sentiment analysis, and ticket summarization.

### Production Frontend Build Check
```bash
cd frontend
npm run build
```
* Compiles static pages for `/`, `/chat`, and `/admin` using Next.js Turbopack compiler.

---

## 📄 License
This project is licensed under the MIT License.
