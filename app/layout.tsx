import "./globals.css";
import { Outfit } from "next/font/google";
import type { Metadata } from "next";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OrganizationJsonLd, LocalBusinessJsonLd } from "@/components/JsonLd";

const outfit = Outfit({ 
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.syedservices.com.pk"),

  title: {
    default: "Syed Services | Premier Visa & Travel Solutions",
    template: "%s | Syed Services",
  },
  description:
    "Your trusted partner for visa processing, flight tickets, work permits, and immigration consultancy. Fast, reliable, and professional services worldwide.",

  keywords: [
    "Pakistan visa services",
    "Pakistan e-visa application",
    "Pakistan exit permit",
    "travel consultancy Peshawar",
    "flight booking",
    "work permits",
    "immigration consultant",
    "Syed Services Pakistan",
    "Syed Services Jalalabad"
  ],

  authors: [{ name: "Syed Services", url: "https://www.syedservices.com.pk" }],
  creator: "Syed Services",
  publisher: "Syed Services",

  alternates: {
    canonical: "https://www.syedservices.com.pk",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Syed Services | Premier Visa & Travel Solutions",
    description:
      "Expert guidance for your international journey. Visa assistance, travel planning, and immigration support.",
    type: "website",
    url: "https://www.syedservices.com.pk",
    siteName: "Syed Services",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Syed Services - Premier Visa & Travel Consultancy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Syed Services | Premier Visa & Travel Solutions",
    description:
      "Expert guidance for visas, immigration, and travel services worldwide.",
    creator: "@syedservices",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${outfit.className} bg-[#020617] text-white antialiased`}
        suppressHydrationWarning
      >
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}