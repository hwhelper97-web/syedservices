import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Our Strategic Offices - Peshawar & Jalalabad",
  description:
    "Visit Syed Services corporate offices located on GT Road, Peshawar, Pakistan and Shams Tareen Plaza, Jalalabad, Afghanistan. Full address, phone numbers, and operational hours.",
  alternates: {
    canonical: "/offices",
  },
  openGraph: {
    title: "Our Strategic Offices - Peshawar & Jalalabad | Syed Services",
    description:
      "Visit Syed Services corporate offices located in Peshawar, Pakistan and Jalalabad, Afghanistan.",
    url: "https://www.syedservices.com.pk/offices",
  },
};

export default function OfficesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Offices", url: "https://www.syedservices.com.pk/offices" }
        ]}
      />
      {children}
    </>
  );
}
