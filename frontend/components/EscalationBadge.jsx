"use client";

import { useState } from "react";
import axios from "axios";
import { FaHeadset, FaPaperPlane } from "react-icons/fa";
import {
  HiClock,
  HiCheckCircle,
  HiArrowPath,
  HiUser,
} from "react-icons/hi2";

const API_URL = "http://127.0.0.1:8000";

export default function EscalationBadge({ status, onRefreshStatus, isRefreshing }) {
  const [customerReplyText, setCustomerReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [csatRating, setCsatRating] = useState(5);
  const [csatFeedback, setCsatFeedback] = useState("");
  const [submittingCSAT, setSubmittingCSAT] = useState(false);
  const [csatSubmitted, setCsatSubmitted] = useState(false);

  const handleSubmitCSAT = async () => {
    if (!ticketId || submittingCSAT) return;
    try {
      setSubmittingCSAT(true);
      await axios.post(`${API_URL}/api/csat/rating`, {
        ticket_id: ticketId,
        rating: csatRating,
        feedback: csatFeedback.trim(),
      });
      setCsatSubmitted(true);
    } catch (err) {
      console.error("Failed to submit CSAT:", err);
    } finally {
      setSubmittingCSAT(false);
    }
  };

  if (!status) return null;

  let message = "";
  let ticketId = "";
  let reason = "";
  let ticketStatus = "Escalated";
  let adminResponse = "";
  let ticketMessages = [];

  if (typeof status === "object" && status !== null) {
    ticketId = status.ticket_id || status.ticketId || "";
    ticketStatus = status.status || "Escalated";
    reason = status.reason || "";
    adminResponse = status.admin_response || status.adminResponse || "";
    ticketMessages = Array.isArray(status.messages) ? status.messages : [];
    message =
      status.message ||
      status.customer_message ||
      (ticketStatus === "Resolved"
        ? "Your support ticket has been resolved by our team."
        : ticketStatus === "In Progress"
        ? "A support agent is actively working on your ticket."
        : "Your request has been escalated to a human support agent.");
  } else if (typeof status === "string") {
    message = status;
  } else {
    message = String(status);
  }

  const handleSendCustomerReply = async (e) => {
    e.preventDefault();
    if (!customerReplyText.trim() || !ticketId || isSending) return;

    try {
      setIsSending(true);
      await axios.post(`${API_URL}/api/tickets/${ticketId}/message`, {
        sender: "customer",
        text: customerReplyText.trim(),
      });
      setCustomerReplyText("");
      if (onRefreshStatus) {
        onRefreshStatus();
      }
    } catch (err) {
      console.error("Failed to send reply to staff:", err);
    } finally {
      setIsSending(false);
    }
  };

  const getTheme = (statusVal) => {
    switch (statusVal) {
      case "Resolved":
        return {
          containerClass: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
          iconBgClass: "bg-emerald-100 border-emerald-200 text-emerald-700",
          titleColor: "text-emerald-800",
          badgeClass: "bg-emerald-100 border-emerald-200 text-emerald-800",
          dotColor: "bg-emerald-500",
          titleText: "Ticket Resolved",
          defaultMsg: "Your issue has been marked as resolved by customer support.",
          icon: <HiCheckCircle className="text-xl text-emerald-600" />,
        };
      case "In Progress":
        return {
          containerClass: "border-indigo-200 bg-indigo-50/90 text-indigo-900",
          iconBgClass: "bg-indigo-100 border-indigo-200 text-indigo-700",
          titleColor: "text-indigo-800",
          badgeClass: "bg-indigo-100 border-indigo-200 text-indigo-800",
          dotColor: "bg-indigo-500 animate-ping",
          titleText: "Support Agent Working on Issue",
          defaultMsg: "A human support agent is currently reviewing your ticket.",
          icon: <HiClock className="text-xl text-indigo-600 animate-pulse" />,
        };
      default: // Escalated
        return {
          containerClass: "border-amber-200 bg-amber-50/90 text-amber-900",
          iconBgClass: "bg-amber-100 border-amber-200 text-amber-700",
          titleColor: "text-amber-800",
          badgeClass: "bg-amber-100 border-amber-200 text-amber-800",
          dotColor: "bg-amber-500 animate-ping",
          titleText: "Escalated to Support Staff",
          defaultMsg: "Your issue has been escalated to a human support agent.",
          icon: <FaHeadset className="text-lg text-amber-700" />,
        };
    }
  };

  const theme = getTheme(ticketStatus);

  return (
    <div className={`my-4 mx-auto max-w-xl rounded-xl border p-4 shadow-xs backdrop-blur-sm transition-all duration-300 ${theme.containerClass}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${theme.iconBgClass}`}>
          {theme.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${theme.titleColor}`}>
              {theme.titleText}
            </h4>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${theme.badgeClass}`}>
                STATUS: {ticketStatus.toUpperCase()}
              </span>
              <span className={`flex h-2 w-2 rounded-full ${theme.dotColor}`} />
            </div>
          </div>

          <p className="mt-1 text-xs leading-relaxed font-medium">
            {message || theme.defaultMsg}
          </p>

          {ticketId && (
            <p className="mt-1 text-[11px] opacity-90">
              Ticket ID: <span className="font-mono font-semibold">{ticketId}</span>
            </p>
          )}

          {reason && (
            <p className="mt-0.5 text-[11px] opacity-80 italic">
              Reason: {reason}
            </p>
          )}

          {/* Live Message Thread */}
          {ticketMessages.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-black/5 pt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Live Support Thread:
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {ticketMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 rounded-lg p-2 text-xs ${
                      msg.sender === "admin"
                        ? "bg-indigo-600 text-white ml-4 shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-800 mr-4 shadow-2xs"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {msg.sender === "admin" ? (
                        <FaHeadset className="text-xs text-indigo-200" />
                      ) : (
                        <HiUser className="text-xs text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold opacity-80">
                        {msg.sender === "admin" ? "Support Agent" : "You"}
                      </p>
                      <p className="leading-relaxed mt-0.5 font-medium">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback Admin Response if no messages array */}
          {adminResponse && ticketMessages.length === 0 && (
            <div className="mt-2.5 rounded-lg border border-indigo-200 bg-white/95 p-3 text-xs shadow-xs text-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700 mb-1">
                <FaHeadset className="text-xs" />
                <span>Human Support Agent Reply:</span>
              </div>
              <p className="leading-relaxed font-medium text-slate-900">{adminResponse}</p>
            </div>
          )}

          {/* Customer CSAT Satisfaction Survey (Feature 6) */}
          {ticketStatus === "Resolved" && (
            <div className="mt-3 rounded-lg border border-emerald-300 bg-white/95 p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <span>How was your support experience?</span>
                </span>
                {csatSubmitted && (
                  <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                    Feedback Submitted
                  </span>
                )}
              </div>

              {!csatSubmitted ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCsatRating(star)}
                        className={`text-xl transition-transform transform hover:scale-125 ${
                          star <= csatRating ? "text-amber-400" : "text-slate-300 hover:text-amber-300"
                        }`}
                        title={`${star} Star${star > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {csatRating} / 5
                    </span>
                  </div>

                  <input
                    type="text"
                    value={csatFeedback}
                    onChange={(e) => setCsatFeedback(e.target.value)}
                    placeholder="Optional feedback or comments..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={handleSubmitCSAT}
                    disabled={submittingCSAT}
                    className="rounded-lg bg-emerald-600 border border-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs disabled:opacity-50"
                  >
                    {submittingCSAT ? "Submitting..." : "Submit Experience Rating"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-semibold italic">
                  Thank you for rating your support experience! Your feedback helps us improve.
                </p>
              )}
            </div>
          )}

          {/* Customer Live Reply Form */}
          {ticketStatus !== "Resolved" && (
            <form onSubmit={handleSendCustomerReply} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={customerReplyText}
                onChange={(e) => setCustomerReplyText(e.target.value)}
                placeholder="Reply to support agent..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isSending || !customerReplyText.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 border border-indigo-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-2xs disabled:opacity-50"
              >
                <FaPaperPlane className="text-[10px]" />
                <span>Send</span>
              </button>
            </form>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-2.5">
            {onRefreshStatus && (
              <button
                type="button"
                onClick={onRefreshStatus}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/80 border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-white transition shadow-2xs"
              >
                <HiArrowPath className={`text-xs ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
                <span>{isRefreshing ? "Checking..." : "Refresh Live Status"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}