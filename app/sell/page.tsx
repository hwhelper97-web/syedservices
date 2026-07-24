"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiInbox, FiSliders, FiMail } from "react-icons/fi";
import Link from "next/link";

export default function SellPage() {
  const [sneakerName, setSneakerName] = useState("");
  const [conditionScore, setConditionScore] = useState(10);
  const [boxStatus, setBoxStatus] = useState("Good");
  const [sellerEmail, setSellerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sneakerName,
          conditionScore,
          boxStatus,
          sellerEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#020617] min-h-screen text-slate-250 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-yellow-400 transition-colors mb-4">
            ← Return to Homepage
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Sneaker <span className="text-yellow-400">Appraisals</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Submit your sneaker details to receive an authentication and value appraisal
          </p>
        </div>

        <div className="bg-[#0f172a]/80 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-md">
          {success ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto">
                <FiCheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-white">Request Submitted!</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your appraisal request has been received. Check your inbox (or the admin email log) for your confirmation message.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setSneakerName("");
                  setConditionScore(10);
                  setBoxStatus("Good");
                  setSellerEmail("");
                }}
                className="mt-4 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Submit Another Request
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Sneaker Name */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                  Sneaker Model & Colorway
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <FiInbox size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan 1 Retro High Travis Scott"
                    value={sneakerName}
                    onChange={(e) => setSneakerName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-xl text-xs focus:outline-none focus:ring-0 text-white"
                  />
                </div>
              </div>

              {/* Condition Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Condition Score
                  </label>
                  <span className="text-xs font-bold text-yellow-400">{conditionScore}/10</span>
                </div>
                <div className="flex items-center gap-4">
                  <FiSliders className="text-slate-500" size={16} />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={conditionScore}
                    onChange={(e) => setConditionScore(parseInt(e.target.value))}
                    className="flex-1 accent-yellow-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Box Status */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                  Box Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Good", "Damaged", "None"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setBoxStatus(status)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        boxStatus === status
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seller Email */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                  Seller Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <FiMail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="seller@example.com"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-xl text-xs focus:outline-none focus:ring-0 text-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-yellow-400 text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? "Submitting..." : "Submit for Appraisal"} <FiArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
