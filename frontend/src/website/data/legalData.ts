export interface LegalSection {
  slug: string;
  title: string;
  category: "Legal & Terms" | "Privacy & Data" | "Bookings & Refunds" | "Safety & Security";
  shortDescription: string;
  lastUpdated: string;
  statutoryReference: string;
  content: {
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }[];
}

export const GRIEVANCE_OFFICER = {
  name: "Dasgir Adur",
  designation: "Owner & Compliance Officer",
  company: "Cab Castle Goa",
  address: "Assagao, Bardez - Goa 403507, India",
  email: "dasgiradur@gmail.com",
  hotline: "+91 70266 48960",
  workingHours: "Monday to Saturday, 09:00 AM – 06:00 PM IST",
  responseSLA: "Within 24 hours of formal receipt",
};

export const LEGAL_POLICIES: Record<string, LegalSection> = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    category: "Privacy & Data",
    shortDescription: "Comprehensive personal data handling under the Digital Personal Data Protection Act, 2023 (DPDP) and IT Act 2000.",
    lastUpdated: "August 2026",
    statutoryReference: "Digital Personal Data Protection Act (DPDP), 2023 & Section 43A of Information Technology Act, 2000",
    content: [
      {
        heading: "1. Scope & Commitment",
        paragraphs: [
          "Cab Castle Goa ('Cab Castle', 'we', 'us', or 'our') is committed to protecting your personal data and privacy. This Privacy Policy governs the collection, processing, storage, and transfer of data collected via our website (cabcastlegoa.com), mobile interfaces, dispatch helplines, and WhatsApp booking channels.",
          "By accessing our platform or booking our cab packages, sightseeing tours, or airport transfers, you consent to the processing of your personal information in accordance with this Privacy Policy and the Digital Personal Data Protection Act, 2023 (DPDP Act).",
        ],
      },
      {
        heading: "2. Personal Data We Collect",
        bullets: [
          "Identity & Contact Information: Full legal name, mobile phone number, WhatsApp contact, email address, and billing address.",
          "Verification Documents: Valid Aadhaar Card / Passport / Voter ID for passenger security and cab dispatch verification.",
          "Booking & Trip Data: Pickup and drop-off coordinates, flight numbers for airport transfers, trip duration, vehicle model preference, and emergency contacts.",
          "Financial & Payment Information: Encrypted transaction identifiers and payment mode. We DO NOT store credit card numbers, CVVs, or UPI PINs on our servers.",
          "Technical & Telemetry Data: IP address, device identifier, browser type, operating system, and vehicle dispatch logs for passenger safety.",
        ],
      },
      {
        heading: "3. Purpose and Legal Grounds for Processing",
        paragraphs: [
          "We process your data strictly under lawful consent and contractual necessity to provide safe transportation and cab rental services in Goa:",
        ],
        bullets: [
          "Dispatching drivers, vehicles, and real-time pickup confirmations via SMS/WhatsApp.",
          "Executing passenger verification mandated under local transport rules.",
          "Processing payments, invoices, refunds, and receipts.",
          "Providing 24/7 on-ground assistance and handling customer grievance inquiries.",
          "Complying with statutory reporting requirements by law enforcement or transport authorities.",
        ],
      },
      {
        heading: "4. Data Retention & Erasure Rights",
        paragraphs: [
          "We retain your personal and trip data only for as long as necessary to fulfill the purposes outlined or as required by Indian taxation (GST) and transport laws (minimum 7 years for financial records).",
          "Under the DPDP Act 2023, you have the right to request access, correction, withdrawal of consent, or erasure of your personal data by contacting our Grievance Officer.",
        ],
      },
    ],
  },

  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    category: "Legal & Terms",
    shortDescription: "Legally binding conditions governing cab bookings, sightseeing tours, payments, and client responsibilities.",
    lastUpdated: "August 2026",
    statutoryReference: "Indian Contract Act, 1872 & Consumer Protection (E-Commerce) Rules, 2020",
    content: [
      {
        heading: "1. Agreement to Terms",
        paragraphs: [
          "These Terms of Service constitute a legally binding agreement between you ('Customer' or 'Rider') and Cab Castle Goa ('Cab Castle'). By booking a tour cab or airport transfer, you agree to comply with all terms herein and all applicable Goa State Transport regulations.",
        ],
      },
      {
        heading: "2. Cab Packages with Driver (8 Hours / 80 Kilometers)",
        bullets: [
          "Tour packages standard usage is capped at 8 continuous hours and 80 running kilometers from designated start time.",
          "Extra usage beyond package limits will be billed at ₹250 per additional hour and ₹25 per additional kilometer.",
          "Night driving allowance (after 10:00 PM) applies at ₹500 for driver allowance.",
          "Parking fees, inter-state permit fees (if entering neighboring states), and commercial toll booth charges are to be settled directly by the passenger unless specified.",
        ],
      },
      {
        heading: "3. Booking & Passenger Conduct",
        bullets: [
          "Valid Government ID (Aadhaar Card / Passport) is required for verification before cab dispatch.",
          "Passengers are requested to maintain vehicle decorum and avoid smoking inside the air-conditioned cabin.",
          "Commercial cargo transportation or carrying illegal substances is strictly forbidden.",
        ],
      },
      {
        heading: "4. Limitation of Liability",
        paragraphs: [
          "Cab Castle Goa shall not be liable for missed flights or train connections resulting from extreme traffic bottlenecks, monsoon waterlogging, state strikes, or unexpected road closures. Passengers are advised to buffer adequate travel time for Goa airport transfers.",
        ],
      },
    ],
  },

  "cookie-policy": {
    slug: "cookie-policy",
    title: "Cookie Policy",
    category: "Privacy & Data",
    shortDescription: "Detailed breakdown of technical, functional, analytics, and marketing cookies utilized across our web portal.",
    lastUpdated: "August 2026",
    statutoryReference: "Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021",
    content: [
      {
        heading: "1. What Are Cookies?",
        paragraphs: [
          "Cookies are small alphanumeric text files stored in your web browser that enable websites to recognize your session, remember your preferences (such as selected pickup locations), and ensure secure booking checkout.",
        ],
      },
      {
        heading: "2. Categories of Cookies We Use",
        table: {
          headers: ["Category", "Purpose", "Default State", "Retention"],
          rows: [
            ["Strictly Necessary", "Session tokens, authentication, CSRF security, booking cart persistence", "Always Active", "Session / 30 Days"],
            ["Functional Cookies", "Remembers preferred car category, language, pickup location", "Opt-In Available", "90 Days"],
            ["Performance & Analytics", "Anonymous traffic measurements, load balancing, page speed telemetry", "Opt-In Available", "180 Days"],
            ["Marketing / Advertising", "Measures effectiveness of Google Ads and promotional travel discounts", "Opt-In Available", "90 Days"],
          ],
        },
      },
      {
        heading: "3. Managing Cookie Preferences",
        paragraphs: [
          "You can customize your cookie consent at any time by clicking the 'Cookie Preferences' link in the footer or accessing our interactive preference center. You can also block cookies via your browser settings.",
        ],
      },
    ],
  },

  "refund-policy": {
    slug: "refund-policy",
    title: "Refund Policy",
    category: "Bookings & Refunds",
    shortDescription: "Transparent refund processing terms, payment gateway SLAs, and statutory security deposit return timelines.",
    lastUpdated: "August 2026",
    statutoryReference: "Consumer Protection (E-Commerce) Rules, 2020 & RBI Master Directions on Online Transactions",
    content: [
      {
        heading: "1. Refund Eligibility Matrix",
        paragraphs: [
          "Refunds for cancelled cab bookings are processed automatically via the original payment source according to the following SLA:",
        ],
        table: {
          headers: ["Scenario", "Cancellation Notice", "Refund Amount", "Processing SLA"],
          rows: [
            ["Cab / Tour Package", "More than 24h prior to pickup", "100% Full Refund", "3–5 Business Days"],
            ["Cab / Tour Package", "12h to 24h prior to pickup", "75% Refund (25% dispatch fee)", "3–5 Business Days"],
            ["Cab / Tour Package", "Less than 12h prior to pickup", "50% Refund", "5–7 Business Days"],
            ["Airport Express Transfer", "Flight delayed / rescheduled > 4h", "100% Free Reschedule or Refund", "3–5 Business Days"],
          ],
        },
      },
      {
        heading: "2. Payment Security Protocol",
        paragraphs: [
          "For confirmed bookings, all payments and any eligible refunds are audited directly by our accounts desk ensuring complete transparency and statutory consumer protection compliance.",
        ],
      },
    ],
  },

  "cancellation-policy": {
    slug: "cancellation-policy",
    title: "Cancellation Policy",
    category: "Bookings & Refunds",
    shortDescription: "Rules and terms for cancelling or rescheduling pre-booked tour cabs and airport pickups in Goa.",
    lastUpdated: "August 2026",
    statutoryReference: "Consumer Protection Act, 2019 & E-Commerce Guidelines",
    content: [
      {
        heading: "1. How to Cancel or Modify a Booking",
        paragraphs: [
          "Bookings can be cancelled or rescheduled effortlessly through our website or by messaging our 24/7 Dispatch Hotline on WhatsApp (+91 70266 48960).",
        ],
      },
      {
        heading: "2. Free Rescheduling Guarantee",
        paragraphs: [
          "We understand travel itineraries change. Customers may reschedule their trip date or time at ZERO penalty fee up to 6 hours before scheduled pickup, subject to vehicle availability in that category.",
        ],
      },
      {
        heading: "3. No-Show Policy",
        paragraphs: [
          "For airport pickups (Mopa GOX / Dabolim GOI), the driver will wait for up to 60 minutes past the actual flight touchdown time free of charge. If the passenger fails to arrive or contact dispatch within 90 minutes of touchdown, the booking will be marked as a No-Show.",
        ],
      },
    ],
  },

  "shipping-policy": {
    slug: "shipping-policy",
    title: "Cab Dispatch & Reporting Policy",
    category: "Bookings & Refunds",
    shortDescription: "Driver reporting, hotel pickup, and airport terminal meet-and-greet terms for cab dispatch.",
    lastUpdated: "August 2026",
    statutoryReference: "Goa Motor Vehicles Rules",
    content: [
      {
        heading: "1. Service Area & Dispatch Hubs",
        paragraphs: [
          "Cab Castle Goa offers on-time cab dispatch across all prominent areas of Goa, including Candolim, Calangute, Baga, Anjuna, Vagator, Panaji, Morjim, Arambol, Mopa Airport (GOX), Dabolim Airport (GOI), and railway stations (Thivim, Karmali, Margao).",
        ],
      },
      {
        heading: "2. Timelines & Airport Express Handover",
        bullets: [
          "Standard Hotel / Resort Pickup: Driver arrives 15 minutes prior to requested start time.",
          "Airport Pickup: Driver tracks incoming flights and meets passenger outside Arrival Exit Terminal.",
          "Sanitization & Vehicle Check: All cabs are thoroughly cleaned, AC verified, and fuel topped prior to arrival.",
        ],
      },
    ],
  },

  "return-policy": {
    slug: "return-policy",
    title: "Trip Completion & Billing Policy",
    category: "Bookings & Refunds",
    shortDescription: "Protocol for trip completion, extra hours/km settlement, and replacement vehicle policies.",
    lastUpdated: "August 2026",
    statutoryReference: "Motor Vehicles Act, 1988",
    content: [
      {
        heading: "1. Trip Completion & Settlement",
        paragraphs: [
          "Upon completion of the sightseeing tour or transfer, the final bill will be verified against the agreed package. Extra hours (₹250/hr) and extra kilometers (₹25/km) if any will be tallied with the guest.",
        ],
      },
      {
        heading: "2. Breakdown & Vehicle Replacement SLA",
        paragraphs: [
          "In the unlikely event of mechanical failure, our rapid dispatch team guarantees an immediate replacement cab anywhere in North Goa within 45 minutes and South Goa within 75 minutes at no extra charge.",
        ],
      },
    ],
  },

  "disclaimer": {
    slug: "disclaimer",
    title: "Legal Disclaimer",
    category: "Legal & Terms",
    shortDescription: "Clarification of liability boundaries, weather contingencies, ferry crossings, and route estimations in Goa.",
    lastUpdated: "August 2026",
    statutoryReference: "Section 79 of Information Technology Act, 2000",
    content: [
      {
        heading: "1. General Information Purpose",
        paragraphs: [
          "The information and fare estimates published on cabcastlegoa.com are provided for general guidance. While we endeavor to maintain real-time vehicle availability and accurate route estimations, actual transit times may vary due to Goa traffic conditions, monsoon weather, or local road repairs.",
        ],
      },
      {
        heading: "2. Third-Party Links & Services",
        paragraphs: [
          "Our platform integrates with Google Maps and standard payment gateways. Cab Castle Goa assumes no liability for independent external server downtimes or API availability.",
        ],
      },
    ],
  },

  "accessibility-statement": {
    slug: "accessibility-statement",
    title: "Accessibility Statement",
    category: "Legal & Terms",
    shortDescription: "Our commitment to digital accessibility, WCAG 2.1 Level AA compliance, and accessible transit in Goa.",
    lastUpdated: "August 2026",
    statutoryReference: "Rights of Persons with Disabilities Act, 2016 & Web Content Accessibility Guidelines (WCAG 2.1 AA)",
    content: [
      {
        heading: "1. Digital Accessibility Standards",
        paragraphs: [
          "Cab Castle Goa is dedicated to making our digital booking services accessible to travelers of all abilities. We strive to adhere to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.",
        ],
        bullets: [
          "High-contrast text design (minimum 4.5:1 ratio for standard copy) for enhanced legibility.",
          "Full keyboard navigability across all booking forms, date pickers, and modal dialogues.",
          "Descriptive alt tags on all vehicle fleet photographs and visual assets.",
          "Accessible semantic HTML markup with screen reader ARIA landmarks.",
        ],
      },
      {
        heading: "2. Accessible Physical Fleet Accommodations",
        paragraphs: [
          "We offer wheelchair-friendly SUV vehicles (Innova Crysta / Ertiga) with low-floor step boards and spacious luggage boots for mobility aids. Please notify dispatch in advance so our driver can assist with boarding.",
        ],
      },
    ],
  },

  "dpa": {
    slug: "dpa",
    title: "Data Processing Agreement (DPA)",
    category: "Privacy & Data",
    shortDescription: "Terms governing transport data processing and personal data handling under DPDP Act 2023.",
    lastUpdated: "August 2026",
    statutoryReference: "Digital Personal Data Protection Act, 2023 (Section 8 — Obligations of Data Fiduciary)",
    content: [
      {
        heading: "1. Applicability & Roles",
        paragraphs: [
          "This Data Processing Agreement ('DPA') supplements our Terms of Service for corporate clients, event planners, and individual consumers where Cab Castle Goa processes personal data on behalf of travelers.",
          "For the purposes of this Agreement, Cab Castle Goa operates as a 'Data Fiduciary' under Indian Law, ensuring that all processing is strictly limited to authorized itinerary fulfillment.",
        ],
      },
      {
        heading: "2. Data Protection Safeguards",
        bullets: [
          "Personal data is encrypted in transit using TLS 1.3 cryptographic protocols and stored on secure cloud clusters located within the Republic of India.",
          "Access to passenger contact information is strictly restricted to assigned drivers for the duration of the active trip only.",
          "Third-party sub-processors (SMS gateway, payment processor) are vetted for strict statutory DPDP compliance.",
        ],
      },
    ],
  },

  "acceptable-use": {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    category: "Safety & Security",
    shortDescription: "Mandatory passenger conduct and prohibition of illegal cargo under Goa Police mandates.",
    lastUpdated: "August 2026",
    statutoryReference: "Motor Vehicles Act, 1988 & Goa Police Act",
    content: [
      {
        heading: "1. Safety & Passenger Conduct",
        paragraphs: [
          "Zero-tolerance policy for unruly behavior, harassment of drivers, or carrying illegal substances. Any violation will result in immediate termination of the trip without refund and notification to Goa Police authorities.",
        ],
      },
      {
        heading: "2. Prohibited Activities",
        bullets: [
          "Demanding drivers to operate on Goa beaches or protected sand dunes (strictly banned by Goa Tourism & Police).",
          "Carrying contraband, illicit liquor across state check-posts, or exceeding legal passenger seating capacity.",
          "Smoking or consuming alcohol inside the vehicle.",
        ],
      },
    ],
  },

  "security-policy": {
    slug: "security-policy",
    title: "Security Policy",
    category: "Safety & Security",
    shortDescription: "Infrastructure security, TLS 1.3 encryption, tokenized authentication, and PCI-DSS compliance.",
    lastUpdated: "August 2026",
    statutoryReference: "Information Technology (Reasonable Security Practices and Procedures) Rules, 2011 (Section 43A)",
    content: [
      {
        heading: "1. Data & Transport Encryption",
        paragraphs: [
          "All web traffic between your browser and our dispatch backend is encrypted with 256-bit TLS 1.3 certificates. Database backups are AES-256 encrypted at rest.",
        ],
      },
      {
        heading: "2. Payment Security",
        paragraphs: [
          "Online transactions are processed via RBI-authorized, certified payment gateways. No credit card numbers, CVVs, or bank net banking passwords ever touch or reside on our application servers.",
        ],
      },
      {
        heading: "3. Fleet Safety & Vehicle Tracking",
        paragraphs: [
          "All fleet vehicles are equipped with certified GPS tracking modules and emergency SOS triggers for passenger security, monitored in real time by our 24/7 Goa Operations Command Center.",
        ],
      },
    ],
  },

  "responsible-disclosure": {
    slug: "responsible-disclosure",
    title: "Responsible Disclosure Policy",
    category: "Safety & Security",
    shortDescription: "Guidelines for security researchers to discover and report vulnerabilities in our web infrastructure.",
    lastUpdated: "August 2026",
    statutoryReference: "CERT-In Guidelines & Information Technology Act, 2000",
    content: [
      {
        heading: "1. Security Researcher Program",
        paragraphs: [
          "We value the contribution of independent security researchers in keeping Cab Castle Goa and our travelers safe. If you discover a security vulnerability in our web application or API endpoints, we welcome your responsible disclosure.",
        ],
      },
      {
        heading: "2. Scope & Safe Harbor",
        bullets: [
          "In-Scope: `cabcastlegoa.com`, API endpoints under `/api/*`, and authentication endpoints.",
          "Out-of-Scope: Denial of Service (DoS/DDoS) attacks, social engineering of employees/drivers, physical security.",
          "Safe Harbor: If you act in good faith, do not access or compromise customer private data, and give us a reasonable window (14 days) to patch before public disclosure, Cab Castle Goa will not initiate legal action.",
        ],
      },
      {
        heading: "3. How to Report",
        paragraphs: [
          "Email your Proof of Concept (PoC) to `dasgiradur@gmail.com` with subject '[SECURITY DISCLOSURE] Vulnerability in Cab Castle Goa'. Our technical team will acknowledge within 24 hours.",
        ],
      },
    ],
  },

  "community-guidelines": {
    slug: "community-guidelines",
    title: "Community Guidelines",
    category: "Safety & Security",
    shortDescription: "Code of conduct ensuring mutual respect, safe journeys, and anti-harassment standards between riders and drivers.",
    lastUpdated: "August 2026",
    statutoryReference: "Goa Tourism Development & Passenger Safety Standards",
    content: [
      {
        heading: "1. Mutual Respect & Zero Tolerance for Harassment",
        paragraphs: [
          "Every journey with Cab Castle Goa is founded on mutual courtesy. We enforce a zero-tolerance policy against verbal abuse, physical harassment, discriminatory remarks, or unsafe demands directed towards drivers or fellow passengers.",
        ],
      },
      {
        heading: "2. Cleanliness & Vehicle Care",
        paragraphs: [
          "Please keep the vehicle clean. Eating messy snacks, spilling drinks, or smoking inside vehicles is prohibited. Drivers have the right to decline service to heavily intoxicated individuals who present an immediate safety hazard.",
        ],
      },
    ],
  },
};
