"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { VISA_STATUS_OPTIONS, VISA_STATUS_COLORS } from "@/lib/visaPipeline";
import { 
  FiSearch, FiFileText, FiLoader, FiCheckCircle, FiClock, 
  FiXCircle, FiEdit3, FiTrash2, FiExternalLink, FiFilter, 
  FiRefreshCw, FiCopy, FiCheck, FiGlobe, FiCalendar, FiAlertTriangle,
  FiUser, FiLayers, FiDollarSign, FiChevronRight, FiX
} from "react-icons/fi";

export default function AdminApplicationsListPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal State
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editSaving, setEditSaving] = useState(false);

  // Delete Modal State
  const [deletingApp, setDeletingApp] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Batch Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      } else {
        showToast("Failed to retrieve applications", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopyTracking = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Edit Modal
  const handleOpenEdit = (app: any) => {
    setEditingApp(app);
    setEditForm({
      status: app.status || "WAITING_CONFIRMATION",
      country: app.country || "",
      visaCategory: app.visaCategory || "",
      duration: app.duration || "",
      entryType: app.entryType || "Single",
      travelDate: app.travelDate || "",
      returnDate: app.returnDate || "",
      purpose: app.purpose || "",
      sponsor: app.sponsor || "",
      reference: app.reference || "",
      notes: "",
    });
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    setEditSaving(true);

    try {
      const res = await fetch(`/api/applications/${editingApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Application modified successfully!");
        setApplications((prev) =>
          prev.map((a) => (a.id === editingApp.id ? { ...a, ...editForm, updatedAt: new Date().toISOString() } : a))
        );
        setEditingApp(null);
      } else {
        showToast(data.error || "Failed to update application", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete Application
  const handleConfirmDelete = async () => {
    if (!deletingApp) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/applications/${deletingApp.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`Application ${deletingApp.trackingId || deletingApp.id} was deleted successfully.`);
        setApplications((prev) => prev.filter((a) => a.id !== deletingApp.id));
        setDeletingApp(null);
      } else {
        showToast(data.error || "Failed to delete application", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // KPI Calculations
  const totalCount = applications.length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED" || a.status === "FINISHED").length;
  const pendingCount = applications.filter((a) => a.status === "WAITING_CONFIRMATION" || a.status === "DRAFT").length;
  const processingCount = applications.filter((a) => 
    !["APPROVED", "FINISHED", "REJECTED", "ARCHIVED", "DRAFT"].includes(a.status)
  ).length;

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const trackingStr = (app.trackingId || "").toLowerCase();
    const clientNameStr = (app.client?.user?.name || "").toLowerCase();
    const clientEmailStr = (app.client?.user?.email || "").toLowerCase();
    const countryStr = (app.country || "").toLowerCase();
    const categoryStr = (app.visaCategory || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      trackingStr.includes(search) ||
      clientNameStr.includes(search) ||
      clientEmailStr.includes(search) ||
      countryStr.includes(search) ||
      categoryStr.includes(search);

    let matchesStatus = true;
    if (statusFilter === "PENDING") {
      matchesStatus = app.status === "WAITING_CONFIRMATION" || app.status === "DRAFT";
    } else if (statusFilter === "PROCESSING") {
      matchesStatus = !["APPROVED", "FINISHED", "REJECTED", "ARCHIVED", "DRAFT"].includes(app.status);
    } else if (statusFilter === "APPROVED") {
      matchesStatus = app.status === "APPROVED" || app.status === "FINISHED";
    } else if (statusFilter === "REJECTED") {
      matchesStatus = app.status === "REJECTED";
    } else if (statusFilter !== "ALL") {
      matchesStatus = app.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  // Batch Selection Helpers
  const isAllSelected = filteredApps.length > 0 && filteredApps.every((a) => selectedIds.includes(a.id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApps.map((a) => a.id));
    }
  };

  const handleToggleSelectOne = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Batch Delete Execution
  const handleConfirmBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    setBatchDeleting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message || `Successfully deleted ${selectedIds.length} applications!`);
        setApplications((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
        setSelectedIds([]);
        setBatchDeleteOpen(false);
      } else {
        showToast(data.error || "Failed to delete selected applications", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setBatchDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4 text-yellow-400">
        <FiLoader className="animate-spin" size={40} />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Loading Immigration Dossiers...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-3 backdrop-blur-xl ${
              toastMessage.type === "success"
                ? "bg-green-950/80 border-green-500/30 text-green-400"
                : "bg-red-950/80 border-red-500/30 text-red-400"
            }`}
          >
            {toastMessage.type === "success" ? <FiCheckCircle size={18} /> : <FiAlertTriangle size={18} />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#111c38] to-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
              <FiLayers size={13} /> Administrative Dossier Command
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Immigration & Visa Dossiers
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Inspect client dossiers, modify visa parameters, update pipeline status stages, or purge archived records with full audit trail.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchApplications}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900/90 border border-slate-700 hover:border-yellow-400/40 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? "animate-spin text-yellow-400" : ""} size={15} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div 
          whileHover={{ y: -3 }} 
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Submissions</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FiFileText size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">{totalCount}</h3>
            <span className="text-xs text-slate-500">dossiers</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-blue-400 font-bold">100%</span> logged in database
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }} 
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Under Processing</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FiClock size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-amber-400">{processingCount}</h3>
            <span className="text-xs text-slate-500">in pipeline</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping mr-1" />
            Active Embassy & China reviews
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }} 
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visas Granted</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FiCheckCircle size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-emerald-400">{approvedCount}</h3>
            <span className="text-xs text-slate-500">approved</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">
              {totalCount > 0 ? `${Math.round((approvedCount / totalCount) * 100)}%` : "0%"}
            </span> success rate
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }} 
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Review</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FiUser size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-purple-400">{pendingCount}</h3>
            <span className="text-xs text-slate-500">new/draft</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            Requires initial deal confirmation
          </div>
        </motion.div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-[2rem] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { key: "ALL", label: "All Dossiers" },
            { key: "PROCESSING", label: "In Pipeline" },
            { key: "PENDING", label: "Awaiting Action" },
            { key: "APPROVED", label: "Approved" },
            { key: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.key
                  ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <FiSearch size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, country, visa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-yellow-400/50 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-yellow-400/50 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Status Types</option>
            {VISA_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Quick Select All Button */}
          {filteredApps.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-md ${
                isAllSelected
                  ? "bg-yellow-400 text-black border-yellow-400 shadow-yellow-400/20 font-black"
                  : "bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-900 hover:text-white"
              }`}
              title={isAllSelected ? "Deselect All" : `Select all ${filteredApps.length} applications`}
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isSomeSelected;
                }}
                readOnly
                className="pointer-events-none w-3.5 h-3.5 rounded accent-yellow-400 cursor-pointer"
              />
              <span>{isAllSelected ? "Deselect All" : `Select All (${filteredApps.length})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {filteredApps.length === 0 ? (
        <div className="bg-[#0f172a]/60 border border-slate-800 border-dashed p-16 rounded-[2.5rem] text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <FiFileText size={28} />
          </div>
          <h4 className="text-lg font-bold text-white">No Matching Dossiers Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or status filter to see submissions.
          </p>
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
              className="mt-2 px-4 py-2 bg-slate-900 border border-slate-800 text-yellow-400 rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0f172a] border border-slate-800 rounded-[2.5rem] shadow-2xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                {/* Select All Table Header Checkbox */}
                <th className="p-5 w-12 text-center">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400 bg-slate-950 border-slate-700 cursor-pointer accent-yellow-400"
                      title={isAllSelected ? "Deselect All Applications" : `Select all ${filteredApps.length} applications`}
                    />
                  </div>
                </th>
                <th className="p-5">Applicant / Client</th>
                <th className="p-5">Destination & Plan</th>
                <th className="p-5">Tracking Reference</th>
                <th className="p-5">Dates & Logistics</th>
                <th className="p-5">Pipeline Status</th>
                <th className="p-5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredApps.map((app) => {
                const clientName = app.client?.user?.name || "Applicant";
                const clientEmail = app.client?.user?.email || "";
                const tracking = app.trackingId || `APP-${app.id}`;
                const statusColorClass = VISA_STATUS_COLORS[app.status] || "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                const isSelected = selectedIds.includes(app.id);

                return (
                  <tr 
                    key={app.id} 
                    className={`hover:bg-slate-900/40 transition-colors group ${
                      isSelected ? "bg-yellow-500/[0.08] border-l-2 border-l-yellow-400" : ""
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectOne(app.id, e as any)}
                          className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400 bg-slate-950 border-slate-700 cursor-pointer accent-yellow-400"
                        />
                      </div>
                    </td>

                    {/* Client */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border border-yellow-400/30 flex items-center justify-center font-black text-yellow-400 text-xs shrink-0">
                          {clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm group-hover:text-yellow-400 transition-colors">
                            {clientName}
                          </p>
                          <p className="text-[11px] text-slate-500">{clientEmail || "Direct Submission"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Destination & Category */}
                    <td className="p-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                          <FiGlobe className="text-yellow-400 shrink-0" size={13} />
                          <span>{app.country || "Unspecified"}</span>
                          {(app.packagePrice || app.package?.priceUSD) && (
                            <span className="font-mono text-emerald-400 font-bold text-[11px] ml-auto">
                              ${app.packagePrice || app.package?.priceUSD} USD
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400">
                            {app.visaCategory || "General Visa"}
                          </span>
                          {app.package && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-yellow-400/10 border border-yellow-400/20 text-[9px] font-black text-yellow-400 uppercase tracking-wider">
                              Package Deal
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tracking ID */}
                    <td className="p-5">
                      <button
                        onClick={(e) => handleCopyTracking(tracking, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:border-yellow-400/40 hover:text-yellow-400 transition-colors cursor-pointer group/btn"
                        title="Click to copy tracking ID"
                      >
                        <span>{tracking}</span>
                        {copiedId === tracking ? (
                          <FiCheck className="text-emerald-400" size={12} />
                        ) : (
                          <FiCopy className="text-slate-500 group-hover/btn:text-yellow-400" size={12} />
                        )}
                      </button>
                    </td>

                    {/* Dates */}
                    <td className="p-5">
                      <div className="text-xs space-y-1">
                        <p className="text-slate-300 flex items-center gap-1">
                          <FiCalendar size={12} className="text-slate-500" />
                          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        </p>
                        {app.travelDate && (
                          <p className="text-[10px] text-slate-500">
                            Travel: {app.travelDate}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm"
                        style={{}}
                      >
                        <span className={`px-2.5 py-0.5 rounded-full border ${statusColorClass}`}>
                          {app.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Dossier link */}
                        <Link
                          href={`/portal/admin/applications/${app.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-yellow-400/50 hover:bg-slate-800 text-xs font-bold rounded-xl text-yellow-400 transition-all cursor-pointer shadow-sm"
                          title="Open Full Dossier"
                        >
                          <FiExternalLink size={13} />
                          <span>Dossier</span>
                        </Link>

                        {/* Modify button */}
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 text-xs font-bold rounded-xl text-blue-400 transition-all cursor-pointer shadow-sm"
                          title="Modify Application Details"
                        >
                          <FiEdit3 size={13} />
                          <span>Modify</span>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => setDeletingApp(app)}
                          className="p-2 bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer shadow-sm"
                          title="Delete Application"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODIFY APPLICATION MODAL */}
      <AnimatePresence>
        {editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <FiEdit3 size={11} /> Modify Dossier
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Edit Application: {editingApp.trackingId || `ID #${editingApp.id}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Applicant: {editingApp.client?.user?.name || "Client"}
                  </p>
                </div>
                <button
                  onClick={() => setEditingApp(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Stage */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Pipeline Status Stage
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    >
                      {VISA_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Destination Country
                    </label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      required
                      placeholder="e.g. China, United Kingdom, Canada"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    />
                  </div>

                  {/* Visa Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Visa Category
                    </label>
                    <input
                      type="text"
                      value={editForm.visaCategory}
                      onChange={(e) => setEditForm({ ...editForm, visaCategory: e.target.value })}
                      required
                      placeholder="e.g. Work Visa (Z), Business (M), Tourist (L)"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Duration of Stay
                    </label>
                    <input
                      type="text"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                      placeholder="e.g. 30 Days, 90 Days, 1 Year"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    />
                  </div>

                  {/* Entry Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Entry Type
                    </label>
                    <select
                      value={editForm.entryType}
                      onChange={(e) => setEditForm({ ...editForm, entryType: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    >
                      <option value="Single">Single Entry</option>
                      <option value="Double">Double Entry</option>
                      <option value="Multiple">Multiple Entry</option>
                    </select>
                  </div>

                  {/* Travel Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Intended Travel Date
                    </label>
                    <input
                      type="text"
                      value={editForm.travelDate}
                      onChange={(e) => setEditForm({ ...editForm, travelDate: e.target.value })}
                      placeholder="YYYY-MM-DD or e.g. Oct 2026"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    />
                  </div>

                  {/* Return Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Intended Return Date
                    </label>
                    <input
                      type="text"
                      value={editForm.returnDate}
                      onChange={(e) => setEditForm({ ...editForm, returnDate: e.target.value })}
                      placeholder="YYYY-MM-DD or e.g. Nov 2026"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    />
                  </div>

                  {/* Purpose */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Purpose of Travel
                    </label>
                    <input
                      type="text"
                      value={editForm.purpose}
                      onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
                      placeholder="e.g. Commercial trade, Tourism, Employment"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    />
                  </div>

                  {/* Sponsor / Reference */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Host Sponsor / Reference
                    </label>
                    <input
                      type="text"
                      value={editForm.sponsor}
                      onChange={(e) => setEditForm({ ...editForm, sponsor: e.target.value })}
                      placeholder="e.g. Shanghai Trading Co. / Self"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                    />
                  </div>

                  {/* Internal Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Administrative Modification Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Reason for changes or updates for client status history log..."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingApp(null)}
                    className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-2xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-black rounded-2xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50 shadow-lg shadow-yellow-400/20"
                  >
                    {editSaving ? <FiLoader className="animate-spin" size={15} /> : <FiCheck size={15} />}
                    {editSaving ? "Saving Updates..." : "Save Modifications"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE APPLICATION CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] border border-red-500/30 w-full max-w-md rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <FiTrash2 size={26} />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-white">Permanently Delete Dossier?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are about to delete application <strong className="text-white font-mono">{deletingApp.trackingId || `ID #${deletingApp.id}`}</strong> for <strong className="text-white">{deletingApp.client?.user?.name || "Client"}</strong>.
                </p>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-red-400 text-left">
                  ⚠️ This will permanently remove all attached applicant documents, status history timestamps, and application ties. This action cannot be reversed.
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingApp(null)}
                  disabled={deleteLoading}
                  className="w-1/2 py-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-2xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="w-1/2 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xs cursor-pointer shadow-lg shadow-red-600/30 disabled:opacity-50"
                >
                  {deleteLoading ? <FiLoader className="animate-spin" size={15} /> : <FiTrash2 size={15} />}
                  {deleteLoading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING BATCH ACTIONS TOOLBAR */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#0f172a]/95 backdrop-blur-xl border border-yellow-400/40 rounded-3xl p-4 md:px-7 shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-2xl w-[92%]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-black text-sm border border-yellow-400/30">
                {selectedIds.length}
              </div>
              <div>
                <span className="text-white font-extrabold text-sm block leading-tight">
                  {selectedIds.length} Application{selectedIds.length > 1 ? "s" : ""} Selected
                </span>
                <span className="text-[11px] text-slate-400">
                  {isAllSelected ? "All filtered dossiers selected" : `out of ${filteredApps.length} filtered results`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isAllSelected && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Select All ({filteredApps.length})
                </button>
              )}

              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => setBatchDeleteOpen(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-all shadow-lg shadow-red-600/30 cursor-pointer"
              >
                <FiTrash2 size={15} />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BATCH DELETE MULTIPLE APPLICATIONS CONFIRMATION MODAL */}
      <AnimatePresence>
        {batchDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] border border-red-500/30 w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto text-2xl">
                <FiTrash2 />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white">
                  Permanently Delete {selectedIds.length} Dossiers?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are about to delete <strong className="text-white font-bold">{selectedIds.length}</strong> selected applications in a single batch operation.
                </p>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 text-left space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-300">
                    <FiAlertTriangle /> Irreversible Administrative Action
                  </div>
                  <div>
                    This will permanently remove all attached documents, unbind associated invoices, and clear status audit logs for these {selectedIds.length} applications.
                  </div>
                </div>
              </div>

              {/* Preview of selected dossiers */}
              <div className="max-h-40 overflow-y-auto bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-xs divide-y divide-slate-800/60 font-mono">
                {applications
                  .filter((a) => selectedIds.includes(a.id))
                  .slice(0, 6)
                  .map((app) => (
                    <div key={app.id} className="py-1.5 flex items-center justify-between text-slate-300">
                      <span className="text-yellow-400 font-bold">{app.trackingId || `APP-${app.id}`}</span>
                      <span className="text-slate-400 truncate max-w-[200px]">
                        {app.client?.user?.name || "Client"} ({app.country || "Visa"})
                      </span>
                    </div>
                  ))}
                {selectedIds.length > 6 && (
                  <div className="py-1.5 text-center text-slate-500 italic text-[11px]">
                    ...and {selectedIds.length - 6} more applications
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBatchDeleteOpen(false)}
                  disabled={batchDeleting}
                  className="w-1/2 py-3.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-2xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBatchDelete}
                  disabled={batchDeleting}
                  className="w-1/2 flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xs cursor-pointer shadow-lg shadow-red-600/30 disabled:opacity-50"
                >
                  {batchDeleting ? <FiLoader className="animate-spin" size={15} /> : <FiTrash2 size={15} />}
                  {batchDeleting ? "Deleting Dossiers..." : `Confirm Delete (${selectedIds.length})`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
