"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FiUsers, FiUserPlus, FiLoader, FiCheckCircle,
  FiEdit2, FiTrash2, FiX, FiSave, FiAlertTriangle,
  FiShield, FiUser, FiMail, FiLock, FiPhone, FiKey,
  FiCopy, FiEye, FiEyeOff, FiSearch, FiRefreshCw,
  FiCheck, FiBriefcase, FiUserCheck
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PortalToast, { ToastMessage } from "@/components/PortalToast";

const ROLE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  SUPER_ADMIN: { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/30", label: "Super Admin" },
  ADMIN:       { bg: "bg-red-500/15",    text: "text-red-300",    border: "border-red-500/30",    label: "Administrator" },
  AGENT:       { bg: "bg-yellow-500/15", text: "text-yellow-300", border: "border-yellow-500/30", label: "Travel Agent" },
  STAFF:       { bg: "bg-blue-500/15",   text: "text-blue-300",   border: "border-blue-500/30",   label: "Support Staff" },
  CLIENT:      { bg: "bg-emerald-500/15",text: "text-emerald-300",border: "border-emerald-500/30",label: "Portal Client" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selection & Bulk delete state
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Add form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
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
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

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
        setUsers(data.users || []);
      } else {
        showToast(data.error || "Failed to load users", "error");
      }
    } catch (e: any) {
      console.error(e);
      showToast("Network error while loading users", "error");
    } finally {
      setLoading(false);
    }
  };

  // Password Generator Function
  const generateStrongPassword = (target: "create" | "edit" = "create") => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    // Pick at least 2 uppers, 2 numbers, 2 symbols, and lowercase
    let pass = "";
    pass += uppers[Math.floor(Math.random() * uppers.length)];
    pass += uppers[Math.floor(Math.random() * uppers.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    
    const all = chars + uppers + numbers + symbols;
    for (let i = 0; i < 6; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle
    const shuffled = pass.split("").sort(() => 0.5 - Math.random()).join("");
    const finalPass = "Syed!" + shuffled.slice(0, 8) + Math.floor(10 + Math.random() * 90);

    if (target === "create") {
      setPassword(finalPass);
      setShowPassword(true);
    } else {
      setEditPassword(finalPass);
      setShowEditPassword(true);
    }

    navigator.clipboard.writeText(finalPass);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
    showToast("Strong password generated & copied to clipboard!", "success");
  };

  const copyPasswordToClipboard = (val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
    showToast("Password copied to clipboard!", "info");
  };

  // Password Strength Calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", score: 0, color: "bg-slate-700" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { label: "Weak", score: 33, color: "bg-red-500" };
    if (score <= 4) return { label: "Good", score: 66, color: "bg-yellow-400" };
    return { label: "Strong", score: 100, color: "bg-emerald-400" };
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
      showToast(`User ${name} registered successfully!`, "success");
      setName(""); 
      setEmail(""); 
      setPassword(""); 
      setAgencyName(""); 
      setPhone("");
      fetchUsers();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message || "Registration failed", "error");
    } finally {
      setRegistering(false);
    }
  };

  const openEdit = (member: any) => {
    setEditUser(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
    setEditStatus(member.status || "ACTIVE");
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
          role: editRole,
          status: editStatus,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");

      setEditUser(null);
      showToast("User account details updated successfully.", "success");
      fetchUsers();
    } catch (err: any) {
      setEditError(err.message);
      showToast(err.message || "Failed to update user", "error");
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
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setDeleteUser(null);
      setSelectedUserIds((prev) => prev.filter((id) => id !== deleteUser.id));
      showToast("User account deleted successfully.", "success");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Failed to delete user", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedUserIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete selected accounts");

      showToast(`Successfully deleted ${data.count || selectedUserIds.length} account(s).`, "success");
      setSelectedUserIds([]);
      setShowBulkDeleteModal(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Bulk deletion failed", "error");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Filter & Search computation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role Filter
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      // Status Filter
      if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(query);
        const matchesEmail = u.email?.toLowerCase().includes(query);
        const matchesPhone = u.clientProfile?.phone?.toLowerCase().includes(query) || u.agentProfile?.phone?.toLowerCase().includes(query);
        const matchesCode = u.agentProfile?.agentCode?.toLowerCase().includes(query) || u.agentProfile?.agencyName?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCode) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Select All Helpers
  const selectableFilteredIds = useMemo(() => {
    return filteredUsers.filter((u) => u.role !== "SUPER_ADMIN").map((u) => u.id);
  }, [filteredUsers]);

  const isAllSelected = selectableFilteredIds.length > 0 && selectableFilteredIds.every((id) => selectedUserIds.includes(id));
  const isSomeSelected = selectedUserIds.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all filtered
      setSelectedUserIds((prev) => prev.filter((id) => !selectableFilteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...selectableFilteredIds])));
    }
  };

  const toggleSelectUser = (id: number) => {
    setSelectedUserIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // KPI calculations
  const stats = useMemo(() => {
    const total = users.length;
    const staff = users.filter((u) => ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(u.role)).length;
    const agents = users.filter((u) => u.role === "AGENT").length;
    const clients = users.filter((u) => u.role === "CLIENT").length;
    return { total, staff, agents, clients };
  }, [users]);

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      <PortalToast toast={toast} onClose={() => setToast(null)} />

      {/* ─── Top Header & Summary KPI Bar ─── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1">
            <FiShield size={14} /> Security & System Administration
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            User Management & Team Directory
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {users.length} Total Users
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin text-yellow-400" : ""} />
            <span>Refresh Directory</span>
          </button>
        </div>
      </div>

      {/* ─── KPI Metric Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Accounts", value: stats.total, icon: <FiUsers className="text-yellow-400" size={20} />, sub: "All registered users", filter: "ALL" },
          { label: "Administrative / Staff", value: stats.staff, icon: <FiShield className="text-purple-400" size={20} />, sub: "Super Admin, Admin, Staff", filter: "STAFF" },
          { label: "Travel Agents", value: stats.agents, icon: <FiBriefcase className="text-amber-400" size={20} />, sub: "Licensed Agency Partners", filter: "AGENT" },
          { label: "Portal Clients", value: stats.clients, icon: <FiUserCheck className="text-emerald-400" size={20} />, sub: "Visa Applicants & Clients", filter: "CLIENT" },
        ].map((kpi, idx) => (
          <div
            key={idx}
            onClick={() => setRoleFilter(kpi.filter)}
            className={`p-4 md:p-5 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#090d16] border transition-all cursor-pointer hover:scale-[1.01] ${
              roleFilter === kpi.filter ? "border-yellow-400/50 shadow-lg shadow-yellow-400/5" : "border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</span>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">{kpi.icon}</div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white mt-2">{kpi.value}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── Main Content Grid: Create User Form (Left 4 cols) + Scroll Box User Table (Right 8 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ─── Column 1: Register New User / Team Member ─── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0f172a] border border-slate-800/90 rounded-3xl p-5 md:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center">
                  <FiUserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Create New User</h3>
                  <p className="text-[11px] text-slate-400">Add Staff, Agent, Client or Admin</p>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <FiAlertTriangle size={15} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <FiCheckCircle size={15} className="shrink-0" />
                  <span>Account registered successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <FiUser size={14} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Ahmad Khan"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <FiMail size={14} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@syedservices.com.pk"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              {/* Password Generator Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => generateStrongPassword("create")}
                    className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer bg-yellow-400/10 hover:bg-yellow-400/20 px-2 py-0.5 rounded-lg border border-yellow-400/20"
                    title="Generate secure strong password"
                  >
                    <FiKey size={11} /> Generate Password
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <FiLock size={14} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter or generate password"
                    className="w-full pl-10 pr-20 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-600 font-mono transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                    {password && (
                      <button
                        type="button"
                        onClick={() => copyPasswordToClipboard(password)}
                        className="p-1.5 text-slate-400 hover:text-yellow-400 rounded-lg hover:bg-slate-800 transition-all"
                        title="Copy Password"
                      >
                        {copiedPassword ? <FiCheck size={13} className="text-emerald-400" /> : <FiCopy size={13} />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Strength:</span>
                      <span className={`font-bold ${
                        passwordStrength.score === 100 ? "text-emerald-400" :
                        passwordStrength.score === 66 ? "text-yellow-400" : "text-red-400"
                      }`}>{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* System Role */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                  System Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <FiShield size={14} />
                  </span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white appearance-none cursor-pointer"
                  >
                    <option value="STAFF">Support Executive (STAFF)</option>
                    <option value="AGENT">Travel Partner / Agency (AGENT)</option>
                    <option value="ADMIN">System Administrator (ADMIN)</option>
                    <option value="CLIENT">Portal Client (CLIENT)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Agent Fields */}
              <AnimatePresence>
                {role === "AGENT" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-3 border-t border-slate-800">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                        Agency Name
                      </label>
                      <input
                        type="text"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder="e.g. Silk Route Travels"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                        Agency Contact Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-600"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3 bg-yellow-400 text-black font-black rounded-xl hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-lg shadow-yellow-400/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider mt-2"
              >
                {registering ? <FiLoader className="animate-spin" size={16} /> : <><FiUserPlus size={16} /> Register Account</>}
              </button>
            </form>
          </div>
        </div>

        {/* ─── Column 2: Active Directory with Scroll Box & Select-All Deletion (Right 8 cols) ─── */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls & Search Filter Bar */}
          <div className="bg-[#0f172a] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "ALL", label: "All Users" },
                { id: "STAFF", label: "Staff" },
                { id: "AGENT", label: "Agents" },
                { id: "CLIENT", label: "Clients" },
                { id: "ADMIN", label: "Admins" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === tab.id
                      ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/10"
                      : "bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <FiSearch size={13} />
              </span>
              <input
                type="text"
                placeholder="Search name, email, phone, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none placeholder-slate-600 text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-white"
                >
                  <FiX size={13} />
                </button>
              )}
            </div>

          </div>

          {/* Floating Bulk Actions Bar when 1+ users selected */}
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
                    <strong>{selectedUserIds.length}</strong> account(s) selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedUserIds([])}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FiTrash2 size={13} /> Delete Selected ({selectedUserIds.length})
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
                  <span>Select All Filtered ({selectableFilteredIds.length})</span>
                </label>
              </div>
              <div className="text-[11px] text-slate-500 font-mono font-bold">
                Showing {filteredUsers.length} of {users.length} accounts
              </div>
            </div>

            {/* Scroll Container with fixed max height and custom scrollbar */}
            <div className="max-h-[580px] overflow-y-auto overflow-x-auto">
              {loading ? (
                <div className="flex flex-col justify-center items-center h-64 text-yellow-400 gap-3">
                  <FiLoader className="animate-spin" size={28} />
                  <span className="text-xs text-slate-500 font-mono">Loading User Directory...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <FiUsers className="text-slate-600 text-4xl mx-auto" />
                  <h4 className="text-white text-sm font-bold">No Users Found</h4>
                  <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="sticky top-0 z-10 bg-[#0b1329] border-b border-slate-800 text-[10px] uppercase font-black text-slate-400 tracking-wider shadow-sm">
                    <tr>
                      <th className="p-4 w-10 text-center">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="p-4">User Details</th>
                      <th className="p-4">Role & Level</th>
                      <th className="p-4">Reference / Code</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((member) => {
                      const isSelected = selectedUserIds.includes(member.id);
                      const isSuperAdmin = member.role === "SUPER_ADMIN";
                      const roleConfig = ROLE_STYLES[member.role] || ROLE_STYLES.STAFF;

                      return (
                        <tr
                          key={member.id}
                          className={`hover:bg-slate-900/40 transition-colors ${
                            isSelected ? "bg-yellow-400/5" : ""
                          }`}
                        >
                          {/* Checkbox Column */}
                          <td className="p-4 text-center">
                            {!isSuperAdmin ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectUser(member.id)}
                                className="w-4 h-4 rounded text-yellow-400 bg-slate-950 border-slate-700 focus:ring-yellow-400 focus:ring-offset-slate-900 cursor-pointer"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-600" title="Super Admin Protected">
                                🔒
                              </span>
                            )}
                          </td>

                          {/* User Column */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center text-xs font-black shrink-0">
                                {member.name ? member.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white text-xs truncate">{member.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                                {(member.clientProfile?.phone || member.agentProfile?.phone) && (
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    {member.clientProfile?.phone || member.agentProfile?.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                              {roleConfig.label}
                            </span>
                          </td>

                          {/* Code / Reference */}
                          <td className="p-4 font-mono text-xs text-slate-400">
                            {member.agentProfile?.agentCode ? (
                              <div>
                                <span className="text-yellow-400 font-bold">{member.agentProfile.agentCode}</span>
                                {member.agentProfile.agencyName && (
                                  <div className="text-[10px] text-slate-500 font-sans">{member.agentProfile.agencyName}</div>
                                )}
                              </div>
                            ) : member.role === "CLIENT" ? (
                              <span className="text-slate-500 text-[10px]">Client Account</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              member.status === "ACTIVE" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : member.status === "SUSPENDED"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${member.status === "ACTIVE" ? "bg-emerald-400" : "bg-red-400"}`} />
                              {member.status || "ACTIVE"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEdit(member)}
                                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-yellow-400 hover:border-yellow-400/30 transition-all cursor-pointer"
                                title="Edit user details or reset password"
                              >
                                <FiEdit2 size={13} />
                              </button>
                              {!isSuperAdmin && (
                                <button
                                  onClick={() => setDeleteUser(member)}
                                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer"
                                  title="Delete user account"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              )}
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
                  <h4 className="text-base font-black text-white">Edit User Account: {editUser.name}</h4>
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
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Full Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required
                    className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white" />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Email Address</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required
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
                      onClick={() => generateStrongPassword("edit")}
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Role</label>
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white">
                      <option value="STAFF">STAFF</option>
                      <option value="AGENT">AGENT</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="CLIENT">CLIENT</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none text-white">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
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
                <h4 className="text-base font-black text-white">Delete User Account?</h4>
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
                <h4 className="text-lg font-black text-white">Delete {selectedUserIds.length} Selected Accounts?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This batch action will permanently remove all selected user and client accounts and their associated records. This action cannot be undone.
                </p>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <span className="text-[11px] font-bold text-red-300">
                  ⚠️ {selectedUserIds.length} account(s) will be permanently purged from the database.
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
                  {bulkDeleting ? <FiLoader className="animate-spin" size={16} /> : <><FiTrash2 size={16} /> Purge Accounts</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
