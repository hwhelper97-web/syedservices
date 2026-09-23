import type { Metadata } from "next";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Immigration & Educational Consultancy Services",
  description:
    "Expert educational consultancy, overseas career counseling, and strategic immigration planning for UK, Canada, Australia, and European destinations.",
  alternates: {
    canonical: "/consultancy",
  },
  openGraph: {
    title: "Immigration & Educational Consultancy Services | Syed Services",
    description:
      "Expert educational consultancy, career counseling, and strategic immigration planning.",
    url: "https://www.syedservices.com.pk/consultancy",
  },
};

export default function ConsultancyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Consultancy", url: "https://www.syedservices.com.pk/consultancy" }
        ]}
      />
      <ServiceJsonLd
        name="Global Immigration & Student Consultancy"
        serviceType="ImmigrationConsultancy"
        description="Professional overseas student placement, career guidance, and residency immigration consulting services."
      />
      {children}
    </>
  );
}
