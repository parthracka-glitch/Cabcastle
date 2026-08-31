/* Brex Design System — Customer Profile & Booking Hub */
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  Ticket,
  Download,
  Car,
  Calendar,
  MapPin,
  Loader2,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Check,
  Copy,
  KeyRound,
  FileText,
  HelpCircle,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  MessageSquare,
  Shield,
  CreditCard,
  Building2,
  X,
  Search,
  ExternalLink,
  UploadCloud,
} from "lucide-react";
import api, { API, formatINR, safeFormatDate, formatApiError } from "@/lib/api";

export default function CustomerProfile() {
  const { user, logout, updateUser, refreshUser } = useAuth();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State
  const activeTab = searchParams.get("tab") || "bookings";
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Bookings Data & Filter
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    driving_license: "",
    city: "",
    state: "",
    emergency_contact: "",
    preferred_location: "Mopa Airport (GOX)",
    aadhar_image_url: "",
    license_image_url: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Copy helper
  const [copiedId, setCopiedId] = useState(null);
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Booking ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sync profile form when user context loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        driving_license: user.driving_license || "",
        city: user.city || "",
        state: user.state || "",
        emergency_contact: user.emergency_contact || "",
        preferred_location: user.preferred_location || "Mopa Airport (GOX)",
        aadhar_image_url: user.aadhar_image_url || "",
        license_image_url: user.license_image_url || "",
      });
    }
  }, [user]);

  const handleProfileDocUpload = async (file, docType) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    const isAadhar = docType === "aadhar";
    if (isAadhar) setUploadingAadhar(true);
    else setUploadingLicense(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await api.post("/bookings/upload-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data?.url) {
        setProfileForm((prev) => ({
          ...prev,
          [isAadhar ? "aadhar_image_url" : "license_image_url"]: data.url,
        }));
        toast.success(`${isAadhar ? "Aadhaar Card" : "Driving License"} uploaded successfully!`);
      }
    } catch (err) {
      toast.error(formatApiError(err) || "Document upload failed");
    } finally {
      if (isAadhar) setUploadingAadhar(false);
      else setUploadingLicense(false);
    }
  };

  // Load customer bookings
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoadingBookings(false);
      return;
    }

    const email = user.email ? user.email.toLowerCase() : "";
    const phone = user.phone || "";

    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        let serverBookings = [];
        if (email) {
          try {
            const res = await api.get("/customer/bookings/search", { params: { q: email } });
            if (Array.isArray(res.data)) {
              serverBookings = res.data;
            }
          } catch {}
        }
        if (serverBookings.length === 0 && phone) {
          try {
            const res = await api.get("/customer/bookings/search", { params: { q: phone } });
            if (Array.isArray(res.data)) {
              serverBookings = res.data;
            }
          } catch {}
        }

        // Also merge local session bookings for this user email
        let localBookings = [];
        try {
          const raw = localStorage.getItem(`ccg_user_bookings_${email}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localBookings = parsed;
          }
        } catch {}

        // Combine and deduplicate
        const mergedMap = new Map();
        [...localBookings, ...serverBookings].forEach((b) => {
          const key = b.booking_no || b.id || b._id;
          if (key && !mergedMap.has(key)) {
            mergedMap.set(key, b);
          }
        });

        setBookings(Array.from(mergedMap.values()));
      } catch (err) {
        console.error("Failed to load customer bookings", err);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (bookingFilter === "active") {
        if (b.status === "Cancelled" || b.status === "Completed") return false;
      } else if (bookingFilter === "completed") {
        if (b.status !== "Completed") return false;
      } else if (bookingFilter === "cancelled") {
        if (b.status !== "Cancelled") return false;
      }

      // Search term
      if (bookingSearch.trim()) {
        const q = bookingSearch.toLowerCase();
        const bNo = (b.booking_no || "").toLowerCase();
        const carTitle = (b.vehicle_snapshot?.title || "").toLowerCase();
        const loc = (b.pickup_location || "").toLowerCase();
        return bNo.includes(q) || carTitle.includes(q) || loc.includes(q);
      }

      return true;
    });
  }, [bookings, bookingFilter, bookingSearch]);

  // Quick stats calculation
  const totalSpent = useMemo(() => {
    return bookings.reduce((sum, b) => (b.status !== "Cancelled" ? sum + (Number(b.total_amount) || 0) : sum), 0);
  }, [bookings]);

  const activeTripsCount = useMemo(() => {
    return bookings.filter((b) => b.status === "Confirmed" || b.status === "In-Progress" || b.status === "Pending").length;
  }, [bookings]);

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Please provide your full name");
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await api.put("/auth/profile", profileForm);
      if (data.ok && data.user) {
        updateUser(data.user);
        toast.success("Profile details updated successfully!");
      } else {
        toast.success("Profile saved!");
      }
    } catch (err) {
      toast.error(formatApiError(err) || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.new_password || passwordForm.new_password.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New password and confirm password do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const { data } = await api.post("/auth/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      if (data.ok) {
        toast.success("Password updated successfully!");
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      }
    } catch (err) {
      toast.error(formatApiError(err) || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#063247] font-body flex flex-col justify-between antialiased">
        <SEO
          title="Sign In Required — Cab Castle Goa"
          description="Sign in to view your Goa cab reservations and invoices."
        />
        <Navbar />

        <main className="max-w-md mx-auto px-4 pt-32 pb-20 w-full flex-grow flex items-center justify-center">
          <div className="w-full bg-white border border-[#DFE8EC] rounded-3xl p-7 text-center shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#063247] text-[#288DA6] flex items-center justify-center mx-auto shadow-md">
              <Shield size={26} />
            </div>

            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-black text-[#063247]">Authentication Required</h1>
              <p className="text-xs text-[#4C606E]">
                You are currently signed out. Please sign in or register to view your active bookings and invoices.
              </p>
            </div>

            <Button
              onClick={() => nav("/login", { state: { from: "/my-bookings" } })}
              className="w-full bg-[#288DA6] hover:bg-[#288DA6]/90 text-white font-bold rounded-xl h-11 transition-all text-xs tracking-wider uppercase cursor-pointer shadow-md"
            >
              Sign In to View Bookings
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#063247] font-body flex flex-col justify-between antialiased">
      <SEO
        title="My Account & Bookings — Cab Castle Goa"
        description="Manage your Goa cab tour reservations, download invoices, and view trip details."
      />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full flex-grow">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#4C606E] mb-4 sm:mb-6 text-left">
          <Link to="/" className="hover:text-[#063247] transition-colors">Home</Link>
          <ChevronRight size={13} className="text-[#8496A2]" />
          <span className="text-[#063247] font-bold">My Account</span>
        </div>

        {/* ── 1. TOP PROFILE HERO BANNER ── */}
        <div className="bg-white border border-[#DFE8EC] rounded-[24px] p-5 sm:p-8 mb-6 sm:mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#063247] text-white flex items-center justify-center font-display text-2xl sm:text-3xl font-bold border-2 border-[#DFE8EC] shrink-0 shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={28} />}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#E4F2F5] text-[#288DA6] p-1 rounded-full border border-white" title="Verified Customer">
                  <ShieldCheck size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#063247] tracking-tight">
                    {user?.name || "Cab Castle Traveler"}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#288DA6] bg-[#E4F2F5] px-3 py-0.5 rounded-full uppercase tracking-wider">
                    <ShieldCheck size={12} /> Verified Account
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#063247] bg-[#C3E7FA] px-3 py-0.5 rounded-full uppercase tracking-wider">
                    <Award size={12} /> Member
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#4C606E]">
                  <span className="flex items-center gap-1.5 font-normal">
                    <Mail size={13} className="text-[#4C606E]" /> {user?.email || "customer@cabcastlegoa.com"}
                  </span>
                  {user?.phone && (
                    <span className="flex items-center gap-1.5 font-normal">
                      <Phone size={13} className="text-[#2A354F]" /> {user.phone}
                    </span>
                  )}
                  {user?.driving_license && (
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#2A354F] bg-[#FCF5D5] px-2.5 py-0.5 rounded-full border border-[#F2D965]/40">
                      <FileText size={11} className="text-[#2A354F]" /> DL: {user.driving_license}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E8ECF2]">
              <Button
                asChild
                className="bg-gradient-to-r from-[#F2D965] via-[#ECD055] to-[#E5C94B] hover:from-[#F7E17E] hover:to-[#ECD055] text-[#1A202C] font-black rounded-full h-11 px-6 text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(242,217,101,0.45)] flex-1 sm:flex-none cursor-pointer border-t border-white/60"
              >
                <Link to="/fleet">
                  <Car size={14} className="mr-1.5 text-[#1A202C]" /> Book A Car
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await logout();
                  nav("/");
                }}
                className="border-[#E8ECF2] bg-transparent text-[#2A354F] hover:bg-[#FEFEF2] hover:border-[#2A354F] text-xs font-bold uppercase tracking-wider rounded-full h-11 px-5 transition-all flex-1 sm:flex-none cursor-pointer"
              >
                <LogOut size={13} className="mr-1.5" /> Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* ── 2. TABBED NAVIGATION ── */}
        <div className="flex items-center gap-2 border-b border-[#E8ECF2] mb-6 sm:mb-8 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "bookings"
                ? "border-[#2A354F] text-[#2A354F]"
                : "border-transparent text-[#6B7C9E] hover:text-[#2A354F]"
            }`}
          >
            <Ticket size={15} /> My Bookings &amp; Trips ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "border-[#2A354F] text-[#2A354F]"
                : "border-transparent text-[#6B7C9E] hover:text-[#2A354F]"
            }`}
          >
            <User size={15} /> Edit Profile &amp; Driver KYC
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "security"
                ? "border-[#2A354F] text-[#2A354F]"
                : "border-transparent text-[#6B7C9E] hover:text-[#2A354F]"
            }`}
          >
            <KeyRound size={15} /> Security &amp; Password
          </button>

          <button
            onClick={() => setActiveTab("help")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "help"
                ? "border-[#2A354F] text-[#2A354F]"
                : "border-transparent text-[#6B7C9E] hover:text-[#2A354F]"
            }`}
          >
            <HelpCircle size={15} /> 24/7 Roadside &amp; Support
          </button>
        </div>

        {/* ── 3. TAB CONTENT ── */}

        {/* ── TAB 1: MY BOOKINGS & TRIPS ── */}
        {activeTab === "bookings" && (
          <div className="space-y-6 text-left">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#E8ECF2] p-3.5 rounded-[24px] shadow-xs">
              {/* Status Pill Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Trips" },
                  { id: "active", label: "Active & Upcoming" },
                  { id: "completed", label: "Completed" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setBookingFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      bookingFilter === f.id
                        ? "bg-[#2A354F] text-white shadow-xs"
                        : "bg-[#FEFEF2] text-[#6B7C9E] hover:text-[#2A354F] border border-[#E8ECF2]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA0BF]" />
                <input
                  type="text"
                  placeholder="Search by ID, car, location..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-[#FEFEF2] border border-[#E8ECF2] rounded-full pl-9 pr-4 py-2 text-xs text-[#2A354F] outline-none focus:border-[#929FC1] transition-colors"
                />
              </div>
            </div>

            {/* Bookings List */}
            {loadingBookings ? (
              <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-12 text-center text-[#6F6E73] flex flex-col items-center justify-center gap-3 shadow-sm">
                <Loader2 className="animate-spin text-[#212121]" size={28} />
                <span className="text-xs font-normal">Loading your verified bookings &amp; travel itineraries...</span>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-12 text-center text-[#6F6E73] shadow-sm">
                <Car size={40} className="mx-auto mb-3 text-[#99989E]" />
                <h3 className="text-base font-bold text-[#212121] mb-1">
                  {bookingSearch || bookingFilter !== "all" ? "No matching bookings found" : "No bookings yet"}
                </h3>
                <p className="text-xs text-[#6F6E73] max-w-md mx-auto mb-6">
                  {bookingSearch || bookingFilter !== "all"
                    ? "Try adjusting your search terms or filter to see other reservations."
                    : "Plan your dream Goa getaway with sanitized, well-maintained self-drive cars and zero security deposit."}
                </p>
                <Button
                  asChild
                  className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-medium rounded-full text-xs uppercase tracking-wider h-11 px-8 shadow-sm cursor-pointer"
                >
                  <Link to="/fleet">Browse Verified Fleet →</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#212121] transition-all relative overflow-hidden"
                  >
                    <div>
                      {/* Booking Header: ID, Date & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#212121]">
                            {b.booking_no || "DHG-BOOKING"}
                          </span>
                          <button
                            onClick={() => copyToClipboard(b.booking_no || b.id, b.id)}
                            className="p-1 text-[#6F6E73] hover:text-[#212121] transition-colors cursor-pointer"
                            title="Copy Booking ID"
                          >
                            {copiedId === b.id ? <Check size={12} className="text-[#4B8039]" /> : <Copy size={12} />}
                          </button>
                        </div>

                        <Badge
                          className={
                            b.status === "Confirmed"
                              ? "bg-[#CFDECA] text-[#4B8039] border-0 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
                              : b.status === "In-Progress"
                              ? "bg-[#EFF0A3] text-[#212121] border-0 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
                              : b.status === "Completed"
                              ? "bg-[#212121] text-white border-0 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
                              : b.status === "Cancelled"
                              ? "bg-[#FFEAEA] text-[#D93025] border-0 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
                              : "bg-[#F6F5FA] text-[#6F6E73] border border-[#DFDCE8] text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
                          }
                        >
                          {b.status || "Pending"}
                        </Badge>
                      </div>

                      {/* Car Snapshot & Details */}
                      <div className="flex items-start gap-3.5 mb-3.5">
                        <div className="w-20 h-14 rounded-[12px] bg-[#F6F5FA] border border-[#DFDCE8] overflow-hidden flex items-center justify-center shrink-0">
                          <img
                            src={b.vehicle_snapshot?.image_url || "/vehicles/cat_hatchback.jpg"}
                            alt={b.vehicle_snapshot?.title || "Car"}
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                            onError={(e) => {
                              e.currentTarget.src = "/vehicles/cat_hatchback.jpg";
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-display text-base font-bold text-[#212121] leading-snug">
                            {b.vehicle_snapshot?.title || "Self-Drive Vehicle"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6F6E73] mt-0.5">
                            <span className="bg-[#F6F5FA] px-2 py-0.5 rounded-full border border-[#DFDCE8]">
                              {b.vehicle_snapshot?.category || "Tour Cab"}
                            </span>
                            <span>{b.days || 1} Day rental</span>
                          </div>
                        </div>
                      </div>

                      {/* Travel Schedule Grid */}
                      <div className="grid grid-cols-2 gap-3 bg-[#F6F5FA] p-3.5 rounded-[16px] border border-[#DFDCE8] text-xs">
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase text-[#6F6E73] font-bold flex items-center gap-1">
                            <MapPin size={11} className="text-[#212121]" /> Pickup Spot
                          </div>
                          <div className="font-bold text-[#212121] truncate">
                            {b.pickup_location || "Assagao Hub"}
                          </div>
                          <div className="text-[11px] text-[#6F6E73] flex items-center gap-1">
                            <Calendar size={11} className="text-[#99989E]" />
                            {safeFormatDate(b.start_date, "dd MMM yyyy · HH:mm")}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] uppercase text-[#6F6E73] font-bold flex items-center gap-1">
                            <MapPin size={11} className="text-[#212121]" /> Drop-off Spot
                          </div>
                          <div className="font-bold text-[#212121] truncate">
                            {b.dropoff_location || b.pickup_location || "Same as Pick-up"}
                          </div>
                          <div className="text-[11px] text-[#6F6E73] flex items-center gap-1">
                            <Calendar size={11} className="text-[#99989E]" />
                            {safeFormatDate(b.end_date, "dd MMM yyyy · HH:mm")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions & Price */}
                    <div className="pt-3 border-t border-[#DFDCE8] flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase text-[#6F6E73] font-medium">Total Amount</div>
                        <div className="font-display text-base sm:text-lg font-bold text-[#212121]">
                          {formatINR(b.total_amount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(b)}
                          className="border-[#DFDCE8] text-[#212121] hover:border-[#212121] hover:text-[#212121] text-[11px] font-medium rounded-full h-8 px-3.5 transition-colors cursor-pointer"
                        >
                          View Details
                        </Button>

                        <a href={`${API}/bookings/${b.id}/invoice`} target="_blank" rel="noreferrer">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#DFDCE8] text-[#212121] hover:bg-[#212121] hover:text-white hover:border-[#212121] text-[11px] font-medium rounded-full h-8 px-3.5 transition-colors cursor-pointer"
                          >
                            <Download size={12} className="mr-1" /> Invoice
                          </Button>
                        </a>

                        <a
                          href={`https://wa.me/917026648960?text=Hello%20Cab%20Castle%20Goa,%20I%20have%20an%20enquiry%20regarding%20my%20booking%20${encodeURIComponent(
                            b.booking_no || b.id
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center h-8 px-3.5 rounded-full bg-[#E4F2F5] hover:bg-[#C3E7FA] text-[#288DA6] text-[11px] font-bold transition-colors"
                          title="Contact Dispatch on WhatsApp"
                        >
                          <MessageSquare size={12} className="mr-1" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: EDIT PROFILE & KYC ── */}
        {activeTab === "profile" && (
          <div className="max-w-3xl mx-auto text-left">
            <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 shadow-sm">
              <div className="mb-6 pb-4 border-b border-[#DFDCE8]">
                <h3 className="font-display text-xl font-bold text-[#212121]">
                  Customer Profile &amp; Contact Details
                </h3>
                <p className="text-xs text-[#6F6E73] mt-1">
                  Keep your contact info and Aadhaar details updated for fast, seamless cab dispatch at Goa airports and hotels.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#212121]">
                      Full Legal Name <span className="text-[#212121]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Enter full legal name"
                      className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-colors"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#212121]">
                      Primary Phone Number <span className="text-[#212121]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="Enter primary phone number"
                      className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email (Read-Only) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#212121]">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full bg-[#F6F5FA]/60 border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#6F6E73] cursor-not-allowed"
                    />
                    <span className="text-[10px] text-[#6F6E73] px-2">Email is tied to your account login.</span>
                  </div>

                  {/* Driving License Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#212121] flex items-center justify-between">
                      <span>Indian / International Driving License</span>
                      <span className="text-[10px] text-[#4B8039] font-bold flex items-center gap-0.5">
                        <ShieldCheck size={11} /> Required for self-drive
                      </span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.driving_license}
                      onChange={(e) => setProfileForm({ ...profileForm, driving_license: e.target.value.toUpperCase() })}
                      placeholder="Enter driving license number"
                      className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-mono text-[#212121] outline-none focus:border-[#212121] transition-colors uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#212121]">City / Town</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="Enter city / town"
                      className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-colors"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#212121]">State / Country</label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      placeholder="Enter state / country"
                      className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Emergency Contact */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#212121]">Emergency Contact Name &amp; Phone</label>
                    <input
                      type="text"
                      value={profileForm.emergency_contact}
                      onChange={(e) => setProfileForm({ ...profileForm, emergency_contact: e.target.value })}
                      placeholder="Enter emergency contact name and phone"
                      className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-colors"
                    />
                  </div>

                  {/* Preferred Pickup Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#212121]">Preferred Goa Arrival Hub</label>
                    <select
                      value={profileForm.preferred_location}
                      onChange={(e) => setProfileForm({ ...profileForm, preferred_location: e.target.value })}
                      className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-colors"
                    >
                      <option value="Mopa Airport (GOX)">Mopa Airport (GOX) - North Goa</option>
                      <option value="Dabolim Airport (GOI)">Dabolim Airport (GOI) - Central Goa</option>
                      <option value="Candolim Beach">Candolim Beach Main Hub</option>
                      <option value="Calangute / Baga">Calangute / Baga</option>
                      <option value="Panaji City">Panaji City</option>
                      <option value="Madgaon Railway Station">Madgaon Railway Station</option>
                    </select>
                  </div>
                </div>

                {/* KYC Identity Documents Upload Section */}
                <div className="p-5 rounded-[16px] bg-[#F6F5FA] border border-[#DFDCE8] space-y-3.5">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#212121] font-bold flex items-center gap-1.5">
                      <ShieldCheck size={15} /> Driver KYC Identity Documents (Secure &amp; Encrypted)
                    </div>
                    <p className="text-xs text-[#6F6E73] mt-1">
                      Upload clear photos of the front of your Aadhaar card and Driving License to skip in-person paperwork upon arrival.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Front of Aadhaar Card */}
                    <div className="bg-white p-4 rounded-[16px] border border-[#DFDCE8] flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[#212121]">Front of Aadhaar Card</span>
                          {profileForm.aadhar_image_url ? (
                            <span className="text-[10px] bg-[#CFDECA] text-[#4B8039] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={11} /> Uploaded
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#6F6E73]">JPG / PNG / PDF</span>
                          )}
                        </div>

                        {profileForm.aadhar_image_url ? (
                          <div className="relative aspect-[16/9] w-full rounded-[12px] border border-[#DFDCE8] overflow-hidden bg-[#F6F5FA] mt-2">
                            <img
                              src={profileForm.aadhar_image_url}
                              alt="Aadhaar Front"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-[#DFDCE8] hover:border-[#212121] rounded-[16px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F6F5FA] mt-2 group">
                            {uploadingAadhar ? (
                              <Loader2 size={22} className="text-[#212121] animate-spin mb-1.5" />
                            ) : (
                              <UploadCloud size={22} className="text-[#99989E] group-hover:text-[#212121] mb-1.5 transition-colors" />
                            )}
                            <span className="text-xs font-medium text-[#212121]">
                              {uploadingAadhar ? "Uploading Document..." : "Upload Aadhaar Front"}
                            </span>
                            <span className="text-[10px] text-[#6F6E73] mt-0.5">Click to select image</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              disabled={uploadingAadhar}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleProfileDocUpload(e.target.files[0], "aadhar");
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {profileForm.aadhar_image_url && (
                        <label className="text-[11px] text-[#212121] hover:underline font-bold cursor-pointer block text-center pt-1">
                          Replace Aadhaar Photo
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            disabled={uploadingAadhar}
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleProfileDocUpload(e.target.files[0], "aadhar");
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Front of Driving License */}
                    <div className="bg-white p-4 rounded-[16px] border border-[#DFDCE8] flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[#212121]">Front of Driving License</span>
                          {profileForm.license_image_url ? (
                            <span className="text-[10px] bg-[#CFDECA] text-[#4B8039] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={11} /> Uploaded
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#6F6E73]">JPG / PNG / PDF</span>
                          )}
                        </div>

                        {profileForm.license_image_url ? (
                          <div className="relative aspect-[16/9] w-full rounded-[12px] border border-[#DFDCE8] overflow-hidden bg-[#F6F5FA] mt-2">
                            <img
                              src={profileForm.license_image_url}
                              alt="Driving License Front"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-[#DFDCE8] hover:border-[#212121] rounded-[16px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F6F5FA] mt-2 group">
                            {uploadingLicense ? (
                              <Loader2 size={22} className="text-[#212121] animate-spin mb-1.5" />
                            ) : (
                              <UploadCloud size={22} className="text-[#99989E] group-hover:text-[#212121] mb-1.5 transition-colors" />
                            )}
                            <span className="text-xs font-medium text-[#212121]">
                              {uploadingLicense ? "Uploading Document..." : "Upload License Front"}
                            </span>
                            <span className="text-[10px] text-[#6F6E73] mt-0.5">Click to select image</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              disabled={uploadingLicense}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleProfileDocUpload(e.target.files[0], "license");
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {profileForm.license_image_url && (
                        <label className="text-[11px] text-[#212121] hover:underline font-bold cursor-pointer block text-center pt-1">
                          Replace License Photo
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            disabled={uploadingLicense}
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleProfileDocUpload(e.target.files[0], "license");
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DFDCE8] flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-medium rounded-full h-11 px-8 text-xs uppercase tracking-wider shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Save Profile Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 3: SECURITY & PASSWORD ── */}
        {activeTab === "security" && (
          <div className="max-w-2xl mx-auto text-left space-y-6">
            {/* Change Password Card */}
            <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 shadow-sm">
              <div className="mb-6 pb-4 border-b border-[#DFDCE8]">
                <h3 className="font-display text-xl font-bold text-[#212121] flex items-center gap-2">
                  <KeyRound size={18} className="text-[#212121]" /> Update Account Password
                </h3>
                <p className="text-xs text-[#6F6E73] mt-1">
                  Ensure your account is protected with a secure password containing at least 6 characters.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#212121]">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#212121]">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#212121]">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full bg-[#F6F5FA] border border-[#DFDCE8] rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium text-[#212121] outline-none focus:border-[#212121] transition-colors"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingPassword}
                    className="bg-[#212121] hover:bg-[#141414] text-white font-medium rounded-full h-11 px-8 text-xs uppercase tracking-wider shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Updating...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Session Information */}
            <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#212121]">Active Browser Session</h4>
                <p className="text-xs text-[#6F6E73] mt-0.5">
                  Logged in as <span className="font-bold text-[#212121]">{user?.email}</span>. Secure encrypted session.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  await logout();
                  nav("/");
                }}
                className="border-[#DFDCE8] bg-transparent text-[#212121] hover:bg-[#F6F5FA] text-xs font-medium uppercase tracking-wider rounded-full h-10 px-5 cursor-pointer"
              >
                <LogOut size={13} className="mr-1.5" /> Sign Out of Account
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB 4: 24/7 ROADSIDE & SUPPORT ── */}
        {activeTab === "help" && (
          <div className="max-w-4xl mx-auto text-left space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Emergency Hotline */}
              <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-6 shadow-sm space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF0A3] text-[#212121] text-xs font-bold uppercase tracking-wider">
                  ⚡ 24/7 Roadside Assistance
                </div>
                <h3 className="font-display text-xl font-bold text-[#212121]">
                  Immediate On-Ground Support Across Goa
                </h3>
                <p className="text-xs text-[#6F6E73] leading-relaxed">
                  Flat tire, battery jump-start, or roadside breakdown? Our verified local mechanics and emergency towing team reach any North or South Goa location in under 45 minutes.
                </p>
                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+917026648960"
                    className="inline-flex items-center justify-center gap-2 bg-[#063247] hover:bg-[#063247]/90 text-white font-medium rounded-full h-11 px-6 text-xs tracking-wider uppercase whitespace-nowrap transition-colors shadow-sm cursor-pointer flex-1"
                  >
                    <Phone size={14} className="text-[#288DA6]" />
                    <span>Call +91 70266 48960</span>
                  </a>
                  <a
                    href="https://wa.me/917026648960?text=Hello%20Cab%20Castle%20Goa,%20I%20need%20assistance"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1E7E34] text-white font-bold rounded-full h-11 px-6 text-xs tracking-wider uppercase whitespace-nowrap transition-colors shadow-xs cursor-pointer flex-1"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              </div>

              {/* Main Operations Hub */}
              <div className="bg-white border border-[#DFE8EC] rounded-[24px] p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F7F7] text-[#063247] text-xs font-bold uppercase tracking-wider border border-[#DFE8EC]">
                    📍 Assagao Main Hub
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#063247] mt-3">
                    Cab Castle Goa Operations Hub
                  </h3>
                  <p className="text-xs text-[#6F6E73] leading-relaxed mt-2">
                    Assagao, Bardez, Goa 403507. Open 24 Hours with prompt cab dispatch, airport transfer coordinators, and customer support.
                  </p>
                </div>
                <div className="pt-3">
                  <a
                    href="https://maps.google.com/?q=Assagao+Goa"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 bg-[#F6F5FA] hover:bg-[#DFDCE8]/40 border border-[#DFDCE8] text-[#212121] font-bold rounded-full h-11 px-6 text-xs tracking-wider uppercase whitespace-nowrap transition-colors w-full sm:w-auto"
                  >
                    <ExternalLink size={13} />
                    <span>View Location on Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Essential Goa Tour Travel Guidelines */}
            <div className="bg-white border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 shadow-sm text-left">
              <h3 className="font-display text-lg font-bold text-[#063247] mb-4 flex items-center gap-2">
                <Shield size={18} className="text-[#288DA6]" /> Essential Cab Travel &amp; Sightseeing Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#6F6E73]">
                <div className="bg-[#F6F5FA] p-4 rounded-[16px] border border-[#DFDCE8]">
                  <div className="font-bold text-[#063247] mb-1">Standard 8h / 80km Tour</div>
                  <p>Covers continuous 8 hours and 80km sightseeing. Extra running is transparently billed at ₹250/hr and ₹25/km.</p>
                </div>
                <div className="bg-[#F6F5FA] p-4 rounded-[16px] border border-[#DFDCE8]">
                  <div className="font-bold text-[#063247] mb-1">Professional Drivers</div>
                  <p>All rides feature licensed, background-verified local drivers who know Goa roads, attractions, and scenic spots.</p>
                </div>
                <div className="bg-[#F6F5FA] p-4 rounded-[16px] border border-[#DFDCE8]">
                  <div className="font-bold text-[#063247] mb-1">Zero Hidden Surcharges</div>
                  <p>All prices include fuel and GST. Tolls and parking are settled directly at actual municipal booths.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── 4. FULL BOOKING DETAILS MODAL ── */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-[24px] border border-[#DFDCE8] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 text-left relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#DFE8EC] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#063247]">
                  {selectedBooking.booking_no || "CCG-BOOKING"}
                </span>
                <h3 className="font-display text-lg font-bold text-[#063247]">Reservation Summary</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-[#F6F5FA] text-[#212121] hover:bg-[#DFDCE8] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Vehicle Info */}
            <div className="flex items-center gap-4 bg-[#F6F5FA] p-4 rounded-[16px] border border-[#DFDCE8]">
              <div className="w-16 h-12 bg-white rounded-[10px] flex items-center justify-center p-1 border border-[#DFDCE8]">
                <img
                  src={selectedBooking.vehicle_snapshot?.image_url || "/vehicles/cat_hatchback.jpg"}
                  alt={selectedBooking.vehicle_snapshot?.title || "Car"}
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              </div>
              <div>
                <div className="font-bold text-sm text-[#212121]">{selectedBooking.vehicle_snapshot?.title || "Car"}</div>
                <div className="text-xs text-[#6F6E73]">Category: {selectedBooking.vehicle_snapshot?.category || "Self-Drive"}</div>
              </div>
            </div>

            {/* Rental Schedule */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F6F5FA]">
                <span className="text-[#6F6E73]">Pickup Location:</span>
                <span className="font-medium text-[#212121]">{selectedBooking.pickup_location || "Candolim Hub"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F5FA]">
                <span className="text-[#6F6E73]">Pickup Date &amp; Time:</span>
                <span className="font-medium text-[#212121]">{safeFormatDate(selectedBooking.start_date, "dd MMM yyyy · HH:mm")}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F5FA]">
                <span className="text-[#6F6E73]">Drop-off Location:</span>
                <span className="font-medium text-[#212121]">{selectedBooking.dropoff_location || selectedBooking.pickup_location || "Same"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F5FA]">
                <span className="text-[#6F6E73]">Drop-off Date &amp; Time:</span>
                <span className="font-medium text-[#212121]">{safeFormatDate(selectedBooking.end_date, "dd MMM yyyy · HH:mm")}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F5FA]">
                <span className="text-[#6F6E73]">Rental Duration:</span>
                <span className="font-medium text-[#212121]">{selectedBooking.days || 1} Day(s)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F5FA]">
                <span className="text-[#6F6E73]">Status:</span>
                <span className="font-bold text-[#4B8039]">{selectedBooking.status || "Confirmed"}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sm text-[#212121] border-t border-[#DFDCE8] mt-2">
                <span>Total Amount Paid:</span>
                <span className="text-[#212121]">{formatINR(selectedBooking.total_amount)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`${API}/bookings/${selectedBooking.id}/invoice`}
                target="_blank"
                rel="noreferrer"
                className="flex-1"
              >
                <Button className="w-full bg-[#212121] hover:bg-[#141414] text-white text-xs uppercase tracking-wider font-bold h-11 rounded-full">
                  <Download size={13} className="mr-1.5" /> Download Tax Invoice
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={() => setSelectedBooking(null)}
                className="border-[#DFDCE8] text-[#212121] text-xs uppercase tracking-wider font-bold h-11 px-6 rounded-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
