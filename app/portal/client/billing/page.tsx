"use client";

import { useState, useEffect } from "react";
import { 
  FiDollarSign, FiFileText, FiUploadCloud, FiCheckCircle, 
  FiClock, FiAlertCircle, FiLoader, FiArrowRight 
} from "react-icons/fi";

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

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices);
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

      setSuccess(true);
      fetchInvoices();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleBankUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setUploadingReceipt(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("invoiceId", selectedInvoice.id.toString());
      formData.append("amount", selectedInvoice.totalAmount.toString());
      formData.append("paymentMethod", "BANK_TRANSFER");
      formData.append("transactionId", transactionId);
      if (receiptFile) {
        formData.append("file", receiptFile);
      }

      const res = await fetch("/api/payments", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload manual payment receipt");
      }

      setSuccess(true);
      setReceiptFile(null);
      setTransactionId("");
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      setError(err.message);
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
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Outstanding</p>
            <h3 className="text-3xl font-black text-red-400">${totalOwed}</h3>
          </div>
          <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center">
            <FiDollarSign size={24} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Paid</p>
            <h3 className="text-3xl font-black text-green-400">${totalPaid}</h3>
          </div>
          <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center">
            <FiCheckCircle size={24} />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
          Payment transaction recorded successfully!
        </div>
      )}

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Invoices List */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight">Visa Invoices</h3>

          {loading ? (
            <div className="flex justify-center items-center h-48 text-yellow-400">
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
              {invoices.map((inv) => (
                <div 
                  key={inv.id}
                  className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2.5rem] shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{inv.invoiceNumber}</span>
                      <h4 className="font-bold text-white text-base mt-0.5">{inv.application.visaCategory}</h4>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      inv.status === "PAID" ? "bg-green-500/10 text-green-400" :
                      inv.status === "UNPAID" ? "bg-red-500/10 text-red-400" :
                      "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Amount Due</span>
                      <p className="text-lg font-black text-white mt-0.5">${inv.totalAmount}</p>
                    </div>

                    {inv.status === "UNPAID" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Bank Receipt
                        </button>
                        <button
                          onClick={() => handleOnlinePay(inv)}
                          disabled={paying}
                          className="px-5 py-2.5 bg-yellow-400 text-black text-xs font-black rounded-xl hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
                        >
                          Pay Online
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bank Upload Details (Sidebar Form) */}
        {selectedInvoice && (
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xl font-black text-white tracking-tight">Manual Bank Transfer</h3>
            
            <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2.5rem] shadow-xl space-y-6">
              <div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Please transfer the total invoice amount to the bank details below and upload the receipt scan:
                </p>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-[11px] mt-4 space-y-1.5 font-medium">
                  <p>🏦 **Bank**: Islamic Bank of Afghanistan</p>
                  <p>🏢 **Account**: Syed Services Tourism LLC</p>
                  <p>🔢 **IBAN**: AF091800100987654321</p>
                </div>
              </div>

              <form onSubmit={handleBankUpload} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Transaction ID / Reference</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                    placeholder="e.g. TXN-98765"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Upload Bank Receipt</label>
                  <label className="w-full py-6 border border-dashed border-slate-800 hover:border-yellow-400/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/40">
                    <FiUploadCloud className="text-slate-500" size={24} />
                    <span className="text-xs font-semibold text-slate-400">
                      {receiptFile ? receiptFile.name : "Select Image or PDF Receipt"}
                    </span>
                    <input
                      type="file"
                      required
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && setReceiptFile(e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800 text-xs font-bold rounded-xl text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingReceipt}
                    className="flex-1 py-3 bg-yellow-400 text-black font-black rounded-xl text-xs hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    {uploadingReceipt ? "Uploading..." : "Submit Receipt"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
