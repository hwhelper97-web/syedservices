"use client";

import { useState, useEffect } from "react";
import {
  FiUsers, FiUserPlus, FiLoader, FiCheckCircle,
  FiEdit2, FiTrash2, FiX, FiSave, FiAlertTriangle,
  FiShield, FiUser, FiMail, FiLock, FiPhone
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/15 text-purple-300 border border-purple-500/20",
  ADMIN:       "bg-red-500/15 text-red-300 border border-red-500/20",
  AGENT:       "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20",
  STAFF:       "bg-blue-500/15 text-blue-300 border border-blue-500/20",
  CLIENT:      "bg-slate-500/15 text-slate-300 border border-slate-500/20",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Add form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const [agencyName, setAgencyName] = useState("");
  const [phone, setPhone] = useState("");

  // Edit modal state
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete confirm state
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        const team = data.users.filter((u: any) => u.role !== "CLIENT");
        setUsers(team);
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
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, agencyName, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register user");

      setSuccess(true);
      setName(""); setEmail(""); setPassword(""); setAgencyName(""); setPhone("");
      fetchUsers();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const openEdit = (member: any) => {
    setEditUser(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
    setEditStatus(member.status);
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
          role: editRole,
          status: editStatus,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");

      setEditUser(null);
      fetchUsers();
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
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ─── Register Form ─── */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight">Register Team Member</h3>

          <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2.5rem] shadow-xl space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-2">
                  <FiCheckCircle /> Team member registered successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { label: "Full Name", value: name, setter: setName, type: "text", placeholder: "John Doe", icon: <FiUser size={15} /> },
                { label: "Email Address", value: email, setter: setEmail, type: "email", placeholder: "name@syedservices.com.pk", icon: <FiMail size={15} /> },
                { label: "Password", value: password, setter: setPassword, type: "password", placeholder: "••••••••", icon: <FiLock size={15} /> },
              ].map(({ label, value, setter, type, placeholder, icon }) => (
                <div key={label}>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">{label}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none">{icon}</span>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      required
                      placeholder={placeholder}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-600"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">System Role</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none"><FiShield size={15} /></span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white appearance-none"
                  >
                    <option value="STAFF">Support Executive (STAFF)</option>
                    <option value="AGENT">Travel Agent (AGENT)</option>
                    <option value="ADMIN">Administrator (ADMIN)</option>
                  </select>
                </div>
              </div>

              <AnimatePresence>
                {role === "AGENT" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-2 border-t border-slate-800">
                    {[
                      { label: "Agency Name", value: agencyName, setter: setAgencyName, type: "text", placeholder: "Jalalabad Operations", icon: <FiUser size={15} /> },
                      { label: "Agency Phone", value: phone, setter: setPhone, type: "tel", placeholder: "+93 764260062", icon: <FiPhone size={15} /> },
                    ].map(({ label, value, setter, type, placeholder, icon }) => (
                      <div key={label}>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">{label}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none">{icon}</span>
                          <input type={type} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                            className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-600" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={registering}
                className="w-full py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                {registering ? <FiLoader className="animate-spin" size={18} /> : <><FiUserPlus size={18} /> Register Member</>}
              </button>
            </form>
          </div>
        </div>

        {/* ─── Active Team Directory ─── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white tracking-tight">Active Team Directory</h3>
            <span className="text-xs text-slate-500 font-mono bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              {users.length} members
            </span>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] shadow-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="p-5">Member</th>
                  <th className="p-5">Role</th>
                  <th className="p-5">Code</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {users.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-900/20 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {member.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{member.name}</p>
                          <p className="text-[10px] text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${ROLE_STYLES[member.role] || ROLE_STYLES.STAFF}`}>
                        {member.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-5 font-mono text-xs text-slate-400">
                      {member.agentProfile?.agentCode || "—"}
                    </td>
                    <td className="p-5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        member.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(member)}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-yellow-400 hover:border-yellow-400/30 transition-all cursor-pointer"
                          title="Edit member"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        {member.role !== "SUPER_ADMIN" && (
                          <button
                            onClick={() => setDeleteUser(member)}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer"
                            title="Remove member"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

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
              className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-white">Edit Team Member</h4>
                <button onClick={() => setEditUser(null)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                  <FiX size={18} />
                </button>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{editError}</div>
              )}

              <form onSubmit={handleEdit} className="space-y-4">
                {[
                  { label: "Full Name", value: editName, setter: setEditName, type: "text" },
                  { label: "Email Address", value: editEmail, setter: setEditEmail, type: "email" },
                  { label: "New Password (leave blank to keep)", value: editPassword, setter: setEditPassword, type: "password", placeholder: "••••••••" },
                ].map(({ label, value, setter, type, placeholder }) => (
                  <div key={label}>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">{label}</label>
                    <input type={type} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder || ""}
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-600" />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Role</label>
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white">
                      <option value="STAFF">STAFF</option>
                      <option value="AGENT">AGENT</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
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
                <h4 className="text-lg font-black text-white">Remove Team Member?</h4>
                <p className="text-sm text-slate-400 mt-2">
                  You are about to permanently remove <span className="text-white font-bold">{deleteUser.name}</span> from the system. This cannot be undone.
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
