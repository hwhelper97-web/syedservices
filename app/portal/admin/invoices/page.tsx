"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFileText,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiMail,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEdit,
  FiCopy,
  FiCheck,
  FiX,
  FiFilter,
  FiExternalLink,
  FiArrowRight,
  FiGlobe,
} from "react-icons/fi";
import { formatCurrencyAmount, SUPPORTED_CURRENCIES, getCurrencyInfo } from "@/lib/currencies";

const PRIMARY_CURRENCIES = [
  {
    code: "ALL",
    name: "All Accounts",
    flag: "🌐",
    symbol: "Multi",
    description: "Consolidated multi-currency view of all client invoices and global receivables.",
  },
  {
    code: "PKR",
    name: "Pakistani Rupee",
    flag: "🇵🇰",
    symbol: "Rs",
    description: "Dedicated account for Pakistan domestic services, visa processing, and ticketing in PKR (₨).",
  },
  {
    code: "AFN",
    name: "Afghan Afghani",
    flag: "🇦🇫",
    symbol: "؋",
    description: "Dedicated account for Afghanistan border transit, consulate services, and regional billing in AFN (؋).",
  },
  {
    code: "USD",
    name: "US Dollar",
    flag: "🇺🇸",
    symbol: "$",
    description: "Dedicated account for international visas, overseas packages, and global transactions in USD ($).",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    symbol: "CA$",
    description: "Dedicated account for Canadian immigration files, study visas, and North American billing in CAD (CA$).",
  },
];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Email Modal State
  const [emailModalInvoice, setEmailModalInvoice] = useState<any | null>(null);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Payment Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [paymentTransactionId, setPaymentTransactionId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast(message ? { message, type } : null);
    setTimeout(() => setToast(null), 4000);
  };

  // Sync currency from URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlCur = sp.get("currency");
      if (urlCur && urlCur !== currencyFilter) {
        setCurrencyFilter(urlCur.toUpperCase());
      }
    }
  }, []);

  const handleSelectCurrency = (code: string) => {
    setCurrencyFilter(code);
    setPage(1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (code === "ALL") {
        url.searchParams.delete("currency");
      } else {
        url.searchParams.set("currency", code);
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        search,
        status: statusFilter,
        currency: currencyFilter,
      });
      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices || []);
        setMetrics(data.metrics || null);
        setTotalPages(data.totalPages || 1);
      } else {
        showToast(data.error || "Failed to load invoices", "error");
      }
    } catch (e: any) {
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, currencyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInvoices();
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/invoices/view/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showToast("Public invoice link copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const openEmailModal = (invoice: any) => {
    setEmailModalInvoice(invoice);
    setEmailRecipient(invoice.customerEmail || invoice.application?.client?.user?.email || "");
    setEmailSubject(`Invoice ${invoice.invoiceNumber} from Syed Services & Consultant`);
    setEmailMessage("");
  };

  const handleSendEmail = async () => {
    if (!emailModalInvoice) return;
    if (!emailRecipient) {
      showToast("Please enter a recipient email address", "error");
      return;
    }
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/invoices/${emailModalInvoice.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: emailRecipient,
          customSubject: emailSubject,
          customMessage: emailMessage,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Invoice sent successfully to ${emailRecipient}!`);
        setEmailModalInvoice(null);
        fetchInvoices();
      } else {
        showToast(data.error || "Failed to send email", "error");
      }
    } catch (err: any) {
      showToast("Network error while sending email", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const openPaymentModal = (invoice: any) => {
    setPaymentModalInvoice(invoice);
    setPaymentAmount(String(invoice.balanceAmount || 0));
    setPaymentMethod("BANK_TRANSFER");
    setPaymentTransactionId("");
    setPaymentNotes("");
  };

  const handleRecordPayment = async () => {
    if (!paymentModalInvoice) return;
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }
    setRecordingPayment(true);
    try {
      const res = await fetch(`/api/invoices/${paymentModalInvoice.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod,
          transactionId: paymentTransactionId,
          notes: paymentNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Payment recorded successfully!");
        setPaymentModalInvoice(null);
        fetchInvoices();
      } else {
        showToast(data.error || "Failed to record payment", "error");
      }
    } catch (err: any) {
      showToast("Network error recording payment", "error");
    } finally {
      setRecordingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "ISSUED").toUpperCase();
    switch (s) {
      case "PAID":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><FiCheckCircle size={12} /> Paid</span>;
      case "PARTIALLY_PAID":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><FiClock size={12} /> Partial</span>;
      case "OVERDUE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><FiAlertCircle size={12} /> Overdue</span>;
      case "SENT":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><FiMail size={12} /> Sent</span>;
      case "DRAFT":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Draft</span>;
      case "VOID":
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600 line-through">Void</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Issued</span>;
    }
  };

  // Identify active currency info
  const activeCurrencyInfo = useMemo(() => {
    const found = PRIMARY_CURRENCIES.find((c) => c.code === currencyFilter);
    if (found) return found;
    const fromSupported = SUPPORTED_CURRENCIES.find((c) => c.code === currencyFilter);
    if (fromSupported) {
      return {
        code: fromSupported.code,
        name: fromSupported.name,
        flag: "🌍",
        symbol: fromSupported.symbol,
        description: `Dedicated account for ${fromSupported.name} invoices and transactions in ${fromSupported.code}.`,
      };
    }
    return PRIMARY_CURRENCIES[0];
  }, [currencyFilter]);

  // Determine active currency code for formatting
  const kpiCurrencyCode = currencyFilter !== "ALL" ? currencyFilter : "PKR";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl font-medium text-sm flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-emerald-500 text-slate-950 font-semibold"
                : "bg-rose-500 text-white font-semibold"
            }`}
          >
            {toast.type === "success" ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FiFileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Independent Invoices</h1>
              <p className="text-sm text-slate-400">
                Create, track, send, and manage dedicated multi-currency accounts &amp; billing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchInvoices()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Invoices"
          >
            <FiRefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          <Link
            href={`/portal/admin/invoices/new?currency=${currencyFilter !== "ALL" ? currencyFilter : "PKR"}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FiPlus size={18} />
            <span>
              Create {currencyFilter !== "ALL" ? `${currencyFilter} Invoice` : "Invoice"}
            </span>
          </Link>
        </div>
      </div>

      {/* ================= DEDICATED CURRENCY LOCATIONS NAVIGATION ================= */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Primary Currency Tabs: ALL, PKR, AFN, USD, CAD */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {PRIMARY_CURRENCIES.map((cur) => {
              const count =
                cur.code === "ALL"
                  ? metrics?.totalInvoices ?? invoices.length
                  : metrics?.currencyBreakdown?.[cur.code]?.count ?? 0;
              const isActive = currencyFilter === cur.code;

              return (
                <button
                  key={cur.code}
                  onClick={() => handleSelectCurrency(cur.code)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.02]"
                      : "bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="text-sm">{cur.flag}</span>
                  <span>{cur.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                      isActive
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-slate-800 text-amber-400 border border-amber-400/20"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* More World Currencies Dropdown */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider hidden sm:inline">
              Other Currencies:
            </span>
            <select
              value={PRIMARY_CURRENCIES.some((c) => c.code === currencyFilter) ? "" : currencyFilter}
              onChange={(e) => {
                if (e.target.value) handleSelectCurrency(e.target.value);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="">Select More...</option>
              {SUPPORTED_CURRENCIES.filter(
                (sc) => !PRIMARY_CURRENCIES.some((pc) => pc.code === sc.code)
              ).map((sc) => {
                const count = metrics?.currencyBreakdown?.[sc.code]?.count ?? 0;
                return (
                  <option key={sc.code} value={sc.code}>
                    {sc.code} ({sc.symbol}) {count > 0 ? `• ${count} inv` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* ================= ACTIVE CURRENCY LOCATION BANNER ================= */}
      {currencyFilter !== "ALL" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-3xl p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
              {activeCurrencyInfo.flag}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {activeCurrencyInfo.name} Location
                </h2>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                  {activeCurrencyInfo.code} ({activeCurrencyInfo.symbol})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {activeCurrencyInfo.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href={`/portal/admin/invoices/new?currency=${currencyFilter}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-400/20"
            >
              <FiPlus size={15} />
              <span>Create {currencyFilter} Invoice</span>
            </Link>

            <button
              onClick={() => handleSelectCurrency("ALL")}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              title="View all currencies"
            >
              View All
            </button>
          </div>
        </motion.div>
      )}

      {/* ================= MULTI-CURRENCY OVERVIEW CARDS (WHEN ALL IS ACTIVE) ================= */}
      {currencyFilter === "ALL" && metrics?.currencyBreakdown && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { code: "PKR", flag: "🇵🇰", name: "Pakistani Rupee" },
            { code: "USD", flag: "🇺🇸", name: "US Dollar" },
            { code: "AFN", flag: "🇦🇫", name: "Afghan Afghani" },
            { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar" },
          ].map((item) => {
            const data = metrics.currencyBreakdown[item.code] || {
              count: 0,
              totalInvoiced: 0,
              totalReceived: 0,
              totalOutstanding: 0,
            };

            return (
              <div
                key={item.code}
                onClick={() => handleSelectCurrency(item.code)}
                className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-amber-400/40 hover:bg-slate-900/80 transition-all cursor-pointer group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.flag}</span>
                    <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {item.code} Account
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                    {data.count} {data.count === 1 ? "inv" : "invs"}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-lg font-black text-white">
                    {formatCurrencyAmount(data.totalInvoiced, item.code, { showCode: true })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Outstanding:</span>
                    <span className={data.totalOutstanding > 0 ? "text-amber-400 font-semibold" : "text-emerald-400"}>
                      {formatCurrencyAmount(data.totalOutstanding, item.code, { showCode: true })}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Open {item.code} Location</span>
                  <FiArrowRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= KPI CARDS (MATCHING SELECTED CURRENCY) ================= */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Invoiced {currencyFilter !== "ALL" ? `(${currencyFilter})` : ""}
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><FiFileText size={18} /></div>
            </div>
            <div className="mt-3 text-2xl font-bold text-white">
              {formatCurrencyAmount(metrics.totalInvoiced, kpiCurrencyCode, { showSymbol: true })}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {metrics.totalInvoices} {currencyFilter !== "ALL" ? `${currencyFilter} Invoices` : "Total Invoices"}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Payments Collected {currencyFilter !== "ALL" ? `(${currencyFilter})` : ""}
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><FiCheckCircle size={18} /></div>
            </div>
            <div className="mt-3 text-2xl font-bold text-emerald-400">
              {formatCurrencyAmount(metrics.totalReceived, kpiCurrencyCode, { showSymbol: true })}
            </div>
            <div className="mt-1 text-xs text-slate-500">{metrics.paidCount} Fully Paid</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Outstanding Balance {currencyFilter !== "ALL" ? `(${currencyFilter})` : ""}
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><FiClock size={18} /></div>
            </div>
            <div className="mt-3 text-2xl font-bold text-amber-400">
              {formatCurrencyAmount(metrics.totalOutstanding, kpiCurrencyCode, { showSymbol: true })}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {metrics.pendingCount + metrics.partiallyPaidCount} Pending Invoices
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Overdue Balance {currencyFilter !== "ALL" ? `(${currencyFilter})` : ""}
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400"><FiAlertCircle size={18} /></div>
            </div>
            <div className="mt-3 text-2xl font-bold text-rose-400">
              {formatCurrencyAmount(metrics.totalOverdue, kpiCurrencyCode, { showSymbol: true })}
            </div>
            <div className="mt-1 text-xs text-slate-500">{metrics.overdueCount} Past Due</div>
          </div>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={
              currencyFilter !== "ALL"
                ? `Search ${currencyFilter} invoice #, client, email...`
                : "Search invoice #, client, email..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 w-full md:w-auto scrollbar-none">
          {["ALL", "ISSUED", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ================= INVOICE TABLE ================= */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer / Bill To</th>
                <th className="px-6 py-4">Issue / Due Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Balance Due</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <FiRefreshCw className="inline-block animate-spin mr-2" size={18} />
                    Loading {currencyFilter !== "ALL" ? `${currencyFilter} invoices...` : "invoices..."}
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto text-xl">
                        {currencyFilter !== "ALL" ? activeCurrencyInfo.flag : <FiFileText size={22} />}
                      </div>
                      <div className="text-white font-bold text-base">
                        No {currencyFilter !== "ALL" ? `${currencyFilter} ` : ""}Invoices Found
                      </div>
                      <p className="text-xs text-slate-400">
                        {currencyFilter !== "ALL"
                          ? `There are currently no invoices issued in ${activeCurrencyInfo.name} (${currencyFilter}). Click below to create your first ${currencyFilter} invoice.`
                          : "No invoices found matching your search and filter criteria."}
                      </p>
                      <div className="pt-2">
                        <Link
                          href={`/portal/admin/invoices/new?currency=${currencyFilter !== "ALL" ? currencyFilter : "PKR"}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-400/20"
                        >
                          <FiPlus size={15} />
                          <span>
                            Create First {currencyFilter !== "ALL" ? `${currencyFilter} Invoice` : "Invoice"}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const clientName =
                    inv.clientName ||
                    inv.customerName ||
                    inv.application?.client?.user?.name ||
                    "Direct Client";
                  const clientEmail =
                    inv.customerEmail ||
                    inv.application?.client?.user?.email ||
                    "";
                  const issueDateFormatted = new Date(inv.issueDate || inv.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const dueDateFormatted = new Date(inv.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-amber-400">
                        <Link href={`/portal/admin/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                        {inv.application && (
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            App #{inv.application.trackingId || inv.application.id}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{clientName}</div>
                        {inv.companyName && (
                          <div className="text-xs text-slate-400">{inv.companyName}</div>
                        )}
                        {clientEmail && (
                          <div className="text-xs text-slate-500">{clientEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-slate-300">{issueDateFormatted}</div>
                        <div className="text-slate-500 mt-0.5">Due: {dueDateFormatted}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        <span className="font-mono">
                          {formatCurrencyAmount(inv.totalAmount, inv.currency, { showCode: true })}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {inv.balanceAmount > 0 ? (
                          <span className="text-amber-400 font-mono">
                            {formatCurrencyAmount(inv.balanceAmount, inv.currency, { showCode: true })}
                          </span>
                        ) : (
                          <span className="text-emerald-400">Paid in Full</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <Link
                            href={`/portal/admin/invoices/${inv.id}`}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View / Edit Invoice"
                          >
                            <FiEye size={15} />
                          </Link>

                          {/* Download PDF */}
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                            title="Download PDF"
                          >
                            <FiDownload size={15} />
                          </a>

                          {/* Email Invoice */}
                          <button
                            onClick={() => openEmailModal(inv)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Send Invoice by Email"
                          >
                            <FiMail size={15} />
                          </button>

                          {/* Record Payment */}
                          {inv.status !== "PAID" && inv.status !== "VOID" && (
                            <button
                              onClick={() => openPaymentModal(inv)}
                              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                              title="Record Payment"
                            >
                              <FiDollarSign size={15} />
                            </button>
                          )}

                          {/* Copy Link */}
                          {inv.accessToken && (
                            <button
                              onClick={() => handleCopyLink(inv.accessToken)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="Copy Public Link"
                            >
                              {copiedToken === inv.accessToken ? <FiCheck size={15} className="text-emerald-400" /> : <FiCopy size={15} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send Email Modal */}
      <AnimatePresence>
        {emailModalInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <FiMail className="text-amber-400" />
                  <span>Send Electronic Invoice</span>
                </div>
                <button
                  onClick={() => setEmailModalInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Invoice <strong>{emailModalInvoice.invoiceNumber}</strong> with branded PDF attached will be emailed directly to the client.
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recipient Email *</label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom Message (Optional)</label>
                  <textarea
                    rows={3}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="e.g. Please find your visa invoice attached. Contact us for any adjustments."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEmailModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingEmail}
                  onClick={handleSendEmail}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={16} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FiMail size={16} />
                      <span>Send Invoice Now</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {paymentModalInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <FiDollarSign className="text-emerald-400" />
                  <span>Record Invoice Payment</span>
                </div>
                <button
                  onClick={() => setPaymentModalInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-400">Invoice:</span>{" "}
                  <strong className="text-white">{paymentModalInvoice.invoiceNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Balance Due:</span>{" "}
                  <strong className="text-amber-400">
                    {formatCurrencyAmount(paymentModalInvoice.balanceAmount, paymentModalInvoice.currency, { showCode: true })}
                  </strong>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Payment Amount ({paymentModalInvoice.currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (HBL / Meezan / Wire)</option>
                    <option value="CASH">Cash Payment</option>
                    <option value="ONLINE">Online Portal / Gateway</option>
                    <option value="CREDIT_CARD">Credit / Debit Card</option>
                    <option value="CHEQUE">Cheque / Pay Order</option>
                    <option value="OTHER">Other Manual Method</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Transaction ID / Reference (Optional)</label>
                  <input
                    type="text"
                    value={paymentTransactionId}
                    onChange={(e) => setPaymentTransactionId(e.target.value)}
                    placeholder="e.g. TXN-9988221 or Deposit Slip #"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Deposited in Peshawar branch by client"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={recordingPayment}
                  onClick={handleRecordPayment}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {recordingPayment ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={16} />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck size={16} />
                      <span>Confirm Payment</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
