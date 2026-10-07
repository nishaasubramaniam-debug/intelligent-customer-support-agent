"use client";

import { useState } from "react";
import {
  HiSparkles,
  HiUser,
  HiDocumentText,
  HiClipboardDocument,
  HiCheck,
  HiWrenchScrewdriver,
  HiInformationCircle,
  HiBolt,
} from "react-icons/hi2";

export default function MessageBubble({
  role,
  content,
  intent,
  toolUsed,
  sources = [],
  timestamp,
}) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatIntent = (str) => {
    if (!str) return "";
    return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderFormattedContent = (text) => {
    if (!text) return null;

    const paragraphs = text.split("\n\n");

    return paragraphs.map((paragraph, pIdx) => {
      const lines = paragraph.split("\n");

      return (
        <div key={pIdx} className="mb-2 last:mb-0 space-y-1">
          {lines.map((line, lIdx) => {
            const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
            const lineContent = isBullet ? line.trim().substring(2) : line;

            const parts = lineContent.split(/(\*\*.*?\*\*)/g);
            const formattedParts = parts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={i} className="font-semibold text-slate-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            });

            if (isBullet) {
              return (
                <div key={lIdx} className="flex items-start gap-2 ml-2 my-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                  <span>{formattedParts}</span>
                </div>
              );
            }

            return <p key={lIdx}>{formattedParts}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div
      className={`group flex items-start gap-3 my-3.5 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold shadow-xs ${
          isUser
            ? "bg-indigo-600 text-white border border-indigo-700"
            : "bg-white border border-slate-200 text-indigo-600"
        }`}
      >
        {isUser ? <HiUser className="text-sm" /> : <HiBolt className="text-sm" />}
      </div>

      {/* Bubble Container */}
      <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
        
        {/* Header Metadata */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-semibold text-slate-800">
              Nexus Support Agent
            </span>

            {intent && (
              <span className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                <HiInformationCircle className="text-xs" />
                {formatIntent(intent)}
              </span>
            )}

            {toolUsed && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                <HiWrenchScrewdriver className="text-xs" />
                {toolUsed}
              </span>
            )}
          </div>
        )}

        {/* Message Card - Crisp Light White Styling */}
        <div
          className={`relative rounded-xl px-4 py-3 text-sm leading-relaxed shadow-xs transition-all ${
            isUser
              ? "rounded-tr-xs bg-indigo-600 text-white"
              : "rounded-tl-xs human-card text-slate-800"
          }`}
        >
          <div className="whitespace-pre-wrap">
            {isUser ? content : renderFormattedContent(content)}
          </div>

          {/* Source Documents Citation */}
          {!isUser && sources && sources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition"
              >
                <HiDocumentText className="text-xs text-indigo-600" />
                <span>{showSources ? "Hide Citation Sources" : `Cites ${sources.length} Policy Document(s)`}</span>
              </button>

              {showSources && (
                <div className="mt-2 space-y-1 bg-slate-50 rounded-md p-2 border border-slate-200 text-[11px] text-slate-700 font-mono">
                  {sources.map((src, i) => (
                    <div key={i} className="flex items-center gap-2 text-indigo-700">
                      <span className="text-slate-400">•</span>
                      <span>{typeof src === "string" ? src.split(/[\\/]/).pop() : JSON.stringify(src)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Bar (Copy Button & Time) */}
          <div className={`mt-2 flex items-center justify-between text-[10px] ${isUser ? "text-indigo-100" : "text-slate-400"}`}>
            <span>{timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>

            {!isUser && (
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:text-slate-800 transition px-1 py-0.5 rounded"
                title="Copy response"
              >
                {copied ? <HiCheck className="text-emerald-600 text-xs" /> : <HiClipboardDocument className="text-xs" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}