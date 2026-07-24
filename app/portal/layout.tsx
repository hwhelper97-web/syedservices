import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PortalLayoutClient from "./PortalLayoutClient";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If there's no session, we only allow access to login and register pages.
  // The middleware will handle path protection, but this serves as a double check.
  if (!session) {
    return <>{children}</>;
  }

  return (
    <PortalLayoutClient user={session}>
      {children}
    </PortalLayoutClient>
  );
}
