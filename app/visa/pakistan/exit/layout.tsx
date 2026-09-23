import type { Metadata } from "next";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Pakistan Exit Permit Application & Legal Clearance",
  description:
    "Official assistance for Pakistan Exit Permits and Humanitarian Exit clearances. Fast document review, legal clearance, and embassy submission support.",
  alternates: {
    canonical: "/visa/pakistan/exit",
  },
  openGraph: {
    title: "Pakistan Exit Permit Application & Legal Clearance | Syed Services",
    description:
      "Official assistance for Pakistan Exit Permits and Humanitarian Exit clearances with priority legal review.",
    url: "https://www.syedservices.com.pk/visa/pakistan/exit",
  },
};

export default function PakistanExitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Visa Services", url: "https://www.syedservices.com.pk/visa" },
          { name: "Pakistan Visa", url: "https://www.syedservices.com.pk/visa/pakistan" },
          { name: "Exit Permit", url: "https://www.syedservices.com.pk/visa/pakistan/exit" }
        ]}
      />
      <ServiceJsonLd
        name="Pakistan Exit Permit Clearance Service"
        serviceType="ImmigrationClearanceService"
        description="Comprehensive documentation processing for Pakistan exit permits, overstay regularizations, and humanitarian clearances."
      />
      {children}
    </>
  );
}
