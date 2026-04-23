"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("admin", "true");
        localStorage.setItem("token", data.token);
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid administrative credentials.");
      }
    } catch (err) {
      setError("Connection error. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-2xl text-black font-bold text-3xl mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
            S
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Access</h1>
          <p className="text-slate-500 mt-2">Manage your leads and inquiries</p>
        </div>

        <div className="glass-card p-8 border-slate-800">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label>Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="email"
                  placeholder="admin@syedservices.com"
                  className="pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label>Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="pl-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
              >
                <FiAlertCircle className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full premium-btn btn-primary mt-2"
            >
              {loading ? "Authenticating..." : "Login to Dashboard"}
              {!loading && <FiArrowRight />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
             <Link href="/" className="text-sm text-slate-500 hover:text-yellow-400 transition-colors">
                Return to public website
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}