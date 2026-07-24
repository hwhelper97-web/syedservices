import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  FiCheckSquare, FiFileText, FiMessageSquare, 
  FiClock, FiAlertCircle, FiUserCheck 
} from "react-icons/fi";

export default async function StaffDashboard() {
  const session = await getSession();

  if (!session || session.role !== "STAFF") {
    redirect("/portal/login");
  }

  // Fetch tasks assigned to staff and pending applications
  const tasks = await prisma.task.findMany({
    where: { assignedToId: session.userId },
    orderBy: { dueDate: "asc" },
    take: 5
  });

  const pendingApps = await prisma.application.findMany({
    where: { status: "WAITING_CONFIRMATION" },
    orderBy: { updatedAt: "desc" },
    include: {
      client: {
        include: {
          user: true
        }
      }
    },
    take: 5
  });

  return (
    <div className="space-y-10">
      {/* Banner */}
      <div className="relative overflow-hidden bg-[#0f172a] border border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Staff Workstation: <span className="text-yellow-400">{session.name}</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Review submitted files, complete verification checkpoints, update status logs, and address assigned tasks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Assigned Tasks */}
        <div className="lg:col-span-6 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FiCheckSquare className="text-yellow-400" /> Assigned Tasks
          </h3>

          {tasks.length === 0 ? (
            <div className="bg-[#0f172a]/40 border border-slate-800 p-8 rounded-[2rem] text-center text-xs text-slate-500">
              No tasks assigned to you currently.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{task.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                    task.priority === "HIGH" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Queue */}
        <div className="lg:col-span-6 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FiFileText className="text-blue-400" /> Document Verification Queue
          </h3>

          {pendingApps.length === 0 ? (
            <div className="bg-[#0f172a]/40 border border-slate-800 p-8 rounded-[2rem] text-center text-xs text-slate-500">
              Verification queue is currently empty. Good job!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApps.map((app) => (
                <div key={app.id} className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{app.client.user.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{app.country} — {app.visaCategory}</p>
                  </div>
                  <Link 
                    href={`/portal/staff/applications/${app.id}`}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-xl text-yellow-400"
                  >
                    Verify
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
