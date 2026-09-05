import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/api";

export default function LightboxModal({ images = [], initialIndex = 0, isOpen = false, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn select-none"
      onClick={() => onClose()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between w-full max-w-6xl mx-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-white/80 font-mono text-xs sm:text-sm bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-white/60 text-xs hidden sm:inline">Use Arrow Keys or Swipe to navigate</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer border border-white/10"
            title={isZoomed ? "Zoom Out" : "Zoom In"}
          >
            {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#7C1F31] hover:bg-[#631826] text-white flex items-center justify-center transition cursor-pointer shadow-md"
            title="Close Lightbox (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center max-w-6xl w-full mx-auto my-2 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[#69A481] text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer z-20 shadow-lg"
            title="Previous Image"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Center Image */}
        <div className="max-h-[78vh] max-w-full flex items-center justify-center overflow-auto rounded-2xl">
          <img
            src={getOptimizedImageUrl(currentImage)}
            alt={`Fleet View ${currentIndex + 1}`}
            className={`max-h-[75vh] w-auto max-w-full object-contain rounded-xl transition-transform duration-300 ${
              isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/vehicles/maruti_dzire.webp";
            }}
          />
        </div>

        {/* Next Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[#69A481] text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer z-20 shadow-lg"
            title="Next Image"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-3xl mx-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setIsZoomed(false);
              }}
              className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                idx === currentIndex
                  ? "border-[#69A481] scale-105 shadow-md"
                  : "border-white/20 opacity-50 hover:opacity-100"
              }`}
            >
              <img
                src={getOptimizedImageUrl(img)}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/vehicles/maruti_dzire.webp";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
