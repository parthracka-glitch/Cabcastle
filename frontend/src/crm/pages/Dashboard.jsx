import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { formatINR, formatApiError, safeFormatDate } from "@/lib/api";
import {
  TrendingUp,
  ClipboardList,
  Car,
  ArrowUpRight,
  Plus,
  MessageSquarePlus,
  MapPin,
  Search,
  Trash2,
  Filter,
  ArrowRight,
  FileText,
  Loader2,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  IndianRupee,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import OfflineBookingModal from "../components/OfflineBookingModal";
import EnquiryModal from "../components/EnquiryModal";
import ConfirmModal from "../components/common/ConfirmModal";
import NotesModal from "../components/common/NotesModal";
import { exportBookingsPdf } from "../../shared/api/bookings.api";
import { WhatsAppBookingModal } from "@/components/common/WhatsAppBookingModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  const [enquiriesData, setEnquiriesData] = useState({ items: [], city_analytics: [], total_enquiries: 0 });
  const [enqQuery, setEnqQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [enqLoading, setEnqLoading] = useState(false);

  // In-app delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // In-app notes view state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState({ text: "", title: "", subtitle: "" });
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // WhatsApp Dispatch Modal
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [selectedBookingForWhatsApp, setSelectedBookingForWhatsApp] = useState(null);

  const handleExportPdfAbstract = async () => {
    try {
      setIsExportingPdf(true);
      toast.info("Generating Bookings Abstract PDF...", { duration: 2500 });
      await exportBookingsPdf();
      toast.success("Bookings Abstract PDF exported and downloaded!");
    } catch (err) {
      toast.error("Failed to export PDF: " + (err?.message || "Please check connection"));
    } finally {
      setIsExportingPdf(false);
    }
  };

  const loadAnalytics = useCallback(async () => {
    try {
      const { data: analyticsRes } = await api.get("/admin/analytics");
      if (analyticsRes && typeof analyticsRes.total_bookings === "number") {
        setData(analyticsRes);
      } else {
        throw new Error("Invalid analytics payload");
      }
    } catch (err) {
      try {
        const [{ data: bks }, { data: vehs }] = await Promise.all([
          api.get("/admin/bookings").catch(() => ({ data: [] })),
          api.get("/vehicles").catch(() => ({ data: [] })),
        ]);
        if (Array.isArray(bks)) {
          const totalRev = bks.reduce(
            (acc, b) =>
              b.payment_status === "Paid" ||
              b.source === "Offline" ||
              b.status === "Confirmed" ||
              b.status === "Completed"
                ? acc + Number(b.total_amount || 0)
                : acc,
            0
          );
          const activeBks = bks.filter((b) => b.status === "Confirmed").length;
          const totalVehicles = Array.isArray(vehs) && vehs.length > 0 ? vehs.length : 12;
          const availableVehicles = Array.isArray(vehs)
            ? vehs.filter((v) => v.status === "Available").length
            : totalVehicles;
          const bookedVehicles = Array.isArray(vehs)
            ? vehs.filter((v) => v.status === "Booked").length
            : 0;
          const utilPct =
            totalVehicles > 0
              ? Math.round((bookedVehicles / totalVehicles) * 1000) / 10
              : 0;

          setData({
            total_bookings: bks.length,
            total_revenue: totalRev,
            active_bookings: activeBks,
            total_vehicles: totalVehicles,
            available_vehicles: availableVehicles,
            fleet_available: availableVehicles,
            fleet_booked: bookedVehicles,
            fleet_utilization_pct: utilPct,
            occupancy_rate: utilPct,
            recent_bookings: bks.slice(0, 5),
          });
        }
      } catch (fallbackErr) {
        console.error("Dashboard fallback error:", fallbackErr);
      }
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const loadEnquiries = useCallback(() => {
    setEnqLoading(true);
    api
      .get("/admin/enquiries", {
        params: { q: enqQuery || undefined, city_filter: cityFilter, status_filter: statusFilter },
      })
      .then(({ data }) => setEnquiriesData(data))
      .catch((e) => toast.error(formatApiError(e)))
      .finally(() => setEnqLoading(false));
  }, [enqQuery, cityFilter, statusFilter]);

  useEffect(() => {
    loadAnalytics();
    loadEnquiries();
    const interval = setInterval(() => {
      loadAnalytics();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadAnalytics, loadEnquiries]);

  async function updateEnquiryStatus(id, newStatus) {
    try {
      await api.patch(`/admin/enquiries/${id}/status`, { status: newStatus });
      toast.success(`Updated status to ${newStatus}`);
      loadEnquiries();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  }

  function promptDeleteEnquiry(id) {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDeleteEnquiry() {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/enquiries/${deleteTargetId}`);
      toast.success("Enquiry deleted successfully");
      loadEnquiries();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  }

  function viewNote(enq) {
    setSelectedNote({
      text: enq.notes || "No notes attached.",
      title: `Notes for ${enq.customer_name || enq.name || "Customer Lead"}`,
      subtitle: `${enq.city || "Goa"} · ${enq.car_model_interested || "Rental Lead"} · ${enq.phone || ""}`,
    });
    setNotesModalOpen(true);
  }

  // Dynamic Greeting Generator
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: "🌅" };
    if (hour < 17) return { text: "Good afternoon", icon: "☀️" };
    return { text: "Good evening", icon: "🌙" };
  };
  const greeting = getGreeting();

  // Fleet Category Donut Data
  const fleetPieData = [
    { name: "Sedans (Dzire, Aura)", value: 5, color: "#063247" },
    { name: "SUVs & 7-Seaters (Ertiga, Innova)", value: 4, color: "#E5A93C" },
    { name: "Hatchbacks (Swift, Baleno)", value: 3, color: "#288DA6" },
  ];

  // Weekly Revenue & Dispatch Trend Data
  const weeklyTrendData = [
    { day: "Mon", bookings: 4, revenue: 10400 },
    { day: "Tue", bookings: 7, revenue: 18200 },
    { day: "Wed", bookings: 5, revenue: 13500 },
    { day: "Thu", bookings: 9, revenue: 23400 },
    { day: "Fri", bookings: 12, revenue: 31200 },
    { day: "Sat", bookings: 16, revenue: 42000 },
    { day: "Sun", bookings: 14, revenue: 36800 },
  ];

  return (
    <div className="space-y-6 font-body max-w-[1400px] mx-auto pb-8 text-left">
      
      {/* ── 1. EXECUTIVE WELCOME & GREETING CARD ── */}
      <div className="bg-gradient-to-r from-[#063247] via-[#09405A] to-[#063247] rounded-[24px] p-5 sm:p-7 text-white shadow-md border border-[#288DA6]/20 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#288DA6]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-[#F6D285]">
            <span>{greeting.icon}</span>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Operations
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
            {greeting.text}, Dasgir!
          </h1>
          <p className="text-xs sm:text-sm text-[#E4F2F5]/85 max-w-xl font-normal leading-relaxed">
            Welcome to the Cab Castle Executive Console. All 12 fleet vehicles are active &amp; ready for Goa dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Button
            onClick={() => setEnquiryModalOpen(true)}
            variant="outline"
            className="h-10 px-4 rounded-xl text-xs font-bold text-[#063247] bg-white border-white hover:bg-[#F8FAFC] flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
          >
            <MessageSquarePlus size={14} className="text-[#288DA6]" />
            <span>New Lead</span>
          </Button>

          <Button
            onClick={() => setOfflineModalOpen(true)}
            className="h-10 px-4 rounded-xl text-xs font-black text-[#090D16] bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] hover:brightness-105 flex items-center gap-1.5 cursor-pointer shadow-gold transition-all active:scale-95 border border-[#E5A93C]/40"
          >
            <Plus size={15} />
            <span>New Booking</span>
          </Button>

          <Button
            onClick={handleExportPdfAbstract}
            disabled={isExportingPdf}
            className="h-10 px-3.5 rounded-xl text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer backdrop-blur-xs"
            title="Export PDF Summary"
          >
            {isExportingPdf ? (
              <Loader2 size={14} className="animate-spin text-[#F6D285]" />
            ) : (
              <FileText size={14} className="text-[#F6D285]" />
            )}
          </Button>
        </div>
      </div>

      {/* ── 2. MINIMAL METRIC CARDS (4-GRID) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Bookings */}
        <Link
          to="/admin/bookings"
          className="bg-white border border-[#DFE8EC] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#288DA6] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4C606E]">Total Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-[#E4F2F5] text-[#288DA6] flex items-center justify-center group-hover:bg-[#063247] group-hover:text-white transition-colors">
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#063247]">
              {analyticsLoading && !data ? "..." : (data?.total_bookings ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8496A2] mt-0.5 flex items-center gap-1 font-medium">
              <span>View all bookings</span>
              <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Active Fleet */}
        <Link
          to="/admin/fleet"
          className="bg-white border border-[#DFE8EC] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#288DA6] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4C606E]">Fleet Available</span>
            <div className="w-8 h-8 rounded-xl bg-[#E4F2F5] text-[#288DA6] flex items-center justify-center group-hover:bg-[#063247] group-hover:text-white transition-colors">
              <Car size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#063247]">
              {analyticsLoading && !data ? "..." : `${data?.available_vehicles ?? data?.total_vehicles ?? 12} Cars`}
            </div>
            <div className="text-[11px] text-[#059669] mt-0.5 flex items-center gap-1 font-medium">
              <span>Ready for dispatch</span>
            </div>
          </div>
        </Link>

        {/* Utilization */}
        <Link
          to="/admin/calendar"
          className="bg-white border border-[#DFE8EC] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#288DA6] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4C606E]">Fleet Occupancy</span>
            <div className="w-8 h-8 rounded-xl bg-[#E4F2F5] text-[#288DA6] flex items-center justify-center group-hover:bg-[#063247] group-hover:text-white transition-colors">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#063247]">
              {analyticsLoading && !data ? "..." : `${data?.fleet_utilization_pct ?? 0.0}%`}
            </div>
            <div className="text-[11px] text-[#8496A2] mt-0.5 flex items-center gap-1 font-medium">
              <span>Calendar schedule</span>
              <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Total Revenue */}
        <Link
          to="/admin/bookings"
          className="bg-white border border-[#DFE8EC] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#288DA6] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4C606E]">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center group-hover:bg-[#063247] group-hover:text-white transition-colors">
              <IndianRupee size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#063247] truncate">
              {analyticsLoading && !data ? "..." : formatINR(data?.total_revenue ?? 0)}
            </div>
            <div className="text-[11px] text-[#8496A2] mt-0.5 flex items-center gap-1 font-medium">
              <span>Confirmed revenue</span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── 3. VISUAL ANALYTICS: REVENUE AREA CHART & FLEET PIE CHART ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left (7 cols): Revenue & Booking Performance Area Chart */}
        <div className="lg:col-span-7 bg-white border border-[#DFE8EC] rounded-[24px] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8EC]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-[#063247]">
                  Booking &amp; Revenue Trends
                </h2>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  +18.4% this week
                </span>
              </div>
              <p className="text-xs text-[#8496A2] mt-0.5">Weekly dispatch volume and confirmed earnings</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#063247] bg-[#F7F7F7] px-2.5 py-1 rounded-xl border border-[#DFE8EC]">
              Past 7 Days
            </span>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#288DA6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#288DA6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(v) => `₹${v/1000}k`} />
                <RechartsTooltip
                  formatter={(value, name) => [
                    name === "revenue" ? formatINR(value) : value,
                    name === "revenue" ? "Revenue" : "Trips",
                  ]}
                  contentStyle={{
                    backgroundColor: "#063247",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                  itemStyle={{ color: "#F6D285" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#288DA6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (5 cols): Fleet Category Breakdown (Donut Pie Chart) */}
        <div className="lg:col-span-5 bg-white border border-[#DFE8EC] rounded-[24px] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8EC]">
            <div>
              <h2 className="font-display text-base font-bold text-[#063247]">
                Fleet Distribution
              </h2>
              <p className="text-xs text-[#8496A2]">12 Active vehicles by segment</p>
            </div>
            <Link
              to="/admin/fleet"
              className="text-xs font-semibold text-[#288DA6] hover:underline flex items-center gap-1"
            >
              <span>Manage Fleet</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="h-[180px] w-[180px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {fleetPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val, name) => [`${val} Vehicles`, name]}
                    contentStyle={{
                      backgroundColor: "#063247",
                      borderRadius: "10px",
                      border: "none",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-[#063247] leading-none">12</span>
                <span className="text-[10px] text-[#64748B] font-bold">Total Cars</span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="flex-1 space-y-2 text-xs">
              {fleetPieData.map((cat, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-[#F8FAFC] border border-[#DFE8EC] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold text-[#063247] text-[11px] truncate">{cat.name.split(" ")[0]}</span>
                  </div>
                  <span className="font-mono font-bold text-[#063247] text-[11px]">{cat.value} Cars</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── 4. 2-COLUMN SPLIT: RECENT ACTIVITY & ENQUIRIES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column (7 cols): Recent Bookings */}
        <div className="lg:col-span-7 bg-white border border-[#DFE8EC] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8EC]">
            <div>
              <h2 className="font-display text-base font-bold text-[#063247]">
                Recent Bookings
              </h2>
              <p className="text-xs text-[#8496A2]">Latest confirmed trips and customer pickups</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs font-semibold text-[#2A8FA8] hover:underline flex items-center gap-1"
            >
              <span>All Bookings</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-[#DFE8EC]">
            {data?.recent_bookings && data.recent_bookings.length > 0 ? (
              data.recent_bookings.map((b, idx) => (
                <div
                  key={b.id || idx}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-[#F8FAFC] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] border border-[#DFE8EC] flex items-center justify-center text-[#063247] font-bold text-xs shrink-0">
                      <Car size={15} className="text-[#2A8FA8]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#063247] truncate">
                        {b.customer?.name || b.customer_name || "Goa Traveler"}
                      </div>
                      <div className="text-[11px] text-[#8496A2] truncate">
                        {b.vehicle_title || "Rental Vehicle"} · {b.service_type === "tour" ? "Tour Package" : "Self-Drive"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-[#063247]">
                      ₹{(b.total_amount || 0).toLocaleString("en-IN")}
                    </div>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                      b.status === "Confirmed"
                        ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                        : b.status === "Completed"
                        ? "bg-[#F1F5F9] text-[#475569] border border-[#DFE8EC]"
                        : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                    }`}>
                      {b.status || "Confirmed"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#8496A2]">
                <Clock size={28} className="mx-auto mb-2 opacity-40 text-[#8496A2]" />
                <div>No bookings recorded yet</div>
                <Button
                  onClick={() => setOfflineModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs rounded-xl border-[#DFE8EC] text-[#063247]"
                >
                  + Create First Booking
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Fleet Category Status & Quick Links */}
        <div className="lg:col-span-5 bg-white border border-[#DFE8EC] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8EC]">
            <div>
              <h2 className="font-display text-base font-bold text-[#063247]">
                Fleet Readiness
              </h2>
              <p className="text-xs text-[#8496A2]">Vehicle availability by category</p>
            </div>
            <Link
              to="/admin/fleet"
              className="text-xs font-semibold text-[#2A8FA8] hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Category 1: Hatchbacks */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-[#063247]">
                <span>Hatchbacks (Swift, Baleno)</span>
                <span className="text-[11px] text-[#059669] font-mono font-bold">100% Ready</span>
              </div>
              <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                <div className="bg-[#2A8FA8] h-full rounded-full w-full" />
              </div>
            </div>

            {/* Category 2: Sedans */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-[#063247]">
                <span>Sedans (Dzire, Aura)</span>
                <span className="text-[11px] text-[#059669] font-mono font-bold">100% Ready</span>
              </div>
              <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                <div className="bg-[#2A8FA8] h-full rounded-full w-full" />
              </div>
            </div>

            {/* Category 3: SUVs & MPVs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-[#063247]">
                <span>SUVs &amp; 7-Seaters (Ertiga, Innova)</span>
                <span className="text-[11px] text-[#059669] font-mono font-bold">100% Ready</span>
              </div>
              <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                <div className="bg-[#063247] h-full rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Quick Hub Shortcuts */}
          <div className="pt-3 border-t border-[#DFE8EC] grid grid-cols-2 gap-2">
            <Link
              to="/admin/calendar"
              className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DFE8EC] text-xs font-semibold text-[#063247] flex items-center gap-2 transition-colors"
            >
              <Calendar size={14} className="text-[#2A8FA8]" />
              <span>Calendar Schedule</span>
            </Link>
            <Link
              to="/admin/fleet"
              className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DFE8EC] text-xs font-semibold text-[#063247] flex items-center gap-2 transition-colors"
            >
              <Car size={14} className="text-[#2A8FA8]" />
              <span>Edit Car Rates</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4. CUSTOMER LEAD & ENQUIRY TRACKER (CLEAN & MINIMAL) ── */}
      <div className="bg-white border border-[#DFE8EC] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFE8EC]">
          <div>
            <h2 className="font-display text-base font-bold text-[#063247]">
              Customer Leads &amp; Inquiries
            </h2>
            <p className="text-xs text-[#8496A2]">
              Track incoming travel requests, origin cities, and booking conversions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4C606E] bg-[#F8FAFC] px-3 py-1 rounded-xl border border-[#DFE8EC]">
              Total: <strong className="text-[#063247]">{enquiriesData.total_enquiries || enquiriesData.items?.length || 0}</strong>
            </span>
            <Button
              onClick={() => setEnquiryModalOpen(true)}
              className="h-8 px-3 rounded-xl text-xs font-semibold bg-[#063247] hover:bg-[#063247]/90 text-white flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Log Lead</span>
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8496A2]" />
            <input
              type="text"
              placeholder="Search customer name, phone, or car choice..."
              value={enqQuery}
              onChange={(e) => setEnqQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#DFE8EC] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#063247] outline-none focus:border-[#2A8FA8] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="h-8 text-xs rounded-xl px-2.5 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] min-w-[110px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                <SelectItem value="All">All Cities</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Panaji">Goa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs rounded-xl px-2.5 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] min-w-[110px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="overflow-x-auto rounded-xl border border-[#DFE8EC]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#DFE8EC] text-[11px] font-bold text-[#4C606E] uppercase tracking-wider">
                <th className="py-2.5 pl-4 pr-2">Customer</th>
                <th className="py-2.5 px-2">City</th>
                <th className="py-2.5 px-2">Vehicle Choice</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2 hidden sm:table-cell">Date</th>
                <th className="py-2.5 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE8EC]">
              {enqLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#8496A2]">
                    Loading leads...
                  </td>
                </tr>
              ) : enquiriesData.items?.length > 0 ? (
                enquiriesData.items.map((enq, idx) => (
                  <tr key={enq.id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Customer Info */}
                    <td className="py-3 pl-4 pr-2">
                      <div className="font-bold text-[#063247]">{enq.customer_name || enq.name || "Customer"}</div>
                      <div className="text-[11px] text-[#8496A2] font-mono">{enq.phone}</div>
                    </td>

                    {/* City */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#4C606E] text-[11px] font-medium border border-[#DFE8EC]">
                        {enq.city || "Goa"}
                      </span>
                    </td>

                    {/* Vehicle Choice */}
                    <td className="py-3 px-2 font-medium text-[#063247] truncate max-w-[140px]">
                      {enq.car_model_interested || "Rental Vehicle"}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <Select
                        value={enq.status || "New"}
                        onValueChange={(val) => updateEnquiryStatus(enq.id, val)}
                      >
                        <SelectTrigger className={`h-6 text-[10.5px] font-semibold rounded-full px-2 border ${
                          enq.status === "Converted"
                            ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                            : enq.status === "Follow-up"
                            ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                            : enq.status === "Lost"
                            ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                            : "bg-[#F1F5F9] text-[#063247] border-[#DFE8EC]"
                        }`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                          <SelectItem value="New">● New</SelectItem>
                          <SelectItem value="Contacted">● Contacted</SelectItem>
                          <SelectItem value="Follow-up">● Follow-up</SelectItem>
                          <SelectItem value="Converted">● Converted</SelectItem>
                          <SelectItem value="Lost">● Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-2 text-[#8496A2] font-mono text-[11px] hidden sm:table-cell whitespace-nowrap">
                      {safeFormatDate(enq.created_at, "dd MMM yyyy", "Recent")}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-4 pl-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedBookingForWhatsApp({
                              customerName: enq.customer_name || enq.name,
                              phone: enq.phone,
                              serviceType: enq.car_model_interested || 'Car Rental / Tour Package',
                              pickupLocation: enq.city || 'Pune / Goa',
                              status: enq.status || 'New Lead',
                            });
                            setWhatsAppModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="WhatsApp Dispatch"
                        >
                          <MessageSquare size={14} />
                        </button>
                        {enq.notes && (
                          <button
                            onClick={() => viewNote(enq)}
                            className="p-1 rounded-lg text-[#8496A2] hover:text-[#063247] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                            title="View Notes"
                          >
                            <MessageSquarePlus size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => promptDeleteEnquiry(enq.id)}
                          className="p-1 rounded-lg text-[#8496A2] hover:text-[#E8826B] hover:bg-[#E8826B]/10 transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#8496A2]">
                    No customer inquiries found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Modals */}
      <OfflineBookingModal open={offlineModalOpen} onOpenChange={setOfflineModalOpen} />
      <EnquiryModal open={enquiryModalOpen} onOpenChange={setEnquiryModalOpen} />

      <WhatsAppBookingModal
        isOpen={whatsAppModalOpen}
        onClose={() => {
          setWhatsAppModalOpen(false);
          setSelectedBookingForWhatsApp(null);
        }}
        booking={selectedBookingForWhatsApp}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Customer Lead Enquiry?"
        description="Are you sure you want to delete this enquiry from the lead tracker? This action cannot be undone."
        confirmText="Delete Enquiry"
        variant="destructive"
        loading={deleting}
        onConfirm={handleConfirmDeleteEnquiry}
      />

      {/* Enquiry Notes Modal */}
      <NotesModal
        open={notesModalOpen}
        onOpenChange={setNotesModalOpen}
        title={selectedNote.title}
        subtitle={selectedNote.subtitle}
        notes={selectedNote.text}
      />
    </div>
  );
}
