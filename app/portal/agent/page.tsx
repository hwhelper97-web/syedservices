import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  FiPlusCircle, FiFileText, FiUsers, FiDollarSign, 
  FiClock, FiCheckCircle, FiTrendingUp, FiMessageSquare,
  FiAlertCircle, FiArrowRight, FiShield, FiBriefcase, FiCopy
} from "react-icons/fi";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AgentDashboard() {
  const session = await getSession();

  if (!session || !["AGENT", "AGENCY_OWNER"].includes(session.role)) {
    redirect("/portal/login");
  }

  let user: any = null;
  let profile: any = null;
  let applications: any[] = [];

  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        agentProfile: true,
      },
    });

    profile = user?.agentProfile;

    // Fallback: If not found directly on user relation, search by userId or email
    if (!profile) {
      profile = await prisma.agentProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!profile && session.email) {
        profile = await prisma.agentProfile.findFirst({
          where: { user: { email: session.email } },
        });
      }
    }

    // Auto-create agent profile if missing
    if (!profile && user) {
      const agentCode = `AGT-${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        profile = await prisma.agentProfile.create({
          data: {
            userId: session.userId,
            agentCode,
            agencyName: session.name ? `${session.name}'s Agency` : "Travel Agency Partner",
            phone: "+92 300 0000000",
          },
        });
      } catch (e) {
        console.error("Error auto-creating agent profile:", e);
      }
    }

    // If profile exists but has missing agentCode, update it
    if (profile && !profile.agentCode) {
      const generatedCode = `AGT-${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        profile = await prisma.agentProfile.update({
          where: { id: profile.id },
          data: { agentCode: generatedCode },
        });
      } catch (e) {
        profile.agentCode = generatedCode;
      }
    }

    // Query applications safely matching agentId or agent userId
    if (profile) {
      applications = await prisma.application.findMany({
        where: {
          OR: [
            { agentId: profile.id },
            { agent: { userId: session.userId } },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            include: {
              user: true,
            },
          },
          package: true,
          invoices: true,
        },
      });
    }
  } catch (error) {
    console.error("AgentDashboard data fetch error:", error);
  }

  const totalApps = applications.length;
  const processingApps = applications.filter(
    (app) => !["APPROVED", "REJECTED", "COMPLETED", "ARCHIVED"].includes(app.status)
  ).length;
  const approvedApps = applications.filter((app) => app.status === "APPROVED").length;
  const commissionRate = profile?.commissionRate || 0;
  const totalCommission = approvedApps * 150; // $150 USD per approved visa grant

  const isProfileComplete = Boolean(
    profile?.agencyName &&
    profile?.licenseNumber &&
    profile?.whatsappNumber &&
    profile?.officeAddress
  );

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-8 pb-12">
      
      {/* Verification Notice Banner if incomplete */}
      {!isProfileComplete && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <FiAlertCircle size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-amber-300 font-black text-xs uppercase tracking-wider">
                Agency Profile Details Incomplete
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                Please complete your agency license number, office address, and WhatsApp contact to ensure uninterrupted visa submission rights and official embassy endorsement.
              </p>
            </div>
          </div>
          <Link
            href="/portal/agent/profile"
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-xl transition-all whitespace-nowrap text-center shadow-md shadow-amber-400/10 shrink-0"
          >
            Complete Agency Profile
          </Link>
        </div>
      )}

      {/* Hero Partner Console Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#131e3a] to-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-widest">
            <FiBriefcase size={14} /> Authorized B2B Travel Partner
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Partner Console: <span className="text-yellow-400">{profile?.agencyName || session.name || "Travel Partner"}</span>
          </h2>
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <span className="text-xs text-slate-400">Agent Code:</span>
            <span className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
              {profile?.agentCode || "AGT-PENDING"}
            </span>
            <span className="text-xs text-slate-500">• Fast-Track Visa File Dispatch Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <Link
            href="/portal/agent/new-app"
            className="flex items-center gap-2 px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-yellow-400/10"
          >
            <FiPlusCircle size={16} /> Submit New Application
          </Link>
          <Link
            href="/portal/agent/profile"
            className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all"
          >
            Agency Settings
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Client Files</p>
            <h3 className="text-2xl md:text-3xl font-black text-white">{totalApps}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Submitted files</p>
          </div>
          <div className="w-11 h-11 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center">
            <FiUsers size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">In Processing</p>
            <h3 className="text-2xl md:text-3xl font-black text-amber-400">{processingApps}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Embassy & review queue</p>
          </div>
          <div className="w-11 h-11 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center">
            <FiClock size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Approved Grants</p>
            <h3 className="text-2xl md:text-3xl font-black text-emerald-400">{approvedApps}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Visas issued</p>
          </div>
          <div className="w-11 h-11 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
            <FiCheckCircle size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Earned Commission</p>
            <h3 className="text-2xl md:text-3xl font-black text-purple-400">${totalCommission}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Cleared payouts</p>
          </div>
          <div className="w-11 h-11 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center">
            <FiDollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Submissions (8 cols) + Quick Operations (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 cols: Recent Applications */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiFileText className="text-yellow-400" /> Recent Agency Submissions
            </h3>
            <Link
              href="/portal/agent/applications"
              className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors"
            >
              View All Files <FiArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            {applications.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <FiFileText size={22} />
                </div>
                <h4 className="text-white font-bold text-sm">No Client Files Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Submit your agency client applications to begin processing and earn commission disbursements.
                </p>
                <Link
                  href="/portal/agent/new-app"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-black font-black text-xs rounded-xl hover:bg-yellow-300 transition-colors shadow-md shadow-yellow-400/10"
                >
                  <FiPlusCircle size={14} /> Submit Application
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/60 border-b border-slate-800 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    <tr>
                      <th className="p-4">Applicant</th>
                      <th className="p-4">Visa Category</th>
                      <th className="p-4">Tracking Code</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {applications.slice(0, 8).map((app) => (
                      <tr key={app.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-yellow-400/10 text-yellow-400 font-black text-[11px] flex items-center justify-center border border-yellow-400/20">
                              {(app.client?.user?.name || "A")[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div>{app.client?.user?.name || "Applicant"}</div>
                              <div className="text-[10px] text-slate-500">{app.country}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">{app.visaCategory || "Standard Visa"}</td>
                        <td className="p-4 font-mono text-[11px] text-yellow-400/90 font-bold">
                          {app.trackingId || "—"}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            app.status === "APPROVED" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : app.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {app.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/portal/agent/applications/${app.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-yellow-400/30 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition-all"
                          >
                            Details <FiArrowRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 cols: Agency Operations & Chat */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center border border-yellow-400/20">
                <FiMessageSquare size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Agency Advisor Chat</h4>
                <p className="text-[11px] text-slate-400">Direct operations line with HQ</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have urgent embassy updates, document questions, or commission settlement queries? Connect with your assigned account manager.
            </p>
            <Link 
              href="/portal/agent/messages"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-yellow-400/30 text-yellow-400 text-xs font-black rounded-xl transition-all text-center block shadow-md"
            >
              Open Advisor Chat
            </Link>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FiShield className="text-emerald-400" /> Agency Tools & Quick Links
            </h4>
            <div className="space-y-2">
              <Link
                href="/portal/agent/new-app"
                className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-yellow-400/30 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-all group"
              >
                <span>Submit Client Visa File</span>
                <FiPlusCircle className="text-yellow-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/portal/agent/users"
                className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-yellow-400/30 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-all group"
              >
                <span>Agency Client Directory</span>
                <FiUsers className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/portal/agent/payments"
                className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-yellow-400/30 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-all group"
              >
                <span>Commission & Payout Logs</span>
                <FiDollarSign className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
