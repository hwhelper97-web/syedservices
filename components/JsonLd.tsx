import React from "react";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.syedservices.com.pk/#organization",
    "name": "Syed Services",
    "alternateName": "Syed Services Pvt Ltd",
    "url": "https://www.syedservices.com.pk",
    "logo": "https://www.syedservices.com.pk/og-image.jpg",
    "description": "Premier international visa assistance, immigration consultancy, flight ticketing, and travel advisory services.",
    "email": "info@syedservices.com.pk",
    "telephone": "+92 309 9797771",
    "sameAs": [
      "https://www.instagram.com/syed_servicesndconsultant?stkn=NmQ0dnJ3NnBienQz",
      "https://www.facebook.com/share/g/14nEsAPNEmD/?mibextid=wwXIfr",
      "https://twitter.com/syedservices",
      "https://linkedin.com/company/syedservices"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+92 309 9797771",
        "contactType": "customer service",
        "areaServed": ["PK", "AF", "AE", "SA", "Worldwide"],
        "availableLanguage": ["English", "Urdu", "Pashto", "Dari", "Arabic"]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": "https://www.syedservices.com.pk/#localbusiness",
    "name": "Syed Services Pakistan Head Office",
    "image": "https://www.syedservices.com.pk/og-image.jpg",
    "url": "https://www.syedservices.com.pk",
    "telephone": "+92 309 9797771",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gt Road, Peshawar",
      "addressLocality": "Peshawar",
      "addressRegion": "Khyber Pakhtunkhwa",
      "postalCode": "25000",
      "addressCountry": "PK"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "currenciesAccepted": "USD, PKR, AFN"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceJsonLd({
  name,
  description,
  serviceType,
  providerName = "Syed Services",
}: {
  name: string;
  description: string;
  serviceType: string;
  providerName?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "serviceType": serviceType,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": providerName,
      "url": "https://www.syedservices.com.pk"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Worldwide"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
