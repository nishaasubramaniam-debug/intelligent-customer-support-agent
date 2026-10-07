"use client";

import { useState, useRef } from "react";
import { HiPaperAirplane, HiArrowPath } from "react-icons/hi2";

export default function ChatInput({ onSend, loading }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading) return;

    onSend(trimmedMessage);
    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3 sm:p-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-end gap-2 sm:gap-3">
        
        {/* Text Input Area */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a support question or enter your issue (e.g., Where is my order ORD1001?)..."
            rows={1}
            disabled={loading}
            className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600/30 disabled:opacity-60 max-h-[120px] overflow-y-auto"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!message.trim() || loading}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 border border-indigo-700 px-5 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 shrink-0 shadow-xs"
        >
          {loading ? (
            <>
              <HiArrowPath className="animate-spin text-base" />
              <span className="hidden sm:inline">Processing...</span>
            </>
          ) : (
            <>
              <HiPaperAirplane className="text-base" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>

      </div>

      <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-400">
        <span>Shift + Enter for new line</span>
        <span className="hidden sm:inline">Press Enter to submit</span>
      </div>
    </div>
  );
}