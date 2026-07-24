import DashboardClient from "../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  return <DashboardClient initialTab="chat" />;
}
