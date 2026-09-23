import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service & Client Agreement",
  description:
    "Review terms and conditions governing Syed Services visa processing, consultancy engagements, payment schedules, and mutual service obligations.",
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
