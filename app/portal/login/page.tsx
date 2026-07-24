"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiGlobe, FiArrowRight, FiLoader, FiCheckCircle } from "react-icons/fi";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/portal");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send code");
      }

      setSuccessMessage(data.message || "Verification code sent to your email.");
      setMode("verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode, password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Reset password failed");
      }

      setSuccessMessage(data.message || "Password reset successful! Please login.");
      setMode("login");
      setPassword("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#020617] min-h-screen text-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1e293b,transparent)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('/world-map.svg')] bg-center bg-no-repeat bg-contain" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo />
          <h2 className="text-2xl font-black text-white mt-4 tracking-tight">
            Client & Staff Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your visa processing and application dashboard
          </p>
        </div>

        <div className="bg-[#0f172a]/80 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-md">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-2"
              >
                <FiCheckCircle size={14} />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <FiMail size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccessMessage("");
                      setMode("forgot");
                    }}
                    className="text-[10px] text-yellow-400 hover:underline font-bold uppercase tracking-widest cursor-pointer bg-transparent border-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <FiLock size={18} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <FiLoader className="animate-spin" size={18} />
                ) : (
                  <>
                    Sign In <FiArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  Reset Portal Password
                </h3>
                <p className="text-xs text-slate-400">
                  Enter your email address to receive a secure 6-digit verification code.
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <FiMail size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" size={18} />
                  ) : (
                    <>
                      Send Reset Code <FiArrowRight size={18} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMessage("");
                    setMode("login");
                  }}
                  className="w-full py-3.5 bg-transparent border border-slate-800 text-slate-400 hover:text-white font-bold rounded-2xl hover:bg-slate-900 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {mode === "verify" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  Verify Reset Code
                </h3>
                <p className="text-xs text-slate-400">
                  Please check your email and enter the code below to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-650 focus:outline-none focus:ring-0 text-center font-bold tracking-[8px] text-white text-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <FiLock size={18} />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <FiLock size={18} />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" size={18} />
                  ) : (
                    <>
                      Reset Password <FiArrowRight size={18} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("forgot");
                  }}
                  className="w-full py-3.5 bg-transparent border border-slate-800 text-slate-400 hover:text-white font-bold rounded-2xl hover:bg-slate-900 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <p className="text-xs text-slate-500">
              New client?{" "}
              <Link
                href="/portal/register"
                className="text-yellow-400 font-bold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors"
          >
            <FiGlobe size={14} /> Back to Homepage
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
