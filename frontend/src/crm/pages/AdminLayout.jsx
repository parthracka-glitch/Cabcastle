import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Car, ClipboardList, Ticket, LogOut, CalendarDays,
  ShieldCheck, Search, Bell, Sparkles, SlidersHorizontal, Settings, Clock, BarChart3, ChevronDown, Menu, X, UserCheck
} from "lucide-react";
import OfflineBookingModal from "../components/OfflineBookingModal";
import EnquiryModal from "../components/EnquiryModal";
import NotificationCenter from "../components/NotificationCenter";

const MAIN_LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/admin/fleet", label: "Fleet", icon: Car },
  { to: "/admin/drivers", label: "Drivers", icon: UserCheck },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-[100dvh] w-full bg-[#F7F7F7] p-1 sm:p-2.5 md:p-4 font-body text-[#063247] relative overflow-x-hidden flex flex-col justify-start md:justify-center">
      {/* Main Floating Dashboard Shell Container */}
      <div className="relative z-10 max-w-[1600px] w-full mx-auto bg-[#F7F7F7] rounded-[1.25rem] sm:rounded-[2rem] shadow-xl border border-[#DFE8EC] h-[calc(100dvh-0.5rem)] sm:h-[calc(100dvh-1.25rem)] md:h-[calc(100dvh-2rem)] flex flex-col lg:flex-row overflow-hidden">
        
        {/* MOBILE HEADER BAR */}
        <div className="lg:hidden bg-[#FFFFFF] border-b border-[#DFE8EC] px-3.5 py-2.5 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white border border-[#DFE8EC] text-[#063247] font-bold cursor-pointer hover:bg-[#F7F7F7] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <NavLink to="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden shadow-2xs border border-[#DFE8EC] bg-white flex items-center justify-center p-0.5">
                <img
                  src="/logo.png"
                  alt="Cab Castle Goa"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="font-display font-extrabold text-sm text-[#063247]">
                  Cab<span className="text-[#288DA6]">Castle</span>
                </span>
                <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#4C606E] mt-0.5">
                  Admin Console
                </span>
              </div>
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <NotificationCenter />
            <NavLink
              to="/admin/settings"
              className="w-8 h-8 rounded-full overflow-hidden border border-[#DFE8EC] bg-white p-0.5 flex items-center justify-center"
              title="Admin Profile"
            >
              <div className="w-full h-full rounded-full bg-[#063247] text-white flex items-center justify-center font-bold text-xs">
                DA
              </div>
            </NavLink>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* LEFT SIDEBAR */}
        <aside
          className={`w-full sm:w-72 lg:w-64 bg-[#FFFFFF] border-r border-[#DFE8EC] p-5 sm:p-6 flex flex-col justify-between shrink-0 transition-all duration-300 ${
            mobileMenuOpen
              ? "fixed top-0 bottom-0 left-0 z-50 shadow-2xl bg-[#F7F7F7] overflow-y-auto"
              : "hidden lg:flex"
          }`}
        >
          <div>
            {/* Mobile Header Inside Drawer */}
            <div className="flex lg:hidden items-center justify-between pb-4 mb-4 border-b border-[#DFE8EC]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden shadow-2xs border border-[#DFE8EC] bg-white flex items-center justify-center p-0.5">
                  <img
                    src="/logo.png"
                    alt="Cab Castle Goa"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="font-display font-extrabold text-base text-[#063247]">
                    Cab<span className="text-[#288DA6]">Castle</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#4C606E] mt-0.5">
                    Admin CRM
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-white border border-[#DFE8EC] text-[#063247]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Desktop Brand Logo Header */}
            <NavLink
              to="/admin"
              className="hidden lg:flex items-center gap-3 mb-8 px-2 group cursor-pointer"
              title="Cab Castle Admin Portal"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden shadow-xs border border-[#DFE8EC] bg-white flex items-center justify-center p-0.5 group-hover:scale-105 group-hover:shadow-md transition-all shrink-0">
                <img
                  src="/logo.png"
                  alt="Cab Castle Goa"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-display font-extrabold text-base tracking-tight text-[#063247]">
                  Cab<span className="text-[#288DA6]">Castle</span>
                </span>
                <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#4C606E]">
                  Admin Console
                </span>
              </div>
            </NavLink>

            {/* Navigation Groups */}
            <div className="space-y-6">
              {/* Main Section */}
              <div>
                <div className="px-3 mb-2 font-mono text-[10px] uppercase font-bold tracking-widest text-[#8FA0BF]">
                  Main Menu
                </div>
                <nav className="relative space-y-1">
                  {/* Active Indicator */}
                  {(() => {
                    const activeIndex = MAIN_LINKS.findIndex(({ to, end }) =>
                      end ? location.pathname === to : location.pathname.startsWith(to) && to !== "/admin"
                    );
                    if (activeIndex === -1) return null;
                    return (
                      <div
                        className="absolute left-0 right-0 h-[38px] bg-[#2A354F] rounded-full shadow-md pointer-events-none transition-all duration-300"
                        style={{
                          transform: `translateY(${activeIndex * 42}px)`,
                          transitionTimingFunction: "cubic-bezier(0.34, 1.5, 0.64, 1)",
                        }}
                      />
                    );
                  })()}

                  {MAIN_LINKS.map(({ to, label, icon: Icon, end }) => {
                    const isActive = end
                      ? location.pathname === to
                      : location.pathname.startsWith(to) && to !== "/admin";
                    return (
                      <NavLink
                        key={label}
                        to={to}
                        end={end}
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`nav-${label.toLowerCase()}`}
                        className={`relative z-10 flex items-center gap-3 px-4 h-[38px] rounded-full text-xs font-bold tracking-wide transition-colors duration-200 ${
                          isActive
                            ? "text-white font-bold"
                            : "text-[#6B7C9E] hover:text-[#2A354F] hover:bg-[#FEFEF2]"
                        }`}
                      >
                        <Icon size={16} className={`transition-colors duration-200 ${isActive ? "text-[#F2D965]" : "text-[#8FA0BF]"}`} />
                        <span>{label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Tools Section */}
              <div>
                <div className="px-3 mb-2 font-mono text-[10px] uppercase font-bold tracking-widest text-[#8496A2]">
                  Quick Actions
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => { setOfflineModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold tracking-wide text-[#4C606E] hover:text-[#063247] hover:bg-[#F7F7F7] transition-all text-left cursor-pointer"
                    data-testid="nav-new-booking-btn"
                  >
                    <Clock size={16} className="text-[#2A8FA8]" />
                    <span>New Booking</span>
                  </button>

                  <button
                    onClick={() => { setEnquiryModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold tracking-wide text-[#4C606E] hover:text-[#063247] hover:bg-[#F7F7F7] transition-all text-left cursor-pointer"
                    data-testid="nav-new-lead-btn"
                  >
                    <BarChart3 size={16} className="text-[#2A8FA8]" />
                    <span>Leads &amp; Enquiries</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* User Footer Account Card */}
          <div className="pt-3 mt-auto border-t border-[#DFE8EC] shrink-0">
            <div className="flex items-center justify-between gap-2 p-2 bg-[#F7F7F7] rounded-2xl border border-[#DFE8EC]">
              <NavLink
                to="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0 p-1 hover:bg-[#FFFFFF] rounded-xl transition-colors"
                title="View Admin Profile & Settings"
                data-testid="admin-profile-card-link"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#DFE8EC] bg-[#063247] p-0.5 shrink-0 flex items-center justify-center shadow-xs">
                  <span className="text-white font-bold text-xs">DA</span>
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs text-[#063247] truncate">{user?.name || "Dasgir Adur"}</div>
                  <div className="text-[10px] text-[#4C606E] truncate font-mono">{user?.email || "dasgiradur@gmail.com"}</div>
                </div>
              </NavLink>

              <button
                onClick={async () => {
                  await logout();
                  nav("/admin/login");
                }}
                className="p-2 rounded-xl text-[#E8826B] hover:bg-[#E8826B]/15 border border-[#E8826B]/30 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 font-mono text-[11px] font-bold"
                title="Sign out of account"
                data-testid="admin-logout"
              >
                <LogOut size={15} />
                <span className="hidden xl:inline">Exit</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overscroll-y-contain no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[#F7F7F7]">
          {/* Desktop Header Bar */}
          <header className="hidden lg:flex p-4 sm:p-6 pb-3 sm:pb-4 flex-wrap items-center justify-between gap-4 border-b border-[#DFE8EC] bg-[#F7F7F7]">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#4C606E]">
              Cab Castle Goa — Executive Dispatch CRM
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <NotificationCenter />

              <NavLink
                to="/admin/settings"
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-[#063247] p-0.5 flex items-center justify-center hover:ring-2 hover:ring-[#288DA6] transition-all cursor-pointer"
                title="Admin Settings & Profile"
                data-testid="admin-header-avatar"
              >
                <span className="text-white font-bold text-xs">DA</span>
              </NavLink>
            </div>
          </header>

          {/* Page Content Outlet */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Global Admin Modals */}
      <OfflineBookingModal open={offlineModalOpen} onOpenChange={setOfflineModalOpen} />
      <EnquiryModal open={enquiryModalOpen} onOpenChange={setEnquiryModalOpen} />
    </div>
  );
}
