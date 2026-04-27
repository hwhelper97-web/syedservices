"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FiLogOut, FiTrash2, FiMail, FiPhone, FiCheckCircle, 
  FiClock, FiFileText, FiDownload, FiSearch, FiEye, FiUser, FiCalendar, FiTag, FiX, FiGlobe, FiLoader
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardClient({ initialLeads }: { initialLeads: any[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const isAdmin = localStorage.getItem("admin");
    const token = localStorage.getItem("token");
    if (isAdmin !== "true" || !token) {
      router.push("/admin/login");
    }
  }, [router]);

  if (!isMounted) return null;

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
        if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const notifyEmail = async (id: number) => {
    setIsNotifying(true);
    try {
      const formData = new FormData();
      if (attachment) {
        formData.append("attachment", attachment);
      }

      const res = await fetch(`/api/leads/${id}/notify`, { 
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        alert("Notification email sent successfully!");
        setAttachment(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send email");
      }
    } catch (err) {
      alert("Error sending notification");
    } finally {
      setIsNotifying(false);
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lead? All associated files will also be deleted.")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
        setSelectedLead(null);
      }
    } catch (err) {
      alert("Error deleting lead");
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm) ||
    l.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "New").length,
    inProgress: leads.filter(l => l.status === "In Progress").length,
    completed: leads.filter(l => l.status === "Completed").length,
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Sidebar / Topbar */}
      <nav className="bg-[#0f172a] border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-bold text-xl">S</div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">Syed Services</h1>
              <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-sm font-medium"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: stats.total, icon: <FiUser />, color: "blue" },
            { label: "New", value: stats.new, icon: <FiClock />, color: "yellow" },
            { label: "In Progress", value: stats.inProgress, icon: <FiLoader className="animate-spin-slow" />, color: "purple" },
            { label: "Completed", value: stats.completed, icon: <FiCheckCircle />, color: "green" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-${stat.color}-400 bg-${stat.color}-400/10`}>
                {stat.icon}
              </div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0f172a] p-4 rounded-xl border border-slate-800">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name, email, or service..."
              className="pl-11 pr-4 py-2 rounded-lg bg-slate-900 border-slate-800 focus:border-yellow-400/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {/* Filter buttons could go here */}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Lead Info</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Service</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Files</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{lead.email || "No email"}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400">
                        {lead.service}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`text-xs font-bold py-1 px-2 rounded-lg border-none focus:ring-0 cursor-pointer
                          ${lead.status === 'New' ? 'bg-yellow-400/10 text-yellow-400' : 
                            lead.status === 'In Progress' ? 'bg-purple-400/10 text-purple-400' : 
                            'bg-green-400/10 text-green-400'}`}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {lead.files.length > 0 ? (
                          lead.files.map((file: any, idx: number) => (
                            <div 
                              key={file.id} 
                              title={file.fileName}
                              className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0f172a] flex items-center justify-center text-xs text-slate-300"
                            >
                              {file.fileType === 'pdf' ? 'P' : 'I'}
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-600 text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button 
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLeads.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <FiUser size={48} className="mx-auto mb-4 opacity-20" />
                <p>No leads found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-full max-w-xl h-full bg-[#0f172a] border-l border-slate-800 shadow-2xl overflow-y-auto"
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedLead.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 text-sm">Tracking ID:</span>
                      <span className="bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold font-mono">
                        {selectedLead.trackingId}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-300">
                        <FiMail className="text-yellow-400" />
                        <span>{selectedLead.email || "No email provided"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <FiPhone className="text-yellow-400" />
                        <span>{selectedLead.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <FiGlobe className="text-yellow-400" />
                        <span>{selectedLead.country || "Nationality not provided"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <FiTag className="text-yellow-400" />
                        <span>{selectedLead.service}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <FiCalendar className="text-yellow-400" />
                        <span>{new Date(selectedLead.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Visa Application Details</h3>
                    <div className="space-y-2 text-xs">
                      {selectedLead.dob && (
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">DOB:</span>
                          <span className="text-slate-200">{selectedLead.dob}</span>
                        </div>
                      )}
                      {selectedLead.passportNumber && (
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">Passport:</span>
                          <span className="text-slate-200">{selectedLead.passportNumber} (Exp: {selectedLead.passportExpiry})</span>
                        </div>
                      )}
                      {selectedLead.fatherName && (
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">Father Name:</span>
                          <span className="text-slate-200">{selectedLead.fatherName}</span>
                        </div>
                      )}
                      {selectedLead.motherName && (
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">Mother Name:</span>
                          <span className="text-slate-200">{selectedLead.motherName}</span>
                        </div>
                      )}
                      {selectedLead.maritalStatus && (
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">Status:</span>
                          <span className="text-slate-200">{selectedLead.maritalStatus} {selectedLead.spouseName ? `(Spouse: ${selectedLead.spouseName})` : ""}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Status</h3>
                    <div className="flex items-center gap-3">
                      <select 
                        value={selectedLead.status}
                        onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                        className={`font-bold py-2 px-4 rounded-xl border-none focus:ring-0 cursor-pointer w-full
                          ${selectedLead.status === 'New' ? 'bg-yellow-400/10 text-yellow-400' : 
                            selectedLead.status === 'In Progress' ? 'bg-purple-400/10 text-purple-400' : 
                            'bg-green-400/10 text-green-400'}`}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a 
                        href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi ${selectedLead.name}, your application (${selectedLead.trackingId}) for ${selectedLead.service} is now ${selectedLead.status}. Track it here: https://syedservices.com.pk/track?id=${selectedLead.trackingId}`
                        )}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all text-xs font-bold"
                      >
                        Notify via WhatsApp
                      </a>

                      <div className="pt-2 border-t border-slate-800 mt-2">
                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Attach Result (PDF)</label>
                        <div className="relative group">
                           <div className={`flex items-center justify-between p-3 bg-slate-900 border rounded-lg transition-all ${attachment ? 'border-yellow-400 bg-yellow-400/5' : 'border-slate-800'}`}>
                              <span className="text-[10px] truncate pr-2 text-slate-400">
                                {attachment ? `✓ ${attachment.name}` : "Upload Visa/Permit PDF"}
                              </span>
                              <FiDownload className="text-slate-600 group-hover:text-yellow-400 transition-colors" />
                              <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                           </div>
                        </div>
                      </div>

                      <button 
                        disabled={isNotifying || !selectedLead.email}
                        onClick={() => notifyEmail(selectedLead.id)}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                      >
                        <FiMail className={isNotifying ? "animate-spin" : ""} />
                        {isNotifying ? "Sending Email..." : "Notify via Email"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Message</h3>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 whitespace-pre-wrap">
                    {selectedLead.message || "No message provided."}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Documents ({selectedLead.files.length})</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedLead.files.length > 0 ? (
                      selectedLead.files.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${file.fileType === 'pdf' ? 'bg-red-400/10 text-red-400' : 'bg-blue-400/10 text-blue-400'}`}>
                              <FiFileText size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white max-w-[200px] truncate">{file.fileName}</p>
                              <p className="text-xs text-slate-500 uppercase">{file.fileType}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {file.fileType !== 'pdf' && (
                              <a 
                                href={file.fileUrl} 
                                target="_blank" 
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                                title="View Image"
                              >
                                <FiEye />
                              </a>
                            )}
                            <a 
                              href={file.fileUrl} 
                              download={file.fileName}
                              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                              title="Download"
                            >
                              <FiDownload />
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic text-sm">No documents attached.</p>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-800">
                  <button 
                    onClick={() => deleteLead(selectedLead.id)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold"
                  >
                    <FiTrash2 /> Delete Lead Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
