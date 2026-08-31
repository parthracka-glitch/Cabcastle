/* Coastal Cabs Goa Design System */
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShieldCheck, Lock, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TermsModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#F7F7F7] text-[#063247] border border-[#DFE8EC] rounded-[24px] p-6 sm:p-8 font-body">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="font-display text-xl sm:text-2xl text-[#063247] font-extrabold flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#063247] text-white flex items-center justify-center">
              <FileText size={18} className="text-[#2A8FA8]" />
            </div>
            Terms &amp; Conditions
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-wider mt-1 text-[#4C606E] font-bold">
            Cab Castle Goa · Cab &amp; Tour Package Agreement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-xs sm:text-sm text-[#063247] leading-relaxed font-body text-left">
          <section className="bg-white p-5 rounded-[16px] border border-[#DFE8EC] shadow-xs">
            <h4 className="font-bold text-sm text-[#063247] mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#288DA6]" /> 1. Booking &amp; Passenger Verification
            </h4>
            <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
              A valid government photo ID is required for booking confirmation and cab dispatch verification. All rides are operated with verified commercial drivers.
            </p>
          </section>

          <section className="bg-white p-5 rounded-[16px] border border-[#DFE8EC] shadow-xs">
            <h4 className="font-bold text-sm text-[#063247] mb-1 flex items-center gap-2">
              <FileText size={16} className="text-[#288DA6]" /> 2. Hourly Package Limits
            </h4>
            <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
              Hourly packages include 8 hours and 80 kilometers per day. Additional hours (₹250/hr) and kilometers (₹25/km) will be billed upon trip conclusion. Night charges of ₹500 apply for travel beyond regular hours.
            </p>
          </section>

          <section className="bg-white p-5 rounded-[16px] border border-[#DFE8EC] shadow-xs">
            <h4 className="font-bold text-sm text-[#063247] mb-1 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#288DA6]" /> 3. Vehicle Usage &amp; Road Rules
            </h4>
            <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
              Smoking and drinking alcohol inside vehicles is strictly prohibited. Passengers are requested to maintain decorum and cooperate with drivers for timely arrivals.
            </p>
          </section>

          <section className="bg-white p-5 rounded-[16px] border border-[#DFE8EC] shadow-xs">
            <h4 className="font-bold text-sm text-[#063247] mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#288DA6]" /> 4. Cancellation &amp; Refund Policy
            </h4>
            <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
              Cancellations requested at least 24 hours prior to scheduled pickup receive a 100% refund processed within 24–48 hours to the original payment method.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-[#DFE8EC] flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#288DA6] hover:bg-[#288DA6]/90 text-white rounded-full px-6 h-10 font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            I Understand &amp; Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NdaModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#F7F7F7] text-[#063247] border border-[#DFE8EC] rounded-[24px] p-6 sm:p-8 font-body">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="font-display text-xl sm:text-2xl text-[#063247] font-extrabold flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#063247] text-white flex items-center justify-center">
              <Lock size={18} className="text-[#288DA6]" />
            </div>
            Privacy &amp; Data Protection
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-wider mt-1 text-[#4C606E] font-bold">
            Cab Castle Goa · Privacy Commitment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-xs sm:text-sm text-[#063247] leading-relaxed font-body text-left">
          <section className="bg-white p-5 rounded-[16px] border border-[#DFE8EC] shadow-xs">
            <h4 className="font-bold text-sm text-[#063247] mb-1 flex items-center gap-2">
              <Lock size={16} className="text-[#288DA6]" /> 1. Customer Personal Data Protection
            </h4>
            <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
              Cab Castle Goa strictly safeguards all customer identity documents, contact numbers, email addresses, and payment records. Your information will never be disclosed, traded, or sold to third-party advertisers.
            </p>
          </section>

          <section className="bg-white p-5 rounded-[16px] border border-[#DFE8EC] shadow-xs">
            <h4 className="font-bold text-sm text-[#063247] mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#288DA6]" /> 2. Confidentiality of Travel Itineraries
            </h4>
            <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
              Any trip planning details, custom hotel delivery destinations, flight schedules, or travel routes shared with our dispatch desk are treated with the utmost discretion.
            </p>
          </section>

          <section className="bg-white p-5 rounded-[16px] border border-[#DFE8EC] shadow-xs">
            <h4 className="font-bold text-sm text-[#063247] mb-1 flex items-center gap-2">
              <Lock size={16} className="text-[#288DA6]" /> 3. Secure Payment Gateway Tokenization
            </h4>
            <p className="text-xs text-[#4C606E] leading-relaxed font-normal">
              Payment card numbers and banking credentials are never stored on Cab Castle Goa servers. Transactions are handled exclusively via PCI-DSS compliant secure payment gateways.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-[#DFE8EC] flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#2A8FA8] hover:bg-[#22768C] text-white rounded-full px-6 h-10 font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
