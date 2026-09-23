import type { Metadata } from "next";
import { FaqJsonLd, BreadcrumbJsonLd, ServiceJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Pakistan Visa Online - Application, Fees & Requirements",
  description:
    "Apply for Pakistan Tourist E-Visa, Business Visa, Family Visit Visa, and Extensions online. Complete checklist of required documents, fees, and fast-track processing.",
  alternates: {
    canonical: "/visa/pakistan",
  },
  openGraph: {
    title: "Pakistan Visa Online - Application, Fees & Requirements | Syed Services",
    description:
      "Apply for Pakistan Tourist E-Visa, Business Visa, and Extensions online with verified embassy documentation support.",
    url: "https://www.syedservices.com.pk/visa/pakistan",
  },
};

const pakistanVisaFaqs = [
  {
    question: "How long does Pakistan Tourist E-Visa processing take?",
    answer: "Normal processing typically takes 7 to 10 working days, while urgent fast-track processing can be completed within 24 to 48 hours for eligible nationalities."
  },
  {
    question: "Can I extend my Pakistan tourist visa online?",
    answer: "Yes, tourist visas can be extended for up to 6 months through our assisted portal before the current visa expires."
  },
  {
    question: "What documents are required for a Pakistan tourist visa?",
    answer: "Standard requirements include a valid passport copy with at least 6 months validity, a recent photograph with a white background, and proof of stay or hotel booking."
  },
  {
    question: "Is Pakistan business visa available for foreign investors?",
    answer: "Yes, business visitors from 147 Business Friendly List (BVL) countries get prioritized processing upon providing an official invitation letter (E-LIV) or Chamber of Commerce documentation."
  }
];

export default function PakistanVisaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Visa Services", url: "https://www.syedservices.com.pk/visa" },
          { name: "Pakistan Visa", url: "https://www.syedservices.com.pk/visa/pakistan" }
        ]}
      />
      <ServiceJsonLd
        name="Pakistan Visa Application & Legal Consultancy"
        serviceType="VisaApplicationService"
        description="Official visa application processing and consultancy for Pakistan tourist, business, family, and extension visas."
      />
      <FaqJsonLd faqs={pakistanVisaFaqs} />
      {children}
    </>
  );
}
