import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  FiFileText, FiUsers, FiDollarSign, FiAward, 
  FiActivity, FiCheckCircle, FiPlusCircle, FiAlertCircle 
} from "react-icons/fi";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    redirect("/portal/login");
  }

  // Aggregate database statistics
  const totalApplications = await prisma.application.count();
  const pendingVerification = await prisma.application.count({
    where: { status: "WAITING_CONFIRMATION" }
  });
  const pendingInvoices = await prisma.invoice.count({
    where: { status: "UNPAID" }
  });
  const totalUsers = await prisma.user.count();

  // Fetch recent applications
  const recentApps = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: {
        include: {
          user: true
        }
      }
    },
    take: 5
  });

  // Fetch recent audit logs
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true
    },
    take: 5
  });

  return (
    <div className="space-y-10">
      {/* Banner */}
      <div className="relative overflow-hidden bg-[#0f172a] border border-slate-800 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Administrator Console: <span className="text-yellow-400">Saeed Arman</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Monitor whole agency metrics, approve financial transactions, assign staff privileges, and audit log activities.
          </p>
        </div>
      </div>

      {/* Grid of 4 stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Files</p>
            <h3 className="text-3xl font-black text-white">{totalApplications}</h3>
          </div>
          <div className="w-11 h-11 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
            <FiFileText size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Document Reviews</p>
            <h3 className="text-3xl font-black text-white">{pendingVerification}</h3>
          </div>
          <div className="w-11 h-11 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center">
            <FiAlertCircle size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Unpaid Invoices</p>
            <h3 className="text-3xl font-black text-white">{pendingInvoices}</h3>
          </div>
          <div className="w-11 h-11 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center">
            <FiDollarSign size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Portal Users</p>
            <h3 className="text-3xl font-black text-white">{totalUsers}</h3>
          </div>
          <div className="w-11 h-11 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
            <FiUsers size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight">Recent System Submissions</h3>

          {recentApps.length === 0 ? (
            <div className="bg-[#0f172a]/40 border border-slate-800 p-8 rounded-[2rem] text-center text-xs text-slate-500">
              No recent client applications submitted.
            </div>
          ) : (
            <div className="overflow-x-auto bg-[#0f172a] border border-slate-800 rounded-[2rem]">
              <table className="w-full text-left text-sm text-slate-350">
                <thead className="bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Client</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {recentApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 font-bold text-white">{app.client.user.name}</td>
                      <td className="p-4">{app.country}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          app.status === "APPROVED" ? "bg-green-500/10 text-green-400" :
                          app.status === "REJECTED" ? "bg-red-500/10 text-red-400" :
                          "bg-yellow-500/10 text-yellow-400"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Logs */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FiActivity className="text-yellow-400" /> Audit Log Activities
          </h3>

          {logs.length === 0 ? (
            <div className="bg-[#0f172a]/40 border border-slate-800 p-8 rounded-[2rem] text-center text-xs text-slate-500">
              No logs recorded.
            </div>
          ) : (
            <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-[2rem] space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="text-xs space-y-1">
                  <p className="font-semibold text-slate-200">
                    {log.user?.name || "System"}: <span className="text-slate-400">{log.action}</span>
                  </p>
                  <p className="text-[10px] text-slate-550">
                    {new Date(log.createdAt).toLocaleString()} {log.details ? `— ${log.details}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
