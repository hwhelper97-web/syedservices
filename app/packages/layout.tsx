import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "All-Inclusive Travel & Visa Packages Catalog",
  description:
    "Explore verified country visa and travel deals with guaranteed pricing in USD, PKR, and AFN. Direct embassy assistance, document checklists, and fast-track processing.",
  alternates: {
    canonical: "/packages",
  },
  openGraph: {
    title: "All-Inclusive Travel & Visa Packages Catalog | Syed Services",
    description:
      "Explore verified country visa and travel packages with transparent rates in USD, PKR, and AFN.",
    url: "https://www.syedservices.com.pk/packages",
  },
};

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Packages", url: "https://www.syedservices.com.pk/packages" }
        ]}
      />
      {children}
    </>
  );
}
