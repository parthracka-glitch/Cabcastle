/* Brex Design System */
import React from "react";
import Marquee from "react-fast-marquee";
import { Star, Award, MessageSquareQuote } from "lucide-react";
import api from "@/lib/api";
import { GoogleIcon } from "../pages/Landing";

export default function ReviewsMarquee() {
  const [reviews, setReviews] = React.useState([]);

  React.useEffect(() => {
    api.get("/reviews").then(({ data }) => setReviews(data)).catch(() => {});
  }, []);

  return (
    <section id="reviews" className="py-12 sm:py-16 bg-[#F6F5FA] text-[#212121] relative overflow-hidden border-t border-[#DFDCE8] font-body">
      <div className="max-w-7xl mx-auto px-6 mb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF0A3] text-[#212121] text-xs uppercase tracking-wider font-bold mb-2.5 shadow-xs">
              <Award size={13} /> Verified Traveller Stories
            </div>
            <h2 className="font-display text-2xl sm:text-4xl text-[#212121] font-bold leading-tight">
              Loved by <span className="text-[#212121]">15,000+ Drivers</span>
            </h2>
          </div>

          {/* Rating Summary Bar */}
          <div className="flex items-center gap-4 bg-white border border-[#DFDCE8] p-3.5 sm:p-4 rounded-[20px] shadow-sm text-left">
            <div className="text-center pr-4 border-r border-[#DFDCE8]">
              <div className="font-display text-2xl font-bold text-[#212121]">4.9</div>
              <div className="flex text-[#212121] justify-center mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} fill="currentColor" />
                ))}
              </div>
            </div>
            <div className="text-xs text-[#6F6E73]">
              <div className="font-bold flex items-center gap-1.5 text-[#212121]">
                <GoogleIcon className="w-3.5 h-3.5" />
                Google Verified Reviews
              </div>
              <div className="text-[#99989E] mt-0.5 font-normal">100% Genuine Goa Trip Feedback</div>
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE UNIFIED REVIEWS SCROLL BAR LINE */}
      <div className="marquee-mask">
        <Marquee gradient={false} speed={35} pauseOnHover>
          {reviews.map((r, i) => (
            <article
              key={`review-card-${i}`}
              className="mx-3 w-[340px] bg-white rounded-[24px] p-6 border border-[#DFDCE8] hover:border-[#212121] transition-all shadow-sm flex-shrink-0 text-left"
              data-testid={`review-card-${i}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#DFDCE8]"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-[#DFDCE8] flex items-center justify-center p-0.5">
                    <GoogleIcon className="w-2.5 h-2.5" />
                  </span>
                </div>
                <div>
                  <div className="font-display text-xs font-bold text-[#212121]">{r.name}</div>
                  <div className="text-[11px] text-[#99989E] font-normal">{r.date || "Goa Explorer"}</div>
                </div>
                <div className="ml-auto flex items-center gap-0.5 text-[#212121]">
                  {[...Array(r.rating || 5)].map((_, idx) => (
                    <Star key={idx} size={12} fill="currentColor" />
                  ))}
                </div>
              </div>

              <div className="relative">
                <p className="font-body text-xs text-[#6F6E73] leading-relaxed">"{r.text}"</p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[#DFDCE8] flex items-center justify-between text-[10px] text-[#99989E] uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5 text-[#212121]">
                  <GoogleIcon className="w-3 h-3" /> Google Verified
                </span>
                <span className="text-[#99989E]">Goa Hub</span>
              </div>
            </article>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
