"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FiFileText, FiUsers, FiDollarSign, FiAward, 
  FiActivity, FiCheckCircle, FiPlusCircle, FiAlertCircle,
  FiArrowUpRight, FiSliders, FiClock, FiGlobe, FiShield,
  FiEye, FiCalendar, FiChevronRight, FiRefreshCw
} from "react-icons/fi";
import { VISA_STATUS_COLORS } from "@/lib/visaPipeline";

interface AdminDashboardClientProps {
  userName: string;
  userRole: string;
  totalApplications: number;
  pendingVerification: number;
  pendingInvoices: number;
  totalUsers: number;
  recentApps: any[];
  logs: any[];
}

export default function AdminDashboardClient({
  userName,
  userRole,
  totalApplications,
  pendingVerification,
  pendingInvoices,
  totalUsers,
  recentApps,
  logs,
}: AdminDashboardClientProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-10 pb-12">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#111c38] to-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                Executive Command Center
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Engine Operational
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Welcome, <span className="text-yellow-400">{userName}</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              {currentDate} — Monitor whole agency metrics, approve financial wire transfers, assign staff privileges, and audit log activities.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/portal/admin/applications"
              className="flex items-center gap-2 px-5 py-3 bg-yellow-400 text-black font-black rounded-2xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-lg shadow-yellow-400/20"
            >
              <FiFileText size={15} />
              Review Dossiers
            </Link>
            <Link
              href="/portal/admin/payments"
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-700 hover:border-yellow-400/40 text-slate-200 hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-lg"
            >
              <FiDollarSign size={15} className="text-yellow-400" />
              Billing Ledger
            </Link>
            <Link
              href="/portal/admin/settings"
              className="p-3 bg-slate-900 border border-slate-700 hover:border-yellow-400/40 text-slate-400 hover:text-yellow-400 rounded-2xl transition-colors"
              title="Global Settings"
            >
              <FiSliders size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Animated KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Visa Dossiers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FiFileText size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">{totalApplications}</h3>
            <span className="text-xs text-slate-500">files logged</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="text-blue-400 font-bold flex items-center gap-1">
              Live Database
            </span>
            <Link href="/portal/admin/applications" className="text-slate-400 hover:text-white flex items-center gap-0.5">
              <span>View All</span>
              <FiChevronRight size={12} />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Verification</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FiAlertCircle size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-amber-400">{pendingVerification}</h3>
            <span className="text-xs text-slate-500">action required</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Awaiting confirmation
            </span>
            <Link href="/portal/admin/applications" className="text-slate-400 hover:text-white flex items-center gap-0.5">
              <span>Inspect</span>
              <FiChevronRight size={12} />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unpaid Invoices</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <FiDollarSign size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-rose-400">{pendingInvoices}</h3>
            <span className="text-xs text-slate-500">receivables open</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="text-rose-400 font-semibold">
              Bank transfers & fees
            </span>
            <Link href="/portal/admin/payments" className="text-slate-400 hover:text-white flex items-center gap-0.5">
              <span>Ledger</span>
              <FiChevronRight size={12} />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Accounts</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FiUsers size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">{totalUsers}</h3>
            <span className="text-xs text-slate-500">portal users</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold">Clients, Agents, Staff</span>
            <Link href="/portal/admin/users" className="text-slate-400 hover:text-white flex items-center gap-0.5">
              <span>Users</span>
              <FiChevronRight size={12} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Applications Table */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <FiFileText className="text-yellow-400" /> Recent Submissions
              </h3>
              <p className="text-xs text-slate-400">Newly received client & agency visa applications</p>
            </div>
            <Link
              href="/portal/admin/applications"
              className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400 hover:underline"
            >
              <span>View All ({totalApplications})</span>
              <FiArrowUpRight size={14} />
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div className="bg-[#0f172a]/60 border border-slate-800 border-dashed p-10 rounded-[2rem] text-center text-xs text-slate-500">
              No recent client applications submitted.
            </div>
          ) : (
            <div className="overflow-x-auto bg-[#0f172a] border border-slate-800 rounded-[2.5rem] shadow-2xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Tracking Code</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {recentApps.map((app) => {
                    const clientName = app.client?.user?.name || "Applicant";
                    const statusColor = VISA_STATUS_COLORS[app.status] || "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                    return (
                      <tr key={app.id} className="hover:bg-slate-900/40 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-[10px] font-bold text-yellow-400">
                              {clientName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-white text-xs group-hover:text-yellow-400 transition-colors">
                              {clientName}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs flex items-center gap-1 font-semibold text-slate-300">
                            <FiGlobe size={12} className="text-yellow-400" />
                            <span>{app.country || "Unspecified"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[11px] font-mono text-slate-400">
                            {app.trackingId || `APP-${app.id}`}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {app.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/portal/admin/applications/${app.id}`}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-yellow-400/40 rounded-xl text-xs font-bold text-slate-300 hover:text-yellow-400 transition-colors inline-flex items-center gap-1"
                          >
                            <FiEye size={12} />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Audit Trail */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <FiActivity className="text-yellow-400" /> Security Audit Log
              </h3>
              <p className="text-xs text-slate-400">Live chronicle of administrative operations</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Real-Time
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="bg-[#0f172a]/60 border border-slate-800 border-dashed p-10 rounded-[2rem] text-center text-xs text-slate-500">
              No audit logs recorded currently.
            </div>
          ) : (
            <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-xs space-y-1 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      {log.user?.name || "System"}:
                      <span className="text-yellow-400 font-mono text-[11px]">{log.action}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-slate-400 pl-3">
                      {log.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
