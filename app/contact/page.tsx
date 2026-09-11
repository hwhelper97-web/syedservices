"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiClock } from "react-icons/fi";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Thank you! Your message has been sent. Our team will contact you shortly.");
        setForm({ name: "", email: "", message: "" });
      } else {
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again or reach out on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#020617] min-h-screen text-slate-200">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 relative overflow-hidden border-b border-slate-800/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-6">
            <FiMail /> 24/7 Client Support
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Get In <span className="text-yellow-400">Touch</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Have questions regarding visa requirements, tickets, or consultation? Our dedicated team is here to guide you.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-white mb-4">Direct Contact</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Reach out directly via phone, WhatsApp, or email for immediate assistance with urgent travel inquiries.
                </p>
              </div>

              <div className="space-y-4">
                <a 
                  href="tel:+923099797771" 
                  className="flex items-center gap-4 p-5 bg-[#0f172a] border border-slate-800 rounded-2xl hover:border-yellow-400/50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-yellow-400/10 text-yellow-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                    <FiPhone size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Call Us</p>
                    <p className="text-white font-bold text-sm">+92 309 9797771</p>
                  </div>
                </a>

                <a 
                  href="https://wa.me/923099797771" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-[#0f172a] border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    <FiClock size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">WhatsApp Support</p>
                    <p className="text-white font-bold text-sm">+92 309 9797771 (Fastest)</p>
                  </div>
                </a>

                <a 
                  href="mailto:info@syedservices.com.pk" 
                  className="flex items-center gap-4 p-5 bg-[#0f172a] border border-slate-800 rounded-2xl hover:border-yellow-400/50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-yellow-400/10 text-yellow-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                    <FiMail size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Email Address</p>
                    <p className="text-white font-bold text-sm">info@syedservices.com.pk</p>
                  </div>
                </a>
              </div>

              {/* Physical Office Highlights */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FiMapPin className="text-yellow-400" /> Physical Offices
                </h4>
                <div className="space-y-3 text-xs text-slate-400">
                  <p><strong>Peshawar, Pakistan:</strong> Prime City Building, University Road, Peshawar</p>
                  <p><strong>Jalalabad, Afghanistan:</strong> Shams Tareen Plaza, Jalalabad</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <h3 className="text-2xl font-black text-white mb-2">Send Us a Message</h3>
                <p className="text-slate-400 text-sm mb-8">
                  Fill in the form below and an advisor will reply within 24 business hours.
                </p>

                {success ? (
                  <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <FiCheckCircle size={26} />
                    </div>
                    <p className="text-emerald-400 font-bold text-sm">{success}</p>
                    <button 
                      onClick={() => setSuccess("")}
                      className="text-xs text-slate-400 hover:text-white underline mt-2"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Full Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:border-yellow-400 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:border-yellow-400 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Message *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="How can we assist you?"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-yellow-400 outline-none transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-yellow-400 text-black font-extrabold rounded-xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-xl shadow-yellow-400/10 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <span>Sending Message...</span>
                      ) : (
                        <>
                          <FiSend /> Send Inquiry
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}