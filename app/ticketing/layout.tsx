import type { Metadata } from "next";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "International Flight Booking & Airline Ticketing",
  description:
    "Compare and reserve international flight tickets with competitive fares. Instant confirmations, group booking discounts, and flexible rescheduling with Syed Services.",
  alternates: {
    canonical: "/ticketing",
  },
  openGraph: {
    title: "International Flight Booking & Airline Ticketing | Syed Services",
    description:
      "Compare and reserve international flight tickets with competitive fares and 24/7 travel desk assistance.",
    url: "https://www.syedservices.com.pk/ticketing",
  },
};

export default function TicketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Flight Ticketing", url: "https://www.syedservices.com.pk/ticketing" }
        ]}
      />
      <ServiceJsonLd
        name="International Flight Reservation & Ticketing"
        serviceType="TravelBookingService"
        description="Air ticket reservations, flight schedule management, and group travel fare discounts."
      />
      {children}
    </>
  );
}
