"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import AdminNavbar from "../../components/AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import {
  HiShieldCheck,
  HiTicket,
  HiBookOpen,
  HiServer,
  HiClock,
  HiCheckCircle,
  HiExclamationTriangle,
  HiMagnifyingGlass,
  HiArrowPath,
  HiFolder,
  HiCpuChip,
  HiCircleStack,
  HiKey,
  HiLockClosed,
  HiSparkles,
  HiLightBulb,
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiDocumentText,
  HiFire,
  HiFaceFrown,
  HiFaceSmile,
  HiShieldExclamation,
  HiArrowUpTray,
  HiGlobeAlt,
  HiLink,
} from "react-icons/hi2";

const API_URL = "http://127.0.0.1:8000";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTicket, setUpdatingTicket] = useState(null);
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [aiSummarizing, setAiSummarizing] = useState(false);
  const [aiSummaryData, setAiSummaryData] = useState(null);

  const fetchAiSummary = async (ticketId) => {
    try {
      setAiSummarizing(true);
      const res = await axios.post(`${API_URL}/api/tickets/${ticketId}/summarize-suggest`);
      if (res.data?.success) {
        setAiSummaryData(res.data);
      }
    } catch (err) {
      console.error("Failed to generate AI summary:", err);
      alert("Unable to generate AI summary at this time.");
    } finally {
      setAiSummarizing(false);
    }
  };
  // Knowledge Base Manager State (Feature 3 & Dynamic Uploader/Scraper)
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [loadingKB, setLoadingKB] = useState(false);
  const [reindexingKB, setReindexingKB] = useState(false);
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [scrapeModalOpen, setScrapeModalOpen] = useState(false);
  const [editingFilename, setEditingFilename] = useState(null);
  const [docTitleInput, setDocTitleInput] = useState("");
  const [docContentInput, setDocContentInput] = useState("");
  const [savingDoc, setSavingDoc] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [scrapeUrlInput, setScrapeUrlInput] = useState("");
  const [scrapeTitleInput, setScrapeTitleInput] = useState("");

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingFile(true);
      const res = await axios.post(`${API_URL}/api/knowledge/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        alert(`File '${file.name}' uploaded and indexed into ChromaDB successfully!`);
        setUploadModalOpen(false);
        fetchKnowledgeDocs();
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.detail || "Failed to upload document.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleScrapeUrl = async () => {
    if (!scrapeUrlInput.trim()) {
      alert("Please enter a valid webpage URL.");
      return;
    }
    try {
      setScrapingUrl(true);
      const res = await axios.post(`${API_URL}/api/knowledge/scrape`, {
        url: scrapeUrlInput.trim(),
        custom_title: scrapeTitleInput.trim() || undefined,
      });
      if (res.data?.success) {
        alert(`Webpage scraped and saved as '${res.data.filename}'! ChromaDB reindexed.`);
        setScrapeModalOpen(false);
        setScrapeUrlInput("");
        setScrapeTitleInput("");
        fetchKnowledgeDocs();
      }
    } catch (err) {
      console.error("Scrape error:", err);
      alert(err.response?.data?.detail || "Failed to scrape web URL.");
    } finally {
      setScrapingUrl(false);
    }
  };

  // CSAT Ratings State (Feature 6)
  const [csatStats, setCsatStats] = useState(null);

  const fetchCsatStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/csat/stats`);
      if (res.data) setCsatStats(res.data);
    } catch (err) {
      console.error("Failed to fetch CSAT stats:", err);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCsatStats();
    }
  }, [user]);

  const fetchKnowledgeDocs = async () => {
    try {
      setLoadingKB(true);
      const res = await axios.get(`${API_URL}/api/knowledge/`);
      if (res.data?.documents) {
        setKnowledgeDocs(res.data.documents);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge docs:", err);
    } finally {
      setLoadingKB(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin" && activeTab === "knowledge") {
      fetchKnowledgeDocs();
    }
  }, [user, activeTab]);

  const handleOpenCreateDoc = () => {
    setEditingFilename(null);
    setDocTitleInput("");
    setDocContentInput("");
    setKbModalOpen(true);
  };

  const handleOpenEditDoc = (doc) => {
    setEditingFilename(doc.filename);
    setDocTitleInput(doc.filename.replace(/\.txt$/, ""));
    setDocContentInput(doc.content || "");
    setKbModalOpen(true);
  };

  const handleSaveDoc = async () => {
    if (!docTitleInput.trim() || !docContentInput.trim()) {
      alert("Please provide both a document filename and policy content.");
      return;
    }
    try {
      setSavingDoc(true);
      const filename = docTitleInput.trim().toLowerCase().replace(/\s+/g, "_") + ".txt";

      if (editingFilename) {
        await axios.put(`${API_URL}/api/knowledge/${editingFilename}`, {
          filename,
          content: docContentInput,
        });
      } else {
        await axios.post(`${API_URL}/api/knowledge/`, {
          filename,
          content: docContentInput,
        });
      }

      setKbModalOpen(false);
      fetchKnowledgeDocs();
    } catch (err) {
      console.error("Failed to save document:", err);
      alert("Unable to save knowledge base document.");
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDeleteDoc = async (filename) => {
    if (!confirm(`Are you sure you want to delete policy document '${filename}'?`)) return;
    try {
      await axios.delete(`${API_URL}/api/knowledge/${filename}`);
      fetchKnowledgeDocs();
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Unable to delete knowledge document.");
    }
  };

  const handleForceReindex = async () => {
    try {
      setReindexingKB(true);
      const res = await axios.post(`${API_URL}/api/knowledge/reindex`);
      if (res.data?.success) {
        alert(`ChromaDB Vector Store successfully re-indexed! (${res.data.document_count} documents, ${res.data.chunk_count} vector chunks)`);
      }
    } catch (err) {
      console.error("Failed to reindex vector store:", err);
      alert("Unable to reindex vector store.");
    } finally {
      setReindexingKB(false);
    }
  };



  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/api/tickets/`);
      setTickets(response.data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Unable to connect to backend ticket API at " + API_URL);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchTickets();

      const interval = setInterval(() => {
        axios
          .get(`${API_URL}/api/tickets/`)
          .then((res) => {
            if (res.data?.tickets) {
              setTickets(res.data.tickets);
            }
          })
          .catch((err) => console.error("Background ticket polling error:", err));
      }, 4000);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedTicket?.ticket_id) {
      // Keep drawer ticket in sync with polling updates
      const updated = tickets.find((t) => t.ticket_id === selectedTicket.ticket_id);
      if (updated && JSON.stringify(updated.messages) !== JSON.stringify(selectedTicket.messages)) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets]);

  useEffect(() => {
    setAiSummaryData(null);
    if (selectedTicket?.ticket_id) {
      setAdminReplyText(selectedTicket.admin_response || "");
    } else {
      setAdminReplyText("");
    }
  }, [selectedTicket?.ticket_id]);


  const updateTicketStatus = async (ticketId, newStatus, responseText = "") => {
    try {
      setUpdatingTicket(ticketId);

      const params = { status: newStatus };
      if (responseText) {
        params.admin_response = responseText;
      }

      await axios.put(`${API_URL}/api/tickets/${ticketId}`, null, { params });

      setTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === ticketId
            ? { ...t, status: newStatus, ...(responseText ? { admin_response: responseText } : {}) }
            : t
        )
      );

      if (selectedTicket && selectedTicket.ticket_id === ticketId) {
        setSelectedTicket((prev) => ({
          ...prev,
          status: newStatus,
          ...(responseText ? { admin_response: responseText } : {}),
        }));
      }
    } catch (err) {
      console.error("Failed to update ticket:", err);
      alert("Unable to update ticket status.");
    } finally {
      setUpdatingTicket(null);
    }
  };


  const sendLiveTicketMessage = async (ticketId, text) => {
    if (!text.trim()) return;
    try {
      setUpdatingTicket(ticketId);
      await axios.post(`${API_URL}/api/tickets/${ticketId}/message`, {
        sender: "admin",
        text: text.trim(),
      });

      setAdminReplyText("");

      const ticketRes = await axios.get(`${API_URL}/api/tickets/${ticketId}`);
      if (ticketRes.data) {
        setTickets((prev) =>
          prev.map((t) => (t.ticket_id === ticketId ? ticketRes.data : t))
        );
        setSelectedTicket(ticketRes.data);
      }
    } catch (err) {
      console.error("Failed to send live message:", err);
      alert("Unable to send live message.");
    } finally {
      setUpdatingTicket(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <HiCheckCircle className="text-xs" />
            Resolved
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
            <HiClock className="text-xs" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            <HiExclamationTriangle className="text-xs" />
            Escalated
          </span>
        );
    }
  };

  const getSentimentBadge = (ticket) => {
    const sentiment = ticket.sentiment || "Neutral";
    const urgency = ticket.urgency_level || "NORMAL";

    if (urgency === "URGENT" || sentiment === "Angry") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-300 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 animate-pulse shadow-2xs">
          <HiFire className="text-xs text-rose-600" />
          <span>URGENT • Angry</span>
        </span>
      );
    }
    if (urgency === "HIGH" || sentiment === "Frustrated") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 shadow-2xs">
          <HiFaceFrown className="text-xs text-amber-600" />
          <span>HIGH • Frustrated</span>
        </span>
      );
    }
    if (sentiment === "Positive") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          <HiFaceSmile className="text-xs text-emerald-600" />
          <span>Positive</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
        <HiShieldExclamation className="text-xs text-slate-500" />
        <span>Neutral</span>
      </span>
    );
  };

  const urgentTickets = tickets.filter(
    (t) => (t.urgency_level === "URGENT" || t.urgency_level === "HIGH" || t.sentiment === "Angry") && t.status !== "Resolved"
  );

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticket_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "Urgent") {
      matchesStatus = ticket.urgency_level === "URGENT" || ticket.urgency_level === "HIGH" || ticket.sentiment === "Angry";
    } else if (statusFilter !== "ALL") {
      matchesStatus = ticket.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const countEscalated = tickets.filter((t) => t.status === "Escalated").length;
  const countInProgress = tickets.filter((t) => t.status === "In Progress").length;
  const countResolved = tickets.filter((t) => t.status === "Resolved").length;

  if (authLoading) {
    return (
      <main className="min-h-screen human-bg-canvas text-slate-900 flex items-center justify-center">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <HiArrowPath className="animate-spin text-sm text-indigo-600" />
          <span>Verifying Admin Permissions...</span>
        </div>
      </main>
    );
  }

  // Strict Access Guard for non-admin users
  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-screen human-bg-canvas text-slate-900 flex flex-col font-sans">
        <AdminNavbar />

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="rounded-xl human-card p-8 space-y-5">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 text-2xl font-bold">
                <HiLockClosed />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Access Restricted
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The Operations Console is reserved exclusively for support staff and system administrators.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 border border-indigo-700 py-2.5 text-xs font-medium text-white hover:bg-indigo-700 transition shadow-xs"
                >
                  <HiKey className="text-sm" />
                  <span>Authenticate at Staff Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen human-bg-canvas text-slate-900 flex flex-col font-sans">
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} ticketCount={tickets.length} />

      {/* Main Container */}
      <div className="mx-auto flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* TAB 1: Support Tickets Management */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            
            {/* Urgent Priority Escalation Alert Banner (Feature 4) */}
            {urgentTickets.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white font-bold animate-bounce shadow-sm">
                    <HiFire className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <span>Urgent Customer Escalations Alert</span>
                      <span className="rounded bg-rose-200/80 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                        {urgentTickets.length} Critical
                      </span>
                    </h4>
                    <p className="text-[11px] text-rose-800/90 mt-0.5">
                      High-urgency or frustrated customer tickets require prompt support intervention.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusFilter("Urgent")}
                  className="rounded-lg bg-rose-600 border border-rose-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-xs flex items-center gap-1"
                >
                  <span>Review Urgent Cases</span>
                </button>
              </div>
            )}

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              
              <div className="rounded-xl human-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Total Escalations
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                    <HiTicket className="text-sm" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {tickets.length}
                </p>
              </div>

              <div className="rounded-xl human-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-amber-700">
                    Pending Review
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-600 border border-amber-200">
                    <HiExclamationTriangle className="text-sm" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-amber-700">
                  {countEscalated}
                </p>
              </div>

              <div className="rounded-xl human-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-indigo-700">
                    In Progress
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                    <HiClock className="text-sm" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-indigo-700">
                  {countInProgress}
                </p>
              </div>

              <div className="rounded-xl human-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                    Resolved Cases
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <HiCheckCircle className="text-sm" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-emerald-700">
                  {countResolved}
                </p>
              </div>

              <div className="rounded-xl human-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-amber-600">
                    CSAT Rating
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-500 border border-amber-200 font-bold text-xs">
                    ★
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-amber-600 flex items-center gap-1">
                  <span>{csatStats?.average_csat || "5.0"}</span>
                  <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                </p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {csatStats?.satisfaction_percentage || 100}% CSAT • {csatStats?.total_ratings || 0} reviews
                </span>
              </div>

            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl human-card p-4">
              
              <div className="relative w-full sm:w-80">
                <HiMagnifyingGlass className="absolute left-3 top-2.5 text-sm text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket ID, message, or reason..."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
                  {["ALL", "Urgent", "Escalated", "In Progress", "Resolved"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatusFilter(tab)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                        statusFilter === tab
                          ? tab === "Urgent"
                            ? "bg-rose-600 text-white shadow-xs font-bold"
                            : "bg-indigo-600 text-white shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab === "Urgent" && "🚨 "}
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={fetchTickets}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
                  title="Refresh tickets"
                >
                  <HiArrowPath className={`text-sm ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

            </div>

            {/* Data Table */}
            <div className="overflow-hidden rounded-xl human-card">
              
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  Loading tickets...
                </div>
              ) : error ? (
                <div className="p-12 text-center text-xs text-rose-600">
                  {error}
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No support tickets found matching your search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="border-b border-slate-200 bg-slate-50 uppercase text-[10px] tracking-wider text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-3.5">Ticket ID</th>
                        <th className="px-6 py-3.5">Customer Message</th>
                        <th className="px-6 py-3.5">Sentiment & Urgency</th>
                        <th className="px-6 py-3.5">Escalation Reason</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Created</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTickets.map((ticket) => (
                        <tr
                          key={ticket.ticket_id}
                          className="hover:bg-slate-50/80 transition"
                        >
                          <td className="px-6 py-3.5 font-mono font-semibold text-indigo-700">
                            {ticket.ticket_id}
                          </td>

                          <td className="max-w-xs px-6 py-3.5 truncate text-slate-900 font-medium">
                            {ticket.customer_message}
                          </td>

                          <td className="px-6 py-3.5">
                            {getSentimentBadge(ticket)}
                          </td>

                          <td className="max-w-xs px-6 py-3.5 truncate text-slate-500">
                            {ticket.reason}
                          </td>

                          <td className="px-6 py-3.5">
                            {getStatusBadge(ticket.status)}
                          </td>

                          <td className="px-6 py-3.5 text-slate-400 text-[11px]">
                            {ticket.created_at
                              ? new Date(ticket.created_at).toLocaleString([], {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : "-"}
                          </td>

                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={ticket.status}
                                disabled={updatingTicket === ticket.ticket_id}
                                onChange={(e) =>
                                  updateTicketStatus(ticket.ticket_id, e.target.value)
                                }
                                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-indigo-600 disabled:opacity-50"
                              >
                                <option value="Escalated">Escalated</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => setSelectedTicket(ticket)}
                                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
                              >
                                Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: Dynamic Knowledge Base Manager (Feature 3 & Dynamic Uploader/Scraper) */}
        {activeTab === "knowledge" && (
          <div className="space-y-6">
            <div className="rounded-xl human-card p-6 space-y-6">
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HiBookOpen className="text-indigo-600 text-base" />
                    <span>Dynamic RAG Knowledge Base Manager</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ingest policy documents (.pdf, .md, .txt) or scrape company websites directly into ChromaDB
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScrapeModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition shadow-xs"
                  >
                    <HiGlobeAlt className="text-sm text-purple-600" />
                    <span>Scrape Web URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-xs"
                  >
                    <HiArrowUpTray className="text-sm text-indigo-600" />
                    <span>Upload Document (.pdf/.md)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleForceReindex}
                    disabled={reindexingKB}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
                    title="Force refresh ChromaDB vector embeddings"
                  >
                    <HiArrowPath className={`text-xs ${reindexingKB ? "animate-spin" : ""}`} />
                    <span>{reindexingKB ? "Re-indexing..." : "Re-index Embeddings"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCreateDoc}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 border border-indigo-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
                  >
                    <HiPlus className="text-sm" />
                    <span>Create Policy Doc</span>
                  </button>
                </div>
              </div>

              {loadingKB ? (
                <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <HiArrowPath className="animate-spin text-sm text-indigo-600" />
                  <span>Loading Knowledge Base Documents...</span>
                </div>
              ) : knowledgeDocs.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                  <p>No knowledge base documents found.</p>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-xs font-medium"
                    >
                      <HiArrowUpTray /> Upload First Document
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {knowledgeDocs.map((doc) => (
                    <div
                      key={doc.filename}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 flex flex-col justify-between hover:border-slate-300 transition shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                            <HiDocumentText className="text-indigo-500 text-sm" />
                            {doc.filename}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {doc.file_type === "pdf" && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-bold uppercase">
                                PDF
                              </span>
                            )}
                            {doc.file_type === "md" && (
                              <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded border border-sky-200 font-bold uppercase">
                                MD
                              </span>
                            )}
                            {doc.source_type === "scraped_web" && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                                Web Scraped
                              </span>
                            )}
                            <span className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">
                              {doc.char_count} chars
                            </span>
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 max-h-32 overflow-y-auto leading-relaxed font-mono">
                          {doc.content}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-400">
                        <span>
                          Updated: {new Date(doc.updated_at).toLocaleDateString([], { dateStyle: "short" })}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditDoc(doc)}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center gap-1"
                          >
                            <HiPencilSquare className="text-xs text-indigo-600" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc.filename)}
                            className="rounded-md border border-rose-200 bg-white px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition shadow-2xs flex items-center gap-1"
                            title="Delete policy document"
                          >
                            <HiTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 3: System Health */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="rounded-xl human-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                    FastAPI Application
                  </span>
                  <HiServer className="text-emerald-600 text-base" />
                </div>
                <p className="mt-3 text-base font-semibold text-slate-900">
                  http://127.0.0.1:8000
                </p>
                <span className="mt-1 inline-block text-[11px] text-emerald-700 font-medium">
                  Status: 200 OK (Running)
                </span>
              </div>

              <div className="rounded-xl human-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-indigo-700">
                    ChromaDB Vector Store
                  </span>
                  <HiCircleStack className="text-indigo-600 text-base" />
                </div>
                <p className="mt-3 text-base font-semibold text-slate-900">
                  MiniLM-L6 Embeddings
                </p>
                <span className="mt-1 inline-block text-[11px] text-indigo-700 font-medium">
                  RAM Singleton Persistent
                </span>
              </div>

              <div className="rounded-xl human-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-700">
                    AI Intelligence Engine
                  </span>
                  <HiCpuChip className="text-indigo-600 text-base" />
                </div>
                <p className="mt-3 text-base font-semibold text-slate-900">
                  Gemini 3.6 Flash
                </p>
                <span className="mt-1 inline-block text-[11px] text-indigo-700 font-medium">
                  API Connected
                </span>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Ticket Inspection Drawer Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl human-card p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-700 font-semibold">
                  {selectedTicket.ticket_id}
                </span>
                <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                  Inspect Ticket Details
                </h3>
              </div>

              {getStatusBadge(selectedTicket.status)}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Customer Message:
                </label>
                <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-800 leading-relaxed">
                  {selectedTicket.customer_message}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Escalation Reason:
                </label>
                <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700">
                  {selectedTicket.reason}
                </div>
              </div>

              {/* Customer Sentiment & Urgency Radar (Feature 4) */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <HiShieldExclamation className="text-slate-400 text-xs" />
                    <span>Customer Sentiment & Urgency Signals</span>
                  </span>
                  {getSentimentBadge(selectedTicket)}
                </div>

                {Array.isArray(selectedTicket.urgency_reasons) && selectedTicket.urgency_reasons.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-200/60">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Detected Risk Factors:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                      {selectedTicket.urgency_reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {selectedTicket.conversation_id && (
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Associated Conversation ID:
                  </label>
                  <p className="mt-1 font-mono text-slate-600">
                    {selectedTicket.conversation_id}
                  </p>
                </div>
              )}

              {/* Live Support Thread */}
              {Array.isArray(selectedTicket.messages) && selectedTicket.messages.length > 0 && (
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Live Chat History ({selectedTicket.messages.length} messages):
                  </label>
                  <div className="mt-1 max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                    {selectedTicket.messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`rounded-md p-2 ${
                          m.sender === "admin"
                            ? "bg-indigo-600 text-white ml-6 shadow-2xs"
                            : "bg-white border border-slate-200 text-slate-800 mr-6 shadow-2xs"
                        }`}
                      >
                        <p className="text-[10px] font-semibold opacity-75">
                          {m.sender === "admin" ? "Support Staff (You)" : "Customer"}
                        </p>
                        <p className="mt-0.5 leading-relaxed font-medium">{m.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Auto-Summarizer & Smart Response Section (Feature 2) */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white font-bold shadow-2xs">
                      <HiSparkles className="text-xs" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        AI Support Copilot
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Auto-Summarizer & Smart Response Suggestions
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchAiSummary(selectedTicket.ticket_id)}
                    disabled={aiSummarizing}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 border border-indigo-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition shadow-xs disabled:opacity-60"
                  >
                    <HiSparkles className={`text-xs ${aiSummarizing ? "animate-spin" : ""}`} />
                    <span>{aiSummarizing ? "Analyzing..." : "Generate AI Insights"}</span>
                  </button>
                </div>

                {aiSummaryData && (
                  <div className="space-y-2.5 pt-1">
                    <div className="rounded-lg border border-indigo-200 bg-white p-3 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px] uppercase tracking-wider">
                        <HiLightBulb className="text-sm" />
                        <span>AI Executive Summary</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {aiSummaryData.summary}
                      </p>

                      {Array.isArray(aiSummaryData.key_points) && aiSummaryData.key_points.length > 0 && (
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px] pt-1 border-t border-slate-100">
                          {aiSummaryData.key_points.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-800 font-bold text-[11px] uppercase tracking-wider">
                          Suggested Smart Response
                        </span>
                        <button
                          type="button"
                          onClick={() => setAdminReplyText(aiSummaryData.suggested_reply)}
                          className="rounded bg-emerald-600 border border-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition shadow-2xs flex items-center gap-1"
                        >
                          <span>Use Suggestion</span>
                        </button>
                      </div>
                      <p className="text-slate-800 leading-relaxed italic bg-white/80 p-2 rounded border border-emerald-100">
                        "{aiSummaryData.suggested_reply}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Human Agent Live Reply to Customer:
                </label>
                <textarea
                  rows={3}
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  placeholder="Type your response to the customer (e.g., 'Hello! I have reviewed your request for order ORD1002 and successfully processed the cancellation. Full refund issued.')"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Update Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) =>
                    updateTicketStatus(selectedTicket.ticket_id, e.target.value, adminReplyText)
                  }
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 outline-none focus:border-indigo-600"
                >
                  <option value="Escalated">Escalated</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    sendLiveTicketMessage(selectedTicket.ticket_id, adminReplyText)
                  }
                  disabled={updatingTicket === selectedTicket.ticket_id || !adminReplyText.trim()}
                  className="rounded-lg bg-indigo-600 border border-indigo-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>{updatingTicket === selectedTicket.ticket_id ? "Sending..." : "Send Live Reply"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-lg bg-slate-100 border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Document Editor Modal (Feature 3) */}
      {kbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl human-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HiDocumentText className="text-indigo-600 text-base" />
                  <span>{editingFilename ? `Edit Policy Document: ${editingFilename}` : "Create New Knowledge Base Policy"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Content will be automatically saved and re-indexed into ChromaDB vector store.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setKbModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
                  Document Filename / Policy Category Identifier:
                </label>
                <input
                  type="text"
                  value={docTitleInput}
                  disabled={Boolean(editingFilename)}
                  onChange={(e) => setDocTitleInput(e.target.value)}
                  placeholder="e.g. warranty_policy, shipping_times, international_returns"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:bg-slate-100 disabled:text-slate-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Will be saved as: <code className="font-mono text-indigo-600">{docTitleInput.trim().toLowerCase().replace(/\s+/g, "_") || "policy_name"}.txt</code>
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
                  Policy Text Content (RAG Ingestion):
                </label>
                <textarea
                  rows={8}
                  value={docContentInput}
                  onChange={(e) => setDocContentInput(e.target.value)}
                  placeholder="Enter company rules, parameters, refund guidelines, support hours, or step-by-step resolution rules..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-800 font-mono leading-relaxed outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setKbModalOpen(false)}
                className="rounded-lg bg-slate-100 border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition shadow-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveDoc}
                disabled={savingDoc}
                className="rounded-lg bg-indigo-600 border border-indigo-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>{savingDoc ? "Saving & Indexing..." : "Save Policy & Re-index"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl human-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HiArrowUpTray className="text-indigo-600 text-base" />
                  <span>Upload Policy Document</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a PDF, Markdown, or Text file to parse & ingest into ChromaDB
                </p>
              </div>

              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <HiArrowUpTray className="text-xl" />
                </div>
                <div>
                  <label
                    htmlFor="file-upload-input"
                    className="cursor-pointer text-xs font-semibold text-indigo-700 hover:text-indigo-800"
                  >
                    Click to select file (.pdf, .md, .txt)
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Maximum file size: 10MB • Text & layout extracted automatically
                  </p>
                </div>
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.md,.txt"
                  onChange={handleUploadFile}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </div>

              {uploadingFile && (
                <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium">
                  <HiArrowPath className="animate-spin text-sm" />
                  <span>Parsing document & reindexing vector embeddings...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-lg bg-slate-100 border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Web Scraper Modal */}
      {scrapeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl human-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HiGlobeAlt className="text-purple-600 text-base" />
                  <span>Scrape Company Webpage</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fetch live webpage content and convert it into knowledge vectors
                </p>
              </div>

              <button
                type="button"
                onClick={() => setScrapeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
                  Webpage URL:
                </label>
                <div className="relative">
                  <HiLink className="absolute left-3 top-2.5 text-sm text-slate-400" />
                  <input
                    type="url"
                    value={scrapeUrlInput}
                    onChange={(e) => setScrapeUrlInput(e.target.value)}
                    placeholder="https://example.com/shipping-policy"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
                  Custom Document Title (Optional):
                </label>
                <input
                  type="text"
                  value={scrapeTitleInput}
                  onChange={(e) => setScrapeTitleInput(e.target.value)}
                  placeholder="e.g. Official Shipping Guidelines 2026"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setScrapeModalOpen(false)}
                className="rounded-lg bg-slate-100 border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition shadow-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleScrapeUrl}
                disabled={scrapingUrl || !scrapeUrlInput.trim()}
                className="rounded-lg bg-purple-600 border border-purple-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <HiGlobeAlt className={`text-xs ${scrapingUrl ? "animate-spin" : ""}`} />
                <span>{scrapingUrl ? "Scraping & Indexing..." : "Scrape & Index Webpage"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}