/* Brex Design System */
import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Fuel, Cog, Users, Sparkles, ArrowRight, Play, Pause, ShieldCheck, Flame, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { formatINR, getOptimizedImageUrl } from "@/lib/api";
import Tilt3DCard from "./Tilt3DCard";

const CATEGORIES = [
  { id: "all", label: "All Vehicles" },
  { id: "suv", label: "SUV & 4x4 Thars" },
  { id: "hatchback", label: "Hatchback & City" },
  { id: "sedan", label: "Premium Sedans" },
  { id: "luxury", label: "Luxury Collection" },
];

export default function CarRollingShowcase({ vehicles = [] }) {
  const scrollRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isAutoRolling, setIsAutoRolling] = useState(true);
  const [viewMode, setViewMode] = useState("rolling");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filteredVehicles = vehicles.filter((v) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "suv") return v.category?.toLowerCase().includes("suv") || v.title?.toLowerCase().includes("thar");
    if (activeCategory === "hatchback") return v.category?.toLowerCase().includes("hatchback");
    if (activeCategory === "sedan") return v.category?.toLowerCase().includes("sedan");
    if (activeCategory === "luxury") return v.category?.toLowerCase().includes("luxury") || v.daily_rate > 3500;
    return true;
  });

  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const isDraggingRef = useRef(false);

  const checkScrollable = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    if (viewMode !== "rolling") return;
    checkScrollable();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollable);
      return () => el.removeEventListener("scroll", checkScrollable);
    }
  }, [filteredVehicles, viewMode]);

  // Mouse drag-to-scroll & Wheel scroll handlers
  useEffect(() => {
    if (viewMode !== "rolling") return;
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 5 && Math.abs(e.deltaX) < 5) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const atStart = scrollLeft <= 0;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;
      e.preventDefault();
      el.scrollBy({ left: delta * 1.8, behavior: "auto" });
    };

    const onMouseDown = (e) => {
      isMouseDownRef.current = true;
      isDraggingRef.current = false;
      startXRef.current = e.pageX - el.offsetLeft;
      scrollLeftStartRef.current = el.scrollLeft;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
      setIsAutoRolling(false);
    };

    const onMouseMove = (e) => {
      if (!isMouseDownRef.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startXRef.current) * 1.5;
      if (Math.abs(walk) > 5) {
        isDraggingRef.current = true;
      }
      el.scrollLeft = scrollLeftStartRef.current - walk;
    };

    const onMouseUpOrLeave = () => {
      isMouseDownRef.current = false;
      el.style.cursor = "grab";
      el.style.removeProperty("user-select");
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUpOrLeave);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUpOrLeave);
    };
  }, [viewMode, filteredVehicles]);

  useEffect(() => {
    if (!isAutoRolling || viewMode !== "rolling") return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
        }
      }
    }, 3800);
    return () => clearInterval(interval);
  }, [isAutoRolling, viewMode]);

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-[#F6F5FA] text-[#212121] relative overflow-hidden border-t border-[#DFDCE8] font-body">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF0A3] text-[#212121] text-xs uppercase tracking-wider font-bold mb-2.5 shadow-xs">
              <Sparkles size={13} /> Handpicked Fleet Showcase
            </div>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#212121]">
              Every Road, a <span className="text-[#212121]">Different Companion</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-1 rounded-full bg-white border border-[#DFDCE8] flex items-center gap-1 shadow-xs">
              <button
                onClick={() => setViewMode("rolling")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "rolling"
                    ? "bg-[#212121] text-white shadow-xs"
                    : "text-[#6F6E73] hover:text-[#212121]"
                }`}
                title="Rolling Cards View"
              >
                <SlidersHorizontal size={13} />
                <span>Rolling</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#212121] text-white shadow-xs"
                    : "text-[#6F6E73] hover:text-[#212121]"
                }`}
                title="Grid Layout View"
              >
                <LayoutGrid size={13} />
                <span>Grid</span>
              </button>
            </div>

            {viewMode === "rolling" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoRolling(!isAutoRolling)}
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all text-[#212121] shadow-xs cursor-pointer active:scale-95"
                  title={isAutoRolling ? "Pause auto-rolling" : "Start auto-rolling"}
                >
                  {isAutoRolling ? <Pause size={12} className="text-[#212121]" /> : <Play size={12} className="text-[#212121]" />}
                  <span className="hidden sm:inline">{isAutoRolling ? "Rolling" : "Paused"}</span>
                </button>

                <button
                  onClick={() => scrollBy(-360)}
                  disabled={!canScrollLeft}
                  className="w-9 h-9 rounded-full bg-white hover:bg-[#F6F5FA] disabled:opacity-30 border border-[#DFDCE8] flex items-center justify-center text-[#212121] transition-all shadow-xs cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => scrollBy(360)}
                  disabled={!canScrollRight}
                  className="w-9 h-9 rounded-full bg-[#212121] hover:bg-[#141414] active:bg-[#000000] disabled:opacity-30 flex items-center justify-center text-white transition-all shadow-xs cursor-pointer active:scale-95"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#212121] text-white shadow-xs"
                  : "bg-white hover:border-[#212121] text-[#6F6E73] border border-[#DFDCE8]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {viewMode === "rolling" ? (
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsAutoRolling(false)}
            onMouseLeave={() => setIsAutoRolling(true)}
            onTouchStart={() => setIsAutoRolling(false)}
            onTouchEnd={() => setTimeout(() => setIsAutoRolling(true), 2000)}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 cursor-grab active:cursor-grabbing snap-x snap-mandatory touch-pan-x"
          >
            {filteredVehicles.map((v, i) => (
              <Tilt3DCard
                key={v.id || i}
                maxTilt={4}
                scale={1.015}
                className="min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 rounded-[24px] snap-start"
              >
                <div className="group rounded-[24px] bg-white border border-[#DFDCE8] hover:border-[#212121] overflow-hidden h-full flex flex-col justify-between shadow-sm transition-all text-left">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F6F5FA] m-3 rounded-[16px]">
                    <img
                      src={getOptimizedImageUrl(v.image_url)}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider text-[#212121] font-bold bg-white/95 border border-[#DFDCE8] shadow-xs">
                        {v.category}
                      </span>
                      {v.daily_rate > 3000 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EFF0A3] text-[#212121] text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 shadow-xs">
                          <Flame size={11} /> Top
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-xs ${
                          v.status === "Available"
                            ? "bg-[#CFDECA] text-[#4B8039]"
                            : v.status === "Booked"
                            ? "bg-[#F6F5FA] text-[#6F6E73] border border-[#DFDCE8]"
                            : "bg-[#212121] text-white"
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-1 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-display text-base font-bold text-[#212121] mb-1.5 leading-tight truncate">
                        {v.title}
                      </h3>

                      <div className="flex items-center gap-2.5 text-xs font-normal text-[#6F6E73] mb-3">
                        <span className="flex items-center gap-1">
                          <Fuel size={12} className="text-[#212121]" />
                          {v.fuel_type}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Cog size={12} className="text-[#212121]" />
                          {v.transmission}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-[#212121]" />
                          {v.seating} Seats
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DFDCE8] flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#99989E] font-medium block">Daily Rate</span>
                        <div className="font-display text-base font-bold text-[#212121]">
                          {formatINR(v.daily_rate)}
                          <span className="text-xs font-normal text-[#6F6E73]">/d</span>
                        </div>
                      </div>

                      <Link
                        to={`/booking/${v.id}`}
                        onClick={(e) => {
                          if (isDraggingRef.current) e.preventDefault();
                        }}
                        className="py-2 px-4 rounded-full bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                        data-testid={`rolling-book-btn-${v.id}`}
                      >
                        <span>Book</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Tilt3DCard>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 py-2">
            {filteredVehicles.map((v, i) => (
              <Tilt3DCard key={v.id || i} maxTilt={4} scale={1.015} className="rounded-[24px]">
                <div
                  className="group rounded-[24px] bg-white border border-[#DFDCE8] hover:border-[#212121] overflow-hidden h-full flex flex-col justify-between shadow-sm transition-all text-left"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F6F5FA] m-3 rounded-[16px]">
                    <img
                      src={v.image_url}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-white/95 text-[#212121] border border-[#DFDCE8] font-bold shadow-xs">
                        {v.category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#CFDECA] text-[#4B8039] shadow-xs">
                        {v.status}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-1 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-display text-base font-bold text-[#212121] mb-1.5 truncate">
                        {v.title}
                      </h3>
                      <div className="flex items-center gap-2.5 text-xs font-normal text-[#6F6E73] mb-3">
                        <span>{v.fuel_type}</span>
                        <span>•</span>
                        <span>{v.transmission}</span>
                        <span>•</span>
                        <span>{v.seating} Seats</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DFDCE8] flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#99989E] font-medium block">Daily Rate</span>
                        <div className="font-display text-base font-bold text-[#212121]">
                          {formatINR(v.daily_rate)}
                          <span className="text-xs font-normal text-[#6F6E73]">/d</span>
                        </div>
                      </div>
                      <Link
                        to={`/booking/${v.id}`}
                        className="py-2 px-4 rounded-full bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>Book</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Tilt3DCard>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 sm:p-5 rounded-[20px] bg-white border border-[#DFDCE8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6F6E73] shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#4B8039]" />
            <span className="text-[#212121] font-bold">Zero Hidden Charges · Unlimited Kilometers included with all rentals</span>
          </div>
          <Link to="/fleet" className="text-[#212121] hover:underline font-bold flex items-center gap-1">
            See All Fleet ({vehicles.length} Total Cars) <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
