"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiFileText, FiLoader, FiSearch, FiAlertCircle,
  FiCheckCircle, FiClock, FiChevronRight, FiUser
} from "react-icons/fi";

import { VISA_STATUS_COLORS as STATUS_STYLES, VISA_STATUS_OPTIONS } from "@/lib/visaPipeline";

export default function StaffApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/applications");
      const data = await res.json();
      if (res.ok) setApplications(data.applications || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (appId: number, status: string) => {
    setUpdatingId(appId);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setApplications(prev =>
          prev.map(a => a.id === appId ? { ...a, status } : a)
        );
      }
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const filtered = applications.filter(app => {
    const matchSearch =
      app.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
      app.client?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.country?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FiFileText className="text-yellow-400" /> All Applications
          </h3>
          <p className="text-xs text-slate-400 mt-1">Review and update status on all submitted visa applications.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <FiSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search client or tracking ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none placeholder-slate-600 text-white"
            />
          </div>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none text-white"
          >
            <option value="ALL">All Statuses</option>
            {VISA_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",    count: applications.length,                                         color: "text-white",       icon: <FiFileText size={16} /> },
          { label: "Pending",  count: applications.filter(a => a.status === "WAITING_CONFIRMATION").length, color: "text-orange-400", icon: <FiClock size={16} /> },
          { label: "Approved", count: applications.filter(a => a.status === "APPROVED").length,    color: "text-green-400",   icon: <FiCheckCircle size={16} /> },
          { label: "Rejected", count: applications.filter(a => a.status === "REJECTED").length,    color: "text-red-400",     icon: <FiAlertCircle size={16} /> },
        ].map(({ label, count, color, icon }) => (
          <div key={label} className="bg-[#0f172a] border border-slate-800 rounded-[1.5rem] p-5 shadow-lg">
            <div className={`${color} mb-2`}>{icon}</div>
            <p className={`text-2xl font-black ${color}`}>{count}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      {filtered.length === 0 ? (
        <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed p-14 rounded-[2.5rem] text-center space-y-3">
          <FiFileText className="text-slate-600 text-4xl mx-auto" />
          <h4 className="text-white font-bold">No Applications Found</h4>
          <p className="text-xs text-slate-500">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] shadow-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="p-5">Applicant</th>
                <th className="p-5">Country / Category</th>
                <th className="p-5">Tracking ID</th>
                <th className="p-5">Date</th>
                <th className="p-5">Status</th>
                <th className="p-5">Update Status</th>
                <th className="p-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {app.client?.user?.name?.[0]?.toUpperCase() || <FiUser size={12} />}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{app.client?.user?.name || "Unknown"}</p>
                        <p className="text-[10px] text-slate-500">{app.client?.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-xs font-semibold text-white">{app.country}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{app.visaCategory}</p>
                  </td>
                  <td className="p-5 font-mono text-xs text-slate-400">{app.trackingId}</td>
                  <td className="p-5 text-xs text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="p-5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLES[app.status] || STATUS_STYLES.DRAFT}`}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-5">
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      disabled={updatingId === app.id}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-yellow-400/40 text-white disabled:opacity-50 cursor-pointer"
                    >
                      {VISA_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {updatingId === app.id && (
                      <FiLoader className="animate-spin text-yellow-400 inline ml-2" size={12} />
                    )}
                  </td>
                  <td className="p-5">
                    <Link
                      href={`/portal/staff/applications/${app.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-yellow-400 text-xs font-semibold rounded-xl transition-all"
                    >
                      View <FiChevronRight size={12} />
                    </Link>
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
