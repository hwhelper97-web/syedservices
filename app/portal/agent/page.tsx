import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  FiPlusCircle, FiFileText, FiUsers, FiDollarSign, 
  FiClock, FiCheckCircle, FiTrendingUp, FiMessageSquare,
  FiAlertCircle
} from "react-icons/fi";

export default async function AgentDashboard() {
  const session = await getSession();

  if (!session || session.role !== "AGENT") {
    redirect("/portal/login");
  }

  // Fetch agent profile and applications
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      agentProfile: {
        include: {
          applications: {
            orderBy: { createdAt: "desc" },
            include: {
              client: {
                include: {
                  user: true,
                }
              }
            }
          }
        }
      }
    }
  });

  const profile = user?.agentProfile;
  const applications = profile?.applications || [];

  const totalApps = applications.length;
  const processingApps = applications.filter(
    (app) => !["APPROVED", "REJECTED", "COMPLETED", "ARCHIVED"].includes(app.status)
  ).length;
  const approvedApps = applications.filter((app) => app.status === "APPROVED").length;
  const commissionRate = profile?.commissionRate || 0;
  const totalCommission = approvedApps * 150; // simple mock: 150 USD per approved visa
  const isProfileComplete = 
    profile?.agencyName &&
    profile?.licenseNumber &&
    profile?.whatsappNumber &&
    profile?.officeAddress &&
    profile?.licenseCertificate &&
    user?.image;

  return (
    <div className="space-y-10">
      {!isProfileComplete && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <span className="text-rose-450 mt-1"><FiAlertCircle size={22} /></span>
            <div className="space-y-1">
              <h4 className="text-rose-400 font-black text-sm uppercase tracking-wider">Verification Action Required</h4>
              <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
                Your agency profile details are incomplete. To comply with embassy regulations and submit visa files, please upload your Travel Agency details, license files, office address, and profile image.
              </p>
            </div>
          </div>
          <Link
            href="/portal/agent/profile"
            className="px-5 py-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer text-center"
          >
            Complete Profile Details
          </Link>
        </div>
      )}

      {/* Banner */}
      <div className="relative overflow-hidden bg-[#0f172a] border border-slate-800 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Partner Console: <span className="text-yellow-400">{profile?.agencyName || session.name}</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Create client profiles, submit applications, check document compliance, and monitor commission metrics.
          </p>
        </div>
        <Link
          href="/portal/agent/new-app"
          className="flex items-center gap-2 px-6 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 cursor-pointer self-start md:self-auto"
        >
          <FiPlusCircle size={20} /> Create Application
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Client Files</p>
            <h3 className="text-3xl font-black text-white">{totalApps}</h3>
          </div>
          <div className="w-11 h-11 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
            <FiUsers size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">In Processing</p>
            <h3 className="text-3xl font-black text-white">{processingApps}</h3>
          </div>
          <div className="w-11 h-11 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center">
            <FiClock size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Approvals</p>
            <h3 className="text-3xl font-black text-white">{approvedApps}</h3>
          </div>
          <div className="w-11 h-11 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
            <FiCheckCircle size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Est. Commission</p>
            <h3 className="text-3xl font-black text-white">${totalCommission}</h3>
          </div>
          <div className="w-11 h-11 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
            <FiDollarSign size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Submissions list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white tracking-tight">Recent Client Submissions</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Agent Code: {profile?.agentCode}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-slate-800/30 text-slate-500 rounded-full flex items-center justify-center">
                <FiFileText size={32} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">No applications submitted</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Submit your first client application to begin tracking commissions.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto bg-[#0f172a] border border-slate-800 rounded-[2rem]">
              <table className="w-full text-left text-sm text-slate-350">
                <thead className="bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-5">Client Name</th>
                    <th className="p-5">Destination</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Tracking ID</th>
                    <th className="p-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-5 font-bold text-white">{app.client.user.name}</td>
                      <td className="p-5">{app.country}</td>
                      <td className="p-5">{app.visaCategory}</td>
                      <td className="p-5 text-slate-500 text-xs font-mono">{app.trackingId}</td>
                      <td className="p-5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
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

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
            <FiMessageSquare className="text-yellow-400 text-3xl mb-4" />
            <h4 className="text-white font-bold mb-2">Agency Chat</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Connect directly with our corporate operations team for query resolutions.
            </p>
            <Link 
              href="/portal/agent/messages"
              className="w-full py-3.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-black rounded-xl hover:bg-yellow-400 hover:text-black transition-all text-center block cursor-pointer"
            >
              Start Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
