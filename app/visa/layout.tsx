import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Visa Services & Processing Solutions",
  description:
    "Comprehensive international visa assistance for tourist, business, student, and work visas with end-to-end documentation guidance and high approval rates.",
  alternates: {
    canonical: "/visa",
  },
  openGraph: {
    title: "Global Visa Services & Processing Solutions | Syed Services",
    description:
      "Comprehensive international visa assistance for tourist, business, student, and work visas with end-to-end documentation guidance.",
    url: "https://www.syedservices.com.pk/visa",
  },
};

export default function VisaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
