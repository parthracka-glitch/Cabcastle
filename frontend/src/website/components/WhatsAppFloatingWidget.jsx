import React, { useState } from "react";
import { MessageCircle, X, Send, Sparkles, Phone, ShieldCheck } from "lucide-react";

export default function WhatsAppFloatingWidget() {
  const [open, setOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");

  const quickPrompts = [
    { title: "🚖 Book a Cab for Today", text: "Hi Cab Castle Goa! I would like to book a cab for today in Goa." },
    { title: "✈️ Airport Transfer (Mopa / Dabolim)", text: "Hi! I need an Airport Transfer to/from Goa Airport." },
    { title: "🌴 Sightseeing Tour Package", text: "Hi! I'm planning a Goa Sightseeing Tour and would like a quote." },
    { title: "💬 Custom Itinerary Help", text: "Hello! Can you help me plan a custom cab itinerary for my Goa trip?" },
  ];

  const handleSend = (text) => {
    const message = encodeURIComponent(text || customMsg || "Hello Cab Castle Goa! I have an inquiry.");
    window.open(`https://wa.me/917026648960?text=${message}`, "_blank");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Bubble Card */}
      {open && (
        <div className="mb-3 w-[320px] sm:w-[350px] bg-white border border-[#DFE8EC] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 text-left">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#063247] to-[#0E7490] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl">
                  👑
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-[#063247] rounded-full" />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-sm leading-tight text-white flex items-center gap-1.5">
                  Cab Castle Goa
                  <span className="text-[10px] bg-[#25D366]/20 text-[#25D366] px-1.5 py-0.2 rounded-full font-bold">Online</span>
                </h4>
                <p className="text-[11px] text-white/80 mt-0.5">24/7 WhatsApp Dispatch &amp; Support</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body / Quick Prompts */}
          <div className="p-4 bg-[#F8FAFC] space-y-3">
            <div className="bg-white p-3 rounded-2xl border border-[#DFE8EC] text-xs text-[#063247] shadow-2xs leading-relaxed">
              👋 <strong>Hi there!</strong> Need quick booking assistance or pricing for Goa cabs? Choose a prompt below or type your message:
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Quick Inquiries</span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.text)}
                  className="w-full p-2.5 bg-white hover:bg-[#E4F2F5] border border-[#DFE8EC] hover:border-[#288DA6]/40 rounded-xl text-left text-xs font-semibold text-[#063247] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>{q.title}</span>
                  <Send size={12} className="text-[#288DA6] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 bg-white border border-[#DFE8EC] rounded-xl p-1.5 focus-within:border-[#288DA6]">
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(customMsg)}
                  placeholder="Type your question..."
                  className="flex-1 px-2 py-1 text-xs text-[#063247] outline-none bg-transparent"
                />
                <button
                  onClick={() => handleSend(customMsg)}
                  className="w-8 h-8 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-4 py-2 bg-white border-t border-[#DFE8EC] text-[10px] text-[#64748B] flex items-center justify-between font-medium">
            <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-[#25D366]" /> Official Verified Line</span>
            <span>+91 70266 48960</span>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/40"
        aria-label="WhatsApp Support"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>

        <MessageCircle size={22} className="fill-white text-transparent" />
        <span className="font-bold text-xs tracking-wide pr-0.5 hidden sm:inline">24/7 WhatsApp Help</span>
      </button>
    </div>
  );
}
