import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let leads: any[] = [];

  try {
    leads = await prisma.lead.findMany({
      include: {
        files: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("❌ DB ERROR:", error);
  }

  return <DashboardClient initialLeads={leads ?? []} />;
}