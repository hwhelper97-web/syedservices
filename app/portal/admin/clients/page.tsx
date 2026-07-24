"use client";

import { useState, useEffect } from "react";
import {
  FiUsers, FiSearch, FiLoader, FiEdit2, FiTrash2,
  FiX, FiSave, FiAlertTriangle, FiCheckCircle
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminClientsListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal state
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [success, setSuccess] = useState(false);

  // Delete confirm state
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        // filter clients
        const clients = data.users.filter((u: any) => u.role === "CLIENT");
        setUsers(clients);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (client: any) => {
    setEditUser(client);
    setEditName(client.name);
    setEditEmail(client.email);
    setEditPhone(client.clientProfile?.phone || "");
    setEditStatus(client.status);
    setEditPassword("");
    setEditError("");
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
          phone: editPhone, // Note: the backend PATCH handles this if we pass it, but since it's nested we'll handle it
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update client");

      setSuccess(true);
      setEditUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

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
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredClients = users.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Client Database</h3>
          <p className="text-xs text-slate-400 mt-1">Directory and management of registered portal clients</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <FiSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none placeholder-slate-600 text-white"
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-2">
            <FiCheckCircle /> Client details updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {filteredClients.length === 0 ? (
        <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed p-12 rounded-[2.5rem] text-center space-y-2">
          <FiUsers className="text-slate-500 text-4xl mx-auto" />
          <h4 className="text-white font-bold">No Clients Found</h4>
          <p className="text-xs text-slate-500">No registered client records found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0f172a] border border-slate-800 rounded-[2rem] shadow-xl">
          <table className="w-full text-left text-sm text-slate-355">
            <thead className="bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-5">Client Name</th>
                <th className="p-5">Email Address</th>
                <th className="p-5">Phone</th>
                <th className="p-5">Account Status</th>
                <th className="p-5">Join Date</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="p-5 font-bold text-white">{client.name}</td>
                  <td className="p-5">{client.email}</td>
                  <td className="p-5 text-slate-400">{client.clientProfile?.phone || "N/A"}</td>
                  <td className="p-5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      client.status === "ACTIVE" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-5 text-xs text-slate-500">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(client)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-yellow-400 hover:border-yellow-400/30 transition-all cursor-pointer"
                        title="Edit client & reset password"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteUser(client)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer"
                        title="Remove client"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      <AnimatePresence>
        {editUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setEditUser(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6 animate-none"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-white">Edit Client Details</h4>
                <button onClick={() => setEditUser(null)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                  <FiX size={18} />
                </button>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{editError}</div>
              )}

              <form onSubmit={handleEdit} className="space-y-4">
                {[
                  { label: "Client Name", value: editName, setter: setEditName, type: "text" },
                  { label: "Email Address", value: editEmail, setter: setEditEmail, type: "email" },
                  { label: "Phone Number", value: editPhone, setter: setEditPhone, type: "text" },
                  { label: "New Password (leave blank to keep)", value: editPassword, setter: setEditPassword, type: "password", placeholder: "••••••••" },
                ].map(({ label, value, setter, type, placeholder }) => (
                  <div key={label}>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">{label}</label>
                    <input type={type} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder || ""}
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-605" />
                  </div>
                ))}

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Account Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                <button type="submit" disabled={editLoading}
                  className="w-full py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  {editLoading ? <FiLoader className="animate-spin" size={18} /> : <><FiSave size={18} /> Save Changes</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirm Modal ─── */}
      <AnimatePresence>
        {deleteUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteUser(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#0f172a] border border-red-500/20 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
                <FiAlertTriangle size={28} />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">Remove Client Record?</h4>
                <p className="text-sm text-slate-400 mt-2">
                  You are about to permanently remove <span className="text-white font-bold">{deleteUser.name}</span>. This will delete their profile and cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteUser(null)}
                  className="flex-1 py-3 bg-slate-900 border border-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleteLoading}
                  className="flex-1 py-3 bg-red-500 text-white font-black rounded-2xl hover:bg-red-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  {deleteLoading ? <FiLoader className="animate-spin" size={16} /> : <><FiTrash2 size={16} /> Remove</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
