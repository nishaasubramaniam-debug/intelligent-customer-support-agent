"use client";

import { useState } from "react";
import ChatWindow from "../../components/ChatWindow";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function ChatPage() {
  const { user } = useAuth();
  const [conversationId] = useState("stream-conversation");

  return (
    <main className="h-screen max-h-screen human-bg-canvas text-slate-900 flex flex-col font-sans overflow-hidden">
      <Navbar />

      {/* Main Workspace Container - Fits Exactly in Viewport */}
      <section className="flex-1 flex flex-col mx-auto w-full max-w-7xl p-2 sm:p-4 min-h-0 overflow-hidden">
        <div className="flex-1 h-full min-h-0 flex flex-col rounded-xl human-card overflow-hidden">
          <ChatWindow
            conversationId={conversationId}
            initialEmail={user?.email || ""}
          />
        </div>
      </section>
    </main>
  );
}