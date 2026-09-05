/* Cab Castle Goa Design System - VehicleCard (Mint #69A481, White Smoke #E7EDEB, Claret #7C1F31) */
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle, Users, Snowflake } from "lucide-react";
import { formatINR, getOptimizedImageUrl } from "@/lib/api";
import Tilt3DCard from "./Tilt3DCard";

function VehicleCard({ v, index = 0, serviceMode = "tour", queryParams = "" }) {
  const navigate = useNavigate();

  // Image list
  const imageList = React.useMemo(() => {
    if (Array.isArray(v.images) && v.images.length > 0) {
      const valid = v.images.filter(Boolean).slice(0, 5);
      if (valid.length > 0) return valid;
    }
    return v.image_url ? [v.image_url] : ["/vehicles/maruti_dzire.webp"];
  }, [v.images, v.image_url]);

  const [activeIdx, setActiveIdx] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // Auto-play rotation
  React.useEffect(() => {
    if (imageList.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % imageList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [imageList.length, isHovered]);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % imageList.length);
  };

  const handleDotClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx(idx);
  };

  const currentImage = imageList[activeIdx] || imageList[0];

  const bookingUrl = `/booking/${v.id}?service=tour${queryParams ? `&${queryParams}` : ""}`;

  // Tour Package Rates
  const tourRate = v.daily_rate || 2500;
  const airportRate = v.airport_rate || 1300;
  const seatingCount = v.seating || 5;

  return (
    <Tilt3DCard maxTilt={3} scale={1.012} className="rounded-[24px] h-full font-body">
      <div
        className="group bg-white rounded-[24px] overflow-hidden border border-[#CBD8D4] shadow-xs hover:shadow-md hover:border-[#69A481] transition-all duration-200 h-full flex flex-col justify-between"
        data-testid={`vehicle-card-${index}`}
        style={{ animationDelay: `${index * 35}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Clickable Card Body */}
        <div onClick={() => navigate(bookingUrl)} className="cursor-pointer p-4 sm:p-5 text-left space-y-3.5">
          
          {/* Top Vehicle Image Banner */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#E7EDEB] select-none border border-[#CBD8D4]">
            <img
              key={`${v.id}-${activeIdx}`}
              src={getOptimizedImageUrl(currentImage)}
              alt={v.title}
              onError={(e) => {
                e.currentTarget.src = "/vehicles/maruti_dzire.webp";
              }}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-103"
              loading="lazy"
            />

            {/* Castle Class Top Badge */}
            <div className="absolute top-2.5 left-2.5 bg-[#7C1F31]/95 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#69A481]/40 text-[10px] font-black text-[#E7EDEB] flex items-center gap-1 z-10 shadow-xs">
              <span>👑 Castle Class</span>
            </div>

            {/* Navigation Arrows */}
            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-[#69A481] hover:text-white text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-[#69A481] hover:text-white text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                  {imageList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => handleDotClick(e, dotIdx)}
                      className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        dotIdx === activeIdx
                          ? "w-4 bg-[#69A481]"
                          : "w-1.5 bg-white/70 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-black text-[#1B2922] tracking-tight group-hover:text-[#7C1F31] transition-colors">
                {v.title}
              </h3>
              <div className="w-7 h-7 rounded-full bg-[#E7EDEB] group-hover:bg-[#DEEDE4] border border-[#CBD8D4] flex items-center justify-center text-[#1B2922] group-hover:text-[#245339] transition-colors shrink-0">
                <ArrowUpRight size={15} />
              </div>
            </div>
            <p className="text-xs text-[#4D6257] font-normal leading-relaxed line-clamp-2">
              {v.subtitle || v.description || "Comfortable AC car rental for sightseeing across Goa."}
            </p>
          </div>

          {/* Tour Package Rates Card Layout */}
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-[#DEEDE4] border border-[#69A481]/40 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#4D6257]">
                  8H / 80KM TOUR PACKAGE
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#1B2922] leading-tight mt-0.5">
                  {formatINR(tourRate)}
                  <span className="text-xs font-normal text-[#4D6257] ml-1">/ 8 hrs</span>
                </div>
              </div>
              <span className="text-xs font-black text-[#245339] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Book Tour →
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] px-2.5">
                <span className="text-[10px] text-[#4D6257]">Airport</span>
                <span className="font-bold text-[11px] text-[#1B2922]">{formatINR(airportRate)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] px-2.5">
                <Users size={12} className="text-[#4D6257]" />
                <span className="font-bold text-[11px] text-[#1B2922]">{seatingCount} Seats</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] px-2.5">
                <Snowflake size={12} className="text-[#69A481]" />
                <span className="font-bold text-[11px] text-[#245339]">AC Car</span>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Contact & Direct Action Buttons */}
        <div className="p-4 sm:p-5 pt-0 border-t-0 space-y-2">
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#CBD8D4]">
            <a
              href={`https://wa.me/917026648960?text=Hi%20Cab%20Castle%20Goa%2C%20I%20would%20like%20to%20book%20a%20car%20for%20${encodeURIComponent(v.title)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#E7EDEB] hover:bg-[#25D366] text-[#1B2922] hover:text-white border border-[#CBD8D4] hover:border-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 text-center"
              title="Enquire on WhatsApp"
            >
              <MessageCircle size={13} className="shrink-0" />
              <span className="truncate">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => navigate(bookingUrl)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7C1F31] via-[#9B2A41] to-[#7C1F31] hover:brightness-105 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98 text-center border border-[#7C1F31]"
            >
              <span>Book Now</span>
              <ArrowUpRight size={13} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </Tilt3DCard>
  );
}

export default React.memo(VehicleCard);
