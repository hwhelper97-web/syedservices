import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER", "MANAGER", "VISA_OFFICER"].includes(session.role)) {
    redirect("/portal/login");
  }

  try {
    // Aggregate database statistics
    const [totalApplications, pendingVerification, pendingInvoices, totalUsers, recentApps, logs] = await Promise.all([
      prisma.application.count().catch(() => 0),
      prisma.application.count({ where: { status: "WAITING_CONFIRMATION" } }).catch(() => 0),
      prisma.invoice.count({ where: { status: "UNPAID" } }).catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            include: {
              user: true,
            },
          },
        },
        take: 6,
      }).catch(() => []),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
        },
        take: 6,
      }).catch(() => []),
    ]);

    // Completely safe JSON serialization to eliminate Date object serialization errors in Next.js
    const safeRecentApps = JSON.parse(JSON.stringify(recentApps));
    const safeLogs = JSON.parse(JSON.stringify(logs));

    return (
      <AdminDashboardClient
        userName={session.name || "Administrator"}
        userRole={session.role}
        totalApplications={totalApplications}
        pendingVerification={pendingVerification}
        pendingInvoices={pendingInvoices}
        totalUsers={totalUsers}
        recentApps={safeRecentApps}
        logs={safeLogs}
      />
    );
  } catch (error) {
    console.error("Admin dashboard load error:", error);
    return (
      <AdminDashboardClient
        userName={session.name || "Administrator"}
        userRole={session.role}
        totalApplications={0}
        pendingVerification={0}
        pendingInvoices={0}
        totalUsers={0}
        recentApps={[]}
        logs={[]}
      />
    );
  }
}
