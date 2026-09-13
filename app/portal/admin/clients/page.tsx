"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FiUsers, FiSearch, FiLoader, FiEdit2, FiTrash2,
  FiX, FiSave, FiAlertTriangle, FiCheckCircle, FiRefreshCw,
  FiKey, FiCopy, FiEye, FiEyeOff, FiCheck, FiUserCheck, FiPhone, FiMail
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PortalToast, { ToastMessage } from "@/components/PortalToast";

export default function AdminClientsListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Selection & Bulk delete state
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Edit modal state
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [success, setSuccess] = useState(false);

  // Delete confirm state (Single)
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        const clients = (data.users || []).filter((u: any) => u.role === "CLIENT");
        setUsers(clients);
      } else {
        showToast(data.error || "Failed to load clients", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error while loading clients", "error");
    } finally {
      setLoading(false);
    }
  };

  // Password Generator Function
  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    let pass = "";
    pass += uppers[Math.floor(Math.random() * uppers.length)];
    pass += uppers[Math.floor(Math.random() * uppers.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    
    const all = chars + uppers + numbers + symbols;
    for (let i = 0; i < 6; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }
    
    const shuffled = pass.split("").sort(() => 0.5 - Math.random()).join("");
    const finalPass = "Client!" + shuffled.slice(0, 8) + Math.floor(10 + Math.random() * 90);

    setEditPassword(finalPass);
    setShowEditPassword(true);
    navigator.clipboard.writeText(finalPass);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
    showToast("Strong client password generated & copied!", "success");
  };

  const copyPasswordToClipboard = (val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
    showToast("Password copied to clipboard!", "info");
  };

  const openEdit = (client: any) => {
    setEditUser(client);
    setEditName(client.name);
    setEditEmail(client.email);
    setEditPhone(client.clientProfile?.phone || "");
    setEditStatus(client.status || "ACTIVE");
    setEditPassword("");
    setEditError("");
    setShowEditPassword(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editUser.id,
          name: editName,
          email: editEmail,
          status: editStatus,
          phone: editPhone,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update client");

      setSuccess(true);
      setEditUser(null);
      showToast("Client account updated successfully.", "success");
      fetchUsers();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setEditError(err.message);
      showToast(err.message || "Failed to update client", "error");
    } finally {
      setEditLoading(false);
    }
  };

  // Single Delete
  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteUser.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete client");

      setDeleteUser(null);
      setSelectedClientIds((prev) => prev.filter((id) => id !== deleteUser.id));
      showToast("Client successfully removed.", "success");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Failed to delete client", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedClientIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedClientIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete selected clients");

      showToast(`Successfully deleted ${data.count || selectedClientIds.length} client(s).`, "success");
      setSelectedClientIds([]);
      setShowBulkDeleteModal(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Bulk deletion failed", "error");
    } finally {
      setBulkDeleting(false);
    }
  };

  const filteredClients = useMemo(() => {
    return users.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesEmail = c.email?.toLowerCase().includes(q);
        const matchesPhone = c.clientProfile?.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }
      return true;
    });
  }, [users, statusFilter, searchTerm]);

  // Select all helpers
  const selectableFilteredIds = useMemo(() => {
    return filteredClients.map((c) => c.id);
  }, [filteredClients]);

  const isAllSelected = selectableFilteredIds.length > 0 && selectableFilteredIds.every((id) => selectedClientIds.includes(id));
  const isSomeSelected = selectedClientIds.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedClientIds((prev) => prev.filter((id) => !selectableFilteredIds.includes(id)));
    } else {
      setSelectedClientIds((prev) => Array.from(new Set([...prev, ...selectableFilteredIds])));
    }
  };

  const toggleSelectClient = (id: number) => {
    setSelectedClientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const suspendedCount = users.filter((u) => u.status === "SUSPENDED" || u.status === "INACTIVE").length;

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      <PortalToast toast={toast} onClose={() => setToast(null)} />

      {/* ─── Top Header & Summary ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1">
            <FiUsers size={14} /> Client Directory & CRM Database
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Registered Visa Clients
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {users.length} Clients
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin text-yellow-400" : ""} />
            <span>Refresh Clients</span>
          </button>
        </div>
      </div>

      {/* ─── Quick KPI Mini-Stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Clients</div>
            <div className="text-2xl font-black text-white mt-1">{users.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
            <FiUsers size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Clients</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FiUserCheck size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suspended / Inactive</div>
            <div className="text-2xl font-black text-red-400 mt-1">{suspendedCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <FiAlertTriangle size={18} />
          </div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "ALL", label: "All Status" },
            { id: "ACTIVE", label: "Active" },
            { id: "SUSPENDED", label: "Suspended" },
            { id: "INACTIVE", label: "Inactive" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/10"
                  : "bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            <FiSearch size={13} />
          </span>
          <input
            type="text"
            placeholder="Search client name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none placeholder-slate-600 text-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-white"
            >
              <FiX size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {isSomeSelected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-red-300">
              <FiCheckCircle className="text-red-400" size={15} />
              <span>
                <strong>{selectedClientIds.length}</strong> client account(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedClientIds([])}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Deselect All
              </button>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <FiTrash2 size={13} /> Delete Selected ({selectedClientIds.length})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Scroll Box Table Container ─── */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded text-yellow-400 bg-slate-950 border-slate-700 focus:ring-yellow-400 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span>Select All ({selectableFilteredIds.length})</span>
            </label>
          </div>
          <div className="text-[11px] text-slate-500 font-mono font-bold">
            Showing {filteredClients.length} of {users.length} clients
          </div>
        </div>

        {/* Scroll Box */}
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 text-yellow-400 gap-3">
              <FiLoader className="animate-spin" size={28} />
              <span className="text-xs text-slate-500 font-mono">Loading Client Database...</span>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FiUsers className="text-slate-600 text-4xl mx-auto" />
              <h4 className="text-white text-sm font-bold">No Clients Found</h4>
              <p className="text-xs text-slate-500">No registered client records matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="sticky top-0 z-10 bg-[#0b1329] border-b border-slate-800 text-[10px] uppercase font-black text-slate-400 tracking-wider shadow-sm">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="p-4">Client Name & Details</th>
                  <th className="p-4">Contact Information</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredClients.map((client) => {
                  const isSelected = selectedClientIds.includes(client.id);

                  return (
                    <tr
                      key={client.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isSelected ? "bg-yellow-400/5" : ""
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectClient(client.id)}
                          className="w-4 h-4 rounded text-yellow-400 bg-slate-950 border-slate-700 focus:ring-yellow-400 focus:ring-offset-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* Name Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                            {client.name ? client.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "C"}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{client.name}</p>
                            <p className="text-[10px] text-slate-400">{client.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="text-slate-300 font-mono text-[11px]">
                            {client.clientProfile?.phone || "No phone listed"}
                          </div>
                          {client.clientProfile?.currentAddress && (
                            <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                              {client.clientProfile.currentAddress}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          client.status === "ACTIVE" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : client.status === "SUSPENDED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${client.status === "ACTIVE" ? "bg-emerald-400" : "bg-red-400"}`} />
                          {client.status || "ACTIVE"}
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "—"}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(client)}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-yellow-400 hover:border-yellow-400/30 transition-all cursor-pointer"
                            title="Edit client details or reset password"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteUser(client)}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer"
                            title="Delete client account"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── Edit Modal with Password Generator ─── */}
      <AnimatePresence>
        {editUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setEditUser(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FiEdit2 className="text-yellow-400" size={18} />
                  <h4 className="text-base font-black text-white">Edit Client: {editUser.name}</h4>
                </div>
                <button onClick={() => setEditUser(null)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                  <FiX size={18} />
                </button>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{editError}</div>
              )}

              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Client Full Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required
                    className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white" />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Email Address</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required
                    className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white" />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+92 300 1234567"
                    className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white" />
                </div>

                {/* Password Reset with Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      New Password (leave blank to keep current)
                    </label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 cursor-pointer"
                    >
                      <FiKey size={11} /> Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 pr-16 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white font-mono"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                      {editPassword && (
                        <button
                          type="button"
                          onClick={() => copyPasswordToClipboard(editPassword)}
                          className="p-1.5 text-slate-400 hover:text-yellow-400"
                        >
                          <FiCopy size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="p-1.5 text-slate-400 hover:text-white"
                      >
                        {showEditPassword ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Account Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditUser(null)}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-xs cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={editLoading}
                    className="flex-1 py-3 bg-yellow-400 text-black font-black rounded-xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs shadow-md shadow-yellow-400/10">
                    {editLoading ? <FiLoader className="animate-spin" size={15} /> : <><FiSave size={15} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Single Delete Confirm Modal ─── */}
      <AnimatePresence>
        {deleteUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteUser(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#0f172a] border border-red-500/30 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl text-center space-y-5"
            >
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-400">
                <FiAlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Delete Client Record?</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-white">{deleteUser.name}</strong> (<span className="text-slate-300 font-mono text-[11px]">{deleteUser.email}</span>)?
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteUser(null)}
                  className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-xs cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs shadow-lg shadow-red-500/20">
                  {deleteLoading ? <FiLoader className="animate-spin" size={15} /> : <><FiTrash2 size={15} /> Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Bulk Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowBulkDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#0f172a] border border-red-500/40 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl space-y-5"
            >
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-400">
                <FiTrash2 size={24} />
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-lg font-black text-white">Delete {selectedClientIds.length} Selected Clients?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This batch action will permanently remove all selected client accounts, profiles, and associated records. This action cannot be undone.
                </p>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <span className="text-[11px] font-bold text-red-300">
                  ⚠️ {selectedClientIds.length} client record(s) will be permanently purged.
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="flex-1 py-3 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs shadow-lg shadow-red-500/25"
                >
                  {bulkDeleting ? <FiLoader className="animate-spin" size={16} /> : <><FiTrash2 size={16} /> Purge Clients</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
