/* Brex Design System */
import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Car, ArrowRight, Clock, Navigation, Compass, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

const CSS = `
@keyframes tp-fadeUp {
  from { opacity:0; transform: perspective(900px) rotateX(10deg) translateY(30px) scale(0.97); }
  to   { opacity:1; transform: perspective(900px) rotateX(0deg)  translateY(0)    scale(1);    }
}
@keyframes tp-slideRight {
  from { opacity:0; transform: translateX(-24px); }
  to   { opacity:1; transform: translateX(0); }
}
@keyframes tp-popIn {
  0%   { opacity:0; transform: scale(0.88) translateY(12px); }
  70%  { transform: scale(1.03) translateY(-2px); }
  100% { opacity:1; transform: scale(1) translateY(0); }
}
@keyframes tp-badgeFloat {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-4px); }
}

.tp-hidden   { opacity:0; transform: perspective(900px) rotateX(10deg) translateY(30px) scale(0.97); }
.tp-visible  { animation: tp-fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }

.tp-step-hidden   { opacity:0; transform: translateX(-20px); }
.tp-step-visible  { animation: tp-slideRight 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }

.tp-card-hidden   { opacity:0; transform: scale(0.88) translateY(12px); }
.tp-card-visible  { animation: tp-popIn 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }

.tp-badge-float   { animation: tp-badgeFloat 3.2s ease-in-out infinite; }
.tp-badge-float-delay { animation: tp-badgeFloat 3.2s ease-in-out 1.2s infinite; }

.tp-3d-card {
  transform-style: preserve-3d;
  transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease;
  will-change: transform;
}
.tp-3d-card:hover {
  box-shadow: 0 20px 40px -12px rgba(6,50,71,0.15), 0 0 0 1px rgba(42,143,168,0.3);
}

.tp-step-row {
  transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, border-color 0.2s;
  will-change: transform;
}
.tp-step-row:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px -4px rgba(6,50,71,0.08);
  border-color: #2A8FA8 !important;
}

@media (max-width: 768px) {
  .tp-hidden  { transform: translateY(24px); }
  .tp-visible { animation: tp-slideRight 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
  .tp-step-row:hover { transform: none; box-shadow: none; }
  .tp-3d-card { will-change: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .tp-hidden, .tp-card-hidden, .tp-step-hidden { opacity:0; transform:none; }
  .tp-visible, .tp-card-visible, .tp-step-visible { animation:none; opacity:1; transform:none; }
  .tp-badge-float, .tp-badge-float-delay { animation:none; }
}
`;

if (typeof document !== "undefined" && !document.getElementById("tp-style")) {
  const s = document.createElement("style");
  s.id = "tp-style";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function useReveal(hiddenClass, visibleClass, delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add(hiddenClass);
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove(hiddenClass);
          el.style.animationDelay = `${delay}ms`;
          el.classList.add(visibleClass);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hiddenClass, visibleClass, delay]);
  return ref;
}

function use3DTilt(maxDeg = 6) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches
                  || ("ontouchstart" in window);
    const deg = isMobile ? maxDeg * 0.45 : maxDeg;

    function tiltFrom(clientX, clientY) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (clientX - cx) / (rect.width  / 2);
      const dy = (clientY - cy) / (rect.height / 2);
      el.style.transform = `perspective(900px) rotateY(${dx * deg}deg) rotateX(${-dy * deg}deg) scale(1.015)`;
    }
    function resetTilt() {
      el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
    }

    function onMouseMove(e) { tiltFrom(e.clientX, e.clientY); }
    function onMouseLeave() { resetTilt(); }
    el.addEventListener("mousemove",  onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    function onTouchMove(e) {
      const t = e.touches[0];
      tiltFrom(t.clientX, t.clientY);
    }
    function onTouchEnd() { resetTilt(); }
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend",  onTouchEnd);

    return () => {
      el.removeEventListener("mousemove",  onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [maxDeg]);
  return ref;
}

export default function TripPlanner() {
  const [trips, setTrips]       = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const nav = useNavigate();

  const r_badge  = useReveal("tp-hidden", "tp-visible", 0);
  const r_h2     = useReveal("tp-hidden", "tp-visible", 120);
  const r_desc   = useReveal("tp-hidden", "tp-visible", 240);
  const r_tabs   = useReveal("tp-card-hidden", "tp-card-visible", 360);

  useEffect(() => {
    api.get("/trip-planner")
      .then(({ data }) => {
        setTrips(data);
        if (data.length) setActiveTab(data[0].id);
      })
      .catch(() => {});
  }, []);

  if (!trips.length) return null;

  return (
    <section id="trip-planner" className="py-12 sm:py-20 bg-[#F7F7F7] text-[#063247] overflow-hidden border-t border-[#DFE8EC] font-body">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section Header ── */}
        <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5 text-left">
          <div>
            <div
              ref={r_badge}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E4F2F5] text-[#2A8FA8] border border-[#C3E7FA] text-xs uppercase tracking-wider font-bold mb-2.5 shadow-xs"
            >
              <Compass size={13} /> Curated Goa Itineraries
            </div>
            <h2
              ref={r_h2}
              className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[#063247]"
            >
              Plan Your <span className="text-[#2A8FA8]">Goa Cab Route</span>
            </h2>
          </div>
          <p
            ref={r_desc}
            className="max-w-md text-xs sm:text-sm text-[#4C606E] leading-relaxed font-normal"
          >
            Handcrafted travel routes tailored for Goa's coastlines, spice plantations, and historic forts.
          </p>
        </div>

        {/* ── Tabs ── */}
        <Tabs
          value={activeTab || trips[0]?.id}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div ref={r_tabs} className="flex justify-start mb-6">
            <TabsList className="bg-white border border-[#DFE8EC] rounded-full p-1 h-auto flex flex-wrap gap-1.5 shadow-xs" data-testid="trip-tabs">
              {trips.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider
                    data-[state=active]:bg-[#063247] data-[state=active]:text-white
                    data-[state=active]:shadow-xs text-[#4C606E] hover:text-[#063247] transition-all duration-150 cursor-pointer"
                  data-testid={`trip-tab-${t.id}`}
                >
                  {t.duration} Route
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {trips.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-2 focus:outline-none">
              <TripCard trip={t} nav={nav} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

function TripCard({ trip: t, nav }) {
  const tiltRef = use3DTilt(5);

  const stepRefs = [
    useReveal("tp-step-hidden", "tp-step-visible", 60),
    useReveal("tp-step-hidden", "tp-step-visible", 140),
    useReveal("tp-step-hidden", "tp-step-visible", 220),
    useReveal("tp-step-hidden", "tp-step-visible", 300),
    useReveal("tp-step-hidden", "tp-step-visible", 380),
    useReveal("tp-step-hidden", "tp-step-visible", 460),
    useReveal("tp-step-hidden", "tp-step-visible", 540),
    useReveal("tp-step-hidden", "tp-step-visible", 620),
  ];

  const r_rightCard = useReveal("tp-card-hidden", "tp-card-visible", 160);
  const r_tip       = useReveal("tp-card-hidden", "tp-card-visible", 320);
  const r_cta       = useReveal("tp-card-hidden", "tp-card-visible", 440);

  const items = (t.itinerary || t.highlights || []).slice(0, 8);

  return (
    <div className="grid lg:grid-cols-12 gap-5 items-stretch text-left">

      {/* ── Left: 3D tilt image card ── */}
      <div
        ref={tiltRef}
        className="tp-3d-card lg:col-span-5 relative rounded-[24px] overflow-hidden min-h-[360px] shadow-sm flex flex-col justify-between p-6 border border-[#DFE8EC] group bg-[#063247] cursor-pointer"
      >
        <img
          src={t.image}
          alt={t.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#063247] via-[#063247]/60 to-transparent" />

        {/* Top badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wider bg-white text-[#063247] font-bold shadow-xs flex items-center gap-1.5">
            <MapPin size={13} className="text-[#2A8FA8]" /> {t.region}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#2A8FA8] text-white text-xs font-bold uppercase tracking-wider">
            {t.duration}
          </span>
        </div>

        {/* Bottom info */}
        <div className="relative z-10 text-white mt-auto">
          <h3 className="font-display text-xl sm:text-2xl font-bold mb-2.5 leading-tight text-white">
            {t.title}
          </h3>
          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/15 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-white/90">
              <Navigation size={13} className="text-[#EFF0A3]" />
              <span>{t.est_distance || "50 km drive"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/90">
              <Clock size={13} className="text-[#EFF0A3]" />
              <span>{t.est_drive_time || "2 hrs drive"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: itinerary panel ── */}
      <div
        ref={r_rightCard}
        className="lg:col-span-7 bg-white rounded-[24px] p-6 sm:p-7 border border-[#DFDCE8] flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#6F6E73] font-bold mb-0.5">
                Recommended Itinerary
              </div>
              <h4 className="font-display text-base font-bold text-[#212121]">
                Best for: <span className="text-[#6F6E73] font-normal">{t.best_for || "Explorers"}</span>
              </h4>
            </div>
          </div>

          <div className="space-y-2.5 mb-4">
            {items.map((item, idx) => {
              const time = typeof item === "object" ? item.time : `Stop ${idx + 1}`;
              const spot = typeof item === "object" ? item.spot : item;
              return (
                <div
                  key={idx}
                  ref={stepRefs[idx]}
                  className="tp-step-row p-3 rounded-[16px] bg-[#F6F5FA] border border-[#DFDCE8] flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-[#212121] text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-[#212121] mb-0.5">{time}</div>
                    <div className="font-body text-xs sm:text-sm font-normal text-[#212121] leading-snug">{spot}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {t.tips && (
            <div
              ref={r_tip}
              className="p-3.5 rounded-[16px] bg-[#EFF0A3]/50 border border-[#EFF0A3] flex items-start gap-2.5 text-xs text-[#212121] mb-4"
            >
              <Lightbulb size={15} className="text-[#212121] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-[#212121]">Local Driving Tip:</strong> {t.tips}
              </div>
            </div>
          )}
        </div>

        <div ref={r_cta} className="pt-4 border-t border-[#DFDCE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#99989E] font-medium mb-0.5">
              Recommended Vehicle
            </div>
            <div className="flex items-center gap-2 font-display text-sm font-bold text-[#212121]">
              <Car size={15} className="text-[#212121]" />
              <span>{t.recommended_vehicle}</span>
            </div>
          </div>

          <Button
            onClick={() => nav(`/fleet?category=${encodeURIComponent(t.recommended_vehicle)}`)}
            className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white rounded-full text-xs font-bold uppercase tracking-wider px-6 py-4 shadow-sm transition-all cursor-pointer"
            data-testid={`trip-cta-${t.id}`}
          >
            <span>Find {t.recommended_vehicle}s</span>
            <ArrowRight size={13} className="ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
