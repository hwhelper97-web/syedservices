import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  FiPlusCircle, FiFileText, FiCalendar, FiMessageSquare, 
  FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight 
} from "react-icons/fi";

export default async function ClientDashboard() {
  const session = await getSession();

  if (!session || session.role !== "CLIENT") {
    redirect("/portal/login");
  }

  // Fetch client profile and active applications
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      clientProfile: {
        include: {
          applications: {
            orderBy: { createdAt: "desc" },
            include: {
              documents: true,
              invoices: true,
            }
          },
          appointments: {
            orderBy: { date: "desc" },
            take: 3,
          }
        }
      }
    }
  });

  const profile = user?.clientProfile;
  const applications = profile?.applications || [];
  const appointments = profile?.appointments || [];

  // Stats calculation
  const totalApps = applications.length;
  const pendingApps = applications.filter(
    (app) => !["APPROVED", "REJECTED", "COMPLETED", "ARCHIVED"].includes(app.status)
  ).length;
  const approvedApps = applications.filter((app) => app.status === "APPROVED").length;

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-[#0f172a] border border-slate-800 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="text-yellow-400">{session.name}</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Track your immigration files, manage documents, check active invoices, and message your agent.
          </p>
        </div>
        <Link
          href="/portal/client/apply"
          className="flex items-center gap-2 px-6 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 cursor-pointer self-start md:self-auto"
        >
          <FiPlusCircle size={20} /> Apply For Visa
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between group shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Applications</p>
            <h3 className="text-4xl font-black text-white">{totalApps}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
            <FiFileText size={22} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between group shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">In Processing</p>
            <h3 className="text-4xl font-black text-white">{pendingApps}</h3>
          </div>
          <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center">
            <FiClock size={22} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between group shadow-xl">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Visas Approved</p>
            <h3 className="text-4xl font-black text-white">{approvedApps}</h3>
          </div>
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
            <FiCheckCircle size={22} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Applications */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white tracking-tight">Active Applications</h3>
            {applications.length > 0 && (
              <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">
                Realtime Updates
              </span>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="bg-[#0f172a]/50 border border-slate-800 border-dashed rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-slate-800/30 text-slate-500 rounded-full flex items-center justify-center">
                <FiAlertCircle size={32} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">No applications found</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  You haven't submitted any visa applications yet. Start your first application today.
                </p>
              </div>
              <Link
                href="/portal/client/apply"
                className="mt-2 text-xs text-yellow-400 font-bold flex items-center gap-1 hover:underline"
              >
                Apply now <FiArrowRight />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div 
                  key={app.id}
                  className="bg-[#0f172a] border border-slate-800 hover:border-slate-700 p-6 rounded-[2.5rem] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full uppercase tracking-wider">
                        {app.country}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                        ID: {app.trackingId}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-white">{app.visaCategory}</h4>
                    <p className="text-xs text-slate-400">
                      Submitted on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                        app.status === "APPROVED" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        app.status === "REJECTED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </div>

                    <Link
                      href={`/portal/client/applications/${app.id}`}
                      className="px-5 py-3.5 bg-slate-900 border border-slate-800 text-xs font-bold rounded-2xl hover:bg-slate-800 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Cards (Appointments & Quick Help) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Appointments Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiCalendar className="text-yellow-400" /> Appointments
              </h4>
              <Link 
                href="/portal/client/appointments" 
                className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest hover:underline"
              >
                Schedule
              </Link>
            </div>
            <div className="p-6">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No upcoming appointments scheduled.
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">
                          {new Date(apt.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{apt.timeSlot}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        apt.status === "SCHEDULED" ? "bg-blue-500/10 text-blue-400" :
                        apt.status === "COMPLETED" ? "bg-green-500/10 text-green-400" :
                        "bg-red-500/10 text-red-400"
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 blur-3xl pointer-events-none" />
            <FiMessageSquare className="text-blue-400 text-3xl mb-4" />
            <h4 className="text-white font-bold mb-2">Need Advisor Help?</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Send an instant message to your assigned travel agent. We respond within 24 hours.
            </p>
            <Link 
              href="/portal/client/messages"
              className="w-full py-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black rounded-xl hover:bg-blue-500 hover:text-white transition-all text-center block cursor-pointer"
            >
              Start Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
