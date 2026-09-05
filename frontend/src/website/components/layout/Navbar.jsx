/* Cab Castle Goa — Signature Dark Prussian & Ocean Cyan Design System */
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  ArrowRight,
  Home,
  Compass,
  Car,
  Ticket,
  Info,
  ChevronRight,
  Phone,
  User,
  LogOut,
  Calendar,
  HelpCircle,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/",
    exact: true,
    icon: Home,
  },
  {
    label: "About Us",
    href: "/about",
    icon: Compass,
  },
  {
    label: "FAQs",
    href: "/faqs",
    icon: HelpCircle,
  },
  {
    label: "My Bookings",
    href: "/my-bookings",
    icon: Ticket,
  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const nav = navigate;
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 15);

      if (currentScrollY <= 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, href) => {
    if (href.startsWith("/")) {
      e.preventDefault();
      if (location.pathname !== href) {
        navigate(href);
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setMobileMenuOpen(false);
      return;
    }
    if (href === "#top" || href === "#hero") {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate("/");
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setMobileMenuOpen(false);
      return;
    }
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");

      const performScroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          const navHeight = 70;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementPosition - navHeight, behavior: "smooth" });
        }
      };

      if (location.pathname !== "/") {
        navigate("/", { state: { scrollTo: targetId } });
      } else {
        performScroll();
      }
      setMobileMenuOpen(false);
    }
  };

  const isLinkActive = (path, exact = false) => {
    if (path.startsWith("#")) return false;
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ── MAIN HEADER / NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${scrolled ? "bg-white/95 backdrop-blur-md border-b border-[#CBD8D4] shadow-xs py-2" : "bg-[#E7EDEB]/95 backdrop-blur-sm py-3 border-b border-[#CBD8D4]/60"}`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6" aria-label="Main navigation">
          <div className="flex items-center justify-between h-12 sm:h-13">
            
            {/* Left: Official Logo & Brand Wordmark */}
            <Link
              to="/"
              className="flex items-center gap-3 shrink-0 group"
              aria-label="Cab Castle Goa Home"
              data-testid="nav-logo"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#69A481]/40 bg-white flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform shadow-xs">
                <img
                  src="/logo.png"
                  alt="Cab Castle Goa"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-lg tracking-tight text-[#1B2922] leading-none">
                    Cab<span className="text-[#7C1F31]">Castle</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#DEEDE4] text-[#245339] font-black border border-[#69A481]/35 tracking-wider uppercase">
                    GOA
                  </span>
                </div>
                <span className="text-[9px] font-bold tracking-widest uppercase text-[#4D6257] leading-none mt-1">
                  Car Rentals &amp; Tours
                </span>
              </div>
            </Link>

            {/* Center: Minimalist Text Navigation (Desktop) */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isLinkActive(item.href, item.exact);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? "text-[#7C1F31] bg-[#DEEDE4] font-bold border border-[#69A481]/35 shadow-xs"
                        : "text-[#4D6257] hover:text-[#7C1F31] hover:bg-[#DEEDE4]/50"
                    }`}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <IconComponent
                      size={14}
                      className={
                        active
                          ? "text-[#69A481]"
                          : "text-[#6C8277]"
                      }
                    />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Right: Auth Action & Book Now CTA */}
            <div className="hidden md:flex items-center gap-2.5 shrink-0">
              {user ? (
                <button
                  onClick={() => logout()}
                  className="text-xs font-bold text-[#4D6257] hover:text-[#7C1F31] px-3 py-2 transition-colors flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-[#FEE2E2]"
                  data-testid="nav-logout-btn"
                  title="Sign out of account"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => nav("/login")}
                  className="text-xs font-bold text-[#1B2922] hover:text-[#7C1F31] px-3.5 py-2 transition-colors flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-[#DEEDE4] border border-[#CBD8D4]"
                  data-testid="nav-sign-in-btn"
                >
                  <User size={13} className="text-[#69A481]" />
                  <span>Sign In</span>
                </button>
              )}

              <button
                onClick={() => nav("/fleet")}
                className="bg-gradient-to-r from-[#7C1F31] via-[#9B2A41] to-[#7C1F31] hover:brightness-105 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 h-10 rounded-xl flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer active:scale-98 whitespace-nowrap border border-[#7C1F31]"
                data-testid="nav-book-cta"
              >
                <span>Reserve Car</span>
                <ArrowRight size={13} className="text-white" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#1B2922] bg-[#DEEDE4] border border-[#CBD8D4] hover:bg-[#DEEDE4]/80 active:scale-95 transition-all focus:outline-none cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              data-testid="nav-menu-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer with Card Segments */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="lg:hidden fixed top-[56px] left-0 right-0 z-50 px-4 pb-6 pt-3 flex flex-col gap-3 bg-[#E7EDEB] border-b border-[#CBD8D4] rounded-b-3xl shadow-xl animate-slideDown max-h-[calc(100vh-56px)] overflow-y-auto">
              
              {/* User Bar in Mobile Menu */}
              {user ? (
                <div className="p-3 bg-white border border-[#CBD8D4] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#7C1F31] text-[#E7EDEB] flex items-center justify-center text-xs font-black">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-[#1B2922]">{user.name || "Customer"}</span>
                      <span className="text-[10px] text-[#4D6257]">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-xl text-[#4D6257] hover:text-[#7C1F31] hover:bg-[#FEE2E2] transition-colors"
                    title="Logout"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    nav("/login");
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white border border-[#CBD8D4] hover:bg-[#DEEDE4] text-[#1B2922] font-bold text-xs flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#69A481]" />
                    <span>Customer Sign In / Register</span>
                  </div>
                  <ChevronRight size={14} className="text-[#4D6257]" />
                </button>
              )}

              <div className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const active = isLinkActive(item.href, item.exact);
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`py-2.5 px-4 text-xs font-bold rounded-2xl transition-all flex items-center justify-between border ${
                        active
                          ? "bg-[#7C1F31] text-white border-[#7C1F31] shadow-xs"
                          : "bg-white text-[#1B2922] border-[#CBD8D4] hover:bg-[#DEEDE4]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            active ? "bg-white/20 text-[#DEEDE4]" : "bg-[#DEEDE4] text-[#69A481]"
                          }`}
                        >
                          <IconComponent size={14} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} className={active ? "text-white/80" : "text-[#4D6257]"} />
                    </a>
                  );
                })}
              </div>

              {/* Mobile CTA */}
              <div className="pt-2 border-t border-[#CBD8D4] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    nav("/fleet");
                  }}
                  className="w-full bg-gradient-to-r from-[#7C1F31] via-[#9B2A41] to-[#7C1F31] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm border border-[#7C1F31] cursor-pointer"
                >
                  <span>Explore Car Rentals</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}