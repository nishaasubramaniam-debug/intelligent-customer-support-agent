"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import EscalationBadge from "./EscalationBadge";
import {
  HiPlus,
  HiTrash,
  HiClock,
  HiBars3,
  HiXMark,
  HiCube,
  HiCreditCard,
  HiUser,
  HiSparkles,
  HiSignal,
  HiTicket,
  HiBolt,
} from "react-icons/hi2";

const API_URL = "http://127.0.0.1:8000";

export default function ChatWindow({
  conversationId: initialConversationId,
  initialEmail = "",
}) {
  const [conversationId, setConversationId] = useState(
    initialConversationId || `conversation-${Date.now()}`
  );

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [escalationStatus, setEscalationStatus] = useState(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState(initialEmail || "");
  const [useStreaming, setUseStreaming] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState("English");

  const messagesEndRef = useRef(null);

  /* Extract active ticket ID */
  const activeTicketId =
    typeof escalationStatus === "object" && escalationStatus !== null
      ? escalationStatus.ticket_id || escalationStatus.ticketId
      : null;

  /* Fetch live ticket status from backend */
  const refreshTicketStatus = async (showLoading = false) => {
    if (!activeTicketId) return;

    if (showLoading) setIsRefreshingStatus(true);

    try {
      const response = await axios.get(`${API_URL}/api/tickets/${activeTicketId}`);
      if (response.data && response.data.status) {
        setEscalationStatus((prev) => {
          if (typeof prev === "object" && prev !== null) {
            return {
              ...prev,
              status: response.data.status,
              customer_message: response.data.customer_message || prev.customer_message,
              reason: response.data.reason || prev.reason,
              admin_response: response.data.admin_response || prev.admin_response,
            };
          }
          return response.data;
        });

      }
    } catch (error) {
      console.warn("Failed to fetch live ticket status:", error);
    } finally {
      if (showLoading) setIsRefreshingStatus(false);
    }
  };

  /* Auto-poll ticket status every 5 seconds if an escalated ticket exists */
  useEffect(() => {
    if (!activeTicketId) return;

    refreshTicketStatus(false);
    const interval = setInterval(() => {
      refreshTicketStatus(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTicketId]);


  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  /* Load saved conversations on initial mount */
  useEffect(() => {
    const savedConversations = localStorage.getItem("chat_conversations");

    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);

        if (parsed.length > 0) {
          const latest = parsed[0];
          setConversationId(latest.id);
          setMessages(latest.messages || []);
          setEscalationStatus(latest.escalationStatus || null);
        }
      } catch (error) {
        console.error("Failed to load saved conversations:", error);
        localStorage.removeItem("chat_conversations");
      }
    }
  }, []);

  /* Persist active conversation history */
  useEffect(() => {
    if (messages.length === 0) return;

    setConversations((previous) => {
      const existingIndex = previous.findIndex((item) => item.id === conversationId);
      const title = messages[0]?.content
        ? messages[0].content.slice(0, 32) + (messages[0].content.length > 32 ? "..." : "")
        : "New Conversation";

      const updatedConversation = {
        id: conversationId,
        title,
        messages,
        escalationStatus,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        const copy = [...previous];
        copy[existingIndex] = updatedConversation;
        return copy;
      }

      return [updatedConversation, ...previous];
    });
  }, [messages, escalationStatus, conversationId]);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("chat_conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  /* Reset & Create New Chat */
  const createNewChat = () => {
    const newId = `conversation-${Date.now()}`;
    setConversationId(newId);
    setMessages([]);
    setEscalationStatus(null);
  };

  /* Switch Conversation */
  const loadConversation = (conv) => {
    setConversationId(conv.id);
    setMessages(conv.messages || []);
    setEscalationStatus(conv.escalationStatus || null);
  };

  /* Delete Single Conversation */
  const deleteConversation = (idToDelete) => {
    const updated = conversations.filter((item) => item.id !== idToDelete);
    setConversations(updated);
    localStorage.setItem("chat_conversations", JSON.stringify(updated));

    if (idToDelete === conversationId) {
      if (updated.length > 0) {
        loadConversation(updated[0]);
      } else {
        createNewChat();
      }
    }
  };

  /* Clear History */
  const clearAllHistory = () => {
    setConversations([]);
    localStorage.removeItem("chat_conversations");
    createNewChat();
  };

  /* Send Message to API */
  const sendMessage = async (userText) => {
    if (!userText.trim() || loading) return;

    const userMsg = {
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      if (useStreaming) {
        const queryParams = new URLSearchParams({
          message: userText,
          conversation_id: conversationId,
        });

        if (orderId) queryParams.append("order_id", orderId);
        if (email) queryParams.append("email", email);
        if (language) queryParams.append("language", language);

        const response = await fetch(`${API_URL}/api/chat/stream?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error(`Stream error: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let assistantContent = "";
        let intent = "";
        let toolUsed = "";
        let sources = [];
        let escalation = null;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
            intent: "",
            toolUsed: "",
            sources: [],
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "intent") intent = data.value;
                if (data.type === "tool") toolUsed = data.value;
                if (data.type === "sources") sources = data.value;
                if (data.type === "token") assistantContent += data.value;
                if (data.type === "escalation") {
                  escalation = data.value;
                  setEscalationStatus(data.value);
                }
              } catch (e) {
                assistantContent += line.slice(6);
              }
            } else {
              assistantContent += rawLine;
            }

            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: assistantContent,
                  intent: intent || updated[lastIdx].intent,
                  toolUsed: toolUsed || updated[lastIdx].toolUsed,
                  sources: sources.length > 0 ? sources : updated[lastIdx].sources,
                };
              }
              return updated;
            });
          }
        }
        return;
      }

      // Fallback Non-Streaming API Request
      const payload = {
        message: userText,
        conversation_id: conversationId,
        language: language,
        ...(orderId ? { order_id: orderId } : {}),
        ...(email ? { email: email } : {}),
      };

      const res = await axios.post(`${API_URL}/api/chat`, payload);
      const data = res.data;

      if (data.escalation) {
        setEscalationStatus(data.escalation);
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.response,
          intent: data.intent,
          toolUsed: data.tool_used,
          sources: data.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I encountered an issue connecting to the support service. Please ensure the backend application is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (promptText, sampleOrderId = "", sampleEmail = "") => {
    if (sampleOrderId) setOrderId(sampleOrderId);
    if (sampleEmail) setEmail(sampleEmail);
    sendMessage(promptText);
  };

  return (
    <div className="flex flex-1 h-full min-h-0 bg-white text-slate-900">
      
      {/* Sidebar: Conversation History */}
      {sidebarOpen && (
        <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50/80">
          
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <HiClock className="text-indigo-600 text-sm" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                History
              </h2>
            </div>

            <button
              type="button"
              onClick={createNewChat}
              className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <HiPlus className="text-xs" />
              <span>New</span>
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No previous conversations.
              </div>
            ) : (
              conversations.map((item) => (
                <div
                  key={item.id}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs transition ${
                    item.id === conversationId
                      ? "bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => loadConversation(item)}
                    className="min-w-0 flex-1 text-left truncate"
                  >
                    <p className="truncate text-xs">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {item.messages?.length || 0} messages
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteConversation(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition"
                    title="Delete conversation"
                  >
                    <HiTrash className="text-sm" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          {conversations.length > 0 && (
            <div className="border-t border-slate-200 p-3">
              <button
                type="button"
                onClick={clearAllHistory}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs text-slate-600 hover:text-rose-600 hover:border-rose-200 transition shadow-xs"
              >
                <HiTrash className="text-sm" />
                <span>Clear History</span>
              </button>
            </div>
          )}

        </aside>
      )}

      {/* Main Chat Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        
        {/* Context Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 backdrop-blur-md">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-md border border-slate-200 bg-white p-1.5 text-xs text-slate-700 hover:bg-slate-100 transition shadow-xs"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? <HiXMark className="text-sm" /> : <HiBars3 className="text-sm" />}
            </button>

            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              Support Context:
            </span>
          </div>

          {/* Context Inputs: Order ID & Email */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Order ID */}
            <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs">
              <HiCube className="text-indigo-600 text-sm" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID (ORD1001)"
                className="w-28 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs">
              <HiUser className="text-indigo-600 text-sm" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-36 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Streaming Toggle */}
            <button
              type="button"
              onClick={() => setUseStreaming(!useStreaming)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                useStreaming
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
              }`}
              title="Toggle real-time streaming mode"
            >
              <HiSignal className="text-xs" />
              <span>{useStreaming ? "Streaming Active" : "Stream Mode"}</span>
            </button>

            {/* Language Selector Dropdown (Feature 5) */}
            <div className="flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50/60 px-2 py-1 text-xs shadow-xs">
              <span className="text-xs">🌐</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-semibold text-indigo-900 outline-none cursor-pointer"
                title="Select preferred conversation language"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Japanese">Japanese (日本語)</option>
                <option value="Chinese">Chinese (中文)</option>
              </select>
            </div>

            {/* Clear Active Chat */}
            <button
              type="button"
              onClick={createNewChat}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition shadow-xs"
            >
              Reset
            </button>
          </div>

        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* Welcome Screen when Empty */}
          {messages.length === 0 && (
            <div className="flex flex-1 min-h-0 my-auto flex-col items-center justify-center text-center p-2 sm:p-4">
              
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 mb-3 shadow-xs">
                <HiBolt className="text-2xl" />
              </div>

              <h2 className="text-base font-bold text-slate-900 sm:text-lg tracking-tight">
                How can we help with your order today?
              </h2>

              <p className="mt-1 max-w-md text-xs text-slate-500 leading-relaxed">
                Query order tracking, return & refund policies, account management, or escalate to human support.
              </p>

              {/* Sample Prompt Chips */}
              <div className="mt-6 w-full max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                  Frequently Asked Questions
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  
                  <button
                    type="button"
                    onClick={() => handleChipClick("Where is my order ORD1001?", "ORD1001")}
                    className="flex items-center gap-3 rounded-lg human-card-interactive p-3 group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <HiCube className="text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Track Order ORD1001</p>
                      <p className="text-[10px] text-slate-500">Check delivery status & tracking</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChipClick("What is your return policy?")}
                    className="flex items-center gap-3 rounded-lg human-card-interactive p-3 group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <HiSparkles className="text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Return & Refund Policy</p>
                      <p className="text-[10px] text-slate-500">Search knowledge base via RAG</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChipClick("I was charged twice for my order", "ORD1002")}
                    className="flex items-center gap-3 rounded-lg human-card-interactive p-3 group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <HiCreditCard className="text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Billing & Payment Check</p>
                      <p className="text-[10px] text-slate-500">Payment verification guidelines</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChipClick("I want to speak with a human support agent")}
                    className="flex items-center gap-3 rounded-lg human-card-interactive p-3 group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <HiTicket className="text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Escalate to Support Staff</p>
                      <p className="text-[10px] text-slate-500">Generate support ticket automatically</p>
                    </div>
                  </button>

                </div>
              </div>

            </div>
          )}

          {/* Render Message Bubbles */}
          {messages.map((item, index) => (
            <MessageBubble
              key={index}
              role={item.role}
              content={item.content}
              intent={item.intent}
              toolUsed={item.toolUsed}
              sources={item.sources}
              timestamp={item.timestamp}
            />
          ))}

          {/* Loading state indicator */}
          {loading && (
            <div className="flex items-center gap-3 my-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-indigo-600 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
              </div>
              <div className="rounded-lg human-card px-3.5 py-2.5 text-xs text-slate-600 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-slate-700">Searching knowledge base & processing response...</span>
              </div>
            </div>
          )}

          {/* Escalation Notification Banner */}
          {escalationStatus && (
            <EscalationBadge
              status={escalationStatus}
              onRefreshStatus={() => refreshTicketStatus(true)}
              isRefreshing={isRefreshingStatus}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Component */}
        <ChatInput onSend={sendMessage} loading={loading} />

      </div>

    </div>
  );
}