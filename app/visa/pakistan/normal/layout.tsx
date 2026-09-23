import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Pakistan Standard Visa Application & Guidelines",
  description:
    "Standard Pakistan visa processing guidelines, entry categories, required supporting credentials, and step-by-step application assistance.",
  alternates: {
    canonical: "/visa/pakistan/normal",
  },
  openGraph: {
    title: "Pakistan Standard Visa Application & Guidelines | Syed Services",
    description:
      "Standard Pakistan visa processing guidelines, entry categories, and step-by-step application assistance.",
    url: "https://www.syedservices.com.pk/visa/pakistan/normal",
  },
};

export default function PakistanNormalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Visa Services", url: "https://www.syedservices.com.pk/visa" },
          { name: "Pakistan Visa", url: "https://www.syedservices.com.pk/visa/pakistan" },
          { name: "Standard Visa", url: "https://www.syedservices.com.pk/visa/pakistan/normal" }
        ]}
      />
      {children}
    </>
  );
}
