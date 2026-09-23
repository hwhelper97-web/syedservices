import type { Metadata } from "next";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Global Work Permits & Employment Visa Solutions",
  description:
    "Official guidelines and assistance for skilled labor visas, corporate intra-company transfers, and overseas work permits across Europe, Middle East, and Asia.",
  alternates: {
    canonical: "/work-permits",
  },
  openGraph: {
    title: "Global Work Permits & Employment Visa Solutions | Syed Services",
    description:
      "Official guidelines and assistance for skilled labor visas and overseas work permits.",
    url: "https://www.syedservices.com.pk/work-permits",
  },
};

export default function WorkPermitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Work Permits", url: "https://www.syedservices.com.pk/work-permits" }
        ]}
      />
      <ServiceJsonLd
        name="Global Work Permit Processing"
        serviceType="EmploymentVisaService"
        description="Skilled worker immigration processing, work authorization permits, and employment visa legal advisory."
      />
      {children}
    </>
  );
}
