import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LocationSection from "../components/LocationSection";
import SEO from "../components/seo/SEO";
import { FAQStructuredData, BreadcrumbStructuredData } from "../components/seo/AdditiveSchemas";
import {
  ShieldCheck,
  Award,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  Car,
  ChevronRight,
  HelpCircle,
  Zap,
  Users,
  Compass,
  ArrowRight,
  Headphones,
  DollarSign,
  Fuel,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const STATS = [
  { value: "2019", label: "Serving Goa Since" },
  { value: "30+", label: "Verified Cabs" },
  { value: "20k+", label: "Completed Trips" },
  { value: "4.9★", label: "Customer Rating", highlight: true },
  { value: "100%", label: "Punctual Dispatch" },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Sanitized & Inspected Fleet",
    desc: "Every Sedan, Ertiga, and Innova undergoes multi-point safety verification, AC servicing, and deep cabin cleaning before every pickup.",
  },
  {
    icon: DollarSign,
    title: "Clear Packages & No Hidden Costs",
    desc: "Predictable hourly packages (8 hrs / 80 km) and fixed point-to-point airport transfer fares with zero hidden surcharges.",
  },
  {
    icon: Zap,
    title: "24/7 Airport & Station Meet-and-Greet",
    desc: "Punctual terminal pickup at Mopa (GOX), Dabolim (GOI), Margao & Thivim railway stations with direct driver coordination.",
  },
  {
    icon: Headphones,
    title: "Dedicated 24/7 Goa Dispatch Support",
    desc: "Our localized dispatch team is on 24-hour standby across North & South Goa for immediate ride assistance and itinerary coordination.",
  },
];

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "pricing", label: "Packages & Rates" },
  { id: "transfers", label: "Airport & Station Transfers" },
  { id: "rules", label: "Operating Rules" },
];

const FAQ_DATA = [
  {
    id: "faq-1",
    category: "pricing",
    question: "How do your hourly rental packages work in Goa?",
    answer:
      "Our standard hourly packages cover 8 hours and 80 kilometers per day. For a Sedan (Dzire/Aura) it is ₹2,500, Ertiga (7-Seater) is ₹3,000, and Toyota Innova Crysta is ₹3,500. Additional hours are charged at ₹250/hr and extra distance at ₹25/km. Night charges of ₹500 apply for travel beyond standard daytime hours.",
  },
  {
    id: "faq-2",
    category: "transfers",
    question: "What are your airport transfer rates for Mopa and Dabolim?",
    answer:
      "We offer transparent fixed point-to-point transfer rates: Sedan is ₹1,300, Ertiga is ₹1,600, and Innova is ₹2,200 for standard airport terminal pick-ups and drop-offs across North Goa.",
  },
  {
    id: "faq-3",
    category: "transfers",
    question: "What are the rates for Margao and Thivim Railway Stations?",
    answer:
      "For Margao Railway Station: Sedan is ₹1,500, Ertiga is ₹1,800, and Innova is ₹2,000. For Thivim Railway Station: Sedan is ₹1,100, Ertiga is ₹1,400, and Innova is ₹1,600.",
  },
  {
    id: "faq-4",
    category: "rules",
    question: "What documents are required to confirm a booking?",
    answer:
      "A Government-issued ID (Aadhaar Card, Passport, or Voter ID) and a contact phone number are required during booking to verify the reservation for cab dispatch.",
  },
  {
    id: "faq-5",
    category: "rules",
    question: "What is your cancellation and booking modification policy?",
    answer:
      "Free cancellations and 100% refunds are available when requested up to 24 hours prior to the scheduled pickup time. Modifications can be coordinated directly with our dispatch team on WhatsApp (+91 70266 48960).",
  },
  {
    id: "faq-6",
    category: "transfers",
    question: "How does airport terminal meet-and-greet work?",
    answer:
      "Our dispatch team tracks your flight status in real-time. When you exit the arrival terminal at Mopa (GOX) or Dabolim (GOI), your driver is positioned right outside for a seamless pickup without taxi queue delays.",
  },
];

export default function AboutPage({ defaultSection } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeFaqCategory, setActiveFaqCategory] = useState("all");

  useEffect(() => {
    if (defaultSection === "faq" || location.pathname.includes("faq") || location.hash === "#faqs") {
      const el = document.getElementById("faqs");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 120);
      }
    }
  }, [defaultSection, location]);

  const filteredFaqs =
    activeFaqCategory === "all"
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === activeFaqCategory);

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#063247] font-body flex flex-col justify-between selection:bg-[#063247] selection:text-white">
      <SEO
        title="About Cab Castle Goa — Tour Cabs, Airport Transfers & FAQs"
        description="Learn about Cab Castle Goa. Explore our hourly sightseeing packages, airport transfers, Sedan, Ertiga & Innova fleet standards, and complete FAQs."
        canonical="/about"
      />
      <FAQStructuredData faqs={FAQ_DATA} />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "About Us & FAQs", url: "/about" },
        ]}
      />

      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        {/* ── 1. HERO HEADER ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#4C606E] mb-6">
            <Link to="/" className="hover:text-[#063247] transition-colors">Home</Link>
            <ChevronRight size={13} className="text-[#8496A2]" />
            <span className="text-[#063247] font-bold">About Us &amp; FAQs</span>
          </div>

          <div className="relative bg-white border border-[#DFE8EC] rounded-[24px] p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063247] tracking-tight leading-tight font-display">
                Reliable Cabs, Honest Pricing, and Scenic Goa Journeys
              </h1>

              <p className="text-sm sm:text-base text-[#4C606E] leading-relaxed font-normal">
                Cab Castle Goa was built to provide tourists and locals with predictable hourly tour packages, punctual airport transfers, and well-maintained Sedans, Ertigas &amp; Innovas backed by 24/7 on-ground dispatch.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-8 border-t border-[#DFE8EC]">
              {STATS.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-[#F7F7F7] p-4 sm:p-5 rounded-[16px] text-center border border-[#DFE8EC]"
                >
                  <div className={`text-2xl sm:text-3xl font-black ${stat.highlight ? "text-[#288DA6]" : "text-[#063247]"}`}>
                    {stat.value}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[#4C606E] font-bold mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. STORY & SERVICE VISION ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Story Card */}
            <div className="lg:col-span-7 bg-white border border-[#DFE8EC] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#288DA6] uppercase tracking-wider">
                  <Award size={16} /> The Cab Castle Story
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063247] tracking-tight font-display">
                  Elevating Cab &amp; Travel Standards Across Goa
                </h2>
                <p className="text-xs sm:text-sm text-[#4C606E] leading-relaxed">
                  Headquartered in Assagao, Bardez, Cab Castle Goa was founded under the leadership of Dasgir Adur to deliver upfront, predictable transportation. We eliminate the frustration of fluctuating tourist rates, surge charges, and unprofessional services.
                </p>
                <p className="text-xs sm:text-sm text-[#4C606E] leading-relaxed">
                  Whether you require an 8-hour sightseeing tour across North Goa beaches, Old Goa churches, and Dudhsagar waterfalls or an on-time airport transfer at 3 AM, our verified fleet of comfortable Sedans, 7-seater Ertigas, and premium Innova Crystas are ready to serve you.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-[#DFE8EC] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#288DA6] font-bold bg-[#E4F2F5] px-3 py-1.5 rounded-full border border-[#288DA6]/30">
                  <CheckCircle2 size={16} />
                  <span>Licensed &amp; Verified Goa Cab Services</span>
                </div>
                <div className="text-xs text-[#4C606E]">
                  Owner &amp; Founder: <span className="font-bold text-[#063247]">Dasgir Adur</span>
                </div>
              </div>
            </div>

            {/* Quick Action Hub Info Card */}
            <div className="lg:col-span-5 bg-[#063247] text-white rounded-[24px] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#C3E7FA] mb-2 flex items-center gap-2">
                  <Compass size={16} /> Main Operations Hub
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 font-display">
                  Assagao &amp; Goa Airport Express
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-[#C3E7FA]/80">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#288DA6] shrink-0 mt-0.5" />
                    <span>Main Dispatch: Assagao, Bardez, North Goa 403507</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-[#288DA6] shrink-0 mt-0.5" />
                    <span>Dispatch Service: 24 Hours / 7 Days a Week</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone size={16} className="text-[#288DA6] shrink-0 mt-0.5" />
                    <span>Direct Hotline: +91 70266 48960</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail size={16} className="text-[#288DA6] shrink-0 mt-0.5" />
                    <span>Email: dasgiradur@gmail.com</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/fleet")}
                  className="bg-[#288DA6] hover:bg-[#22768C] text-white font-bold text-xs uppercase tracking-wider rounded-full h-10 flex-1 shadow-sm transition-all cursor-pointer"
                >
                  <Car size={14} className="mr-1.5" /> Browse Cabs
                </Button>
                <a
                  href="https://wa.me/917026648960?text=Hi%20Cab%20Castle%20Goa,%20I%20have%20an%20inquiry%20regarding%20cab%20packages"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-full h-10 px-5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle size={14} className="text-[#25D366]" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. FOUR PILLARS OF SERVICE ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063247] tracking-tight font-display">
              Why Travellers Choose Cab Castle Goa
            </h2>
            <p className="text-xs sm:text-sm text-[#4C606E] mt-1">
              Engineered for seamless travel across North &amp; South Goa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#DFE8EC] rounded-[24px] p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-[#288DA6] transition-colors"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#E4F2F5] text-[#288DA6] flex items-center justify-center mb-3">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-sm text-[#063247] mb-1.5 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. COMPREHENSIVE FAQS ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10" id="faqs">
          <div className="bg-white border border-[#DFE8EC] rounded-[24px] p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#DFE8EC]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#288DA6] uppercase tracking-wider mb-2">
                  <HelpCircle size={15} /> Frequently Asked Questions
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063247] tracking-tight font-display">
                  Everything You Need to Know
                </h2>
                <p className="text-xs sm:text-sm text-[#4C606E] mt-1">
                  Clear answers regarding hourly packages, airport transfers, and booking rules.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFaqCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeFaqCategory === cat.id
                        ? "bg-[#063247] text-white shadow-xs"
                        : "bg-[#F7F7F7] text-[#063247] hover:bg-[#E4F2F5] border border-[#DFE8EC]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion List */}
            <Accordion type="single" collapsible className="w-full space-y-3">
              {filteredFaqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border border-[#DFE8EC] rounded-[16px] px-5 py-1 bg-[#F7F7F7] data-[state=open]:bg-white data-[state=open]:border-[#288DA6] transition-colors"
                >
                  <AccordionTrigger className="text-left text-xs sm:text-sm font-bold text-[#063247] hover:no-underline py-3">
                    <span className="pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-[#4C606E] leading-relaxed pt-1 pb-3 font-normal">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── 5. BOTTOM CALL TO ACTION ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <div className="bg-[#063247] text-white rounded-[24px] p-8 sm:p-12 text-center relative overflow-hidden shadow-md">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                Ready to Book Your Ride in Goa?
              </h2>
              <p className="text-xs sm:text-sm text-[#C3E7FA]/80 leading-relaxed">
                Choose from our verified fleet of Sedans, Ertiga 7-seaters, and Innova Crystas with instant confirmation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button
                  onClick={() => navigate("/fleet")}
                  className="bg-[#288DA6] hover:bg-[#22768C] text-white font-bold text-xs uppercase tracking-wider rounded-full h-11 px-7 shadow-sm transition-all cursor-pointer"
                >
                  <span>Explore Available Cabs</span>
                  <ArrowRight size={14} className="ml-1.5" />
                </Button>
                <a
                  href="tel:+917026648960"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-full h-11 px-6 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone size={14} className="text-[#288DA6]" />
                  <span>Call +91 70266 48960</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LocationSection />

      <Footer />
    </div>
  );
}
