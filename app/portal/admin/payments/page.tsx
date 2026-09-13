"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiDollarSign, FiFileText, FiLoader, FiCheckCircle, 
  FiClock, FiAlertCircle, FiDownload, FiCheck, FiX, 
  FiPlus, FiEdit3, FiTrash2, FiSearch, FiRefreshCw, 
  FiCopy, FiEye, FiCalendar, FiCreditCard, FiAlertTriangle, FiArrowUpRight
} from "react-icons/fi";
import CustomDatePicker from "@/components/CustomDatePicker";

export default function AdminPaymentsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Edit Invoice Modal
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<{ totalAmount: string; status: string; dueDate: string }>({
    totalAmount: "",
    status: "UNPAID",
    dueDate: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  // Delete Invoice Modal
  const [deletingInvoice, setDeletingInvoice] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Batch Selection & Deletion State
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Create Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    invoiceNumber: "",
    totalAmount: "",
    dueDate: "",
    status: "UNPAID",
    applicationId: "",
  });
  const [createSaving, setCreateSaving] = useState(false);

  // Receipt Preview Modal
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices || []);
      } else {
        showToast("Failed to retrieve invoices", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Payment verification (slips)
  const handleVerify = async (paymentId: number, status: string) => {
    setVerifyingId(paymentId);
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Payment slip successfully marked as ${status.toLowerCase()}!`);
        fetchInvoices();
      } else {
        showToast(data.error || "Failed to update payment", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error updating payment verification", "error");
    } finally {
      setVerifyingId(null);
    }
  };

  // Open Edit Invoice Modal
  const handleOpenEdit = (inv: any) => {
    setEditingInvoice(inv);
    const dateStr = inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : "";
    setEditForm({
      totalAmount: String(inv.totalAmount || ""),
      status: inv.status || "UNPAID",
      dueDate: dateStr,
    });
  };

  // Save Edit Invoice
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    setEditSaving(true);

    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: editingInvoice.id,
          totalAmount: parseFloat(editForm.totalAmount),
          status: editForm.status,
          dueDate: editForm.dueDate || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`Invoice ${editingInvoice.invoiceNumber} updated successfully!`);
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === editingInvoice.id
              ? {
                  ...inv,
                  totalAmount: parseFloat(editForm.totalAmount),
                  status: editForm.status,
                  dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : inv.dueDate,
                }
              : inv
          )
        );
        setEditingInvoice(null);
      } else {
        showToast(data.error || "Failed to update invoice", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete Invoice
  const handleConfirmDelete = async () => {
    if (!deletingInvoice) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/payments?invoiceId=${deletingInvoice.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`Invoice ${deletingInvoice.invoiceNumber} deleted successfully.`);
        setInvoices((prev) => prev.filter((inv) => inv.id !== deletingInvoice.id));
        setDeletingInvoice(null);
      } else {
        showToast(data.error || "Failed to delete invoice", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Create Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSaving(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_INVOICE",
          invoiceNumber: createForm.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
          totalAmount: parseFloat(createForm.totalAmount),
          dueDate: createForm.dueDate || undefined,
          status: createForm.status,
          applicationId: createForm.applicationId ? parseInt(createForm.applicationId, 10) : undefined,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Custom invoice generated successfully!");
        setShowCreateModal(false);
        setCreateForm({
          invoiceNumber: "",
          totalAmount: "",
          dueDate: "",
          status: "UNPAID",
          applicationId: "",
        });
        fetchInvoices();
      } else {
        showToast(data.error || "Failed to create invoice", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setCreateSaving(false);
    }
  };

  // Financial KPI Metrics
  const totalVolume = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const paidVolume = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const unpaidVolume = invoices
    .filter((inv) => inv.status === "UNPAID" || inv.status === "PARTIALLY_PAID")
    .reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const pendingSlipsCount = invoices.reduce((count, inv) => {
    const hasPending = (inv.payments || []).some((p: any) => p.status === "PENDING");
    return hasPending ? count + 1 : count;
  }, 0);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const code = (inv.invoiceNumber || "").toLowerCase();
    const clientName = (inv.application?.client?.user?.name || "").toLowerCase();
    const category = (inv.application?.visaCategory || "").toLowerCase();
    const tracking = (inv.application?.trackingId || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      code.includes(search) ||
      clientName.includes(search) ||
      category.includes(search) ||
      tracking.includes(search);

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Batch Selection Helpers
  const isAllSelected = filteredInvoices.length > 0 && filteredInvoices.every((inv) => selectedInvoiceIds.includes(inv.id));
  const isSomeSelected = selectedInvoiceIds.length > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(filteredInvoices.map((inv) => inv.id));
    }
  };

  const handleToggleSelectOne = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedInvoiceIds([]);
  };

  // Selected Invoices Total Sum
  const selectedTotalAmount = invoices
    .filter((inv) => selectedInvoiceIds.includes(inv.id))
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // Batch Delete Invoices Execution
  const handleConfirmBatchDelete = async () => {
    if (selectedInvoiceIds.length === 0) return;
    setBatchDeleting(true);

    try {
      const res = await fetch("/api/payments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceIds: selectedInvoiceIds }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message || `Successfully deleted ${selectedInvoiceIds.length} invoices!`);
        setInvoices((prev) => prev.filter((inv) => !selectedInvoiceIds.includes(inv.id)));
        setSelectedInvoiceIds([]);
        setBatchDeleteOpen(false);
      } else {
        showToast(data.error || "Failed to delete selected invoices", "error");
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
          Loading Financial Ledger & Invoices...
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
              <FiDollarSign size={13} /> Financial Operations Desk
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Billing & Invoices Desk
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Audit client receivables, inspect wire transfer payment slips, modify fee amounts, or issue direct client billing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-yellow-400 text-black font-black rounded-2xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-lg shadow-yellow-400/20"
            >
              <FiPlus size={16} />
              Issue New Invoice
            </button>
            <button
              onClick={fetchInvoices}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-700 hover:border-yellow-400/40 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? "animate-spin text-yellow-400" : ""} size={15} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoiced Volume</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FiDollarSign size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-400">$</span>
            <h3 className="text-3xl font-black text-white">{totalVolume.toLocaleString()}</h3>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across {invoices.length} total generated invoices
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collected Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FiCheckCircle size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-sm font-bold text-emerald-400">$</span>
            <h3 className="text-3xl font-black text-emerald-400">{paidVolume.toLocaleString()}</h3>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-bold">
              {totalVolume > 0 ? `${Math.round((paidVolume / totalVolume) * 100)}%` : "0%"}
            </span> of billed amount collected
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unpaid Balance</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <FiClock size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-sm font-bold text-rose-400">$</span>
            <h3 className="text-3xl font-black text-rose-400">{unpaidVolume.toLocaleString()}</h3>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Pending client settlements & wire transfers
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slips Awaiting Audit</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FiCreditCard size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-amber-400">{pendingSlipsCount}</h3>
            <span className="text-xs text-slate-500">receipts</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            {pendingSlipsCount > 0 ? (
              <span className="text-amber-400 font-bold">Action Required: Verify receipts</span>
            ) : (
              <span className="text-emerald-400">All payment proofs audited</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-[2rem] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { key: "ALL", label: "All Invoices" },
            { key: "UNPAID", label: "Unpaid" },
            { key: "PAID", label: "Paid & Verified" },
            { key: "PARTIALLY_PAID", label: "Partially Paid" },
            { key: "VOID", label: "Voided" },
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

        {/* Search */}
        <div className="relative min-w-[280px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <FiSearch size={15} />
          </span>
          <input
            type="text"
            placeholder="Search invoice code, client, visa..."
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

        {/* Quick Select All Button */}
        {filteredInvoices.length > 0 && (
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-md ${
              isAllSelected
                ? "bg-yellow-400 text-black border-yellow-400 shadow-yellow-400/20 font-black"
                : "bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-900 hover:text-white"
            }`}
            title={isAllSelected ? "Deselect All" : `Select all ${filteredInvoices.length} invoices`}
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
            <span>{isAllSelected ? "Deselect All" : `Select All (${filteredInvoices.length})`}</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-[#0f172a]/60 border border-slate-800 border-dashed p-16 rounded-[2.5rem] text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <FiDollarSign size={28} />
          </div>
          <h4 className="text-lg font-bold text-white">No Invoices Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No financial entries match your filter criteria or search terms.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 px-5 py-2.5 bg-yellow-400 text-black rounded-xl text-xs font-bold hover:scale-[1.02] cursor-pointer"
          >
            Create New Invoice
          </button>
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
                      title={isAllSelected ? "Deselect All Invoices" : `Select all ${filteredInvoices.length} invoices`}
                    />
                  </div>
                </th>
                <th className="p-5">Invoice Reference</th>
                <th className="p-5">Client & Dossier</th>
                <th className="p-5">Billing Amount</th>
                <th className="p-5">Timeline & Due Date</th>
                <th className="p-5">Payment Proof</th>
                <th className="p-5">Billing Status</th>
                <th className="p-5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredInvoices.map((inv) => {
                const clientName = inv.application?.client?.user?.name || "Direct Client";
                const clientEmail = inv.application?.client?.user?.email || "";
                const trackingId = inv.application?.trackingId || null;
                const manualPayment = (inv.payments || []).find((p: any) => p.paymentMethod === "BANK_TRANSFER");
                const isPendingSlip = manualPayment && manualPayment.status === "PENDING";
                const isVerifiedSlip = manualPayment && manualPayment.status === "VERIFIED";
                const isSelected = selectedInvoiceIds.includes(inv.id);

                return (
                  <tr 
                    key={inv.id} 
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
                          onChange={(e) => handleToggleSelectOne(inv.id, e as any)}
                          className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400 bg-slate-950 border-slate-700 cursor-pointer accent-yellow-400"
                        />
                      </div>
                    </td>

                    {/* Invoice Code */}
                    <td className="p-5">
                      <button
                        onClick={(e) => handleCopyCode(inv.invoiceNumber, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white hover:border-yellow-400/40 hover:text-yellow-400 transition-colors cursor-pointer group/btn"
                        title="Click to copy invoice code"
                      >
                        <span>{inv.invoiceNumber}</span>
                        {copiedCode === inv.invoiceNumber ? (
                          <FiCheck className="text-emerald-400" size={12} />
                        ) : (
                          <FiCopy className="text-slate-500 group-hover/btn:text-yellow-400" size={12} />
                        )}
                      </button>
                    </td>

                    {/* Client & Application */}
                    <td className="p-5">
                      <div className="space-y-1">
                        <p className="font-bold text-white text-sm group-hover:text-yellow-400 transition-colors">
                          {clientName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          {trackingId ? (
                            <Link
                              href={`/portal/admin/applications/${inv.applicationId}`}
                              className="font-mono text-yellow-400/80 hover:underline flex items-center gap-1"
                            >
                              <span>{trackingId}</span>
                              <FiArrowUpRight size={11} />
                            </Link>
                          ) : (
                            <span>{inv.application?.visaCategory || "Direct Bill"}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-5">
                      <div className="flex items-baseline gap-0.5 font-black text-white text-base">
                        <span className="text-xs text-yellow-400 font-bold">$</span>
                        <span>{inv.totalAmount?.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Timeline */}
                    <td className="p-5">
                      <div className="text-xs space-y-1">
                        <p className="text-slate-400 flex items-center gap-1">
                          <FiCalendar size={12} className="text-slate-500" />
                          <span>Issued: {new Date(inv.createdAt).toLocaleDateString()}</span>
                        </p>
                        {inv.dueDate && (
                          <p className="text-[10px] text-slate-500">
                            Due: {new Date(inv.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Receipt Verification */}
                    <td className="p-5">
                      {manualPayment?.receiptUrl ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewReceiptUrl(manualPayment.receiptUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-yellow-400 text-yellow-400 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <FiEye size={13} /> View Slip
                          </button>
                          {isPendingSlip && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleVerify(manualPayment.id, "VERIFIED")}
                                disabled={verifyingId !== null}
                                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/20 rounded-lg transition-all cursor-pointer"
                                title="Approve Payment"
                              >
                                <FiCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleVerify(manualPayment.id, "REJECTED")}
                                disabled={verifyingId !== null}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 rounded-lg transition-all cursor-pointer"
                                title="Reject Payment"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs italic">No slip attached</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                          inv.status === "PAID"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : inv.status === "PARTIALLY_PAID"
                            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                            : inv.status === "VOID"
                            ? "bg-slate-800 border-slate-700 text-slate-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Modify Button */}
                        <button
                          onClick={() => handleOpenEdit(inv)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 text-xs font-bold rounded-xl text-blue-400 transition-all cursor-pointer shadow-sm"
                          title="Edit Invoice Details"
                        >
                          <FiEdit3 size={13} />
                          <span>Modify</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingInvoice(inv)}
                          className="p-2 bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer shadow-sm"
                          title="Delete Invoice"
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

      {/* MODIFY INVOICE MODAL */}
      <AnimatePresence>
        {editingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0f172a] border border-slate-700 w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <FiEdit3 size={11} /> Modify Invoice
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Edit {editingInvoice.invoiceNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Client: {editingInvoice.application?.client?.user?.name || "Client"}
                  </p>
                </div>
                <button
                  onClick={() => setEditingInvoice(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Total Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Total Amount ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-yellow-400 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editForm.totalAmount}
                      onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white focus:border-yellow-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Invoice Payment Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                  >
                    <option value="UNPAID">UNPAID (Pending Payment)</option>
                    <option value="PAID">PAID (Settled & Cleared)</option>
                    <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                    <option value="VOID">VOID (Cancelled / Refunded)</option>
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Settlement Due Date
                  </label>
                  <CustomDatePicker
                    value={editForm.dueDate}
                    onChange={(val) => setEditForm({ ...editForm, dueDate: val })}
                    placeholder="Select Due Date"
                    minYear={new Date().getFullYear() - 1}
                    maxYear={new Date().getFullYear() + 5}
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingInvoice(null)}
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
                    {editSaving ? "Saving Updates..." : "Save Invoice Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE INVOICE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0f172a] border border-slate-700 w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <FiPlus size={11} /> Issue Billing
                  </div>
                  <h3 className="text-xl font-black text-white">Generate Custom Invoice</h3>
                  <p className="text-xs text-slate-400">Bill applicant or agent for consultancy or visa processing</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-4">
                {/* Invoice Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Invoice Code (Leave blank to auto-generate)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-009"
                    value={createForm.invoiceNumber}
                    onChange={(e) => setCreateForm({ ...createForm, invoiceNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none font-mono"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Billing Amount ($ USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-yellow-400 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="500.00"
                      value={createForm.totalAmount}
                      onChange={(e) => setCreateForm({ ...createForm, totalAmount: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white focus:border-yellow-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Payment Due Date
                  </label>
                  <CustomDatePicker
                    value={createForm.dueDate}
                    onChange={(val) => setCreateForm({ ...createForm, dueDate: val })}
                    placeholder="Select Due Date"
                    minYear={new Date().getFullYear()}
                    maxYear={new Date().getFullYear() + 5}
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Initial Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:border-yellow-400/60 focus:outline-none"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-2xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-black rounded-2xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50 shadow-lg shadow-yellow-400/20"
                  >
                    {createSaving ? <FiLoader className="animate-spin" size={15} /> : <FiPlus size={15} />}
                    {createSaving ? "Generating..." : "Generate Invoice"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE INVOICE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingInvoice && (
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
                <h3 className="text-xl font-black text-white">Permanently Delete Invoice?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are about to delete invoice <strong className="text-white font-mono">{deletingInvoice.invoiceNumber}</strong> amounting to <strong className="text-white font-bold">${deletingInvoice.totalAmount}</strong>.
                </p>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-red-400 text-left">
                  ⚠️ This action will permanently remove this invoice and all associated transaction audit logs and uploaded receipts. This cannot be undone.
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingInvoice(null)}
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

      {/* RECEIPT PREVIEW MODAL */}
      <AnimatePresence>
        {previewReceiptUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0f172a] border border-slate-700 max-w-3xl w-full rounded-[2.5rem] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FiCreditCard className="text-yellow-400" />
                  Bank Deposit / Wire Transfer Receipt Proof
                </h4>
                <div className="flex items-center gap-2">
                  <a
                    href={previewReceiptUrl}
                    download
                    target="_blank"
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                    title="Download Receipt"
                  >
                    <FiDownload size={18} />
                  </a>
                  <button
                    onClick={() => setPreviewReceiptUrl(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {previewReceiptUrl.endsWith(".pdf") ? (
                  <iframe src={previewReceiptUrl} className="w-full h-[60vh] rounded-xl" />
                ) : (
                  <img
                    src={previewReceiptUrl}
                    alt="Receipt Scan"
                    className="max-h-[60vh] object-contain rounded-xl shadow-lg"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING BATCH ACTIONS TOOLBAR */}
      <AnimatePresence>
        {selectedInvoiceIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#0f172a]/95 backdrop-blur-xl border border-yellow-400/40 rounded-3xl p-4 md:px-7 shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-2xl w-[92%]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-black text-sm border border-yellow-400/30 shadow-inner">
                {selectedInvoiceIds.length}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-extrabold text-sm block leading-tight">
                    {selectedInvoiceIds.length} Invoice{selectedInvoiceIds.length > 1 ? "s" : ""} Selected
                  </span>
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                    ${selectedTotalAmount.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {isAllSelected ? "All filtered invoices selected" : `out of ${filteredInvoices.length} filtered results`}
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
                  Select All ({filteredInvoices.length})
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
                <span>Delete Selected ({selectedInvoiceIds.length})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BATCH DELETE MULTIPLE INVOICES CONFIRMATION MODAL */}
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
                  Permanently Delete {selectedInvoiceIds.length} Invoices?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are about to delete <strong className="text-white font-bold">{selectedInvoiceIds.length}</strong> selected invoices totaling <strong className="text-yellow-400 font-bold font-mono">${selectedTotalAmount.toLocaleString()}</strong> in a single batch operation.
                </p>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 text-left space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-300">
                    <FiAlertTriangle /> Irreversible Financial Action
                  </div>
                  <div>
                    This will permanently remove these invoices, all attached wire transfer / deposit receipts, and associated transaction logs. This cannot be undone.
                  </div>
                </div>
              </div>

              {/* Preview of selected invoices */}
              <div className="max-h-40 overflow-y-auto bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-xs divide-y divide-slate-800/60 font-mono">
                {invoices
                  .filter((inv) => selectedInvoiceIds.includes(inv.id))
                  .slice(0, 6)
                  .map((inv) => (
                    <div key={inv.id} className="py-1.5 flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">{inv.invoiceNumber}</span>
                        <span className="text-slate-400 truncate max-w-[140px]">
                          {inv.application?.client?.user?.name || "Direct Client"}
                        </span>
                      </div>
                      <span className="text-white font-bold">${inv.totalAmount}</span>
                    </div>
                  ))}
                {selectedInvoiceIds.length > 6 && (
                  <div className="py-1.5 text-center text-slate-500 italic text-[11px]">
                    ...and {selectedInvoiceIds.length - 6} more invoices
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
                  {batchDeleting ? "Deleting Invoices..." : `Confirm Delete (${selectedInvoiceIds.length})`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
