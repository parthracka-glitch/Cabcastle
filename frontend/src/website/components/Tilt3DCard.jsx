import React, { useRef, useEffect } from "react";

export default function Tilt3DCard({
  children,
  className = "",
  maxTilt = 6,
  scale = 1.015,
  glare = true,
}) {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    // Check if device supports hover
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: none)").matches) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const mouseX = (clientX - rect.left - width / 2) / (width / 2);
      const mouseY = (clientY - rect.top - height / 2) / (height / 2);

      const rotateX = (-mouseY * maxTilt).toFixed(2);
      const rotateY = (mouseX * maxTilt).toFixed(2);

      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      cardRef.current.style.transition = "transform 0.08s ease-out";

      if (glare && glareRef.current) {
        const glareX = ((clientX - rect.left) / width) * 100;
        const glareY = ((clientY - rect.top) / height) * 100;
        glareRef.current.style.opacity = "0.25";
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35), transparent 65%)`;
      }
    });
  };

  const handleMouseEnter = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.08s ease-out";
    }
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      cardRef.current.style.transition = "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)";
    }
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = "0";
      glareRef.current.style.transition = "opacity 0.3s ease";
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      }}
    >
      {children}

      {/* Dynamic 3D Specular Light Glare */}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[inherit] opacity-0"
        />
      )}
    </div>
  );
}

