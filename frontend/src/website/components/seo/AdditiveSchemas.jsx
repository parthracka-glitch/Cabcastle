import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * Additive JSON-LD Structured Data Components for Coastal Cabs Goa
 * 
 * Provides Google-compliant Rich Snippet schemas:
 * 1. FAQPage Schema (for About & FAQ questions)
 * 2. BreadcrumbList Schema (for rich snippet navigation trails)
 * 3. VehicleProductSchema (for Product & Offer rich cards in search)
 * 4. WebSiteSearchSchema (for Google Sitelinks Search Box)
 * 5. OrganizationFounderSchema (for Knowledge Graph & Entity Authority)
 */

const SITE_URL = "https://cabcastlegoa.com";

/**
 * FAQPage Schema
 * @param {Array<{question: string, answer: string}>} faqs
 */
export function FAQStructuredData({ faqs = [] }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

/**
 * BreadcrumbList Schema
 * @param {Array<{name: string, url: string}>} items
 */
export function BreadcrumbStructuredData({ items = [] }) {
  if (!items || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

/**
 * WebSite Sitelinks Searchbox Schema
 */
export function WebSiteSearchSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": SITE_URL,
    "name": "Cab Castle Goa",
    "alternateName": "Cab Castle",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/fleet?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

/**
 * Organization & Knowledge Graph Schema
 */
export function OrganizationFounderSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "name": "Cab Castle Goa",
    "legalName": "Cab Castle Goa Cabs & Tour Travels",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91 70266 48960",
      "contactType": "customer service",
      "contactOption": "TollFree",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi", "Konkani"]
    },
    "founder": {
      "@type": "Person",
      "name": "Dasgir Adur"
    },
    "knowsAbout": [
      "Goa Cab Packages",
      "Goa Tourism Transportation",
      "Hourly Rental Packages",
      "Airport Pickup and Drop",
      "Sedan, Ertiga & Innova MPV Transfers"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

/**
 * Vehicle Product & Offer Schema
 */
export function VehicleProductSchema({ vehicle }) {
  if (!vehicle) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": vehicle.title || vehicle.name,
    "image": vehicle.image_url?.startsWith("http") ? vehicle.image_url : `${SITE_URL}${vehicle.image_url}`,
    "description": vehicle.description || `${vehicle.title} cab in Goa with hourly tour packages and airport transfers.`,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brand || vehicle.title?.split(" ")[0] || "Cab Castle Goa"
    },
    "fuelType": vehicle.fuel_type || "Petrol",
    "vehicleTransmission": vehicle.transmission || "Manual",
    "vehicleSeatingCapacity": vehicle.seating || 5,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": vehicle.daily_rate || 2500,
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "url": `${SITE_URL}/fleet`,
      "seller": {
        "@type": "TaxiService",
        "name": "Cab Castle Goa"
      }
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export default {
  FAQStructuredData,
  BreadcrumbStructuredData,
  WebSiteSearchSchema,
  OrganizationFounderSchema,
  VehicleProductSchema,
};
