/* Cab Castle Goa Design System */
import React from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
    <div className="min-h-screen bg-[#F7F7F7] text-[#063247] font-body no-scroll-x antialiased">
      <SEO
        title="Cab Castle Goa — Premium Cabs & Tour Travels in Goa"
        description="Book 8h/80km sightseeing day tours and airport transfers across Goa with professional drivers."
        canonical="/"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "Tour Packages & Cabs", url: "/" },
        ]}
      />
      <Navbar />

      {/* ── 1. CLEAN & SIMPLE HERO BANNER ── */}
      <section className="pt-20 sm:pt-24 pb-14 sm:pb-18 w-full bg-gradient-to-b from-[#063247] via-[#0A4560] to-[#063247] relative overflow-hidden select-none border-b border-[#DFE8EC]/20">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#288DA6]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-5">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-display tracking-tight leading-tight drop-shadow-sm">
            TOUR PACKAGES &amp; CABS
          </h1>

          {/* Clean Subtitle */}
          <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto leading-relaxed font-normal">
            Reliable sightseeing day tours, beach hopping, heritage forts, and 24/7 airport terminal pickups with verified local drivers in Goa.
          </p>

          {/* Action Button */}
          <div className="pt-3 flex items-center justify-center">
            <button
              type="button"
              onClick={scrollToFleet}
              className="h-12 px-8 bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] hover:brightness-105 text-[#090D16] text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-[#E5A93C]/40"
            >
              <span>EXPLORE CABS</span>
              <ArrowRight size={15} className="text-[#090D16]" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. FULL-WIDTH CATALOG SECTION ── */}
      <section id="fleet-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20 font-body">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#475569] mb-1">
              <Link to="/" className="hover:text-[#0F172A] transition-colors">Home</Link>
              <ChevronRight size={13} className="text-[#64748B]" />
              <span className="text-[#0F172A] font-bold">
                Tour Packages &amp; Cabs
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl text-[#0F172A] font-black tracking-tight font-display">
              Available Tour &amp; Sightseeing Fleet
            </h2>
          </div>
        </div>

        {/* Top Filter Toolbar: Category Pills + Search + Sorting */}
        <div className="bg-white rounded-[24px] p-3 sm:p-4 border border-[#E8E0D2] shadow-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-left">
          
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
                      ? "bg-[#0F172A] text-[#F6D285] shadow-xs border border-[#E5A93C]/40"
                      : "bg-[#FAF8F5] text-[#475569] hover:text-[#0F172A] hover:bg-[#FAF2DE]"
                  }`}
                >
                  {c === "All"
                    ? "All Cabs"
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
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search Dzire, Ertiga, Innova..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-7 rounded-full bg-[#F7F7F7] border border-[#DFE8EC] text-xs font-normal text-[#063247] placeholder:text-[#8496A2] focus:outline-none focus:bg-white focus:border-[#288DA6] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8496A2] hover:text-[#063247] p-1 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="w-36 shrink-0">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 bg-[#F7F7F7] border-[#DFE8EC] rounded-full text-xs font-medium text-[#063247] focus:ring-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowUpDown size={11} className="text-[#063247] shrink-0" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#F7F7F7] border-[#DFE8EC] text-[#063247] text-xs rounded-xl">
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
              <div key={i} className="bg-white border border-[#DFE8EC] rounded-[24px] overflow-hidden shadow-sm">
                <div className="aspect-[16/10] bg-[#F7F7F7] animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-2/3 bg-[#F7F7F7] animate-pulse rounded-full" />
                  <div className="h-4 w-1/2 bg-[#F7F7F7] animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div
            className="py-16 px-4 text-center bg-white rounded-[24px] border border-[#DFE8EC] shadow-sm"
            data-testid="no-vehicles"
          >
            <div className="w-12 h-12 rounded-full bg-[#E4F2F5] text-[#288DA6] flex items-center justify-center mx-auto mb-3">
              <Car size={22} />
            </div>
            <h3 className="text-base font-bold text-[#063247] mb-1">
              No vehicles match your search
            </h3>
            <p className="text-xs text-[#4C606E] max-w-sm mx-auto mb-5 font-normal">
              Try selecting another category or resetting the search bar.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 px-6 rounded-full bg-[#063247] text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer hover:bg-[#288DA6] transition-all"
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

      {/* ── Verified Customer Reviews & Social Proof ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#DFE8EC]/80">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#063247] bg-[#E4F2F5] px-3 py-1 rounded-full border border-[#288DA6]/30 mb-2">
            ⭐ 4.9 / 5 Rated by 500+ Travelers
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#063247]">
            Loved by Goa Tourists &amp; Families
          </h2>
          <p className="text-xs text-[#5A7184] mt-1">
            Real experiences from travelers who explored North &amp; South Goa with Cab Castle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
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
          ].map((rev, i) => (
            <div key={i} className="p-5 rounded-3xl bg-white border border-[#DFE8EC] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <div className="flex text-amber-400 text-xs tracking-tight">
                    {"★".repeat(rev.rating)}
                  </div>
                  <span className="text-[10px] font-bold text-[#288DA6] bg-[#E4F2F5] px-2 py-0.5 rounded-full">
                    {rev.trip}
                  </span>
                </div>
                <p className="text-xs text-[#334155] leading-relaxed italic mb-4">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[#063247]">{rev.name}</div>
                  <div className="text-[10px] text-[#64748B]">{rev.city} · {rev.car}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Verified Trip
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
