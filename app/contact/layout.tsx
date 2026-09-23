import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Contact Us - 24/7 Visa & Travel Helpline",
  description:
    "Get in touch with Syed Services visa and immigration consultants. Call +92 309 9797771, WhatsApp directly, or email info@syedservices.com.pk for immediate case evaluations.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us - 24/7 Visa & Travel Helpline | Syed Services",
    description:
      "Get in touch with Syed Services visa consultants. Call +92 309 9797771 or WhatsApp for immediate assistance.",
    url: "https://www.syedservices.com.pk/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Contact", url: "https://www.syedservices.com.pk/contact" }
        ]}
      />
      {children}
    </>
  );
}
