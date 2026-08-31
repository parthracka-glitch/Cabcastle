import React, { useEffect, useState, useRef } from "react";
import { Car, MapPin, Gauge } from "lucide-react";

const MILESTONES = [
  { min: 0, max: 0.25, label: "Candolim Main Hub", code: "HUB-01" },
  { min: 0.25, max: 0.5, label: "Calangute & Baga Coast", code: "BEACH-02" },
  { min: 0.5, max: 0.75, label: "Anjuna & Fort Aguada", code: "FORT-03" },
  { min: 0.75, max: 1.0, label: "Mopa & GOI Airport", code: "AIRPORT-04" },
];

export default function ScrollCarAnimation() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());
  const speedTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const dt = now - lastTime.current;
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (totalHeight > 0) {
        const progress = Math.min(1, Math.max(0, currentScrollY / totalHeight));
        setScrollProgress(progress);
      }

      // Calculate instantaneous scroll speed for realistic speedometer
      if (dt > 30) {
        const dy = Math.abs(currentScrollY - lastScrollY.current);
        const calculatedSpeed = Math.min(95, Math.round((dy / dt) * 120));
        setSpeed(calculatedSpeed);
        lastScrollY.current = currentScrollY;
        lastTime.current = now;

        clearTimeout(speedTimeout.current);
        speedTimeout.current = setTimeout(() => {
          setSpeed(0);
        }, 150);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(speedTimeout.current);
    };
  }, []);

  const currentMilestone = MILESTONES.find(
    (m) => scrollProgress >= m.min && scrollProgress <= m.max
  ) || MILESTONES[0];

  // Map progress (0 to 1) to vertical viewport position (12vh to 82vh)
  const topPercent = 12 + scrollProgress * 70;

  return (
    <div className="hidden lg:block fixed top-0 right-6 xl:right-10 h-screen w-24 pointer-events-none z-30 select-none">
      {/* Dashed Route Path Line */}
      <div className="absolute top-[10%] bottom-[10%] left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#013E37]/10 via-[#C86A46]/40 to-[#013E37]/10 border-r border-dashed border-[#C86A46]/50" />

      {/* Route Distance Markers */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#013E37]" title="Candolim" />
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#C86A46]" title="Calangute" />
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#7FB8A4]" title="Anjuna" />
      <div className="absolute top-[82%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#013E37]" title="Airport" />

      {/* Floating Animated Car */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transition-transform duration-100 ease-out flex flex-col items-center"
        style={{ top: `${topPercent}%` }}
      >
        {/* Headlight Beam Effect */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-10 h-12 bg-gradient-to-b from-[#C86A46]/30 via-[#C86A46]/10 to-transparent blur-xs pointer-events-none clip-beam" />

        {/* Milestone Popover Pill */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#013E37] text-white px-3 py-1.5 rounded-xl shadow-lg border border-[#7FB8A4]/30 flex items-center gap-2 animate-fadeRight">
          <MapPin size={12} className="text-[#C86A46] shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#7FB8A4] font-bold">
              {currentMilestone.code}
            </span>
            <span className="font-body text-[11px] font-bold text-[#FFFFFF] mt-0.5">
              {currentMilestone.label}
            </span>
          </div>
          <div className="border-l border-[#7FB8A4]/30 pl-2 flex items-center gap-1 font-mono text-[10px] text-[#C86A46] font-bold">
            <Gauge size={11} />
            <span>{speed} km/h</span>
          </div>
        </div>

        {/* Car Silhouette Container */}
        <div className="relative p-2.5 rounded-2xl bg-[#013E37] text-white shadow-xl border border-[#C86A46]/50 group transform hover:scale-110 transition-transform">
          <Car size={20} className="text-[#C86A46] animate-pulse" />
          {/* Wheel animation glow */}
          <span className="absolute -bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-[#C86A46] animate-ping" />
          <span className="absolute -bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-[#C86A46] animate-ping" />
        </div>
      </div>
    </div>
  );
}
