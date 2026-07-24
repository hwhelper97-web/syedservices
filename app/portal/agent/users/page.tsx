"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiUserPlus, FiLoader, FiCheckCircle, FiPlusCircle, FiMail, FiPhone, FiLock, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AgentUsersPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/agent/users");
      const data = await res.json();
      if (res.ok) {
        setClients(data.clients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/agent/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register client user");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      fetchClients();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Banner */}
      <div className="relative overflow-hidden bg-[#0f172a] border border-slate-800 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <FiUsers className="text-yellow-400" /> Client accounts
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Register individual client credentials so they can log in to view visa updates, and easily submit applications on their behalf.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Register Form */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FiUserPlus className="text-yellow-400" /> Register Client Account
          </h3>

          <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2.5rem] shadow-xl space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-2">
                <FiCheckCircle /> Client account registered successfully!
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@gmail.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Temporary Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Phone Number (Optional)</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+93 3001234567"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-400/10 disabled:opacity-50"
              >
                {registering ? (
                  <FiLoader className="animate-spin" size={18} />
                ) : (
                  <>
                    <FiUserPlus size={18} /> Register Client
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FiUsers className="text-yellow-400" /> Registered Clients ({clients.length})
            </h3>
          </div>

          {loading ? (
            <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-12 flex justify-center items-center h-64 text-yellow-400">
              <FiLoader className="animate-spin" size={32} />
            </div>
          ) : clients.length === 0 ? (
            <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-slate-800/30 text-slate-500 rounded-full flex items-center justify-center">
                <FiUsers size={32} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">No client accounts yet</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Add clients using the registration panel to start submitting applications for them.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden bg-[#0f172a] border border-slate-800 rounded-[2.5rem] shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-350">
                  <thead className="bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-5">Name / Email</th>
                      <th className="p-5">Phone</th>
                      <th className="p-5">Created At</th>
                      <th className="p-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="p-5">
                          <div className="font-bold text-white text-sm">{client.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{client.email}</div>
                        </td>
                        <td className="p-5 text-xs font-semibold text-slate-400">
                          {client.clientProfile?.phone || "N/A"}
                        </td>
                        <td className="p-5 text-xs text-slate-500">
                          {new Date(client.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-5 text-right">
                          <Link
                            href={`/portal/agent/new-app?email=${encodeURIComponent(client.email)}&name=${encodeURIComponent(client.name)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 hover:bg-yellow-400 hover:text-black border border-yellow-400/25 text-yellow-400 text-[11px] font-black rounded-xl transition-all cursor-pointer"
                          >
                            <FiPlusCircle /> Apply
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
