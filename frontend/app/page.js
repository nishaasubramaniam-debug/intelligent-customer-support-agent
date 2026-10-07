"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import {
  HiChatBubbleLeftRight,
  HiShieldCheck,
  HiBookOpen,
  HiCpuChip,
  HiArrowRight,
  HiCheckCircle,
  HiClock,
  HiSparkles,
  HiGlobeAlt,
  HiUserGroup,
  HiArrowUpTray,
  HiBolt,
  HiCircleStack,
} from "react-icons/hi2";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section with Soft Indigo Gradient Glow */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Top Announcement Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-indigo-200 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs hover:border-indigo-300 transition">
            <HiSparkles className="text-indigo-600 text-sm animate-pulse" />
            <span>Next-Gen Enterprise AI Support Platform</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="max-w-4xl mx-auto space-y-5">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight">
              <span className="block text-slate-900">
                Intelligent Customer Support
              </span>
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Powered by Conversational AI & RAG
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal pt-1">
              Automate customer inquiries 24/7, search company knowledge bases with ChromaDB vector search, detect user intent, execute order tools, and escalate complex cases seamlessly.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 border border-indigo-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition duration-200"
            >
              <HiChatBubbleLeftRight className="text-lg" />
              <span>Launch Customer Support Chat</span>
              <HiArrowRight className="text-sm" />
            </Link>

            <Link
              href="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-white border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition duration-200"
            >
              <HiShieldCheck className="text-lg text-indigo-600" />
              <span>Staff Operations Console</span>
            </Link>
          </div>

          {/* Feature Highlights Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              <HiCheckCircle className="text-emerald-500 text-sm" /> Multi-turn Memory
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              <HiCheckCircle className="text-emerald-500 text-sm" /> ChromaDB RAG Vector Store
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              <HiCheckCircle className="text-emerald-500 text-sm" /> Real-Time Human Escalation
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              <HiCheckCircle className="text-emerald-500 text-sm" /> Autonomous Tool Calling
            </span>
          </div>

        </div>
      </section>

      {/* Enterprise Platform Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Core Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight pt-1">
              Built for Modern Enterprise Support
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              End-to-end customer support automation with strict safety guardrails, dynamic document ingestion, and live human agent co-pilot.
            </p>
          </div>

          {/* 4 Clean Enterprise Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Intent Engine */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-4 hover:border-indigo-300 hover:bg-white transition duration-200 shadow-2xs hover:shadow-md">
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-xl font-bold shadow-xs">
                <HiCpuChip />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Intent Detection Engine
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Automatically classifies user queries into order tracking, returns, billing, complaints, or human escalation requests.
                </p>
              </div>
            </div>

            {/* Card 2: ChromaDB RAG */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-4 hover:border-purple-300 hover:bg-white transition duration-200 shadow-2xs hover:shadow-md">
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-purple-600 text-white text-xl font-bold shadow-xs">
                <HiBookOpen />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  ChromaDB Vector RAG
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Searches uploaded PDF user manuals, Markdown policy documents, and web pages using semantic similarity vector embeddings.
                </p>
              </div>
            </div>

            {/* Card 3: Tool Execution */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-4 hover:border-emerald-300 hover:bg-white transition duration-200 shadow-2xs hover:shadow-md">
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-emerald-600 text-white text-xl font-bold shadow-xs">
                <HiClock />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Autonomous Tool Execution
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Executes live database queries for order status updates, shipment tracking, and user account verification automatically.
                </p>
              </div>
            </div>

            {/* Card 4: Human Escalation */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-4 hover:border-amber-300 hover:bg-white transition duration-200 shadow-2xs hover:shadow-md">
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-amber-600 text-white text-xl font-bold shadow-xs">
                <HiUserGroup />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Human Agent Escalation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Escalates complex cases or severe customer frustration directly to human support staff with real-time live chat handover.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Dynamic Knowledge Base Feature Banner */}
      <section className="py-12 bg-slate-50 border-t border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border border-slate-800">
            
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-900/80 border border-indigo-700/60 px-3 py-1 text-xs font-semibold text-indigo-300">
                <HiGlobeAlt className="text-indigo-400 text-sm" />
                <span>Dynamic Document Uploader & Web Scraper</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Keep Your AI Trained on Real-Time Business Data
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Upload PDF user manuals, Markdown guidelines, or scrape company website URLs directly into ChromaDB without writing any code.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Link
                href="/admin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 border border-indigo-500 px-6 py-3.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-md"
              >
                <HiArrowUpTray className="text-base" />
                <span>Manage Knowledge Base</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <HiBolt className="text-indigo-600 text-base" />
            <span className="font-semibold text-slate-700">Intelligent Customer Support Agent</span>
            <span>© 2026 Enterprise Edition</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-900 transition">Home</Link>
            <Link href="/chat" className="hover:text-slate-900 transition">Customer Chat</Link>
            <Link href="/admin" className="hover:text-slate-900 transition">Staff Portal</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
