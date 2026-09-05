/* Cab Castle Goa Design System - FleetPage (Mint #69A481, White Smoke #E7EDEB, Claret #7C1F31) */
import React from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Marquee from "react-fast-marquee";
import SEO from "../components/seo/SEO";
import { BreadcrumbStructuredData } from "../components/seo/AdditiveSchemas";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import VehicleCard from "../components/VehicleCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import {
  Search,
  X,
  RotateCcw,
  ArrowUpDown,
  Car,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

import { MASTER_FLEET } from "../data/fleetData";

const CATEGORIES = ["All", "Sedan", "SUV", "Hatchback"];

export default function FleetPage({ defaultService = "tour" } = {}) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // Active partition is locked to "tour"
  const serviceMode = "tour";

  // 1. Initial State
  const [vehicles, setVehicles] = React.useState(() => {
    try {
      const cached = localStorage.getItem("ccg_cached_vehicles_v2");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
    } catch {}
    return MASTER_FLEET;
  });

  const [loading, setLoading] = React.useState(false);

  // Fetch updated fleet from API
  const fetchFleet = React.useCallback(() => {
    api.get("/vehicles", { params: { _t: Date.now() } })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setVehicles(data);
          try {
            localStorage.setItem("ccg_cached_vehicles_v2", JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchFleet();
    const handleUpdate = () => { fetchFleet(); };
    window.addEventListener("ccg_vehicles_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ccg_vehicles_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchFleet]);

  // 2. Filters & Search State
  const [category, setCategory] = React.useState(params.get("category") || "All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("recommended");

  // Sync category from params
  React.useEffect(() => {
    const c = params.get("category");
    if (c) setCategory(c);
  }, [params]);

  // 3. Update URL search params as filters change (without reload)
  React.useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set("service", "tour");
    if (category && category !== "All") newParams.set("category", category);

    setParams(newParams, { replace: true });
  }, [category, setParams]);

  const handleResetFilters = () => {
    setCategory("All");
    setSearchQuery("");
    setSortBy("recommended");
  };

  // Filtered vehicles
  const filteredVehicles = React.useMemo(() => {
    return vehicles
      .filter((v) => {
        if (v.id === "v-thar" || v.id === "v-thar-roxx" || v.title?.toLowerCase().includes("thar")) return false;
        if (category !== "All" && v.category.toLowerCase() !== category.toLowerCase()) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = v.title.toLowerCase().includes(q);
          const matchesCat = v.category.toLowerCase().includes(q);
          const matchesDesc = (v.description || "").toLowerCase().includes(q);
          if (!matchesTitle && !matchesCat && !matchesDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aRate = a.daily_rate;
        const bRate = b.daily_rate;
        if (sortBy === "price-asc") return aRate - bRate;
        if (sortBy === "price-desc") return bRate - aRate;
        if (sortBy === "seats") return b.seating - a.seating;
        return 0;
      });
  }, [vehicles, category, searchQuery, sortBy]);

  const scrollToFleet = () => {
    const el = document.getElementById("fleet-catalog-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#E7EDEB] text-[#1B2922] font-body no-scroll-x antialiased">
      <SEO
        title="Cab Castle Goa — Premium Car Rentals & Tour Packages in Goa"
        description="Book 8h/80km sightseeing day tours and airport transfers across Goa with professional drivers."
        canonical="/"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "Car Rentals & Tours", url: "/" },
        ]}
      />
      <Navbar />

      {/* ── 1. CLEAN & CRISP HERO BANNER WITH SCENIC GOA BACKGROUND ── */}
      <section className="pt-14 sm:pt-16 w-full bg-[#24060C] relative select-none">
        <div className="relative w-full h-[60vh] min-h-[440px] max-h-[580px] overflow-hidden flex flex-col justify-center items-center text-center p-6 sm:p-12">
          
          {/* Clear Scenic Goa Landscape Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80"
              alt="Goa Beach & Car Rentals"
              className="w-full h-full object-cover object-center brightness-[0.70]"
            />
            {/* Clean Light-to-Dark Protective Tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#24060C] via-[#24060C]/50 to-[#24060C]/70 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-4 sm:space-y-5">
            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-display tracking-tight leading-none drop-shadow-xl">
              CAR RENTALS &amp; TOURS
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-white/95 max-w-xl mx-auto leading-relaxed drop-shadow-md font-normal">
              Relax with experienced, professional local drivers for North &amp; South Goa day tours, beach hopping, heritage forts, and 24/7 airport terminal pickups.
            </p>

            {/* Action Button */}
            <div className="pt-2 flex items-center justify-center">
              <button
                type="button"
                onClick={scrollToFleet}
                className="h-12 px-8 bg-gradient-to-r from-[#7C1F31] via-[#9B2A41] to-[#7C1F31] hover:brightness-110 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-[#7C1F31]"
              >
                <span>EXPLORE CARS</span>
                <ArrowRight size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FULL-WIDTH CATALOG SECTION ── */}
      <section id="fleet-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20 font-body">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#4D6257] mb-1">
              <Link to="/" className="hover:text-[#7C1F31] transition-colors">Home</Link>
              <ChevronRight size={13} className="text-[#6C8277]" />
              <span className="text-[#1B2922] font-bold">
                Car Rentals &amp; Tours
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl text-[#1B2922] font-black tracking-tight font-display">
              Available Tour &amp; Sightseeing Fleet
            </h2>
          </div>
        </div>

        {/* Top Filter Toolbar: Category Pills + Search + Sorting */}
        <div className="bg-white rounded-[24px] p-3 sm:p-4 border border-[#CBD8D4] shadow-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-left">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((c) => {
              const isSelected = category.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`h-9 px-4 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#7C1F31] text-[#E7EDEB] shadow-xs border border-[#69A481]/40"
                      : "bg-[#E7EDEB] text-[#4D6257] hover:text-[#1B2922] hover:bg-[#DEEDE4]"
                  }`}
                >
                  {c === "All"
                    ? "All Cars"
                    : c === "Sedan"
                    ? "Sedan (Dzire / Aura)"
                    : c === "SUV"
                    ? "SUV & 7-Seater (Ertiga / Innova Crysta)"
                    : "Hatchback (Swift / Baleno)"}
                </button>
              );
            })}
          </div>

          {/* Search input & Sorting */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C8277]" />
              <input
                type="text"
                placeholder="Search Dzire, Ertiga, Innova..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-7 rounded-full bg-[#E7EDEB] border border-[#CBD8D4] text-xs font-normal text-[#1B2922] placeholder:text-[#6C8277] focus:outline-none focus:bg-white focus:border-[#69A481] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C8277] hover:text-[#1B2922] p-1 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="w-36 shrink-0">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 bg-[#E7EDEB] border-[#CBD8D4] rounded-full text-xs font-medium text-[#1B2922] focus:ring-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowUpDown size={11} className="text-[#1B2922] shrink-0" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#E7EDEB] border-[#CBD8D4] text-[#1B2922] text-xs rounded-xl">
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="seats">Most Seats First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        {/* ── Full-Width Vehicle Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#CBD8D4] rounded-[24px] overflow-hidden shadow-sm">
                <div className="aspect-[16/10] bg-[#E7EDEB] animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-2/3 bg-[#E7EDEB] animate-pulse rounded-full" />
                  <div className="h-4 w-1/2 bg-[#E7EDEB] animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div
            className="py-16 px-4 text-center bg-white rounded-[24px] border border-[#CBD8D4] shadow-sm"
            data-testid="no-vehicles"
          >
            <div className="w-12 h-12 rounded-full bg-[#DEEDE4] text-[#69A481] flex items-center justify-center mx-auto mb-3">
              <Car size={22} />
            </div>
            <h3 className="text-base font-bold text-[#1B2922] mb-1">
              No vehicles match your search
            </h3>
            <p className="text-xs text-[#4D6257] max-w-sm mx-auto mb-5 font-normal">
              Try selecting another category or resetting the search bar.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 px-6 rounded-full bg-[#7C1F31] text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer hover:bg-[#631826] transition-all"
            >
              <RotateCcw size={13} className="mr-1.5 inline" />
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="fleet-grid">
            {filteredVehicles.map((v, i) => (
              <div key={v.id || i} className="animate-fadeUp" style={{ animationDelay: `${i * 35}ms` }}>
                <VehicleCard
                  v={v}
                  index={i}
                  serviceMode={serviceMode}
                />
              </div>
            ))}
          </div>
        )}

      </section>

      {/* ── Verified Customer Reviews & Infinite Scrolling Social Proof ── */}
      <section className="py-14 bg-[#E7EDEB] border-t border-[#CBD8D4] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245339] bg-[#DEEDE4] px-3.5 py-1 rounded-full border border-[#69A481]/30 mb-2.5">
            ⭐ 4.9 / 5 Rated · 500+ Verified Goa Trips
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#1B2922] tracking-tight">
            Loved by Goa Tourists &amp; Families
          </h2>
          <p className="text-xs sm:text-sm text-[#4D6257] mt-1.5 max-w-xl mx-auto">
            Real stories and ratings from travelers exploring North &amp; South Goa with Cab Castle.
          </p>
        </div>

        {/* Infinite Scrolling Horizontal Marquee */}
        <div className="relative w-full">
          <Marquee speed={36} pauseOnHover={true} gradient={false} className="py-2">
            {[
              {
                name: "Pooja & Rohan Mehta",
                city: "Mumbai",
                trip: "3-Day North & South Goa Tour",
                car: "Toyota Innova Crysta",
                text: "Our chauffeur Suresh was exceptionally polite and knew all the hidden beach viewpoints in South Goa. The car was spotless and AC was freezing cold throughout.",
                rating: 5,
              },
              {
                name: "Dr. Arvind Swaminathan",
                city: "Bangalore",
                trip: "Mopa Airport Pickup + Sightseeing",
                car: "Maruti Ertiga AC",
                text: "Flight landed at Mopa airport at 11 PM and driver was already waiting outside with our name board. Zero advance payment and honest pricing. Highly recommend!",
                rating: 5,
              },
              {
                name: "Elena & David Wright",
                city: "UK (International Tourist)",
                trip: "Dudhsagar Falls & Heritage Tour",
                car: "Maruti Baleno AC",
                text: "Booking on WhatsApp was seamless. Clear English speaking driver who helped us buy tickets at Dudhsagar without standing in queues. 10/10 experience!",
                rating: 5,
              },
              {
                name: "Sameer Deshmukh",
                city: "Pune",
                trip: "South Goa Beaches & Sunset Trip",
                car: "Swift Dzire AC",
                text: "We visited Palolem, Cabo de Rama, and Cola Beach. The driver gave great local seafood restaurant tips and drove very safely on the ghat roads.",
                rating: 5,
              },
              {
                name: "Rajesh & Sneha Kulkarni",
                city: "Hyderabad",
                trip: "4-Day Complete Goa Vacation",
                car: "Innova Crysta Luxury",
                text: "Travelled with elderly parents and two kids. The spacious Innova Crysta made the entire trip smooth and relaxing. Punctual every single morning!",
                rating: 5,
              },
              {
                name: "Vikramjit Singh",
                city: "Delhi NCR",
                trip: "North Goa Beach & Club Hopping",
                car: "Maruti Ertiga AC",
                text: "No surge pricing at midnight after Baga clubs. Driver was professional and respectful. Best cab service in Goa by far!",
                rating: 5,
              },
            ].map((rev, i) => (
              <div
                key={i}
                className="mx-3.5 w-[330px] sm:w-[370px] p-5 rounded-3xl bg-white border border-[#CBD8D4] shadow-2xs hover:shadow-md hover:border-[#69A481]/40 transition-all flex flex-col justify-between text-left shrink-0 select-none"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-3">
                    <div className="flex text-[#69A481] text-xs tracking-tight">
                      {"★".repeat(rev.rating)}
                    </div>
                    <span className="text-[10px] font-bold text-[#245339] bg-[#DEEDE4] px-2.5 py-0.5 rounded-full border border-[#69A481]/30">
                      {rev.trip}
                    </span>
                  </div>
                  <p className="text-xs text-[#4D6257] leading-relaxed italic mb-4">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#CBD8D4] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-[#1B2922]">{rev.name}</div>
                    <div className="text-[10px] text-[#6C8277] font-medium">{rev.city} · {rev.car}</div>
                  </div>
                  <span className="text-[10px] font-bold text-[#245339] bg-[#DEEDE4] px-2 py-0.5 rounded-full border border-[#69A481]/30">
                    ✓ Verified Trip
                  </span>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      <Footer />
    </div>
  );
}
