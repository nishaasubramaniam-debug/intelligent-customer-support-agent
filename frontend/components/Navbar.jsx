"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  HiSparkles,
  HiChatBubbleLeftRight,
  HiArrowLeftOnRectangle,
  HiUserPlus,
  HiChevronDown,
  HiHome,
  HiBolt,
  HiShieldCheck,
} from "react-icons/hi2";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userName = user?.name ? user.name.replace(/\bdemo\b/gi, "System").trim() : "Customer";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-15 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 group-hover:bg-indigo-100 transition duration-200 shadow-xs">
            <HiBolt className="text-lg" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900">
                Intelligent <span className="text-indigo-600">Customer Support Agent</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              AI-Powered Customer Support System
            </p>
          </div>
        </Link>

        {/* Navigation Tabs - Segmented Control Style */}
        <nav className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-1">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
              pathname === "/"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <HiHome className="text-sm" />
            <span>Home</span>
          </Link>

          <Link
            href="/chat"
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
              pathname === "/chat"
                ? "bg-indigo-600 text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <HiChatBubbleLeftRight className="text-sm" />
            <span>Customer Chat</span>
          </Link>

          {/* Only display Staff Portal for authorized admin staff */}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                pathname === "/admin"
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <HiShieldCheck className="text-sm text-indigo-500" />
              <span>Staff Portal</span>
            </Link>
          )}
        </nav>

        {/* Right Auth Area */}
        <div className="flex items-center gap-3">
          
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:border-slate-300 transition shadow-xs"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white font-bold text-xs shadow-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {userName}
                  </p>
                </div>
                <HiChevronDown className="text-xs text-slate-500" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/chat"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
                  >
                    <HiChatBubbleLeftRight className="text-indigo-600 text-sm" />
                    <span>Support Workspace</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition mt-1"
                  >
                    <HiArrowLeftOnRectangle className="text-sm" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <span>Sign In</span>
              </Link>

              <Link
                href="/register"
                className="hidden sm:flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition shadow-xs border border-indigo-700"
              >
                <HiUserPlus className="text-sm" />
                <span>Create Account</span>
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
