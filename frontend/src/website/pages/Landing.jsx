/* Coastal Cabs Goa Design System */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SEO from "../components/seo/SEO";
import { WebSiteSearchSchema, OrganizationFounderSchema } from "../components/seo/AdditiveSchemas";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LocationSection from "../components/LocationSection";
import VehicleCard from "../components/VehicleCard";
import Marquee from "react-fast-marquee";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Car,
  Check,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Star,
  Phone,
  ArrowRight,
  Headphones,
  MessageSquare,
  Plane,
  Clock,
  Key,
  Compass,
  Sparkles,
} from "lucide-react";
import api, { formatINR } from "@/lib/api";
import { MASTER_FLEET } from "../data/fleetData";
import WhatsAppInquiryModal from "../components/WhatsAppInquiryModal";

export function GoogleIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

const STARTER_FEATURED_VEHICLES = [
  {
    id: "v-sedan-dzire",
    title: "Comfort Sedan (Maruti Dzire / Hyundai Aura)",
    category: "Sedan",
    daily_rate: 2500,
    fuel_type: "Petrol",
    seating: 5,
    image_url: "/vehicles/maruti_dzire.webp",
    status: "Available",
    description: "Comfortable and reliable AC sedan for local city sightseeing, airport runs, and full-day tours with driver.",
  },
  {
    id: "v-ertiga-7seater",
    title: "Maruti Suzuki Ertiga (7-Seater MPV)",
    category: "SUV",
    daily_rate: 3000,
    fuel_type: "Petrol",
    seating: 7,
    image_url: "/vehicles/maruti_ertiga_2022.webp",
    status: "Available",
    description: "Spacious 7-seater MPV with dual AC, flexible luggage room for family sightseeing and group road trips.",
  },
  {
    id: "v-innova-crysta",
    title: "Toyota Innova Crysta (Executive MPV)",
    category: "SUV",
    daily_rate: 3500,
    fuel_type: "Diesel",
    seating: 7,
    image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    status: "Available",
    description: "Premium executive luxury MPV with plush captain seating, unmatched highway comfort, and spacious luggage room.",
  },
];

const TRUST_FEATURES = [
  {
    icon: <Clock className="w-5 h-5 text-[#288DA6]" />,
    title: "8h / 80km Tour Packages",
    desc: "Fixed packages (Sedan ₹2,500 | Ertiga ₹3,000 | Innova ₹3,500) with transparent extra hour (₹250/hr) and extra km (₹25/km).",
  },
  {
    icon: <Compass className="w-5 h-5 text-[#288DA6]" />,
    title: "North & South Goa Sightseeing",
    desc: "Curated tours covering popular beaches, historic churches, temples, spice plantations, and Dudhsagar waterfalls.",
  },
  {
    icon: <Plane className="w-5 h-5 text-[#288DA6]" />,
    title: "24/7 Airport & Station Transfers",
    desc: "Direct pickup at Mopa (GOX), Dabolim (GOI), Margao & Thivim railway stations from just ₹1,100.",
  },
  {
    icon: <Headphones className="w-5 h-5 text-[#288DA6]" />,
    title: "Instant WhatsApp Booking",
    desc: "Fast coordination, sanitized cabs, professional courteous drivers, and 24/7 dedicated assistance.",
  },
];

const TESTIMONIALS = [
  {
    name: "Rohan Malhotra",
    location: "Mumbai",
    rating: 5,
    date: "February 2026",
    trip: "North Goa Beach Tour",
    car: "Maruti Ertiga (7-Seater)",
    comment: "Booking our cab with Cab Castle Goa was completely hassle-free! The driver arrived right outside Mopa airport on time, the car was spotless, and pricing was 100% transparent.",
  },
  {
    name: "Ananya Sharma",
    location: "Bengaluru",
    rating: 5,
    date: "January 2026",
    trip: "South Goa Tour Package",
    car: "Comfort Sedan Dzire",
    comment: "Excellent cab service! We booked the 8h/80km tour package with driver for our South Goa church and beach tour. Extremely polite driver and completely honest pricing.",
  },
  {
    name: "Vikram & Pooja",
    location: "Delhi NCR",
    rating: 5,
    date: "December 2025",
    trip: "Innova Airport Transfer & Tour",
    car: "Toyota Innova Crysta",
    comment: "The Innova Crysta was in pristine condition. Captain seats were super comfortable for the long drive from Dabolim. Very courteous team!",
  },
  {
    name: "Siddharth Roy",
    location: "Kolkata",
    rating: 5,
    date: "February 2026",
    trip: "North Goa Beach Hopper",
    car: "Baleno AC Cab",
    comment: "Booked a cab for 3 days sightseeing. Experienced driver navigated narrow lanes effortlessly and shared great local food recommendations. Excellent service!",
  },
  {
    name: "Priya Nair",
    location: "Hyderabad",
    rating: 5,
    date: "January 2026",
    trip: "Family Vacation",
    car: "Kia Carens (7-Seater)",
    comment: "Super transparent pricing with zero hidden surcharges. Driver arrived 15 minutes before pickup time at Candolim resort. 10/10 recommended for families.",
  },
  {
    name: "Arjun Mehta",
    location: "Pune",
    rating: 5,
    date: "February 2026",
    trip: "Airport Express Transfer",
    car: "Swift Hatchback",
    comment: "Flight was delayed by 2 hours at Mopa GOX, but driver was waiting patiently outside the exit gate. Super smooth communication on WhatsApp!",
  },
];

const HERO_CAROUSEL_SLIDES = [
  {
    id: "v-ertiga-7seater",
    title: "Maruti Ertiga (7-Seater MPV)",
    subtitle: "Spacious Family Cruiser with Captain Comfort",
    tag: "Tour Cab with Driver",
    rate: "From ₹3,000 / 8h",
    rating: "4.9★ (2,500+ Trips)",
    image: "/vehicles/maruti_ertiga_2022.webp",
    fallback: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    service: "tour",
  },
  {
    id: "v-innova-crysta",
    title: "Toyota Innova Crysta (Luxury)",
    subtitle: "Premium Cab Tour & Airport Express",
    tag: "VIP Cab with Driver",
    rate: "From ₹3,500 / 8h",
    rating: "5.0★ (1,800+ Trips)",
    image: "/vehicles/toyota_innova_crysta.webp",
    fallback: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    service: "tour",
  },
  {
    id: "v-sedan-dzire",
    title: "Maruti Dzire AC Sedan",
    subtitle: "Comfort Sedan for City Sightseeing & Airport Runs",
    tag: "Executive AC Sedan",
    rate: "From ₹2,500 / 8h",
    rating: "4.9★ (3,200+ Trips)",
    image: "/vehicles/maruti_dzire.webp",
    fallback: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
    service: "tour",
  },
  {
    id: "v-creta-suv",
    title: "Hyundai Creta / Grand Vitara",
    subtitle: "Executive Luxury SUV with Polite Driver",
    tag: "Executive Compact SUV",
    rate: "From ₹3,200 / 8h",
    rating: "4.9★ (1,400+ Trips)",
    image: "/vehicles/hyundai_creta_2023.webp",
    fallback: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    service: "tour",
  },
];

export default function Landing() {
  const nav = useNavigate();

  // Active Category Filter for fleet catalog
  const [activeCategory, setActiveCategory] = useState("All");

  // Hero Carousel Slide State
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (isHeroHovered) return;
    const timer = setInterval(() => {
      setHeroSlideIdx((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  const handleHeroPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeroSlideIdx((prev) => (prev - 1 + HERO_CAROUSEL_SLIDES.length) % HERO_CAROUSEL_SLIDES.length);
  };

  const handleHeroNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeroSlideIdx((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length);
  };

  const [vehicles, setVehicles] = useState(() => {
    try {
      const cached = localStorage.getItem("ccg_cached_vehicles_v2");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
    } catch {}
    return MASTER_FLEET;
  });
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  // Search Widget State
  const [searchService, setSearchService] = useState("tour");
  const [searchForm, setSearchForm] = useState({
    pickupLocation: "Mopa Airport (GOX)",
    dropoffLocation: "Candolim Beach Hub",
    pickupDate: new Date().toISOString().split("T")[0],
    pickupTime: "09:00",
    dropoffDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    dropoffTime: "18:00",
    category: "All",
  });

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const navOffset = 64;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementPosition - navOffset, behavior: "smooth" });
        }
      }, 150);
    }
  }, [location]);

  const fetchVehicles = React.useCallback(() => {
    api.get("/vehicles", { params: { _t: Date.now() } })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setVehicles(data);
          try {
            localStorage.setItem("ccg_cached_vehicles", JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVehicles(false));
  }, []);

  useEffect(() => {
    fetchVehicles();
    const handleUpdate = () => { fetchVehicles(); };
    window.addEventListener("ccg_vehicles_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ccg_vehicles_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchVehicles]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    query.set("service", searchService);
    if (searchForm.category !== "All") query.set("category", searchForm.category);
    if (searchForm.pickupLocation) query.set("location", searchForm.pickupLocation);
    if (searchForm.pickupDate) query.set("start", searchForm.pickupDate);
    if (searchForm.dropoffDate) query.set("end", searchForm.dropoffDate);
    nav(`/fleet?${query.toString()}`);
  };

  const featuredVehicles = React.useMemo(() => {
    return vehicles.slice(0, 6);
  }, [vehicles]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A] font-body antialiased overflow-x-hidden">
      <SEO />
      <WebSiteSearchSchema />
      <OrganizationFounderSchema />
      <Navbar />

      {/* ── 1. FULL-WIDTH HERO SECTION WITH VEHICLE BACKGROUND ── */}
      <section
        className="pt-28 sm:pt-36 pb-16 sm:pb-24 w-full bg-[#070A11] text-white relative overflow-hidden"
        aria-label="Hero Section"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        {/* Full-Screen Dynamic Background Images Across Entire Hero Width */}
        <div className="absolute inset-0 select-none z-0">
          {HERO_CAROUSEL_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === heroSlideIdx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                onError={(e) => {
                  e.currentTarget.src = slide.fallback;
                }}
                className="w-full h-full object-cover object-center sm:object-right-center transition-transform duration-1000"
              />
            </div>
          ))}

          {/* Cinematic Directional Gradients for Maximum Contrast & Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070A11]/95 via-[#070A11]/70 to-[#070A11]/30 pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#070A11] via-[#070A11]/80 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#070A11]/90 to-transparent pointer-events-none z-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 space-y-8 sm:space-y-12">
          
          {/* Main Headline: Goa's Premier Cab & Tour Service */}
          <div className="text-left max-w-3xl pt-2 sm:pt-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white font-display tracking-tight leading-[1.08] drop-shadow-2xl">
              Goa's Premier <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#E5A93C] to-[#F59E0B]">
                Cab &amp; Tour Service.
              </span>
            </h1>
          </div>

          {/* ── 2. SLEEK TRANSPARENT GLASS BOOKING SEARCH BAR ── */}
          <div className="max-w-5xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-[#070A11]/65 backdrop-blur-2xl text-white border border-white/20 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-4 text-left ring-1 ring-inset ring-white/10"
            >
              {/* Top Service Header & Quick Highlights */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3.5">
                <div className="flex items-center gap-2 text-sm font-black text-white">
                  <Compass size={16} className="text-[#E5A93C]" />
                  <span>Cab Castle Cab &amp; Tour Booking Engine</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F6D285]">
                  <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
                  <span>Guaranteed Driver Punctuality &amp; Clean Cabs</span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 items-end">
                {/* Field 1: Pickup Location */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E2E8F0] flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#E5A93C]" />
                    Pick-up Location
                  </label>
                  <Select
                    value={searchForm.pickupLocation}
                    onValueChange={(val) => setSearchForm({ ...searchForm, pickupLocation: val })}
                  >
                    <SelectTrigger className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3.5 text-xs font-bold text-white h-11 focus:ring-1 focus:ring-[#E5A93C] focus:border-[#E5A93C] backdrop-blur-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B1120] border-white/20 text-white rounded-xl text-xs backdrop-blur-xl shadow-2xl">
                      <SelectItem value="Mopa Airport (GOX)">Mopa Airport (GOX)</SelectItem>
                      <SelectItem value="Dabolim Airport (GOI)">Dabolim Airport (GOI)</SelectItem>
                      <SelectItem value="Candolim Beach Hub">Candolim Beach Hub</SelectItem>
                      <SelectItem value="Calangute / Baga">Calangute / Baga</SelectItem>
                      <SelectItem value="Anjuna / Vagator">Anjuna / Vagator</SelectItem>
                      <SelectItem value="Panaji City">Panaji City</SelectItem>
                      <SelectItem value="Margao Railway Station">Margao Railway Station</SelectItem>
                      <SelectItem value="Thivim Railway Station">Thivim Railway Station</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Field 2: Drop-off Location */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E2E8F0] flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#E5A93C]" />
                    Drop-off Location
                  </label>
                  <Select
                    value={searchForm.dropoffLocation}
                    onValueChange={(val) => setSearchForm({ ...searchForm, dropoffLocation: val })}
                  >
                    <SelectTrigger className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3.5 text-xs font-bold text-white h-11 focus:ring-1 focus:ring-[#E5A93C] focus:border-[#E5A93C] backdrop-blur-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B1120] border-white/20 text-white rounded-xl text-xs backdrop-blur-xl shadow-2xl">
                      <SelectItem value="Mopa Airport (GOX)">Mopa Airport (GOX)</SelectItem>
                      <SelectItem value="Dabolim Airport (GOI)">Dabolim Airport (GOI)</SelectItem>
                      <SelectItem value="Candolim Beach Hub">Candolim Beach Hub</SelectItem>
                      <SelectItem value="Calangute / Baga">Calangute / Baga</SelectItem>
                      <SelectItem value="Anjuna / Vagator">Anjuna / Vagator</SelectItem>
                      <SelectItem value="Panaji City">Panaji City</SelectItem>
                      <SelectItem value="Margao Railway Station">Margao Railway Station</SelectItem>
                      <SelectItem value="Thivim Railway Station">Thivim Railway Station</SelectItem>
                      <SelectItem value="Same as Pick-up">Same as Pick-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Field 3: Pick-up Date */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E2E8F0] flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#E5A93C]" />
                    Pick-up Date
                  </label>
                  <input
                    type="date"
                    value={searchForm.pickupDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSearchForm({ ...searchForm, pickupDate: e.target.value })}
                    className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3.5 text-xs font-bold text-white outline-none focus:border-[#E5A93C] focus:ring-1 focus:ring-[#E5A93C] h-11 cursor-pointer backdrop-blur-md scheme-dark"
                  />
                </div>

                {/* Field 4: Drop-off Date */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#E2E8F0] flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#E5A93C]" />
                    Drop Date
                  </label>
                  <input
                    type="date"
                    value={searchForm.dropoffDate}
                    min={searchForm.pickupDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSearchForm({ ...searchForm, dropoffDate: e.target.value })}
                    className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3.5 text-xs font-bold text-white outline-none focus:border-[#E5A93C] focus:ring-1 focus:ring-[#E5A93C] h-11 cursor-pointer backdrop-blur-md scheme-dark"
                  />
                </div>

                {/* Field 5: Search CTA Button */}
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] hover:brightness-105 text-[#090D16] font-black rounded-xl h-11 text-xs tracking-wider uppercase transition-all shadow-gold flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-[#E5A93C]/40"
                  >
                    <span>Search Fleet</span>
                    <ArrowRight size={14} className="text-[#090D16]" />
                  </Button>
                </div>
              </div>

              {/* Quick Car Tag Pills */}
              <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-[#E2E8F0]/80">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-white text-[11px]">Popular:</span>
                  <Link to="/fleet?category=Hatchback" className="hover:text-white hover:bg-white/20 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 text-[11px] transition-colors">
                    Swift &amp; Baleno
                  </Link>
                  <Link to="/fleet?category=SUV" className="hover:text-white hover:bg-white/20 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 text-[11px] transition-colors">
                    Ertiga &amp; Innova Crysta
                  </Link>
                  <Link to="/fleet?category=Sedan" className="hover:text-white hover:bg-white/20 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 text-[11px] transition-colors">
                    Dzire AC
                  </Link>
                </div>
                <span className="text-[11px] font-mono text-[#F6D285] font-bold">
                  Zero Advance · 100% Guaranteed Driver
                </span>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* ── 3. LIVE FLEET LISTINGS GRID ── */}
      <section id="fleet-showcase" className="pt-12 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5]" aria-labelledby="fleet-grid-heading">
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FAF2DE] text-[#B87A18] border border-[#E5A93C]/35 mb-1">
            <span>🏰 Verified Cab Fleet</span>
          </div>
          <h2 id="fleet-grid-heading" className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight font-display">
            Explore Our Curated Fleet &amp; Tour Packages
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] max-w-2xl mx-auto font-normal">
            Every vehicle in the Cab Castle fleet includes a vetted, courteous local driver, spotless air conditioning, and upfront guaranteed package pricing.
          </p>

          {/* Category Filter Pills */}
          <div className="inline-flex rounded-full p-1 bg-white border border-[#E8E0D2] shadow-xs mt-3">
            {["All", "Sedan", "SUV", "Hatchback"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#0F172A] text-[#F6D285] shadow-xs border border-[#E5A93C]/40"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                {cat === "All" ? "All Cabs" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {loadingVehicles && featuredVehicles.length === 0 ? (
            [...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E8E0D2] rounded-[24px] overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] bg-[#FAF8F5] animate-pulse" />
              </div>
            ))
          ) : featuredVehicles.length > 0 ? (
            featuredVehicles.map((v, idx) => (
              <VehicleCard
                key={v.id || idx}
                v={v}
                index={idx}
                serviceMode="tour"
              />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-[#475569]">
              No fleet vehicles available at the moment.
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-6 sm:mt-8">
          <Button
            asChild
            className="bg-[#0F172A] hover:bg-[#090D16] text-[#F6D285] font-black rounded-full h-11 px-8 text-xs tracking-wider uppercase shadow-gold border border-[#E5A93C]/40 transition-all cursor-pointer"
          >
            <Link to="/fleet?service=tour">
              <span>View All Fleet &amp; Pricing</span>
              <ArrowRight size={14} className="ml-2 text-[#E5A93C]" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── 4. SECONDARY PROMO BANNER ── */}
      <section className="py-4 sm:py-6 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5]" aria-labelledby="airport-promo-heading">
        <div className="bg-[#0F172A] border border-[#E5A93C]/30 rounded-[28px] p-6 sm:p-10 lg:p-12 text-white text-left relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E5A93C]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-white/10 text-[#F6D285] border border-[#E5A93C]/30">
                <Sparkles size={12} className="text-[#E5A93C]" />
                <span>Bespoke Itineraries &amp; Airport Runs</span>
              </div>
              <h2 id="airport-promo-heading" className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight font-display">
                Need A Customized Goa Tour or Airport Transfer?
              </h2>
              <p className="text-[#E2E8F0] text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
                Our local dispatch team is ready to organize comfortable cab transfers, multi-day beach hopping, or heritage packages suited exactly to your group size.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <a
                href="https://wa.me/917026648960?text=Hello%20Cab%20Castle%20Goa,%20I%20would%20like%20to%20enquire%20about%20a%20cab%20package"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] hover:brightness-105 text-[#090D16] font-black rounded-full h-11 px-5 text-xs uppercase tracking-wider shadow-gold transition-all text-center cursor-pointer active:scale-95 border border-[#E5A93C]/40"
                data-testid="promo-whatsapp-btn"
              >
                <MessageSquare size={15} />
                <span>Instant WhatsApp Inquiry</span>
              </a>
              <a
                href="tel:+917026648960"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold rounded-full h-11 px-5 text-xs uppercase tracking-wider transition-colors text-center cursor-pointer active:scale-98"
                data-testid="promo-call-btn"
              >
                <Phone size={14} className="text-[#F6D285]" />
                <span>Call +91 70266 48960</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. TRUST & STATS SECTION ── */}
      <section className="pt-2 pb-6 sm:pt-2 sm:pb-10 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5]">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {TRUST_FEATURES.map((feat, i) => (
            <div
              key={i}
              className="bg-white rounded-[24px] p-4 sm:p-6 border border-[#E8E0D2] text-left space-y-2 hover:border-[#E5A93C] hover:shadow-gold transition-all duration-200 shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#FAF2DE] text-[#E5A93C] flex items-center justify-center border border-[#E5A93C]/30">
                {feat.icon}
              </div>
              <h3 className="text-sm font-black text-[#0F172A]">
                {feat.title}
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed font-normal">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. CUSTOMER TESTIMONIALS (AUTO-SCROLLING MARQUEE) ── */}
      <section id="reviews" className="py-10 sm:py-14 bg-[#FAF8F5] border-y border-[#E8E0D2] overflow-hidden" aria-labelledby="reviews-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FAF2DE] text-[#B87A18] border border-[#E5A93C]/35 mb-2.5">
            <Star size={13} className="fill-[#E5A93C] text-[#E5A93C]" />
            <span>Verified 5-Star Customer Reviews</span>
          </div>
          <h2 id="reviews-heading" className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight font-display">
            Trusted by Over 2,500+ Travelers
          </h2>
          <p className="text-[#475569] text-xs sm:text-sm font-normal mt-1 max-w-xl mx-auto">
            Real feedback from vacationers, corporate guests, and families choosing Cab Castle Goa.
          </p>
        </div>

        {/* Continuous Smooth Auto-Scrolling Marquee */}
        <div className="relative w-full overflow-hidden">
          <Marquee
            gradient={false}
            speed={35}
            pauseOnHover={true}
            className="py-2"
          >
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="mx-3 w-[310px] sm:w-[360px] bg-white rounded-[24px] p-5 sm:p-6 border border-[#E8E0D2] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#E5A93C] hover:shadow-gold transition-all duration-300 select-none text-left"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#E5A93C]">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-[#64748B]">{t.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#475569] italic leading-relaxed font-normal line-clamp-3">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E0D2] flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-xs font-bold text-[#0F172A]">{t.name}</span>
                    <span className="block text-[11px] text-[#475569]">{t.location} · {t.car}</span>
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0F172A] bg-[#FAF2DE] border border-[#E5A93C]/30 px-2.5 py-1 rounded-full shadow-2xs shrink-0"
                  >
                    <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-bold text-[#0F172A]">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ── 7. BENEFITS HIGHLIGHT BANNER ── */}
      <section id="benefits" className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto cv-auto bg-[#FAF8F5]">
        <div className="bg-white border border-[#E8E0D2] rounded-[28px] p-5 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center text-left">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FAF2DE] text-[#B87A18] border border-[#E5A93C]/35">
                <span>👑 The Castle Distinction</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight leading-tight font-display">
                Why Cab Castle Goa is Your Trusted Travel Partner
              </h2>

              <div className="space-y-2.5">
                {[
                  "Professional Drivers — Polite, punctual, background-verified local drivers for safe, comfortable sightseeing.",
                  "Transparent 8h / 80km Packages — Upfront all-inclusive packages with predictable extra km/hr tariffs.",
                  "24/7 Airport & Station Concierge — Flight-monitored pickup at Mopa (GOX), Dabolim (GOI), Margao & Thivim.",
                  "Zero Hidden Surcharges — What you see is what you pay, with instant digital invoice receipts.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#FAF2DE] text-[#E5A93C] border border-[#E5A93C]/35 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[#0F172A] leading-snug">{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] hover:brightness-105 text-[#090D16] font-black rounded-full h-11 px-8 text-xs tracking-wider uppercase transition-all shadow-gold cursor-pointer border border-[#E5A93C]/40"
                >
                  <Link to="/fleet">
                    <span>Explore All Cabs &amp; Tours</span>
                    <ArrowRight size={14} className="ml-1.5 text-[#090D16]" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-[#FAF8F5] border border-[#E8E0D2] rounded-2xl p-4 sm:p-5">
                <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-display">
                  ₹0
                </div>
                <div className="text-xs font-bold text-[#0F172A] mt-1">Zero Hidden Fees</div>
                <div className="text-[11px] text-[#475569] mt-0.5">100% transparent pricing</div>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E8E0D2] rounded-2xl p-4 sm:p-5">
                <div className="text-2xl sm:text-3xl font-black text-[#E5A93C] font-display">
                  24/7
                </div>
                <div className="text-xs font-bold text-[#0F172A] mt-1">Airport Transfers</div>
                <div className="text-[11px] text-[#475569] mt-0.5">Mopa GOX &amp; Dabolim GOI</div>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E8E0D2] rounded-2xl p-4 sm:p-5">
                <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-display">
                  100%
                </div>
                <div className="text-xs font-bold text-[#0F172A] mt-1">Sanitized Fleet</div>
                <div className="text-[11px] text-[#475569] mt-0.5">Clean &amp; comfortable AC cabs</div>
              </div>
              <div className="bg-[#FAF8F5] border border-[#E8E0D2] rounded-2xl p-4 sm:p-5">
                <div className="text-2xl sm:text-3xl font-black text-[#E5A93C] font-display">
                  5.0 ★
                </div>
                <div className="text-xs font-bold text-[#0F172A] mt-1">Google Rated</div>
                <div className="text-[11px] text-[#475569] mt-0.5">2,500+ happy travelers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. HEADQUARTERS & CONTACT LOCATION ── */}
      <LocationSection />

      <WhatsAppInquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        defaultService="Goa Cab & Tour Package"
      />

      <Footer />
    </div>
  );
}
