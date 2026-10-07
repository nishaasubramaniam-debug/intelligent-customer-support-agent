"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../../../components/AdminNavbar";
import { useAuth } from "../../../context/AuthContext";
import {
  HiShieldCheck,
  HiLockClosed,
  HiEnvelope,
  HiEye,
  HiEyeSlash,
  HiArrowRight,
  HiExclamationTriangle,
} from "react-icons/hi2";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide your admin email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const user = await login(email, password);

      if (user.role === "admin") {
        router.push("/admin");
      } else {
        setError("Access Denied: This account does not have Support Admin permissions.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to authenticate admin credentials. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen human-bg-canvas text-slate-900 flex flex-col font-sans">
      <AdminNavbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          
          <div className="rounded-xl human-card p-6 sm:p-8 space-y-6">
            
            {/* Admin Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 mb-1">
                <HiShieldCheck className="text-2xl" />
              </div>

              <div className="inline-block rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                Staff Authentication
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Admin Console Sign In
              </h2>
              <p className="text-xs text-slate-500">
                Restricted access for support operations and administrators
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2.5">
                <HiExclamationTriangle className="text-base shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Admin Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Admin Email Address
                </label>
                <div className="relative">
                  <HiEnvelope className="absolute left-3 top-2.5 text-sm text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    required
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600/30 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Security Password
                </label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-2.5 text-sm text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-sm text-slate-400 hover:text-slate-700 transition"
                  >
                    {showPassword ? <HiEyeSlash /> : <HiEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 border border-indigo-700 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying Staff Credentials...</span>
                  ) : (
                    <>
                      <span>Authenticate Operations Console</span>
                      <HiArrowRight className="text-sm" />
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>
      </div>
    </main>
  );
}
