import React, { useState } from "react";
import { Phone, Mail, Instagram, Scale, Cookie, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CookiePreferencesModal from "../CookiePreferencesModal";

export default function Footer() {
  const [cookieModalOpen, setCookieModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#24060C] text-[#FFFFFF] pt-12 sm:pt-14 pb-8 sm:pb-10 border-t border-[#69A481]/25 relative font-body text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pb-8 sm:pb-10 border-b border-white/10">
            
            {/* Col 1: Brand & About */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden shadow-xs border-2 border-[#69A481]/40 bg-white flex items-center justify-center p-0.5">
                  <img
                    src="/logo.png"
                    alt="Cab Castle Goa"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-xl tracking-tight text-white leading-none">
                      Cab<span className="text-[#69A481]">Castle</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#DEEDE4] text-[#245339] font-black border border-[#69A481]/35 tracking-wider uppercase">
                      GOA
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#8FC4A5] leading-none mt-1">
                    Car Rentals &amp; Tour Travels
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#E7EDEB]/80 leading-relaxed max-w-sm font-normal">
                Goa's premier car rental and tour reservation platform. Curated sedans, SUVs, executive MPVs, and customized sightseeing itineraries with upfront guaranteed pricing.
              </p>

              {/* Social Channels */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://wa.me/917026648960"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#69A481] hover:text-[#24060C] border border-[#69A481]/30 text-[#69A481] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group shadow-xs"
                  aria-label="WhatsApp"
                >
                  <Phone size={14} className="group-hover:text-[#24060C]" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#69A481] hover:text-[#24060C] border border-[#69A481]/30 text-[#69A481] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group shadow-xs"
                  aria-label="Instagram"
                >
                  <Instagram size={14} className="group-hover:text-[#24060C]" />
                </a>
                <a
                  href="mailto:dasgiradur@gmail.com"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#69A481] hover:text-[#24060C] border border-[#69A481]/30 text-[#69A481] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group shadow-xs"
                  aria-label="Email"
                >
                  <Mail size={14} className="group-hover:text-[#24060C]" />
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#8FC4A5] font-mono">
                Explore
              </h4>
              <ul className="space-y-2.5 text-xs text-[#E7EDEB]/80 font-normal">
                <li>
                  <Link to="/" className="hover:text-[#69A481] transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/fleet" className="hover:text-[#69A481] transition-colors">Fleet &amp; Pricing</Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#69A481] transition-colors">About Us &amp; FAQs</Link>
                </li>
                <li>
                  <Link to="/legal" className="hover:text-[#69A481] transition-colors flex items-center gap-1.5 text-[#8FC4A5] font-semibold">
                    <Scale size={12} className="text-[#69A481]" />
                    <span>Legal &amp; Policies</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Direct Concierge & Contact */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#8FC4A5] font-mono">
                Direct Concierge
              </h4>
              <div className="space-y-2 text-xs text-[#E7EDEB]/80">
                <div className="text-[#FFFFFF] font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#69A481]" />
                  <span>Executive: Dasgir Adur</span>
                </div>
                <div>
                  <a
                    href="tel:+917026648960"
                    className="hover:text-[#69A481] transition-colors flex items-center gap-2 font-mono text-[#FFFFFF]"
                  >
                    <Phone size={13} className="text-[#69A481]" />
                    <span>+91 70266 48960</span>
                  </a>
                </div>
                <div>
                  <a
                    href="https://wa.me/917026648960"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#69A481] transition-colors flex items-center gap-2 font-mono text-[#FFFFFF]"
                  >
                    <Phone size={13} className="text-[#69A481]" />
                    <span>WhatsApp: 7026648960</span>
                  </a>
                </div>
                <div>
                  <a
                    href="mailto:dasgiradur@gmail.com"
                    className="hover:text-[#69A481] transition-colors flex items-center gap-2 text-[#E7EDEB]/80 break-all"
                  >
                    <Mail size={13} className="text-[#69A481] shrink-0" />
                    <span>dasgiradur@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Single Tab Pin */}
          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#E7EDEB]/60">
            <div>
              &copy; {new Date().getFullYear()} Cab Castle Goa. All rights reserved.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <Link
                to="/legal"
                className="hover:text-[#69A481] transition-colors flex items-center gap-1.5 text-[#E7EDEB]/80"
              >
                <Scale size={12} className="text-[#69A481]" />
                <span>Legal &amp; Policies</span>
              </Link>
              <span>•</span>
              <button
                type="button"
                onClick={() => setCookieModalOpen(true)}
                className="hover:text-[#69A481] transition-colors flex items-center gap-1.5 text-[#E7EDEB]/80 cursor-pointer"
              >
                <Cookie size={12} className="text-[#69A481]" />
                <span>Cookie Preferences</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Cookie Preferences Modal */}
      <CookiePreferencesModal
        open={cookieModalOpen}
        onOpenChange={setCookieModalOpen}
      />
    </>
  );
}
