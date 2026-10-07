"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  HiShieldCheck,
  HiTicket,
  HiBookOpen,
  HiServer,
  HiArrowLeftOnRectangle,
  HiChevronDown,
} from "react-icons/hi2";

export default function AdminNavbar({ activeTab, setActiveTab, ticketCount = 0 }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userName = user?.name ? user.name.replace(/\bdemo\b/gi, "System").trim() : "System Admin";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-15 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Admin Brand Logo */}
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold shadow-xs">
            <HiShieldCheck className="text-lg" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900">
                Intelligent <span className="text-indigo-600">Customer Support Agent</span>
              </span>
              <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 uppercase tracking-wider">
                Admin Console
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Support Staff Operations Workspace
            </p>
          </div>
        </Link>

        {/* Admin Tabs */}
        {pathname === "/admin" && setActiveTab && (
          <nav className="hidden md:flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === "tickets"
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HiTicket className="text-sm" />
              <span>Tickets ({ticketCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("knowledge")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === "knowledge"
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HiBookOpen className="text-sm" />
              <span>Knowledge Base</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === "system"
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HiServer className="text-sm" />
              <span>System Health</span>
            </button>
          </nav>
        )}

        {/* Right Staff Profile / Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:border-slate-300 transition shadow-xs"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white font-bold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {userName}
                  </p>
                  <p className="text-[10px] text-indigo-600 font-medium">
                    Support Staff
                  </p>
                </div>
                <HiChevronDown className="text-xs text-slate-500 ml-1" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                  >
                    <HiArrowLeftOnRectangle className="text-sm" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition shadow-xs"
            >
              <span>Staff Login</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
