import React, { useEffect, useState } from "react";
import { Car } from "lucide-react";

export default function HeroAnimatedCarBackground() {
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax transform for background and car drive displacement
  const carTranslateX = Math.min(450, scrollOffset * 0.7);
  const bgParallaxY = scrollOffset * 0.15;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Cinematic Goa Coastal Highway Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-75 ease-out scale-105"
        style={{
          backgroundImage: `url('/goa_hero_bg.png')`,
          transform: `translate3d(0, ${bgParallaxY}px, 0)`,
        }}
      />

      {/* High Contrast Gradient Mask for Both Light & Dark Modes */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F9F8F6] via-[#F9F8F6]/92 to-[#F9F8F6]/40 dark:from-[#052420] dark:via-[#052420]/96 dark:to-[#052420]/75" />
    </div>
  );
}
