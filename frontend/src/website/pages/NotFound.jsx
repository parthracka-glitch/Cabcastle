/* Coastal Cabs Goa Design System */
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Compass, Home, Car } from "lucide-react";

export default function NotFound() {
  return (
    <div className="no-scroll-x min-h-screen bg-[#F7F7F7] text-[#063247] flex flex-col justify-between relative overflow-x-hidden font-body">
      <SEO
        title="404 — Page Not Found | Cab Castle Goa"
        description="The page you are looking for does not exist or has been moved. Return to Cab Castle Goa home or explore our fleet."
      />
      <Navbar />

      <main className="py-20 md:py-32 px-6 flex items-center justify-center relative z-10">
        <div className="max-w-xl text-center space-y-5 bg-white p-8 sm:p-12 rounded-[24px] border border-[#DFE8EC] shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#E4F2F5] p-4 flex items-center justify-center text-[#288DA6] shadow-xs">
            <Compass size={32} />
          </div>

          <div className="text-xs uppercase tracking-wider text-[#4C606E] font-bold">
            Error 404
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#063247] leading-tight">
            Lost in Paradise?
          </h1>

          <p className="text-sm sm:text-base text-[#4C606E] max-w-md mx-auto leading-relaxed font-normal">
            The page or vehicle link you're looking for doesn't exist or may have moved. Let's get you back on track to explore Goa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#063247] hover:bg-[#288DA6] text-white font-bold rounded-full px-7 py-5 text-xs uppercase tracking-wider transition-all cursor-pointer">
                <Home size={14} className="mr-2" /> Back to Home
              </Button>
            </Link>

            <Link to="/fleet" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-[#DFE8EC] hover:bg-[#F8FAFC] bg-transparent text-[#063247] font-bold rounded-full px-7 py-5 text-xs uppercase tracking-wider transition-all cursor-pointer">
                <Car size={14} className="mr-2 text-[#0D9488]" /> Explore Fleet
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
