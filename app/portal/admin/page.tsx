import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER", "MANAGER", "VISA_OFFICER"].includes(session.role)) {
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
    take: 6
  });

  // Fetch recent audit logs
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true
    },
    take: 6
  });

  // Serialize dates for client components
  const serializedRecentApps = recentApps.map(app => ({
    ...app,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    contractAcceptedAt: app.contractAcceptedAt ? app.contractAcceptedAt.toISOString() : null,
  }));

  const serializedLogs = logs.map(log => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <AdminDashboardClient
      userName={session.name || "Administrator"}
      userRole={session.role}
      totalApplications={totalApplications}
      pendingVerification={pendingVerification}
      pendingInvoices={pendingInvoices}
      totalUsers={totalUsers}
      recentApps={serializedRecentApps}
      logs={serializedLogs}
    />
  );
}
