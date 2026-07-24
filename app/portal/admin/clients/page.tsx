"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiSearch, FiLoader, FiUserPlus, FiLock } from "react-icons/fi";

export default function AdminClientsListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        // filter clients
        const clients = data.users.filter((u: any) => u.role === "CLIENT");
        setUsers(clients);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = users.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h3 className="text-xl font-black text-white tracking-tight">Client Database</h3>
          <p className="text-xs text-slate-400 mt-1">Directory of registered website clients</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <FiSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:border-yellow-400/50 focus:outline-none placeholder-slate-600"
            />
          </div>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed p-12 rounded-[2.5rem] text-center space-y-2">
          <FiUsers className="text-slate-500 text-4xl mx-auto" />
          <h4 className="text-white font-bold">No Clients Found</h4>
          <p className="text-xs text-slate-500">No registered client records found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0f172a] border border-slate-800 rounded-[2rem] shadow-xl">
          <table className="w-full text-left text-sm text-slate-350">
            <thead className="bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-5">Client Name</th>
                <th className="p-5">Email Address</th>
                <th className="p-5">Phone</th>
                <th className="p-5">Account Status</th>
                <th className="p-5">Join Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="p-5 font-bold text-white">{client.name}</td>
                  <td className="p-5">{client.email}</td>
                  <td className="p-5 text-slate-400">{client.clientProfile?.phone || "N/A"}</td>
                  <td className="p-5">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      {client.status}
                    </span>
                  </td>
                  <td className="p-5 text-xs text-slate-500">
                    {new Date(client.createdAt).toLocaleDateString()}
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
