/* Coastal Cabs Goa Design System */
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Award, ShieldCheck, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutUsModal({ open, onOpenChange }) {
  const handleViewLocation = () => {
    onOpenChange(false);
    setTimeout(() => {
      const el = document.getElementById("locations");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#locations";
      }
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#F7F7F7] text-[#063247] border border-[#DFE8EC] rounded-[24px] p-6 sm:p-8 font-body" data-testid="about-us-modal">
        <DialogHeader className="mb-5 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E4F2F5] text-[#2A8FA8] text-xs font-bold uppercase tracking-wider mb-2.5 w-fit shadow-xs border border-[#C3E7FA]">
            <Sparkles size={13} /> Trusted Goa Cab Service
          </div>
          <DialogTitle className="font-display text-2xl sm:text-3xl text-[#063247] font-extrabold leading-tight flex items-center gap-3">
            About Cab Castle Goa
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#4C606E] mt-1.5 leading-relaxed font-normal">
            Goa’s premier tour travel &amp; cab rental service — delivering hourly packages (8 hrs / 80 km), airport transfers, and verified Sedans, SUVs &amp; Hatchbacks.
          </DialogDescription>
        </DialogHeader>

        {/* Core Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-[20px] bg-[#063247] text-white mb-5 shadow-sm font-mono">
          <div className="text-center p-1.5">
            <div className="font-display text-2xl font-bold text-white">2019</div>
            <div className="text-[10px] uppercase tracking-wider text-[#C3E7FA] mt-0.5 font-bold">Est. Year</div>
          </div>
          <div className="text-center p-1.5">
            <div className="font-display text-2xl font-bold text-white">30+</div>
            <div className="text-[10px] uppercase tracking-wider text-[#C3E7FA] mt-0.5 font-bold">Verified Cabs</div>
          </div>
          <div className="text-center p-1.5">
            <div className="font-display text-2xl font-bold text-white">20k+</div>
            <div className="text-[10px] uppercase tracking-wider text-[#C3E7FA] mt-0.5 font-bold">Happy Trips</div>
          </div>
          <div className="text-center p-1.5">
            <div className="font-display text-2xl font-bold text-[#288DA6]">4.9★</div>
            <div className="text-[10px] uppercase tracking-wider text-[#C3E7FA] mt-0.5 font-bold">Rating</div>
          </div>
        </div>

        {/* Story & Mission */}
        <div className="space-y-3.5 text-xs sm:text-sm text-[#063247] leading-relaxed font-body text-left">
          <div className="p-6 rounded-[20px] bg-white border border-[#DFE8EC] shadow-sm">
            <h3 className="font-display text-lg font-bold text-[#063247] mb-2 flex items-center gap-2">
              <Award className="text-[#288DA6]" size={20} /> Our Standards &amp; Principles
            </h3>
            <p className="text-[#4C606E] leading-relaxed mb-2 font-normal">
              Cab Castle Goa was founded by Dasgir Adur to provide predictable, transparent transportation and sightseeing tours across Goa. We eliminate the frustration of fluctuating tourist rates and unpunctual service.
            </p>
            <p className="text-[#4C606E] leading-relaxed font-normal">
              We operate on three key principles: <strong>clear hourly packages and transfer fares</strong>, <strong>sanitized and inspected vehicles</strong>, and <strong>24/7 dedicated dispatch support</strong>.
            </p>
          </div>

          {/* Pillars of Excellence Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-[18px] bg-white border border-[#DFE8EC] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#E4F2F5] text-[#2A8FA8] flex items-center justify-center mb-2.5 border border-[#C3E7FA]">
                <ShieldCheck size={16} />
              </div>
              <h4 className="font-bold text-sm text-[#063247] mb-1">Clean &amp; Sanitized</h4>
              <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
                Every Sedan, Ertiga, and Innova undergoes multi-point safety verification and thorough interior cleaning before handover.
              </p>
            </div>

            <div className="p-5 rounded-[18px] bg-white border border-[#DFE8EC] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#E4F2F5] text-[#2A8FA8] flex items-center justify-center mb-2.5 border border-[#C3E7FA]">
                <MapPin size={16} />
              </div>
              <h4 className="font-bold text-sm text-[#063247] mb-1">Airport &amp; Station Coverage</h4>
              <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
                Direct terminal pickups and drop-offs at Mopa (GOX), Dabolim (GOI), Margao &amp; Thivim stations with 24/7 flight coordination.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#DFE8EC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#2A8FA8] flex items-center gap-1.5 font-bold">
            <CheckCircle2 size={14} />
            <span>Licensed &amp; Verified Goa Cab Services</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              onClick={handleViewLocation}
              className="bg-[#063247] hover:bg-[#2A8FA8] text-white rounded-full px-5 h-10 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin size={13} className="text-[#C3E7FA]" /> View HQ &amp; Map
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-[#DFE8EC] bg-transparent text-[#063247] hover:bg-[#E4F2F5] rounded-full px-5 h-10 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
