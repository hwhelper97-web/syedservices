import "./globals.css";
import { Outfit } from "next/font/google";
import { Metadata } from "next";
import { LanguageProvider } from "@/contexts/LanguageContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Syed Services | Premier Visa & Travel Solutions",
  description: "Your trusted partner for visa processing, flight tickets, work permits, and immigration consultancy. Fast, reliable, and professional services.",
  keywords: "visa services, travel consultancy, tickets, flight booking, work permits, immigration, Syed Services Pakistan",
  openGraph: {
    title: "Syed Services | Premier Visa & Travel Solutions",
    description: "Expert guidance for your international journey. Visa assistance, travel planning, and immigration support.",
    type: "website",
    url: "https://syedservices.com.pk",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.className} bg-[#020617] text-white antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}