"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiPhone, FiGlobe, FiArrowRight, FiLoader } from "react-icons/fi";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [agencyName, setAgencyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role, agencyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Successful registration
      router.push("/portal");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#020617] min-h-screen text-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial gradient and world map */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1e293b,transparent)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('/world-map.svg')] bg-center bg-no-repeat bg-contain" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Logo & Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo />
          <h2 className="text-2xl font-black text-white mt-4 tracking-tight">
            Client Registration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create an account to submit and track your visa applications
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[#0f172a]/80 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-md">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                I want to register as
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("CLIENT")}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    role === "CLIENT"
                      ? "bg-yellow-400/10 border-yellow-400 text-yellow-400 shadow-lg shadow-yellow-400/5"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <FiUser size={16} />
                  <span>Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("AGENT")}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    role === "AGENT"
                      ? "bg-yellow-400/10 border-yellow-400 text-yellow-400 shadow-lg shadow-yellow-400/5"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <FiGlobe size={16} />
                  <span>Travel Agency</span>
                </button>
              </div>
            </div>

            {role === "AGENT" && (
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                  Agency Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <FiGlobe size={18} />
                  </span>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    required
                    placeholder="Syed Services Lahore"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <FiUser size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
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
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <FiPhone size={18} />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+93 764260062"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                Password
              </label>
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
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-sm placeholder-slate-600 focus:outline-none focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <FiLoader className="animate-spin" size={18} />
              ) : (
                <>
                  Register <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href="/portal/login"
                className="text-yellow-400 font-bold hover:underline"
              >
                Sign In
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
