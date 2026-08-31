import React, { useState } from "react";
import { MapPin, Phone, Mail, Instagram, FileText, Lock, Cookie, ShieldCheck, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import CookiePreferencesModal from "../CookiePreferencesModal";

export default function Footer() {
  const [cookieModalOpen, setCookieModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#080C15] text-[#FFFFFF] pt-12 sm:pt-16 pb-8 sm:pb-10 border-t border-[#E5A93C]/20 relative font-body text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-8 sm:pb-12 border-b border-white/10">
            {/* Col 1 & 2: Brand Info */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden shadow-xs border-2 border-[#E5A93C]/40 bg-white flex items-center justify-center p-0.5">
                  <img
                    src="/logo.png"
                    alt="Cab Castle Goa"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-xl tracking-tight text-white leading-none">
                      Cab<span className="text-[#E5A93C]">Castle</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FAF2DE] text-[#B87A18] font-black border border-[#E5A93C]/35 tracking-wider uppercase">
                      GOA
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#F6D285] leading-none mt-1">
                    Premium Cabs &amp; Tour Travels
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#E2E8F0]/85 leading-relaxed max-w-sm font-normal">
                Goa's trusted cab service and tour reservation platform. Curated sedans, SUVs, spacious MPVs, and customized sightseeing itineraries with upfront guaranteed pricing.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://wa.me/917026648960"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E5A93C] hover:text-[#090D16] border border-[#E5A93C]/30 text-[#E5A93C] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group shadow-xs"
                  aria-label="WhatsApp"
                >
                  <Phone size={15} className="group-hover:text-[#090D16]" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E5A93C] hover:text-[#090D16] border border-[#E5A93C]/30 text-[#E5A93C] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group shadow-xs"
                  aria-label="Instagram"
                >
                  <Instagram size={15} className="group-hover:text-[#090D16]" />
                </a>
                <a
                  href="mailto:dasgiradur@gmail.com"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E5A93C] hover:text-[#090D16] border border-[#E5A93C]/30 text-[#E5A93C] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group shadow-xs"
                  aria-label="Email"
                >
                  <Mail size={15} className="group-hover:text-[#090D16]" />
                </a>
              </div>
            </div>

            {/* Col 3: Quick Links */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F6D285] font-mono">
                Our Fleet
              </h4>
              <ul className="space-y-2 text-xs text-[#E2E8F0]/85 font-normal">
                <li>
                  <Link to="/" className="hover:text-[#E5A93C] hover:underline transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#E5A93C] hover:underline transition-colors">About Us &amp; FAQs</Link>
                </li>
                <li>
                  <Link to="/tour-packages" className="hover:text-[#E5A93C] hover:underline transition-colors">Tour Packages</Link>
                </li>
                <li>
                  <Link to="/fleet" className="hover:text-[#E5A93C] hover:underline transition-colors">All Cabs &amp; Fleet</Link>
                </li>
                <li>
                  <Link to="/fleet?category=Sedan" className="hover:text-[#E5A93C] hover:underline transition-colors">Sedans</Link>
                </li>
                <li>
                  <Link to="/fleet?category=SUV" className="hover:text-[#E5A93C] hover:underline transition-colors">Ertiga &amp; Innova MPVs</Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setCookieModalOpen(true)}
                    className="hover:text-[#E5A93C] hover:underline transition-colors text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>Cookie Preferences</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & Policies */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F6D285] font-mono flex items-center gap-1.5">
                <Scale size={13} className="text-[#E5A93C]" />
                <span>Legal &amp; Policies</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#E2E8F0]/85 font-normal">
                <li>
                  <Link to="/terms" className="hover:text-[#E5A93C] hover:underline transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#E5A93C] hover:underline transition-colors">Privacy Policy (DPDP)</Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-[#E5A93C] hover:underline transition-colors">Refund Policy</Link>
                </li>
                <li>
                  <Link to="/cancellation-policy" className="hover:text-[#E5A93C] hover:underline transition-colors">Cancellation Policy</Link>
                </li>
                <li>
                  <Link to="/delivery-policy" className="hover:text-[#E5A93C] hover:underline transition-colors">Trip Dispatch Terms</Link>
                </li>
                <li>
                  <Link to="/legal" className="hover:text-[#E5A93C] hover:underline text-[#F6D285] font-bold transition-colors">
                    All Compliance Policies →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Contact & Operations */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#F6D285] font-mono">
                Direct Concierge
              </h4>
              <div className="space-y-2.5 text-xs text-[#E2E8F0]/85">
                <div className="text-[#FFFFFF] font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
                  <span>Executive: Dasgir Adur</span>
                </div>
                <div>
                  <a href="tel:+917026648960" className="hover:text-[#E5A93C] transition-colors flex items-center gap-2 font-mono font-medium text-[#FFFFFF]">
                    <Phone size={13} className="text-[#E5A93C]" />
                    <span>+91 70266 48960</span>
                  </a>
                </div>
                <div>
                  <a href="https://wa.me/917026648960" target="_blank" rel="noreferrer" className="hover:text-[#E5A93C] transition-colors flex items-center gap-2 font-mono font-medium text-[#FFFFFF]">
                    <Phone size={13} className="text-[#E5A93C]" />
                    <span>WhatsApp: 7026648960</span>
                  </a>
                </div>
                <div>
                  <a href="mailto:dasgiradur@gmail.com" className="hover:text-[#E5A93C] transition-colors flex items-center gap-2 text-[#E2E8F0]/85 break-all">
                    <Mail size={13} className="text-[#E5A93C] shrink-0" />
                    <span>dasgiradur@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Compliance */}
          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#E2E8F0]/60">
            <div>
              &copy; {new Date().getFullYear()} Cab Castle Goa. All rights reserved. Cab Castle Goa, India.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs">
              <Link
                to="/terms"
                className="hover:text-[#E5A93C] hover:underline cursor-pointer flex items-center gap-1"
              >
                <FileText size={12} className="text-[#E5A93C]" /> Terms
              </Link>
              <span>•</span>
              <Link
                to="/privacy"
                className="hover:text-[#E5A93C] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Lock size={12} className="text-[#E5A93C]" /> Privacy
              </Link>
              <span>•</span>
              <Link
                to="/security"
                className="hover:text-[#E5A93C] hover:underline cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck size={12} className="text-[#E5A93C]" /> Security
              </Link>
              <span>•</span>
              <button
                type="button"
                onClick={() => setCookieModalOpen(true)}
                className="hover:text-[#E5A93C] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Cookie size={12} className="text-[#E5A93C]" /> Cookie Preferences
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
