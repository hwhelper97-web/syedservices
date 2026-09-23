import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Received Successfully",
  description:
    "Your visa application has been received by Syed Services. Our processing team will review your dossier and initiate verification.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
