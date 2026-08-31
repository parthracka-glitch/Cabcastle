import React from "react";
import api, { API, formatApiError, formatINR } from "@/lib/api";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronLeft, ChevronRight, CalendarDays, User, Phone, Mail, MapPin,
  Car, Download, Loader2, Clock, Ticket, ArrowUpRight, ArrowDownLeft,
  Search, LayoutGrid, Calendar as CalIcon, Plus, CheckCircle2,
  CalendarRange, Sparkles, Filter, RefreshCw, Layers, Check, ArrowRight,
  TrendingUp, ShieldCheck, Gauge, Fuel, Eye, CalendarCheck, HelpCircle,
  PhoneCall
} from "lucide-react";
import {
  format, getDaysInMonth, startOfMonth, addDays, isSameDay, isWeekend,
  isToday as isDateToday, parseISO
} from "date-fns";
import { toast } from "sonner";
import OfflineBookingModal from "../components/OfflineBookingModal";

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarView() {
  const today = React.useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = React.useState("DAILY"); // "DAILY" | "MONTH"
  
  // Data state
  const [vehicles, setVehicles] = React.useState(() => {
    try {
      const cached = localStorage.getItem("dh_cached_vehicles");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [allBookings, setAllBookings] = React.useState(() => {
    try {
      const cached = sessionStorage.getItem("dh_cached_admin_bookings");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loadingData, setLoadingData] = React.useState(() => vehicles.length === 0);
  const [searchCar, setSearchCar] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [fleetStatusFilter, setFleetStatusFilter] = React.useState("ALL"); // "ALL" | "RENTED" | "AVAILABLE"
  const [dateRangeMode, setDateRangeMode] = React.useState("MONTH"); // "MONTH" | "14DAYS" | "7DAYS"

  // Daily view states
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [summary, setSummary] = React.useState({});
  const [dailyBookings, setDailyBookings] = React.useState([]);
  const [byDateMeta, setByDateMeta] = React.useState({ pickups_count: 0, returns_count: 0, ongoing_count: 0 });
  const [movementFilter, setMovementFilter] = React.useState("ALL");

  // Dialog & Slot states
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detail, setDetail] = React.useState(null);
  const [offlineModalOpen, setOfflineModalOpen] = React.useState(false);
  const [quickBookingData, setQuickBookingData] = React.useState(null);

  // Timeline horizontal scroll ref
  const timelineScrollRef = React.useRef(null);
  const todayColumnRef = React.useRef(null);

  // Load vehicles and monthly bookings with fast fallback
  const loadFleetData = React.useCallback(async () => {
    try {
      const [vRes, bRes] = await Promise.all([
        api.get("/vehicles"),
        api.get("/admin/bookings")
      ]);
      if (vRes.data && Array.isArray(vRes.data)) {
        setVehicles(vRes.data);
        try {
          localStorage.setItem("dh_cached_vehicles", JSON.stringify(vRes.data));
        } catch {}
      }
      if (bRes.data && Array.isArray(bRes.data)) {
        setAllBookings(bRes.data);
        try {
          sessionStorage.setItem("dh_cached_admin_bookings", JSON.stringify(bRes.data));
        } catch {}
      }
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Load calendar summary for Daily/Month mode on-demand
  const loadSummary = React.useCallback(async (m) => {
    try {
      const { data } = await api.get("/admin/bookings/calendar-summary", {
        params: { year: m.getFullYear(), month: m.getMonth() + 1 },
      });
      setSummary(data || {});
    } catch (e) {
      toast.error(formatApiError(e));
    }
  }, []);

  // Load daily bookings for Dispatch mode on-demand
  const loadDailyBookings = React.useCallback(async (d) => {
    try {
      const targetStr = ymd(d);
      const { data } = await api.get("/admin/bookings/by-date", {
        params: { date: targetStr },
      });
      const rawList = data.bookings || [];
      let pCount = 0, rCount = 0, oCount = 0;

      const processed = rawList.map((b) => {
        const startStr = b.start_date ? b.start_date.substring(0, 10) : "";
        const endStr = b.end_date ? b.end_date.substring(0, 10) : "";

        let movement_type = "ongoing";
        if (startStr === targetStr && endStr === targetStr) {
          movement_type = "same_day";
          pCount++; rCount++;
        } else if (startStr === targetStr) {
          movement_type = "pickup";
          pCount++;
        } else if (endStr === targetStr) {
          movement_type = "return";
          rCount++;
        } else {
          movement_type = "ongoing";
          oCount++;
        }
        return { ...b, movement_type };
      });

      setDailyBookings(processed);
      setByDateMeta({ pickups_count: pCount, returns_count: rCount, ongoing_count: oCount });
    } catch (e) {
      setDailyBookings([]);
    }
  }, []);

  // 1. Initial fleet & bookings load
  React.useEffect(() => {
    loadFleetData();
  }, [loadFleetData]);

  // 2. On-demand calendar summary only when in Daily or Month mode
  React.useEffect(() => {
    if (viewMode === "DAILY" || viewMode === "MONTH") {
      loadSummary(currentMonth);
    }
  }, [currentMonth, loadSummary, viewMode]);

  // 3. On-demand daily bookings only when in Daily mode
  React.useEffect(() => {
    if (viewMode === "DAILY") {
      loadDailyBookings(selectedDate);
    }
  }, [selectedDate, loadDailyBookings, viewMode]);

  async function changeStatus(id, status) {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      toast.success(`Marked ${status}`);
      loadFleetData();
      loadDailyBookings(selectedDate);
      loadSummary(currentMonth);
    } catch (e) { toast.error(formatApiError(e)); }
  }

  // Days array for current view range
  const daysInView = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const totalMonthDays = getDaysInMonth(currentMonth);
    
    if (dateRangeMode === "7DAYS") {
      const baseStart = isSameDay(currentMonth, startOfMonth(today)) ? today : start;
      const res = [];
      for (let i = 0; i < 7; i++) {
        res.push(addDays(baseStart, i));
      }
      return res;
    }
    
    if (dateRangeMode === "14DAYS") {
      const baseStart = isSameDay(currentMonth, startOfMonth(today)) ? today : start;
      const res = [];
      for (let i = 0; i < 14; i++) {
        res.push(addDays(baseStart, i));
      }
      return res;
    }

    // Default: FULL MONTH
    const result = [];
    for (let i = 0; i < totalMonthDays; i++) {
      result.push(addDays(start, i));
    }
    return result;
  }, [currentMonth, dateRangeMode, today]);

  // Quick jump to today in timeline
  const scrollToToday = React.useCallback(() => {
    if (todayColumnRef.current && timelineScrollRef.current) {
      const container = timelineScrollRef.current;
      const target = todayColumnRef.current;
      const vehicleColWidth = window.innerWidth < 640 ? 140 : window.innerWidth < 1024 ? 200 : 260;
      const scrollLeftPos = target.offsetLeft - vehicleColWidth;
      container.scrollTo({ left: Math.max(0, scrollLeftPos), behavior: "smooth" });
    }
  }, []);

  // Quick horizontal scroll step
  const handleScrollStep = (direction) => {
    if (timelineScrollRef.current) {
      const step = window.innerWidth < 640 ? 200 : 350;
      timelineScrollRef.current.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" });
    }
  };

  // Pre-calculate today's fleet KPIs
  const todayMetrics = React.useMemo(() => {
    const todayStr = ymd(today);
    let activeRented = 0;
    let pickupsToday = 0;
    let returnsToday = 0;

    allBookings.forEach((b) => {
      if (b.status === "Cancelled") return;
      const s = b.start_date ? b.start_date.substring(0, 10) : "";
      const e = b.end_date ? b.end_date.substring(0, 10) : "";
      if (s <= todayStr && todayStr <= e) {
        activeRented++;
      }
      if (s === todayStr) pickupsToday++;
      if (e === todayStr) returnsToday++;
    });

    const totalFleet = vehicles.length;
    const availableToday = Math.max(0, totalFleet - activeRented);
    const occupancyRate = totalFleet > 0 ? Math.round((activeRented / totalFleet) * 100) : 0;

    return { totalFleet, activeRented, availableToday, pickupsToday, returnsToday, occupancyRate };
  }, [vehicles, allBookings, today]);

  // Categories list
  const categories = React.useMemo(() => {
    const set = new Set(vehicles.map((v) => v.category));
    return ["All", ...Array.from(set).filter(Boolean)];
  }, [vehicles]);

  // Filtered vehicles list
  const filteredVehicles = React.useMemo(() => {
    const todayStr = ymd(today);

    return vehicles.filter((v) => {
      const matchCat = categoryFilter === "All" || v.category === categoryFilter;
      const matchQ = !searchCar ||
        v.title.toLowerCase().includes(searchCar.toLowerCase()) ||
        v.reg_no.toLowerCase().includes(searchCar.toLowerCase());
      
      if (!matchCat || !matchQ) return false;

      if (fleetStatusFilter === "ALL") return true;

      const isRentedToday = allBookings.some((b) => {
        if (b.vehicle_id !== v.id || b.status === "Cancelled") return false;
        const s = b.start_date ? b.start_date.substring(0, 10) : "";
        const e = b.end_date ? b.end_date.substring(0, 10) : "";
        return s <= todayStr && todayStr <= e;
      });

      if (fleetStatusFilter === "RENTED") return isRentedToday;
      if (fleetStatusFilter === "AVAILABLE") return !isRentedToday;

      return true;
    });
  }, [vehicles, categoryFilter, searchCar, fleetStatusFilter, allBookings, today]);

  // Modifiers for Daily Calendar picker
  const modifiers = React.useMemo(() => {
    const hasAny = [], mostlyOffline = [], allCompleted = [], hasCancelled = [];
    for (const [d, s] of Object.entries(summary)) {
      const [y, m, day] = d.split("-").map(Number);
      const date = new Date(y, m - 1, day);
      if (s.total > 0) hasAny.push(date);
      if (s.Offline > s.Online) mostlyOffline.push(date);
      if (s.Confirmed === 0 && s.Completed > 0) allCompleted.push(date);
      if (s.Cancelled > 0 && s.Confirmed === 0 && s.Completed === 0) hasCancelled.push(date);
    }
    return { hasAny, mostlyOffline, allCompleted, hasCancelled };
  }, [summary]);

  const filteredDailyBookings = React.useMemo(() => {
    if (movementFilter === "PICKUP") return dailyBookings.filter(b => b.movement_type === "pickup" || b.movement_type === "same_day");
    if (movementFilter === "RETURN") return dailyBookings.filter(b => b.movement_type === "return" || b.movement_type === "same_day");
    if (movementFilter === "ONGOING") return dailyBookings.filter(b => b.movement_type === "ongoing");
    return dailyBookings;
  }, [dailyBookings, movementFilter]);

  // Handle slot quick-booking
  const handleQuickBookSlot = (vehicle, day) => {
    const nextDay = addDays(day, 2);
    setQuickBookingData({
      vehicle_id: vehicle.id,
      start_date: day,
      end_date: nextDay,
      total_amount: (vehicle.daily_rate || 2000) * 2,
    });
    setOfflineModalOpen(true);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5 font-body text-[#063247] max-w-[1400px] mx-auto w-full pb-8 text-left">
        
        {/* ── 1. CLEAN PAPER CALENDAR HEADER & KPI STRIP ── */}
        <div className="bg-white border border-[#EAEAEA] rounded-[24px] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F0]">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#063247] tracking-tight">
                  Fleet Calendar
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#063247] border border-[#E8E0D2]">
                  <CalendarDays size={13} className="text-[#288DA6]" />
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1 font-normal">
                Live vehicle availability, reservation timelines &amp; dispatch schedule.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
              {/* Clean Segmented View Switcher: Dispatch & Month */}
              <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0]">
                <button
                  onClick={() => setViewMode("DAILY")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "DAILY"
                      ? "bg-white text-[#063247] shadow-xs"
                      : "text-[#64748B] hover:text-[#063247]"
                  }`}
                  data-testid="view-daily-btn"
                >
                  <CalIcon size={13} />
                  <span>Dispatch Board</span>
                </button>
                <button
                  onClick={() => setViewMode("MONTH")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "MONTH"
                      ? "bg-white text-[#063247] shadow-xs"
                      : "text-[#64748B] hover:text-[#063247]"
                  }`}
                >
                  <CalendarRange size={13} />
                  <span>Monthly Grid</span>
                </button>
              </div>

              {/* Primary Add Offline Booking CTA */}
              <Button
                onClick={() => {
                  setQuickBookingData(null);
                  setOfflineModalOpen(true);
                }}
                className="h-10 px-4 rounded-xl text-xs font-black text-[#090D16] bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] hover:brightness-105 flex items-center gap-1.5 cursor-pointer shadow-gold transition-all active:scale-95 border border-[#E5A93C]/40 shrink-0"
              >
                <Plus size={15} />
                <span>Add Booking</span>
              </Button>
            </div>
          </div>

          {/* Minimalist Linear Runway KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8E0D2] flex flex-col justify-between">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Total Fleet</span>
              <div className="text-xl font-extrabold text-[#0F172A] mt-1 flex items-baseline gap-1">
                {todayMetrics.totalFleet} <span className="text-[11px] font-normal text-[#64748B]">Cars</span>
              </div>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/70 flex flex-col justify-between">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Available
              </span>
              <div className="text-xl font-extrabold text-emerald-900 mt-1 flex items-baseline gap-1">
                {todayMetrics.availableToday} <span className="text-[11px] font-bold text-emerald-700">Ready</span>
              </div>
            </div>

            <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-200/70 flex flex-col justify-between">
              <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Car size={12} className="text-sky-700" /> On Road
              </span>
              <div className="text-xl font-extrabold text-sky-900 mt-1 flex items-baseline gap-1">
                {todayMetrics.activeRented} <span className="text-[11px] font-bold text-sky-700">Active</span>
              </div>
            </div>

            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/70 flex flex-col justify-between">
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight size={12} className="text-amber-700" /> Pickups Today
              </span>
              <div className="text-xl font-extrabold text-amber-900 mt-1">
                {todayMetrics.pickupsToday}
              </div>
            </div>

            <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-200/70 flex flex-col justify-between">
              <span className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownLeft size={12} className="text-indigo-700" /> Returns Today
              </span>
              <div className="text-xl font-extrabold text-indigo-900 mt-1">
                {todayMetrics.returnsToday}
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8E0D2] flex flex-col justify-between">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Occupancy</span>
              <div className="text-xl font-extrabold text-[#0F172A] mt-1 flex items-baseline gap-1">
                {todayMetrics.occupancyRate}% <span className="text-[11px] font-normal text-[#64748B]">Fleet</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. MAIN CALENDAR VIEWS (MONTHLY GRID OR DAILY DISPATCH) ── */}

        {/* ── 4. VIEW MODE 2: MONTH MATRIX GRID ── */}
        {viewMode === "MONTH" && (
          <div className="rounded-2xl bg-white border border-[#DFE8EC] p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarRange size={16} className="text-[#0E7490]" />
                <h2 className="font-display text-base font-bold text-[#063247]">
                  Monthly Grid · {format(currentMonth, "MMMM yyyy")}
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#5A7184]">
                {daysInView.length} Days
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
                <div key={w} className="p-2 text-center text-xs font-semibold text-[#5A7184] uppercase tracking-wider bg-[#F8FAFC] rounded-lg border border-[#DFE8EC]">
                  {w}
                </div>
              ))}

              {daysInView.map((day) => {
                const dayStr = ymd(day);
                const isToday = isSameDay(day, today);
                
                const dayBookings = allBookings.filter((b) => {
                  if (b.status === "Cancelled") return false;
                  const s = b.start_date ? b.start_date.substring(0, 10) : "";
                  const e = b.end_date ? b.end_date.substring(0, 10) : "";
                  return s <= dayStr && dayStr <= e;
                });

                const pickups = dayBookings.filter(b => b.start_date?.substring(0, 10) === dayStr);
                const returns = dayBookings.filter(b => b.end_date?.substring(0, 10) === dayStr);

                return (
                  <div
                    key={dayStr}
                    onClick={() => {
                      setSelectedDate(day);
                      setViewMode("DAILY");
                    }}
                    className={`min-h-[90px] sm:min-h-[110px] p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isToday
                        ? "border-[#0E7490] bg-[#0E7490]/5 ring-2 ring-[#0E7490]/20"
                        : "border-[#DFE8EC] bg-white hover:border-[#063247] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isToday ? "text-[#0E7490]" : "text-[#063247]"}`}>
                        {format(day, "d")}
                      </span>
                      {dayBookings.length > 0 && (
                        <Badge className="bg-[#063247] text-white text-[9px] px-1.5 py-0 h-4">
                          {dayBookings.length}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 my-1">
                      {pickups.length > 0 && (
                        <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center justify-between">
                          <span>Out</span> <span>{pickups.length}</span>
                        </div>
                      )}
                      {returns.length > 0 && (
                        <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center justify-between">
                          <span>In</span> <span>{returns.length}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-[#5A7184] text-right truncate">
                      {dayBookings.length === 0 ? "Free" : `${dayBookings.length} on road`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 5. VIEW MODE 3: DAILY DISPATCH BOARD ── */}
        {viewMode === "DAILY" && (
          <div className="grid lg:grid-cols-5 gap-4 font-body">
            {/* Left Calendar Picker */}
            <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-white border border-[#DFE8EC] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#0E7490]" />
                  <span className="font-display text-sm font-bold text-[#063247]">
                    Select Date
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#5A7184]">
                  {format(selectedDate, "dd MMM yyyy")}
                </span>
              </div>

              <div className="dh-calendar-wrap border border-[#DFE8EC] rounded-xl p-2 bg-[#F8FAFC]" data-testid="admin-calendar">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  modifiers={modifiers}
                  modifiersClassNames={{
                    hasAny: "dh-day-has",
                    mostlyOffline: "dh-day-offline",
                    allCompleted: "dh-day-completed",
                    hasCancelled: "dh-day-cancelled",
                  }}
                  className="p-0 bg-transparent w-full"
                />
              </div>

              {/* Day Quick Summary */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE8EC] space-y-2 text-xs">
                <div className="font-bold text-[#063247] uppercase tracking-wider text-[10px]">
                  Daily Movement Stats
                </div>
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Pickups Scheduled:</span> <span>{byDateMeta.pickups_count}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Returns Scheduled:</span> <span>{byDateMeta.returns_count}</span>
                </div>
                <div className="flex justify-between text-blue-700 font-semibold">
                  <span>On Road Active:</span> <span>{byDateMeta.ongoing_count}</span>
                </div>
              </div>
            </div>

            {/* Right Dispatch Checklist */}
            <div className="lg:col-span-3 space-y-4 font-body">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DFE8EC] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-[#5A7184]">
                      Daily Dispatch Board
                    </div>
                    <div className="font-display text-lg sm:text-xl font-bold text-[#063247] mt-0.5">
                      {format(selectedDate, "EEEE, dd MMMM yyyy")}
                    </div>
                  </div>

                  {/* Movement Filter Tabs */}
                  <div className="flex gap-1 text-xs bg-[#F1F5F9] p-0.5 rounded-xl border border-[#DFE8EC] overflow-x-auto">
                    <button
                      onClick={() => setMovementFilter("ALL")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                        movementFilter === "ALL" ? "bg-white text-[#063247] shadow-2xs font-bold" : "text-[#5A7184] hover:text-[#063247]"
                      }`}
                    >
                      All ({dailyBookings.length})
                    </button>
                    <button
                      onClick={() => setMovementFilter("PICKUP")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                        movementFilter === "PICKUP" ? "bg-amber-600 text-white font-bold" : "text-[#5A7184] hover:text-[#063247]"
                      }`}
                    >
                      Out ({byDateMeta.pickups_count})
                    </button>
                    <button
                      onClick={() => setMovementFilter("RETURN")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                        movementFilter === "RETURN" ? "bg-emerald-600 text-white font-bold" : "text-[#5A7184] hover:text-[#063247]"
                      }`}
                    >
                      In ({byDateMeta.returns_count})
                    </button>
                  </div>
                </div>

                {/* Bookings List */}
                <ScrollArea className="max-h-[500px] pr-1">
                  {filteredDailyBookings.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center text-xs text-[#5A7184] border-2 border-dashed border-[#DFE8EC] rounded-xl">
                      No movements scheduled for {format(selectedDate, "dd MMM yyyy")}.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredDailyBookings.map((b) => (
                        <div
                          key={b.id || b._id}
                          onClick={() => { setDetail(b); setDetailOpen(true); }}
                          className="p-3.5 rounded-xl border border-[#DFE8EC] bg-[#F8FAFC] hover:bg-white hover:border-[#063247] transition-all cursor-pointer shadow-2xs flex flex-col sm:flex-row sm:items-start gap-3"
                          data-testid={`cal-booking-${b.id}`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <img
                              src={b.vehicle_snapshot?.image_url || "/vehicles/placeholder.png"}
                              alt=""
                              className="w-16 h-12 rounded-lg object-cover border border-[#DFE8EC] shrink-0 bg-white"
                              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80"; }}
                            />

                            <div className="flex-1 min-w-0 font-body">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                {(b.movement_type === "pickup" || b.movement_type === "same_day") && (
                                  <span className="bg-amber-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <ArrowUpRight size={10} /> PICKUP
                                  </span>
                                )}
                                {(b.movement_type === "return" || b.movement_type === "same_day") && (
                                  <span className="bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <ArrowDownLeft size={10} /> RETURN
                                  </span>
                                )}
                                {b.movement_type === "ongoing" && (
                                  <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Car size={10} /> ON ROAD
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-[#5A7184] bg-white px-2 py-0.5 rounded-md border border-[#DFE8EC]">
                                  {b.booking_no}
                                </span>
                              </div>

                              <div className="font-display font-bold text-xs sm:text-sm text-[#063247] truncate">
                                {b.vehicle_snapshot?.title} <span className="text-xs text-[#5A7184] font-mono font-normal">({b.vehicle_snapshot?.reg_no})</span>
                              </div>

                              <div className="text-xs text-[#063247] mt-1 flex items-center gap-2 font-medium">
                                <User size={12} className="text-[#0E7490] shrink-0" />
                                <span className="truncate">{b.customer?.name}</span>
                                {b.customer?.phone && (
                                  <a
                                    href={`tel:${b.customer.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[#0E7490] hover:underline flex items-center gap-0.5 font-mono text-[11px]"
                                    title="Call customer"
                                  >
                                    <PhoneCall size={10} /> {b.customer.phone}
                                  </a>
                                )}
                              </div>

                              <div className="text-[#5A7184] mt-1 flex items-center gap-1.5 text-xs truncate">
                                <MapPin size={11} className="text-[#94A3B8] shrink-0" />
                                <span className="truncate">{b.pickup_location}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DFE8EC]">
                            <div className="text-xs sm:text-sm font-bold text-[#063247]">
                              {formatINR(b.total_amount)}
                            </div>
                            <Badge className="mt-0.5 sm:mt-1 text-[10px] font-semibold bg-white text-[#063247] border border-[#DFE8EC]">
                              {b.payment_status || "Paid"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. BOOKING DETAIL MODAL ── */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent
            className="w-[95vw] sm:max-w-2xl bg-white border-[#DFE8EC] text-[#063247] max-h-[90vh] overflow-y-auto font-body rounded-2xl p-4 sm:p-6 shadow-xl"
            data-testid="cal-detail-modal"
          >
            {detail && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold flex items-center gap-2.5 text-[#063247] flex-wrap">
                    <span>{detail.booking_no}</span>
                    <StatusPill status={detail.status} />
                  </DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-4 mt-2 font-body">
                  <div className="rounded-xl overflow-hidden border border-[#DFE8EC] bg-[#F8FAFC]">
                    <img
                      src={detail.vehicle_snapshot?.image_url || "/vehicles/placeholder.png"}
                      alt=""
                      className="w-full aspect-[16/10] object-cover bg-white"
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80"; }}
                    />
                    <div className="p-3 bg-[#F8FAFC]">
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-[#5A7184]">Vehicle</div>
                      <div className="font-display font-bold text-sm text-[#063247] flex items-center gap-2 mt-0.5">
                        <Car size={14} className="text-[#0E7490]" /> {detail.vehicle_snapshot?.title}
                      </div>
                      <div className="text-xs text-[#5A7184] font-mono">
                        {detail.vehicle_snapshot?.reg_no} · {detail.vehicle_snapshot?.category}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Info icon={<User size={13} />} label="Customer Name" value={detail.customer?.name} />
                    <Info icon={<Phone size={13} />} label="Phone Number" value={detail.customer?.phone} />
                    <Info icon={<Mail size={13} />} label="Email Address" value={detail.customer?.email} />
                    <Info icon={<MapPin size={13} />} label="Pickup Location" value={detail.pickup_location} />
                    <Info
                      icon={<Clock size={13} />}
                      label="Rental Duration"
                      value={`${detail.days || 1} day(s) · ${format(new Date(detail.start_date), "dd MMM HH:mm")} → ${format(new Date(detail.end_date), "dd MMM HH:mm")}`}
                    />
                    {detail.coupon_code && (
                      <Info
                        icon={<Ticket size={13} />}
                        label="Coupon Applied"
                        value={`${detail.coupon_code} (− ${formatINR(detail.discount)})`}
                      />
                    )}
                  </div>
                </div>

                <Separator className="bg-[#DFE8EC] my-3" />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-body">
                  <MiniStat label="Base Fare" value={formatINR(detail.base_amount)} />
                  <MiniStat label="Add-ons" value={formatINR(detail.addon_amount)} />
                  <MiniStat label="Airport Surcharge" value={formatINR(detail.airport_surcharge)} />
                  {detail.tax > 0 && <MiniStat label="Tax (GST)" value={formatINR(detail.tax)} />}
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE8EC] flex items-center justify-between font-body">
                  <span className="text-xs uppercase font-semibold tracking-wider text-[#5A7184]">Total Fare</span>
                  <span className="font-display text-xl font-bold text-[#063247]">{formatINR(detail.total_amount)}</span>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2 justify-end font-body">
                  {detail.customer?.phone && (
                    <a
                      href={`https://wa.me/91${detail.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hello ${detail.customer?.name || "Customer"}, your Cab Castle Goa booking (${detail.booking_no}) for ${detail.vehicle_snapshot?.title || "your vehicle"} has been confirmed for ${format(new Date(detail.start_date), "dd MMM yyyy")}. Our chauffeur will arrive at ${detail.pickup_location || "your pickup location"}. Thank you for choosing Cab Castle!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        type="button"
                        className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl px-4 cursor-pointer justify-center shadow-xs"
                      >
                        <Phone size={14} className="mr-1.5" /> WhatsApp Dispatch
                      </Button>
                    </a>
                  )}

                  <a href={`${API}/bookings/${detail.id}/invoice`} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-[#DFE8EC] bg-[#F8FAFC] text-[#063247] hover:bg-[#F1F5F9] font-semibold text-xs rounded-xl px-4 cursor-pointer justify-center"
                      data-testid="cal-invoice-btn"
                    >
                      <Download size={14} className="mr-1.5 text-[#0E7490]" /> PDF Invoice
                    </Button>
                  </a>

                  {detail.status !== "Completed" && (
                    <Button
                      variant="outline"
                      onClick={() => changeStatus(detail.id, "Completed")}
                      className="bg-[#063247] text-white hover:bg-[#063247]/90 font-semibold text-xs rounded-xl px-4 cursor-pointer justify-center"
                    >
                      Mark Completed
                    </Button>
                  )}
                  {detail.status !== "Cancelled" && (
                    <Button
                      variant="outline"
                      onClick={() => changeStatus(detail.id, "Cancelled")}
                      className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold text-xs rounded-xl px-4 cursor-pointer justify-center"
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── 7. MANUAL OFFLINE BOOKING MODAL ── */}
        <OfflineBookingModal
          open={offlineModalOpen}
          onOpenChange={setOfflineModalOpen}
          initialData={quickBookingData}
          onSuccess={() => {
            loadFleetData();
            loadDailyBookings(selectedDate);
            loadSummary(currentMonth);
          }}
        />
      </div>
    </TooltipProvider>
  );
}

function StatusPill({ status }) {
  const cls = status === "Confirmed"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : status === "Completed"
    ? "bg-[#063247] text-white"
    : "bg-[#F1F5F9] text-[#5A7184] border-[#DFE8EC]";
  return <Badge className={`${cls} text-[10px] font-semibold rounded-full px-2.5 py-0.5 border`}>{status}</Badge>;
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 font-body">
      <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#DFE8EC] flex items-center justify-center text-[#0E7490] mt-0.5 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase font-semibold tracking-wider text-[#5A7184]">{label}</div>
        <div className="text-xs font-bold text-[#063247] truncate">{value || "—"}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#DFE8EC] text-center">
      <div className="text-[10px] uppercase text-[#5A7184] font-semibold">{label}</div>
      <div className="text-xs sm:text-sm font-bold text-[#063247] mt-0.5">{value}</div>
    </div>
  );
}
