import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * Enterprise SEO & GEO (Generative Engine Optimization) Manager.
 * Dynamically manages meta tags, canonical URLs, OpenGraph, Twitter cards,
 * and Schema.org JSON-LD structured data for search engine & AI LLM discoverability.
 */
export default function SEO({
  title = "Cab Castle Goa — Premium Cabs & Tour Travels in Goa",
  description = "Book premium cabs & tour packages in Goa. Hourly sightseeing packages (8 hrs / 80 km) & point-to-point airport transfers with zero hidden charges. Sedans, SUVs & Hatchbacks.",
  canonical = "https://cabcastlegoa.com",
  ogType = "website",
  ogImage = "https://cabcastlegoa.com/logo.png",
  schema = null,
  noindex = false,
}) {
  const siteUrl = "https://cabcastlegoa.com";
  const fullCanonical = canonical.startsWith("http") ? canonical : `${siteUrl}${canonical}`;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`;

  // Default Schema.org LocalBusiness & TaxiService structured data
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "name": "Cab Castle Goa",
    "alternateName": "Cab Castle",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "image": `${siteUrl}/logo.png`,
    "description": description,
    "telephone": "+91 70266 48960",
    "email": "dasgiradur@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Assagao Dispatch Hub",
      "addressLocality": "Assagao, Bardez, North Goa",
      "addressRegion": "Goa",
      "postalCode": "403507",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 15.5898,
      "longitude": 73.7745
    },
    "priceRange": "₹1100 - ₹3500",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "areaServed": [
      { "@type": "AdministrativeArea", "name": "North Goa" },
      { "@type": "AdministrativeArea", "name": "South Goa" },
      { "@type": "Airport", "name": "Dabolim Airport (GOI)" },
      { "@type": "Airport", "name": "Mopa Airport (GOX)" }
    ],
    "sameAs": [
      "https://wa.me/917026648960"
    ]
  };

  const activeSchema = schema || defaultSchema;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* GEO & AI Search Optimization Tags */}
      <meta name="geo.region" content="IN-GA" />
      <meta name="geo.placename" content="Assagao, Goa" />
      <meta name="geo.position" content="15.5898;73.7745" />
      <meta name="ICBM" content="15.5898, 73.7745" />
      <meta name="ai-site-category" content="Cab Rental & Tour Travel Service" />
      <meta name="ai-coverage" content="North Goa, South Goa, Dabolim Airport GOI, Mopa Airport GOX, Margao, Thivim" />

      {/* OpenGraph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Cab Castle Goa" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(activeSchema)}
      </script>
    </Helmet>
  );
}
