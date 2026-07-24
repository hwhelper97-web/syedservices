"use client";

import { useState, useEffect } from "react";
import { 
  FiDollarSign, FiFileText, FiLoader, FiCheckCircle, 
  FiClock, FiAlertCircle, FiDownload, FiCheck, FiX 
} from "react-icons/fi";

export default function AdminPaymentsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: number, status: string) => {
    setVerifyingId(paymentId);
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });
      if (res.ok) {
        alert(`Payment transaction marked as ${status.toLowerCase()}!`);
        fetchInvoices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingId(null);
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
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-black text-white tracking-tight">Billing & Payments Desk</h3>
        <p className="text-xs text-slate-400 mt-1">Audit client invoices, view manual wire transfers, and confirm payments</p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed p-12 rounded-[2.5rem] text-center space-y-2">
          <FiDollarSign className="text-slate-500 text-4xl mx-auto" />
          <h4 className="text-white font-bold">No Invoices</h4>
          <p className="text-xs text-slate-500">No system invoices are logged currently.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0f172a] border border-slate-800 rounded-[2rem] shadow-xl">
          <table className="w-full text-left text-sm text-slate-350">
            <thead className="bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-5">Invoice Code</th>
                <th className="p-5">Client Profile</th>
                <th className="p-5">Visa Plan</th>
                <th className="p-5">Fee Amount</th>
                <th className="p-5">Verification Link</th>
                <th className="p-5">Payment Status</th>
                <th className="p-5 text-right">Verification Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {invoices.map((inv) => {
                const manualPayment = inv.payments.find((p: any) => p.paymentMethod === "BANK_TRANSFER");
                const isPending = manualPayment && manualPayment.status === "PENDING";
                
                return (
                  <tr key={inv.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-5 font-bold text-white font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="p-5 font-bold text-white">{inv.application.client.user.name}</td>
                    <td className="p-5">{inv.application.visaCategory}</td>
                    <td className="p-5 font-black text-white">${inv.totalAmount}</td>
                    <td className="p-5">
                      {manualPayment?.receiptUrl ? (
                        <a 
                          href={manualPayment.receiptUrl} 
                          target="_blank" 
                          className="text-xs text-yellow-400 font-bold hover:underline flex items-center gap-1.5"
                        >
                          <FiDownload size={14} /> Receipt Scan
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        inv.status === "PAID" ? "bg-green-500/10 text-green-400" :
                        inv.status === "UNPAID" ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {isPending ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleVerify(manualPayment.id, "REJECTED")}
                            disabled={verifyingId !== null}
                            className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all cursor-pointer"
                            title="Reject Payment"
                          >
                            <FiX size={16} />
                          </button>
                          <button
                            onClick={() => handleVerify(manualPayment.id, "VERIFIED")}
                            disabled={verifyingId !== null}
                            className="p-2 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 rounded-xl transition-all cursor-pointer"
                            title="Verify Payment"
                          >
                            <FiCheck size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-bold italic uppercase">Audited</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
