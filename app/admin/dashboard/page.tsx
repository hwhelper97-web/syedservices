import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  let messages: any[] = [];

  try {
    messages = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("❌ DB ERROR:", error);
  }

  // ✅ always safe fallback
  return <DashboardClient messages={messages ?? []} />;
}