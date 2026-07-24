import DashboardClient from "../dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AppraisalsPage() {
  return <DashboardClient initialTab="appraisals" />;
}
