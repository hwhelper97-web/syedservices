"use client";

import { useState, useEffect } from "react";
import { FiDollarSign, FiLoader, FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";

export default function AgentPaymentsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const approvedApps = applications.filter((app) => app.status === "APPROVED");
  const totalCommission = approvedApps.length * 150; // $150 USD commission per approved visa file
  const pendingApps = applications.filter((app) => !["APPROVED", "REJECTED", "COMPLETED"].includes(app.status));
  const expectedCommission = pendingApps.length * 150;

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
        <h3 className="text-xl font-black text-white tracking-tight">Commission & Payments Desk</h3>
        <p className="text-xs text-slate-400 mt-1">Audit earned commissions and verify payment disbursements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Earned Commission</p>
            <h3 className="text-3xl font-black text-white">${totalCommission}</h3>
          </div>
          <div className="w-11 h-11 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
            <FiTrendingUp size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pending Clearance</p>
            <h3 className="text-3xl font-black text-white">${expectedCommission}</h3>
          </div>
          <div className="w-11 h-11 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center">
            <FiClock size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Approved Files</p>
            <h3 className="text-3xl font-black text-white">{approvedApps.length}</h3>
          </div>
          <div className="w-11 h-11 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
            <FiCheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Payment Records */}
      <h3 className="text-sm font-black text-white uppercase tracking-wider">Payment Disbursement Log</h3>
      {approvedApps.length === 0 ? (
        <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed p-12 rounded-[2.5rem] text-center space-y-2">
          <FiDollarSign className="text-slate-500 text-4xl mx-auto" />
          <h4 className="text-white font-bold">No Payments Cleared</h4>
          <p className="text-xs text-slate-500">Commissions will be shown once a visa file is successfully approved by administration.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0f172a] border border-slate-800 rounded-[2rem] shadow-xl">
          <table className="w-full text-left text-sm text-slate-350">
            <thead className="bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-5">Client File</th>
                <th className="p-5">Country</th>
                <th className="p-5">Category</th>
                <th className="p-5">Earned Rate</th>
                <th className="p-5">Approval Date</th>
                <th className="p-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {approvedApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="p-5 font-bold text-white">{app.client.user.name}</td>
                  <td className="p-5">{app.country}</td>
                  <td className="p-5">{app.visaCategory}</td>
                  <td className="p-5 font-bold text-white">$150.00</td>
                  <td className="p-5 text-xs">
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-5">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      Disbursed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
