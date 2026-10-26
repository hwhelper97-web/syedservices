"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiDownload,
  FiMail,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCopy,
  FiCheck,
  FiPrinter,
  FiFileText,
  FiRefreshCw,
  FiX,
  FiExternalLink,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { formatCurrencyAmount } from "@/lib/currencies";

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Email Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [paymentTxnId, setPaymentTxnId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setInvoice(data.invoice);
        setEmailRecipient(data.invoice.customerEmail || data.invoice.application?.client?.user?.email || "");
        setEmailSubject(`Invoice ${data.invoice.invoiceNumber} from Syed Services & Consultant`);
        setPaymentAmount(String(data.invoice.balanceAmount || 0));
      } else {
        showToast(data.error || "Failed to load invoice", "error");
      }
    } catch {
      showToast("Error loading invoice details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const handleCopyPublicLink = () => {
    if (!invoice?.accessToken) return;
    const url = `${window.location.origin}/invoices/view/${invoice.accessToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast("Public invoice link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSendEmail = async () => {
    if (!emailRecipient) {
      showToast("Please enter an email address", "error");
      return;
    }
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/invoices/${id}/email`, {
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
        showToast(`Invoice email sent to ${emailRecipient}!`);
        setShowEmailModal(false);
        fetchInvoice();
      } else {
        showToast(data.error || "Failed to send email", "error");
      }
    } catch {
      showToast("Error sending email", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleRecordPayment = async () => {
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    setRecordingPayment(true);
    try {
      const res = await fetch(`/api/invoices/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          paymentMethod,
          transactionId: paymentTxnId,
          notes: paymentNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Payment recorded successfully!");
        setShowPaymentModal(false);
        fetchInvoice();
      } else {
        showToast(data.error || "Failed to record payment", "error");
      }
    } catch {
      showToast("Error recording payment", "error");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleVoidInvoice = async () => {
    if (!confirm("Are you sure you want to void this invoice? This will set status to VOID.")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VOID" }),
      });
      if (res.ok) {
        showToast("Invoice marked as VOID");
        fetchInvoice();
      }
    } catch {
      showToast("Failed to void invoice", "error");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <FiRefreshCw className="inline-block animate-spin mr-2" size={24} />
        <p className="mt-2 text-sm">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-24 text-center text-slate-400">
        <FiAlertCircle className="mx-auto mb-3 text-rose-500" size={36} />
        <h2 className="text-lg font-bold text-white">Invoice Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested invoice ID does not exist.</p>
        <Link href="/portal/admin/invoices" className="inline-block mt-4 text-xs font-semibold text-amber-400 hover:underline">
          &larr; Return to Invoices
        </Link>
      </div>
    );
  }

  const clientName =
    invoice.clientName ||
    invoice.customerName ||
    invoice.application?.client?.user?.name ||
    "Direct Client";
  const clientEmail =
    invoice.customerEmail ||
    invoice.application?.client?.user?.email ||
    "";
  const currency = invoice.currency || "PKR";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
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

      {/* Top Header / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/portal/admin/invoices"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{invoice.invoiceNumber}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {invoice.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Created on {new Date(invoice.createdAt).toLocaleDateString()} • Billed to {clientName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download PDF */}
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-colors"
          >
            <FiDownload size={14} className="text-amber-400" />
            <span>Download PDF</span>
          </a>

          {/* Send Email */}
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-blue-400 font-semibold text-xs transition-colors"
          >
            <FiMail size={14} />
            <span>Send Email</span>
          </button>

          {/* Record Payment */}
          {invoice.status !== "PAID" && invoice.status !== "VOID" && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <FiDollarSign size={14} />
              <span>Record Payment</span>
            </button>
          )}

          {/* Public Link */}
          {invoice.accessToken && (
            <button
              onClick={handleCopyPublicLink}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Copy Public Link"
            >
              {copiedLink ? <FiCheck size={16} className="text-emerald-400" /> : <FiCopy size={16} />}
            </button>
          )}

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Print Invoice"
          >
            <FiPrinter size={16} />
          </button>

          {/* Void */}
          {invoice.status !== "VOID" && (
            <button
              onClick={handleVoidInvoice}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors"
            >
              Void
            </button>
          )}
        </div>
      </div>

      {/* Main Branded Invoice Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Header Bar */}
        <div className="bg-[#020617] p-8 border-b-2 border-amber-400 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white p-1 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-400/20 overflow-hidden shrink-0">
              <Image src="/images/logo.png" alt="Syed Services Logo" width={52} height={52} className="w-full h-full object-contain" priority />
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-wider">SYED SERVICES</div>
              <div className="text-xs text-amber-400 font-semibold tracking-wider">&amp; CONSULTANT • TRAVEL &amp; VISA SERVICES</div>
              <div className="text-[11px] text-slate-400 mt-1">Peshawar, Pakistan | Jalalabad, Afghanistan</div>
            </div>
          </div>

          <div className="text-left md:text-right">
            <div className="text-2xl font-black text-amber-400 tracking-tight">INVOICE</div>
            <div className="text-sm font-mono font-bold text-white">{invoice.invoiceNumber}</div>
            <div className="text-xs text-slate-400 mt-1">
              Currency: <strong className="text-white">{currency}</strong>
            </div>
          </div>
        </div>

        {/* Billed To & Dates */}
        <div className="p-8 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/30">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Billed To</div>
            <div className="text-lg font-bold text-white">{clientName}</div>
            {invoice.companyName && (
              <div className="text-sm text-slate-300 font-medium">{invoice.companyName}</div>
            )}
            {clientEmail && (
              <div className="text-xs text-slate-400 mt-1">Email: {clientEmail}</div>
            )}
            {invoice.customerPhone && (
              <div className="text-xs text-slate-400">Phone: {invoice.customerPhone}</div>
            )}
            {invoice.customerAddress && (
              <div className="text-xs text-slate-400 mt-1">
                {[invoice.customerAddress, invoice.customerCity, invoice.customerCountry].filter(Boolean).join(", ")}
              </div>
            )}
            {invoice.taxNumber && (
              <div className="text-xs text-slate-400 mt-1">Tax ID: {invoice.taxNumber}</div>
            )}
          </div>

          <div className="md:text-right space-y-1.5 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">Issue Date:</span>{" "}
              {new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div>
              <span className="font-semibold text-slate-300">Due Date:</span>{" "}
              {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {invoice.application && (
              <div className="pt-1">
                <span className="font-semibold text-slate-300">Linked Visa Application:</span>{" "}
                <Link
                  href={`/portal/admin/applications/${invoice.application.id}`}
                  className="text-amber-400 hover:underline"
                >
                  #{invoice.application.trackingId || invoice.application.id} ({invoice.application.country})
                </Link>
              </div>
            )}
            {invoice.accessToken && (
              <div className="pt-2">
                <a
                  href={`/invoices/view/${invoice.accessToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <span>Open Public Client View</span>
                  <FiExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Services Table */}
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="pb-3">#</th>
                  <th className="pb-3">Service &amp; Description</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Discount</th>
                  <th className="pb-3 text-right">Tax</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(invoice.items || []).map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 text-slate-500 text-xs">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white">{item.serviceName || item.description}</div>
                      {item.serviceName && item.description && item.description !== item.serviceName && (
                        <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 text-center text-xs">
                      {item.quantity} {item.unit || "unit"}
                    </td>
                    <td className="py-3 text-right font-mono text-xs">
                      {formatCurrencyAmount(item.unitPrice, currency, { showSymbol: false })}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-slate-400">
                      {item.discount > 0 ? `-${formatCurrencyAmount(item.discount, currency, { showSymbol: false })}` : "-"}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-slate-400">
                      {item.tax > 0 ? `+${formatCurrencyAmount(item.tax, currency, { showSymbol: false })}` : "-"}
                    </td>
                    <td className="py-3 text-right font-bold text-white font-mono">
                      {formatCurrencyAmount(item.amount, currency, { showSymbol: false })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Terms */}
          <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Payment Instructions &amp; Bank Details
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {invoice.termsConditions || "Bank transfer details available upon request."}
                </div>
              </div>

              {invoice.notes && (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-400">Client Note: </span>
                  <span className="text-slate-300">{invoice.notes}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-5 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">
                  {formatCurrencyAmount(invoice.subtotalAmount, currency, { showCode: true })}
                </span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between py-1 text-emerald-400">
                  <span>Discounts</span>
                  <span className="font-mono">
                    -{formatCurrencyAmount(invoice.discountAmount, currency, { showCode: true })}
                  </span>
                </div>
              )}

              {invoice.taxAmount > 0 && (
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Taxes ({invoice.taxRate}%)</span>
                  <span className="font-mono text-slate-300">
                    +{formatCurrencyAmount(invoice.taxAmount, currency, { showCode: true })}
                  </span>
                </div>
              )}

              {invoice.shippingFee > 0 && (
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Additional Charges</span>
                  <span className="font-mono text-slate-300">
                    +{formatCurrencyAmount(invoice.shippingFee, currency, { showCode: true })}
                  </span>
                </div>
              )}

              <div className="flex justify-between p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-white font-bold text-base my-2">
                <span className="text-amber-400">Grand Total</span>
                <span className="font-mono text-amber-400">
                  {formatCurrencyAmount(invoice.totalAmount, currency, { showCode: true })}
                </span>
              </div>

              <div className="flex justify-between py-1 text-slate-400">
                <span>Total Amount Paid</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {formatCurrencyAmount(invoice.paidAmount, currency, { showCode: true })}
                </span>
              </div>

              <div className="flex justify-between py-2 border-t border-slate-800 text-sm font-bold">
                <span className="text-slate-200">Balance Due</span>
                <span className={`font-mono ${invoice.balanceAmount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {formatCurrencyAmount(invoice.balanceAmount, currency, { showCode: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#020617] border-t border-slate-800 text-center text-xs text-slate-500">
          Syed Services &amp; Consultant • Pakistan &amp; Afghanistan • info@syedservices.com.pk • WhatsApp: +92 309 9797771
        </div>
      </div>

      {/* Payment History & Email Logs Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment History */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FiDollarSign className="text-emerald-400" />
              Recorded Payments ({invoice.payments?.length || 0})
            </h3>
            {invoice.status !== "PAID" && invoice.status !== "VOID" && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                + Add Payment
              </button>
            )}
          </div>

          {(!invoice.payments || invoice.payments.length === 0) ? (
            <p className="text-xs text-slate-500 py-4 text-center">No payments recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {invoice.payments.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">
                      {formatCurrencyAmount(p.amount, currency, { showCode: true })}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {p.paymentMethod.replace("_", " ")} {p.transactionId ? `• Ref: ${p.transactionId}` : ""}
                    </div>
                    {p.notes && <div className="text-[10px] text-slate-500 mt-0.5">{p.notes}</div>}
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {p.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Logs */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FiMail className="text-blue-400" />
              Email Dispatch History ({invoice.emailLogs?.length || 0})
            </h3>
            <button
              onClick={() => setShowEmailModal(true)}
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              + Send Email
            </button>
          </div>

          {(!invoice.emailLogs || invoice.emailLogs.length === 0) ? (
            <p className="text-xs text-slate-500 py-4 text-center">No email history recorded.</p>
          ) : (
            <div className="space-y-3">
              {invoice.emailLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{log.recipientEmail}</div>
                    <div className="text-[11px] text-slate-400">{log.subject}</div>
                    {log.errorMessage && (
                      <div className="text-[10px] text-rose-400 mt-0.5">{log.errorMessage}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === "SENT"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {log.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(log.sentAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
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
                  onClick={() => setShowEmailModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <FiX size={20} />
                </button>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom Note (Optional)</label>
                  <textarea
                    rows={3}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="e.g. Please find your invoice attached."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
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

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
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
                  <span>Record Payment</span>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                <span className="text-slate-400">Remaining Balance:</span>
                <strong className="text-amber-400 font-mono text-sm">
                  {formatCurrencyAmount(invoice.balanceAmount, currency, { showCode: true })}
                </strong>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Amount ({currency}) *
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
                    <option value="BANK_TRANSFER">Bank Transfer (HBL / Meezan)</option>
                    <option value="CASH">Cash Payment</option>
                    <option value="ONLINE">Online Portal</option>
                    <option value="CREDIT_CARD">Credit / Debit Card</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Transaction ID / Reference (Optional)</label>
                  <input
                    type="text"
                    value={paymentTxnId}
                    onChange={(e) => setPaymentTxnId(e.target.value)}
                    placeholder="e.g. TXN-12345 or Deposit Slip #"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Notes about payment collection"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
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
