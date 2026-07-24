"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VISA_STATUS_OPTIONS } from "@/lib/visaPipeline";
import { FiSearch, FiFileText, FiLoader, FiPlusCircle, FiChevronRight } from "react-icons/fi";

export default function AgentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Assigned Client Files</h3>
          <p className="text-xs text-slate-400 mt-1">Manage and track applications submitted under your agency account</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <FiSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search client files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none placeholder-slate-600 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none text-white"
          >
            <option value="ALL">All Statuses</option>
            {VISA_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Link
            href="/portal/agent/new-app"
            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <FiPlusCircle /> New Visa File
          </Link>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed p-12 rounded-[2.5rem] text-center space-y-2">
          <FiFileText className="text-slate-500 text-4xl mx-auto" />
          <h4 className="text-white font-bold">No Applications</h4>
          <p className="text-xs text-slate-500">No applications match your active filters or tracking queries.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0f172a] border border-slate-800 rounded-[2rem] shadow-xl">
          <table className="w-full text-left text-sm text-slate-350">
            <thead className="bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-5">Applicant Name</th>
                <th className="p-5">Country</th>
                <th className="p-5">Category</th>
                <th className="p-5">Tracking ID</th>
                <th className="p-5">Date Submitted</th>
                <th className="p-5">Status</th>
                <th className="p-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-900/20 transition-colors group">
                  <td className="p-5 font-bold text-white">{app.client.user.name}</td>
                  <td className="p-5">{app.country}</td>
                  <td className="p-5">{app.visaCategory}</td>
                  <td className="p-5 text-slate-500 font-mono text-xs">{app.trackingId}</td>
                  <td className="p-5 text-xs">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      app.status === "APPROVED" ? "bg-green-500/10 text-green-400" :
                      app.status === "REJECTED" ? "bg-red-500/10 text-red-400" :
                      "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-5">
                    <Link
                      href={`/portal/agent/applications/${app.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-yellow-400/40 hover:bg-slate-800 text-xs font-semibold rounded-xl text-yellow-400 transition-all whitespace-nowrap"
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
