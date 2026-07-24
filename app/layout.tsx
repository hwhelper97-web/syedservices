import "./globals.css";
import { Outfit } from "next/font/google";
import type { Metadata } from "next";
import { LanguageProvider } from "@/contexts/LanguageContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.syedservices.com.pk"),

  title: "Syed Services | Premier Visa & Travel Solutions",
  description:
    "Your trusted partner for visa processing, flight tickets, work permits, and immigration consultancy. Fast, reliable, and professional services.",

  keywords: [
    "visa services",
    "travel consultancy",
    "tickets",
    "flight booking",
    "work permits",
    "immigration",
    "Syed Services Pakistan",
  ],

  openGraph: {
    title: "Syed Services | Premier Visa & Travel Solutions",
    description:
      "Expert guidance for your international journey. Visa assistance, travel planning, and immigration support.",
    type: "website",
    url: "https://www.syedservices.com.pk",
    siteName: "Syed Services",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Syed Services",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Syed Services | Premier Visa & Travel Solutions",
    description:
      "Expert guidance for visas, immigration, and travel services.",
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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}