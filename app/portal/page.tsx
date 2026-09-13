import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function PortalPage() {
  const session = await getSession();

  if (!session) {
    redirect("/portal/login");
  }

  const { role } = session;

  if (["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER", "MANAGER", "VISA_OFFICER"].includes(role)) {
    redirect("/portal/admin");
  } else if (role === "AGENT") {
    redirect("/portal/agent");
  } else if (role === "STAFF") {
    redirect("/portal/staff");
  } else if (role === "CLIENT") {
    redirect("/portal/client");
  } else {
    redirect("/portal/login");
  }
}
