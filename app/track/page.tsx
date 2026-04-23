"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiPackage, FiClock, FiCheckCircle, FiAlertCircle, FiLoader, FiPhone } from "react-icons/fi";
import { useSearchParams } from "next/navigation";

function TrackContent() {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setTrackingId(id);
      handleTrack(id);
    }
  }, [searchParams]);

  const handleTrack = async (id: string = trackingId) => {
    if (!id) return;
    setLoading(true);
    setError("");
    setApplication(null);

    try {
      const res = await fetch(`/api/track?id=${id}`);
      const data = await res.json();
      if (res.ok) {
        setApplication(data);
      } else {
        setError(data.error || "Application not found. Please check your Tracking ID.");
      }
    } catch (err) {
      setError("Failed to fetch application status.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { name: "Applied", status: "New", icon: <FiPackage />, desc: "Application received and queued." },
    { name: "In Process", status: "In Progress", icon: <FiClock />, desc: "Documents are being reviewed." },
    { name: "Completed", status: "Completed", icon: <FiCheckCircle />, desc: "Your visa/permit is ready." },
  ];

  const getCurrentStep = () => {
    if (!application) return -1;
    return steps.findIndex(s => s.status === application.status);
  };

  return (
    <main className="bg-[#020617] min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-black mb-4">Track <span className="text-gradient">Application</span></h1>
            <p className="text-slate-400">Enter your Tracking ID to see the real-time status of your request.</p>
          </motion.div>

          {/* Search Box */}
          <div className="glass-card p-6 mb-12 border-slate-800">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Enter Tracking ID (e.g. SS-XXXXX)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  className="w-full pl-12 bg-slate-900 border border-slate-800 rounded-xl py-4 focus:border-yellow-400 outline-none transition-all"
                />
              </div>
              <button 
                onClick={() => handleTrack()}
                disabled={loading}
                className="premium-btn btn-primary px-8 flex items-center gap-2"
              >
                {loading ? <FiLoader className="animate-spin" /> : "Track"}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-4 mb-12"
              >
                <FiAlertCircle className="text-2xl shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {application && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Application Details */}
                <div className="glass-card p-8 border-slate-800">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Application for</span>
                      <h3 className="text-2xl font-bold">{application.service}</h3>
                      <p className="text-slate-400 text-sm">{application.name}</p>
                    </div>
                    <div className="text-md-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Status</span>
                      <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                        application.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 
                        application.status === 'In Progress' ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-400/20 text-yellow-400'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="relative pt-8 pb-12">
                    <div className="absolute top-12 left-0 w-full h-1 bg-slate-800 rounded-full" />
                    <div className="relative flex justify-between">
                      {steps.map((step, idx) => {
                        const currentIdx = getCurrentStep();
                        const isActive = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={idx} className="flex flex-col items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 
                              ${isActive ? 'bg-yellow-400 border-slate-900 text-black scale-110 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                              {step.icon}
                            </div>
                            <div className="text-center">
                              <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-white' : 'text-slate-600'}`}>{step.name}</h4>
                              <p className="text-[10px] text-slate-500 max-w-[100px] hidden sm:block">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Active Progress Bar Overlay */}
                    <div 
                      className="absolute top-12 left-0 h-1 bg-yellow-400 transition-all duration-1000 ease-out" 
                      style={{ width: `${(getCurrentStep() / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="glass-card p-6 border-slate-800 bg-slate-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center">
                      <FiPhone />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Need help?</p>
                      <p className="text-sm font-bold text-slate-300">Contact Support</p>
                    </div>
                  </div>
                  <a 
                    href="https://wa.me/923099797771" 
                    target="_blank"
                    className="text-xs font-bold text-yellow-400 border border-yellow-400/20 px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition-all"
                  >
                    Message on WhatsApp
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}
