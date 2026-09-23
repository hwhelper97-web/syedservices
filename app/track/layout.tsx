import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Track Visa Application Status Online",
  description:
    "Check real-time status of your Pakistan visa, exit permit, or consular file using your tracking ID or passport number. Live updates from Syed Services operations center.",
  alternates: {
    canonical: "/track",
  },
  openGraph: {
    title: "Track Visa Application Status Online | Syed Services",
    description:
      "Check real-time status of your Pakistan visa or consular dossier using your tracking ID.",
    url: "https://www.syedservices.com.pk/track",
  },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Track Application", url: "https://www.syedservices.com.pk/track" }
        ]}
      />
      {children}
    </>
  );
}
