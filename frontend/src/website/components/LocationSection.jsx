/* Cab Castle Goa Design System - Headquarters & Contact Section (Mint #69A481, White Smoke #E7EDEB, Claret #7C1F31) */
import React from "react";
import { MapPin, Phone, Mail, Globe, Navigation, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocationSection() {
  const addressQuery = "Assagao, Bardez, Goa 403507";
  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(addressQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="locations" className="py-12 sm:py-16 bg-[#E7EDEB] text-[#1B2922] border-t border-[#CBD8D4] font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="mb-6 sm:mb-8 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#DEEDE4] text-[#245339] border border-[#69A481]/35 mb-2">
            <MapPin size={12} className="text-[#69A481]" />
            <span>Strategic Operations</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#1B2922] tracking-tight font-display">
            Central Dispatch Concierge in Assagao, Bardez
          </h2>
          <p className="text-xs sm:text-sm text-[#4D6257] mt-1 font-normal">
            Strategic car rental dispatch hub covering North &amp; South Goa, 24/7 direct airport express transfers (Mopa GOX &amp; Dabolim GOI), and full-day tour packages.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left Column: Information Box */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-[28px] border border-[#CBD8D4] shadow-xs flex flex-col justify-between text-left">
            <div>
              {/* Profile / Founder Header */}
              <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-[#CBD8D4]">
                <div className="w-12 h-12 rounded-2xl bg-[#7C1F31] text-[#E7EDEB] border border-[#69A481]/40 flex items-center justify-center text-sm font-black tracking-wider shrink-0 shadow-xs">
                  DA
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1B2922] leading-tight font-display">
                    Dasgir Adur
                  </h3>
                  <p className="text-xs text-[#4D6257] font-medium mt-0.5">
                    Managing Director — Cab Castle Goa
                  </p>
                </div>
              </div>

              {/* Information Details List */}
              <div className="space-y-4 text-xs sm:text-sm mb-6 sm:mb-8">
                {/* Address */}
                <div className="flex items-start gap-3.5 text-[#1B2922]">
                  <MapPin size={16} className="text-[#69A481] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-[#4D6257] uppercase tracking-wider font-bold">
                      ADDRESS
                    </span>
                    <span className="font-medium text-[#1B2922] text-xs sm:text-sm">
                      Assagao, Bardez - Goa 403507.
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5 text-[#1B2922]">
                  <Phone size={16} className="text-[#69A481] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-[#4D6257] uppercase tracking-wider font-bold">
                      PHONE
                    </span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-bold font-mono text-[#1B2922] text-xs sm:text-sm">
                      <a href="tel:+917026648960" className="hover:text-[#7C1F31] transition-colors">
                        +91 70266 48960
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5 text-[#1B2922]">
                  <Mail size={16} className="text-[#69A481] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-[#4D6257] uppercase tracking-wider font-bold">
                      EMAIL
                    </span>
                    <a
                      href="mailto:dasgiradur@gmail.com"
                      className="font-medium text-[#1B2922] hover:text-[#7C1F31] transition-colors text-xs sm:text-sm break-all"
                    >
                      dasgiradur@gmail.com
                    </a>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-start gap-3.5 text-[#1B2922]">
                  <Globe size={16} className="text-[#69A481] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-[#4D6257] uppercase tracking-wider font-bold">
                      WEBSITE
                    </span>
                    <span className="font-medium text-[#1B2922] text-xs sm:text-sm">
                      cabcastlegoa.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#CBD8D4]">
              <a
                href="https://wa.me/917026648960?text=Hello%20Cab%20Castle%20Goa,%20I%20want%20to%20inquire%20about%20booking%20a%20car%20in%20Goa"
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-[#69A481] hover:bg-[#528A69] text-white font-black text-xs uppercase tracking-wider h-11 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all border border-[#69A481]/40">
                  <MessageSquare size={14} className="text-white" />
                  <span>WHATSAPP</span>
                </Button>
              </a>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full bg-white hover:bg-[#DEEDE4] text-[#1B2922] border border-[#CBD8D4] hover:border-[#69A481] font-bold text-xs uppercase tracking-wider h-11 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Navigation size={14} className="text-[#69A481]" />
                  <span>DIRECTIONS</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Map Box */}
          <div className="lg:col-span-7 bg-white rounded-[28px] border border-[#CBD8D4] shadow-xs overflow-hidden flex flex-col min-h-[300px] sm:min-h-[380px]">
            {/* Dark Top Bar */}
            <div className="px-5 py-3.5 bg-[#24060C] text-white flex items-center justify-between text-xs font-medium border-b border-white/10">
              <div className="flex items-center gap-2 truncate">
                <MapPin size={14} className="text-[#69A481] shrink-0" />
                <span className="truncate font-medium text-[11px] sm:text-xs">Assagao (Bardez), Goa 403507</span>
              </div>
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#8FC4A5] hover:text-white transition-colors text-[11px] sm:text-xs flex items-center gap-1 shrink-0 font-bold ml-2"
              >
                <span>Open in Maps</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Google Map Embed */}
            <div className="flex-1 w-full h-full min-h-[250px] sm:min-h-[320px]">
              <iframe
                title="Cab Castle Goa Headquarters Map"
                src={mapEmbedUrl}
                className="w-full h-full border-0 min-h-[250px] sm:min-h-[320px]"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
