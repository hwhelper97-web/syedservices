"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiDownload,
  FiPrinter,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFileText,
  FiCreditCard,
  FiShield,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { formatCurrencyAmount } from "@/lib/currencies";

export default function PublicInvoiceViewPage() {
  const params = useParams();
  const token = params?.token as string;

  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/invoices/public/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.invoice) {
          setInvoice(data.invoice);
        } else {
          setError(data.error || "This invoice link is invalid or has expired.");
        }
      })
      .catch(() => {
        setError("Unable to connect to the server. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
        <FiRefreshCw className="animate-spin text-amber-400 mb-4" size={36} />
        <p className="text-sm text-slate-400">Loading electronic invoice...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <FiAlertCircle size={40} className="mx-auto" />
        </div>
        <h1 className="text-xl font-bold">Invoice Not Found</h1>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          {error || "We could not find the requested invoice. Please contact Syed Services for assistance."}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://wa.me/923099797771"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            <FaWhatsapp size={16} /> Contact on WhatsApp
          </a>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Go to Syed Services Home
          </Link>
        </div>
      </div>
    );
  }

  const currency = invoice.currency || "PKR";
  const clientName = invoice.clientName || invoice.customerName || "Valued Client";
  const whatsappUrl = `https://wa.me/923099797771?text=${encodeURIComponent(
    `Hello Syed Services, I am inquiring regarding Invoice #${invoice.invoiceNumber} for ${clientName}.`
  )}`;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Floating Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <FiShield size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400">Verified Electronic Invoice</div>
              <div className="text-sm font-bold text-white font-mono">{invoice.invoiceNumber}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF */}
            <a
              href={`/api/invoices/public/${token}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <FiDownload size={15} />
              <span>Download PDF</span>
            </a>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Print Invoice"
            >
              <FiPrinter size={16} />
            </button>

            {/* WhatsApp Confirmation */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
            >
              <FaWhatsapp size={15} />
              <span className="hidden sm:inline">Confirm on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Invoice Canvas */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-[#020617] p-8 border-b-2 border-amber-400 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-400/20 overflow-hidden shrink-0">
                <Image src="/images/logo.png" alt="Syed Services Logo" width={52} height={52} className="w-full h-full object-contain" priority />
              </div>
              <div>
                <div className="text-xl font-black text-white tracking-wider">SYED SERVICES</div>
                <div className="text-xs text-amber-400 font-bold tracking-wider">&amp; CONSULTANT • TRAVEL &amp; VISA SERVICES</div>
                <div className="text-[11px] text-slate-400 mt-1">Peshawar, Pakistan | Jalalabad, Afghanistan</div>
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="text-2xl font-black text-amber-400">INVOICE</div>
              <div className="text-sm font-mono font-bold text-white">{invoice.invoiceNumber}</div>
              <div className="mt-1">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    invoice.status === "PAID"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : invoice.status === "PARTIALLY_PAID"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To & Dates */}
          <div className="p-8 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/40">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Billed To</div>
              <div className="text-lg font-bold text-white">{clientName}</div>
              {invoice.companyName && (
                <div className="text-sm text-slate-300 font-medium">{invoice.companyName}</div>
              )}
              {invoice.customerEmail && (
                <div className="text-xs text-slate-400 mt-1">Email: {invoice.customerEmail}</div>
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
                <div className="text-xs text-slate-400 mt-1">Tax ID / CNIC: {invoice.taxNumber}</div>
              )}
            </div>

            <div className="md:text-right space-y-1.5 text-xs text-slate-400">
              <div>
                <span className="font-semibold text-slate-300">Issue Date:</span>{" "}
                {new Date(invoice.issueDate).toLocaleDateString("en-US", {
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
              <div className="pt-2">
                <span className="font-semibold text-slate-300">Currency:</span>{" "}
                <strong className="text-white font-mono">{currency}</strong>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="pb-3">#</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Unit Price</th>
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
                      <td className="py-3 text-right font-bold text-white font-mono">
                        {formatCurrencyAmount(item.amount, currency, { showSymbol: false })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Payment Instructions */}
            <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Payment Details */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <FiCreditCard /> Bank Transfer &amp; Payment Instructions
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {invoice.termsConditions || "Payment details available on request."}
                  </div>
                </div>

                {invoice.notes && (
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-400">Note: </span>
                    <span className="text-slate-300">{invoice.notes}</span>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="md:col-span-5 space-y-2 text-xs">
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">
                    {formatCurrencyAmount(invoice.subtotalAmount, currency, { showCode: true })}
                  </span>
                </div>

                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">
                      -{formatCurrencyAmount(invoice.discountAmount, currency, { showCode: true })}
                    </span>
                  </div>
                )}

                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between py-1 text-slate-400">
                    <span>Tax</span>
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
                  <span>Amount Paid</span>
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

          {/* Verification Footer */}
          <div className="p-6 bg-[#020617] border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
            <div className="text-slate-400 font-semibold">Syed Services &amp; Consultant</div>
            <div>Peshawar, Pakistan &bull; Jalalabad, Afghanistan</div>
            <div>
              Support Email: <a href="mailto:info@syedservices.com.pk" className="text-amber-400 hover:underline">info@syedservices.com.pk</a> &bull; Phone / WhatsApp: <a href="https://wa.me/923099797771" className="text-amber-400 hover:underline">+92 309 9797771</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
