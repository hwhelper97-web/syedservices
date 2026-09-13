"use client";

import { useState, useEffect } from "react";
import { 
  FiDollarSign, FiFileText, FiUploadCloud, FiCheckCircle, 
  FiClock, FiAlertCircle, FiLoader, FiArrowRight, FiCopy, 
  FiCheck, FiMapPin, FiShield, FiCreditCard, FiSmartphone, 
  FiHome, FiHelpCircle, FiCalendar, FiUser
} from "react-icons/fi";
import PortalToast, { ToastMessage } from "@/components/PortalToast";

export default function ClientBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [paying, setPaying] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Active payment method tab: "bank" | "cash" | "online"
  const [paymentTab, setPaymentTab] = useState<"bank" | "cash" | "online">("bank");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showToast(`Copied to clipboard: ${text}`, "info");
    setTimeout(() => {
      setCopiedField(null);
    }, 2500);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices || []);
        // Auto-select first unpaid invoice if available
        const firstUnpaid = data.invoices?.find((inv: any) => inv.status === "UNPAID");
        if (firstUnpaid && !selectedInvoice) {
          setSelectedInvoice(firstUnpaid);
        }
      }
    } catch (e) {
      console.error("Failed to load invoices", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePay = async (invoice: any) => {
    setPaying(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("invoiceId", invoice.id.toString());
      formData.append("amount", invoice.totalAmount.toString());
      formData.append("paymentMethod", "ONLINE");
      formData.append("transactionId", `TXN-${Math.floor(Math.random() * 10000000)}`);

      const res = await fetch("/api/payments", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process simulated online payment");
      }

      showToast("Online payment completed successfully!", "success");
      setSuccess(true);
      fetchInvoices();
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setPaying(false);
    }
  };

  const handleBankUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) {
      showToast("Please select an unpaid invoice to settle.", "error");
      return;
    }

    if (!transactionId.trim()) {
      showToast("Please provide the transaction ID / reference number.", "error");
      return;
    }

    setUploadingReceipt(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("invoiceId", selectedInvoice.id.toString());
      formData.append("amount", selectedInvoice.totalAmount.toString());
      formData.append("paymentMethod", "BANK_TRANSFER");
      formData.append("transactionId", transactionId.trim());
      if (receiptFile) {
        formData.append("file", receiptFile);
      }

      const res = await fetch("/api/payments", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit bank receipt");
      }

      showToast("Payment receipt submitted! Our accounts team will verify shortly.", "success");
      setSuccess(true);
      setReceiptFile(null);
      setTransactionId("");
      fetchInvoices();
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Aggregated billing totals
  const totalOwed = invoices
    .filter((inv) => inv.status === "UNPAID")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Portal Toast Notification */}
      <PortalToast toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-mono font-bold">
                FINANCIAL PORTAL
              </span>
              <span className="text-xs text-slate-500 font-bold">
                Secure Syed Services Billing
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Invoices & Payment Options
            </h2>
            <p className="text-slate-400 text-xs max-w-xl">
              Pay securely via Mobile Wallet (EasyPaisa), Direct Bank Transfer (HBL), or Cash in Person at any of our official branches.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-950/80 border border-slate-800 px-5 py-3.5 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Invoices</p>
              <p className="text-xl font-black text-white font-mono mt-0.5">{invoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-red-500/30 transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all" />
          <div className="space-y-1 z-10">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Outstanding</p>
            <h3 className="text-3xl font-black text-red-400 font-mono">${totalOwed.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-400">
              {invoices.filter(i => i.status === "UNPAID").length} invoice(s) pending payment
            </p>
          </div>
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/20">
            <FiDollarSign size={26} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="space-y-1 z-10">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Paid & Cleared</p>
            <h3 className="text-3xl font-black text-emerald-400 font-mono">${totalPaid.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-400">
              {invoices.filter(i => i.status === "PAID").length} invoice(s) verified & completed
            </p>
          </div>
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
            <FiCheckCircle size={26} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl sm:col-span-2 lg:col-span-1 relative overflow-hidden group hover:border-yellow-400/30 transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl group-hover:bg-yellow-400/10 transition-all" />
          <div className="space-y-1 z-10">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Payment Security</p>
            <h3 className="text-lg font-black text-yellow-400 flex items-center gap-1.5">
              <FiShield /> Official Receipts
            </h3>
            <p className="text-[11px] text-slate-400">
              All transactions verified with legal stamps & receipts
            </p>
          </div>
          <div className="w-14 h-14 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-400/20">
            <FiShield size={26} />
          </div>
        </div>
      </div>

      {/* Main Grid: Invoices vs Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Invoices List */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <FiFileText className="text-yellow-400" /> Visa Invoices
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              Select an invoice to pay
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48 text-yellow-400 bg-[#0f172a] border border-slate-800 rounded-[2.5rem]">
              <FiLoader className="animate-spin" size={28} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed p-12 rounded-[2.5rem] text-center flex flex-col items-center justify-center gap-3">
              <FiFileText className="text-slate-500 text-4xl" />
              <h4 className="text-white font-bold text-sm">No Invoices Found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Invoices are auto-generated when you submit a visa processing application.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                const isUnpaid = inv.status === "UNPAID";

                return (
                  <div 
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`bg-[#0f172a] border p-6 rounded-[2.5rem] shadow-xl space-y-4 transition-all cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? "border-yellow-400/80 shadow-yellow-400/5 ring-1 ring-yellow-400/30" 
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                        Selected for Payment
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                            {inv.invoiceNumber}
                          </span>
                          {inv.application?.package && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[9px] font-black uppercase">
                              Package Deal
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-white text-base">
                          {inv.application?.package 
                            ? inv.application.package.title 
                            : `${inv.application?.country || ""} ${inv.application?.visaCategory || "Visa Processing"}`}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {inv.application?.country} · {inv.application?.visaCategory} · {inv.application?.entryType || "Single Entry"}
                        </p>
                      </div>

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        inv.status === "PAID" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : inv.status === "UNPAID" 
                          ? "bg-red-500/10 text-red-400 border-red-500/20" 
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>
                        {inv.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">
                          Amount Due
                        </span>
                        <p className="text-xl font-black text-white font-mono mt-0.5">${inv.totalAmount} USD</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">
                          Due Date
                        </span>
                        <span className="text-slate-300 font-semibold font-mono">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "7 Days"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Payment Methods Hub */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Header / Active Selection Banner */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white tracking-tight">Payment Methods</h3>
                {selectedInvoice && (
                  <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">
                    Selected: {selectedInvoice.invoiceNumber} (${selectedInvoice.totalAmount})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Choose your preferred payment method below to settle your invoice.
              </p>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-855">
              <button
                type="button"
                onClick={() => setPaymentTab("bank")}
                className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  paymentTab === "bank"
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <FiSmartphone size={15} />
                <span>Bank & Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentTab("cash")}
                className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  paymentTab === "cash"
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <FiHome size={15} />
                <span>Pay in Person</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentTab("online")}
                className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  paymentTab === "online"
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <FiCreditCard size={15} />
                <span>Instant Card</span>
              </button>
            </div>

            {/* TAB 1: BANK & EASYPAISA DETAILS */}
            {paymentTab === "bank" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-4">
                  
                  {/* EasyPaisa Wallet Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/30 relative overflow-hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
                          EP
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">EasyPaisa Mobile Wallet</h4>
                          <p className="text-[10px] text-emerald-400 font-bold uppercase">Direct & Instant Mobile Account</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        FASTEST
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                          Mobile / Account Number
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono font-black text-emerald-400 text-sm tracking-wider">
                            03109797771
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("03109797771", "easypaisa_num")}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy number"
                          >
                            {copiedField === "easypaisa_num" ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                          Account Title / Beneficiary
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-white text-xs">
                            Syed Saif Ur Rehman
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("Syed Saif Ur Rehman", "easypaisa_title")}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy Title"
                          >
                            {copiedField === "easypaisa_title" ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HBL Bank Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-950 to-slate-900 border border-cyan-500/30 relative overflow-hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black text-xs">
                          HBL
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">Habib Bank Limited (HBL)</h4>
                          <p className="text-[10px] text-cyan-400 font-bold uppercase">Official Corporate Bank Transfer</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                        INTERBANK / RAAST / IBAN
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 sm:col-span-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                          Bank IBAN (International / Local)
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono font-black text-cyan-400 text-sm tracking-wider break-all">
                            PK33HABB0006967901747803
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("PK33HABB0006967901747803", "hbl_iban")}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                            title="Copy IBAN"
                          >
                            {copiedField === "hbl_iban" ? <FiCheck className="text-cyan-400" /> : <FiCopy />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                          Account Title
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-white text-xs">
                            Syed Saif
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("Syed Saif", "hbl_title")}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy Title"
                          >
                            {copiedField === "hbl_title" ? <FiCheck className="text-cyan-400" /> : <FiCopy />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                          Bank Name
                        </span>
                        <p className="font-bold text-slate-200 text-xs mt-1">
                          HBL (Habib Bank Limited)
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Upload Proof of Payment Form */}
                <form onSubmit={handleBankUpload} className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FiUploadCloud className="text-yellow-400" /> Submit Proof of Transfer
                    </h4>
                    {selectedInvoice && (
                      <span className="text-[10px] text-slate-400">
                        For: <strong className="text-white">{selectedInvoice.invoiceNumber}</strong>
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                      Transaction ID / Reference Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required
                      placeholder="e.g. EasyPaisa TID: 198273412 or HBL Ref No."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-yellow-400 outline-none placeholder-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                      Upload Payment Receipt / Screenshot <span className="text-slate-500">(Optional)</span>
                    </label>
                    <label className="w-full py-5 border border-dashed border-slate-800 hover:border-yellow-400/40 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-slate-900/50">
                      <FiUploadCloud className="text-yellow-400" size={22} />
                      <span className="text-xs font-semibold text-slate-300">
                        {receiptFile ? receiptFile.name : "Choose Receipt Screenshot or PDF"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        PNG, JPG, PDF up to 10MB
                      </span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && setReceiptFile(e.target.files[0])}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingReceipt || !selectedInvoice || selectedInvoice.status === "PAID"}
                    className="w-full py-3.5 bg-yellow-400 text-black font-black text-xs rounded-xl hover:bg-yellow-300 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-yellow-400/10"
                  >
                    {uploadingReceipt ? (
                      <span className="flex items-center justify-center gap-2">
                        <FiLoader className="animate-spin" /> Uploading Receipt...
                      </span>
                    ) : selectedInvoice?.status === "PAID" ? (
                      "Selected Invoice is Already Paid"
                    ) : (
                      `Submit Bank Receipt for Invoice ${selectedInvoice?.invoiceNumber || ""}`
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: PAY IN PERSON (CASH) */}
            {paymentTab === "cash" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-900 border border-yellow-400/30 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 flex items-center justify-center">
                      <FiHome size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Cash Desk & Walk-In Payment</h4>
                      <p className="text-[10px] text-yellow-400 font-bold uppercase">Official Branch Accounts Counters</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    You can visit any of our physical office locations to pay in cash (USD, PKR, or AFN). Our accounts officers will verify your tracking ID and issue an immediate physical stamped receipt.
                  </p>
                </div>

                {/* Branches List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    Official Branch Locations
                  </span>

                  {/* Branch 1: Peshawar */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                        <FiMapPin className="text-yellow-400" /> Peshawar Head Office
                      </h5>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        OPEN 9 AM - 6 PM
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      University Road / Saddar Commercial Area, Peshawar, KP, Pakistan.
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Accounts Desk: +92 310 9797771 · Mon - Sat (9:00 AM - 6:00 PM)
                    </p>
                  </div>

                  {/* Branch 2: Kabul */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                        <FiMapPin className="text-yellow-400" /> Kabul Branch Office
                      </h5>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        OPEN 8:30 AM - 5 PM
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Shahr-e Naw, Commercial District, Kabul, Afghanistan.
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Accounts Desk: Saturday - Thursday (8:30 AM - 5:00 PM)
                    </p>
                  </div>

                  {/* Branch 3: Islamabad */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                        <FiMapPin className="text-yellow-400" /> Islamabad Liaison Office
                      </h5>
                      <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        BY APPOINTMENT
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Blue Area, Jinnah Avenue, Islamabad, Pakistan.
                    </p>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-1">
                    <FiHelpCircle /> In-Person Payment Instructions
                  </span>
                  <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
                    <li>Bring your <strong>Tracking ID ({selectedInvoice?.application?.trackingId || "APP-XXXX"})</strong> or <strong>Invoice ({selectedInvoice?.invoiceNumber || "INV-XXXX"})</strong>.</li>
                    <li>Present it to the cash counter and pay the invoice fee (${selectedInvoice?.totalAmount || 0} USD or equivalent).</li>
                    <li>Collect the official stamped receipt. The accounts desk will mark your invoice <strong>PAID</strong> in the system instantly.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB 3: INSTANT ONLINE PAYMENT */}
            {paymentTab === "online" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-900 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                        <FiCreditCard size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">Instant Online Card Checkout</h4>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase">Visa, MasterCard, UnionPay</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                      AUTOMATED
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    Complete your payment instantly using any international credit/debit card. Your invoice will be marked as cleared immediately.
                  </p>
                </div>

                {selectedInvoice ? (
                  <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                      <span className="text-slate-400">Invoice Reference</span>
                      <span className="font-mono font-bold text-white">{selectedInvoice.invoiceNumber}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                      <span className="text-slate-400">Total Payable Amount</span>
                      <span className="font-mono font-black text-emerald-400 text-base">${selectedInvoice.totalAmount} USD</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOnlinePay(selectedInvoice)}
                      disabled={paying || selectedInvoice.status === "PAID"}
                      className="w-full py-4 bg-yellow-400 text-black font-black text-xs rounded-xl hover:bg-yellow-300 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-yellow-400/10 flex items-center justify-center gap-2"
                    >
                      {paying ? (
                        <>
                          <FiLoader className="animate-spin" /> Processing Online Gateway...
                        </>
                      ) : selectedInvoice.status === "PAID" ? (
                        "Invoice Already Cleared"
                      ) : (
                        <>
                          <FiCreditCard /> Pay ${selectedInvoice.totalAmount} USD Online Now
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-6">
                    Please select an unpaid invoice from the left column to proceed.
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

