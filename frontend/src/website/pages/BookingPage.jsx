import React from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays } from "date-fns";
import {
  Calendar as CalIcon, MapPin, Plane, User, Phone, Mail,
  Check, ArrowRight, Loader2, ShieldCheck, Users, Clock,
  MessageSquare, Train, CreditCard, Lock, LogIn, Compass
} from "lucide-react";
import { toast } from "sonner";
import api, { formatINR } from "@/lib/api";
import { MASTER_FLEET } from "../data/fleetData";

export const FLEET_SPECS = {};
MASTER_FLEET.forEach((v) => {
  FLEET_SPECS[v.id] = {
    id: v.id,
    title: v.title,
    subtitle: v.subtitle,
    category: v.category,
    image_url: v.image_url,
    fuel_type: v.fuel_type,
    seating: v.seating,
    hourlyRate: v.daily_rate,
    extraHr: 250,
    extraKm: 25,
    nightCharge: 500,
    transfers: {
      airport: v.airport_rate,
      margao: v.airport_rate + 200,
      thivim: Math.max(1100, v.airport_rate - 200),
    },
  };
});

const TIME_OPTIONS = [
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
];

export default function BookingPage() {
  const { vehicleId } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user } = useAuth();

  // Resolve vehicle details & rates
  const vehicle = React.useMemo(() => {
    if (vehicleId && FLEET_SPECS[vehicleId]) return FLEET_SPECS[vehicleId];
    const idLower = (vehicleId || "").toLowerCase();
    const match = MASTER_FLEET.find(
      (m) =>
        m.id.toLowerCase() === idLower ||
        m.title.toLowerCase().includes(idLower) ||
        idLower.includes(m.title.toLowerCase())
    );
    if (match && FLEET_SPECS[match.id]) return FLEET_SPECS[match.id];
    return FLEET_SPECS["v-swift"] || Object.values(FLEET_SPECS)[0];
  }, [vehicleId]);

  // Tour mode: "hourly" (8h/80km package) OR "transfer" (Point-to-point transfer)
  const [tourSubOption, setTourSubOption] = React.useState(() => {
    return params.get("mode") === "transfer" || params.get("airport") === "1" ? "transfer" : "hourly";
  });

  // Transfer route: "airport", "margao", or "thivim"
  const [transferRoute, setTransferRoute] = React.useState("airport");
  const [airportName, setAirportName] = React.useState("Mopa Airport (GOX)");

  // Duration in days
  const [days, setDays] = React.useState(1);
  const [isCustomDays, setIsCustomDays] = React.useState(false);

  // Date & Time Fields
  const dropDateInputRef = React.useRef(null);
  const [pickupDate, setPickupDate] = React.useState(() => {
    return params.get("start") || format(new Date(), "yyyy-MM-dd");
  });
  const [pickupTime, setPickupTime] = React.useState("09:00 AM");

  const [dropDate, setDropDate] = React.useState(() => {
    return params.get("end") || format(addDays(new Date(), 1), "yyyy-MM-dd");
  });
  const [dropTime, setDropTime] = React.useState("06:00 PM");

  // Sync dropDate when days change
  const handleDaysChange = (newDays) => {
    setDays(newDays);
    try {
      const p = new Date(pickupDate);
      if (!isNaN(p.getTime())) {
        setDropDate(format(addDays(p, newDays), "yyyy-MM-dd"));
      }
    } catch {}
  };

  // Sync days if user changes dropDate manually
  const handleDropDateChange = (newDropDateStr) => {
    setDropDate(newDropDateStr);
    try {
      const p = new Date(pickupDate);
      const d = new Date(newDropDateStr);
      if (!isNaN(p.getTime()) && !isNaN(d.getTime())) {
        const diff = Math.max(1, Math.round((d.getTime() - p.getTime()) / (1000 * 60 * 60 * 24)));
        setDays(diff);
        if (diff > 3) {
          setIsCustomDays(true);
        }
      }
    } catch {}
  };

  // Handle Custom Days click — scroll & focus to drop date picker
  const handleCustomClick = () => {
    setIsCustomDays(true);
    const el = document.getElementById("schedule-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => {
      if (dropDateInputRef.current) {
        try {
          dropDateInputRef.current.focus();
          if (typeof dropDateInputRef.current.showPicker === "function") {
            dropDateInputRef.current.showPicker();
          }
        } catch {}
      }
    }, 250);
  };

  // Locations & Customer Info (Auto-fetched from login session, fully editable)
  const [pickupLocation, setPickupLocation] = React.useState("");
  const [dropLocation, setDropLocation] = React.useState("");
  const [passengerName, setPassengerName] = React.useState(() => user?.name || "");
  const [passengerPhone, setPassengerPhone] = React.useState(() => user?.phone || "");
  const [passengerEmail, setPassengerEmail] = React.useState(() => user?.email || "");
  const [aadhaarNumber, setAadhaarNumber] = React.useState(() => user?.aadhar || user?.driving_license || "");
  const [selectedItinerary, setSelectedItinerary] = React.useState("North Goa Beaches & Forts");

  const [busy, setBusy] = React.useState(false);

  // Auto-fetch user details when logged-in session changes (remains 100% editable)
  React.useEffect(() => {
    if (user) {
      if (user.name) setPassengerName((prev) => (prev ? prev : user.name));
      if (user.email) setPassengerEmail((prev) => (prev ? prev : user.email));
      if (user.phone) setPassengerPhone((prev) => (prev ? prev : user.phone));
      if (user.aadhar || user.driving_license) {
        setAadhaarNumber((prev) => (prev ? prev : user.aadhar || user.driving_license || ""));
      }
    }
  }, [user]);

  // Live Price Calculation
  const { totalAmount, perDayRate, rateDescription } = React.useMemo(() => {
    if (tourSubOption === "hourly") {
      const total = vehicle.hourlyRate * days;
      return {
        totalAmount: total,
        perDayRate: vehicle.hourlyRate,
        rateDescription: `8h / 80km Tour Package (${days} ${days === 1 ? "Day" : "Days"})`,
      };
    } else {
      let total = vehicle.transfers.airport;
      let desc = `Airport Transfer (${airportName})`;
      if (transferRoute === "margao") {
        total = vehicle.transfers.margao;
        desc = "Margao Railway Station Transfer";
      } else if (transferRoute === "thivim") {
        total = vehicle.transfers.thivim;
        desc = "Thivim Railway Station Transfer";
      }
      return {
        totalAmount: total,
        perDayRate: total,
        rateDescription: desc,
      };
    }
  }, [tourSubOption, transferRoute, airportName, days, vehicle]);

  const handleBookNow = async (viaWhatsApp = false) => {
    // 1. Mandatory Login Security Guard
    if (!user) {
      toast.error("Security Requirement: Please sign in or create an account to book your cab.");
      nav("/login", { state: { from: `/booking/${vehicle.id}` } });
      return;
    }

    // 2. Strict Verification: All fields must be filled
    const finalPickupLoc = tourSubOption === "transfer" && transferRoute === "airport" ? airportName : pickupLocation.trim();
    if (!finalPickupLoc) {
      toast.error("Please fill in your Pickup Address / Hotel / Terminal");
      const el = document.getElementById("pickup-location-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!dropLocation.trim()) {
      toast.error("Please fill in your Drop-off Address / Destination");
      const el = document.getElementById("drop-location-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!passengerName.trim()) {
      toast.error("Please fill in your Full Name");
      const el = document.getElementById("passenger-name-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const cleanPhone = passengerPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please fill in a valid 10-digit WhatsApp phone number");
      const el = document.getElementById("passenger-phone-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!passengerEmail.trim() || !passengerEmail.includes("@") || !passengerEmail.includes(".")) {
      toast.error("Please fill in a valid Email Address for your booking confirmation");
      const el = document.getElementById("passenger-email-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const cleanAadhaar = aadhaarNumber.replace(/\D/g, "");
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      toast.error("Please fill in your 12-digit Aadhaar Card Number for guest verification");
      const el = document.getElementById("aadhaar-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setBusy(true);

    const startIso = new Date(`${pickupDate}T09:00:00`).toISOString();
    const endIso = new Date(`${dropDate}T18:00:00`).toISOString();
    const customerEmail = passengerEmail.trim().toLowerCase();
    const finalDropLoc = dropLocation.trim();

    const bookingNo = `CCG-${Math.floor(100000 + Math.random() * 900000)}`;

    const bookingPayload = {
      booking_no: bookingNo,
      vehicle_id: vehicle.id,
      vehicle_title: vehicle.title,
      start_date: startIso,
      end_date: endIso,
      pickup_location: finalPickupLoc,
      drop_location: finalDropLoc,
      customer: {
        name: passengerName.trim(),
        phone: passengerPhone.trim(),
        email: customerEmail,
        aadhar: cleanAadhaar,
      },
      service_partition: "tour",
      service_type: tourSubOption,
      selected_itinerary: tourSubOption === "hourly" ? selectedItinerary : undefined,
      transfer_route: tourSubOption === "transfer" ? transferRoute : undefined,
      days,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      drop_date: dropDate,
      drop_time: dropTime,
      per_day_rate: perDayRate,
      total_amount: totalAmount,
      security_deposit: 0,
      delivery_fee: 0,
    };

    const localRecord = {
      ...bookingPayload,
      booking_no: bookingNo,
      vehicle_snapshot: {
        title: vehicle.title,
        subtitle: vehicle.subtitle,
        category: vehicle.category,
        image_url: vehicle.image_url,
        seating: vehicle.seating,
        fuel_type: vehicle.fuel_type,
      },
      payment_status: "Pay to Driver (Zero Advance)",
      created_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem("ccg_last_booking", JSON.stringify(localRecord));
      localStorage.setItem(`ccg_booking_${bookingNo}`, JSON.stringify(localRecord));
      localStorage.setItem("ccg_customer_name", passengerName.trim());
      localStorage.setItem("ccg_customer_phone", passengerPhone.trim());
      localStorage.setItem("ccg_customer_aadhar", cleanAadhaar);
      if (passengerEmail) localStorage.setItem("ccg_customer_email", passengerEmail.trim().toLowerCase());
    } catch {}

    if (viaWhatsApp) {
      const msg = `*New Booking Request — Cab Castle Goa*%0A` +
        `• *Booking ID:* ${bookingNo}%0A` +
        `• *Vehicle:* ${vehicle.title}%0A` +
        `• *Service:* 🚖 Tour & Sightseeing Cab (With Driver)%0A` +
        (tourSubOption === "hourly" ? `• *Itinerary:* 🌴 ${selectedItinerary}%0A` : "") +
        `• *Option:* ${rateDescription}%0A` +
        `• *Pickup:* ${pickupDate} at ${pickupTime} (${bookingPayload.pickup_location})%0A` +
        `• *Drop-off:* ${dropDate} at ${dropTime} (${bookingPayload.drop_location})%0A` +
        `• *Customer:* ${passengerName} (${passengerPhone})%0A` +
        `• *Aadhaar:* XXXX-XXXX-${cleanAadhaar.slice(-4)}%0A` +
        `• *Total Fare:* ₹${totalAmount} (Pay to Driver on trip completion)%0A` +
        `Please confirm my reservation!`;
      window.open(`https://wa.me/917026648960?text=${msg}`, "_blank");
    }

    try {
      const { data } = await api.post("/bookings", bookingPayload);
      const finalId = data?.booking_no || data?.id || data?._id || bookingNo;
      const combinedRecord = { ...localRecord, ...data, booking_no: finalId };
      try {
        localStorage.setItem("ccg_last_booking", JSON.stringify(combinedRecord));
        localStorage.setItem(`ccg_booking_${finalId}`, JSON.stringify(combinedRecord));
        if (customerEmail) {
          const userKey = `ccg_user_bookings_${customerEmail}`;
          const existing = JSON.parse(localStorage.getItem(userKey) || "[]");
          localStorage.setItem(userKey, JSON.stringify([combinedRecord, ...existing.filter((b) => b.booking_no !== finalId)]));
        }
      } catch {}
      nav(`/booking-success/${finalId}`, { state: { booking: combinedRecord } });
    } catch {
      toast.success("Reservation confirmed! Our dispatch team will coordinate via WhatsApp.");
      try {
        if (customerEmail) {
          const userKey = `ccg_user_bookings_${customerEmail}`;
          const existing = JSON.parse(localStorage.getItem(userKey) || "[]");
          localStorage.setItem(userKey, JSON.stringify([localRecord, ...existing.filter((b) => b.booking_no !== bookingNo)]));
        }
      } catch {}
      nav(`/booking-success/${bookingNo}`, { state: { booking: localRecord } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#063247] font-body no-scroll-x">
      <SEO
        title={`Book ${vehicle.title} | Cab Castle Goa`}
        description={`Book ${vehicle.title} tour cab or airport transfer. Transparent rates, fast booking.`}
        canonical={`/booking/${vehicle.id}`}
      />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        
        {/* Top Vehicle Header Card */}
        <div className="bg-white border border-[#DFE8EC] rounded-[24px] p-4 sm:p-6 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <img
              src={vehicle.image_url}
              alt={vehicle.title}
              className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl object-cover border border-[#DFE8EC] bg-[#F7F7F7] shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E4F2F5] text-[#063247] px-2.5 py-0.5 rounded-full border border-[#288DA6]/30">
                  {vehicle.category}
                </span>
                <span className="text-xs font-semibold text-[#4C606E] flex items-center gap-1">
                  <Users size={12} className="text-[#063247]" /> {vehicle.seating} Seats
                </span>
                <span className="text-xs font-bold text-[#288DA6]">Air Conditioned</span>
              </div>
              <h1 className="font-display text-lg sm:text-xl font-extrabold text-[#063247] mt-1">
                {vehicle.title}
              </h1>
              <p className="text-xs text-[#4C606E]">
                {vehicle.subtitle || "Comfortable AC cab with polite driver for sightseeing across Goa."}
              </p>
            </div>
          </div>

          <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[#DFE8EC] flex sm:flex-col items-center sm:items-end justify-between">
            <span className="text-[10px] font-bold uppercase text-[#4C606E]">
              Tour Package Rate
            </span>
            <div className="font-display text-2xl font-extrabold text-[#063247]">
              {formatINR(perDayRate)}
              <span className="text-xs font-normal text-[#4C606E]">
                {tourSubOption === "hourly" ? " / 8h" : " / transfer"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Booking Form */}
        <div className="bg-white border border-[#DFE8EC] rounded-[24px] p-5 sm:p-8 shadow-sm space-y-6 text-left">
          
          {/* Service Indicator Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#E4F2F5]/70 border border-[#288DA6]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#063247] text-white flex items-center justify-center shrink-0">
                <Compass size={15} className="text-[#288DA6]" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-[#063247] block">
                  🚖 Tour &amp; Sightseeing Cab (With Driver)
                </span>
                <p className="text-xs text-[#4C606E]">
                  8 hrs / 80 km Sightseeing or Point-to-Point Airport Transfer
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white text-[#063247] border border-[#DFE8EC] shrink-0">
              {formatINR(perDayRate)}
            </span>
          </div>

          {/* STEP 1: TOUR TYPE (8H / 80KM VS TRANSFER) */}
          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#DFE8EC] space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-[#063247]">1. Select Service Type:</Label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setTourSubOption("hourly")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    tourSubOption === "hourly" ? "bg-[#063247] text-white" : "bg-white text-[#4C606E] border border-[#DFE8EC]"
                  }`}
                >
                  8h / 80km Sightseeing
                </button>
                <button
                  type="button"
                  onClick={() => setTourSubOption("transfer")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    tourSubOption === "transfer" ? "bg-[#063247] text-white" : "bg-white text-[#4C606E] border border-[#DFE8EC]"
                  }`}
                >
                  Airport / Station Transfer
                </button>
              </div>
            </div>

            {tourSubOption === "hourly" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4C606E] font-medium">Select Days:</span>
                  <span className="font-mono font-bold text-[#063247]">{days * 8}h · {days * 80}km included</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setIsCustomDays(false);
                        handleDaysChange(d);
                      }}
                      className={`py-2 px-2 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                        !isCustomDays && days === d
                          ? "bg-[#063247] text-white border-[#063247] shadow-xs"
                          : "bg-white text-[#063247] border-[#DFE8EC] hover:border-[#288DA6]"
                      }`}
                    >
                      <div>{d} {d === 1 ? "Day" : "Days"}</div>
                      <div className="text-[10px] font-normal opacity-80 mt-0.5">{formatINR(vehicle.hourlyRate * d)}</div>
                    </button>
                  ))}

                  {/* Custom Days Button */}
                  <button
                    type="button"
                    onClick={handleCustomClick}
                    className={`py-2 px-2 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                      isCustomDays || days > 3
                        ? "bg-[#063247] text-white border-[#063247] shadow-xs"
                        : "bg-white text-[#063247] border-[#DFE8EC] hover:border-[#288DA6]"
                    }`}
                  >
                    <div>{isCustomDays || days > 3 ? `${days} Days` : "Custom"}</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">
                      {isCustomDays || days > 3 ? formatINR(vehicle.hourlyRate * days) : "Pick Dates 📅"}
                    </div>
                  </button>
                </div>

                {/* Custom Days Inline Stepper & Input Controller */}
                {(isCustomDays || days > 3) && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#DFE8EC] shadow-xs mt-2 animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-[#063247]">Duration:</span>
                      <div className="flex items-center border border-[#DFE8EC] rounded-lg overflow-hidden bg-[#F7F7F7]">
                        <button
                          type="button"
                          onClick={() => handleDaysChange(Math.max(1, days - 1))}
                          className="w-8 h-8 flex items-center justify-center text-sm font-black text-[#063247] hover:bg-[#DFE8EC] transition-colors cursor-pointer"
                          aria-label="Decrease days"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={days}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1) {
                              handleDaysChange(Math.min(30, val));
                            }
                          }}
                          className="w-12 text-center text-xs font-black text-[#063247] bg-transparent outline-none py-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleDaysChange(Math.min(30, days + 1))}
                          className="w-8 h-8 flex items-center justify-center text-sm font-black text-[#063247] hover:bg-[#DFE8EC] transition-colors cursor-pointer"
                          aria-label="Increase days"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-bold text-[#063247]">{days === 1 ? "Day" : "Days"}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-[#063247] block">{formatINR(vehicle.hourlyRate * days)}</span>
                      <span className="text-[10px] text-[#4C606E] font-medium">{days * 8}h · {days * 80}km included</span>
                    </div>
                  </div>
                )}

                {/* Popular Curated Goa Itineraries Selector */}
                <div className="mt-4 pt-3 border-t border-[#DFE8EC]/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#063247] flex items-center gap-1.5">
                      🌴 Curated Goa Itinerary Route
                    </span>
                    <span className="text-[10px] text-[#288DA6] font-bold">Driver Knows Route</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        title: "North Goa Beaches & Forts",
                        icon: "🏰",
                        places: "Aguada Fort · Chapora Fort · Vagator · Anjuna · Baga Beach",
                        tag: "Most Popular",
                      },
                      {
                        title: "South Goa Heritage & Churches",
                        icon: "⛪",
                        places: "Old Goa Basilica · Se Cathedral · Mangueshi Temple · Miramar",
                        tag: "Heritage & Culture",
                      },
                      {
                        title: "Dudhsagar Waterfalls & Spices",
                        icon: "🌊",
                        places: "Dudhsagar Falls Safari Point · Sahakari Spice Farm Tour",
                        tag: "Day Adventure",
                      },
                      {
                        title: "Custom Route (Your Own Plan)",
                        icon: "🎯",
                        places: "Driver will follow your custom preferred stops anywhere in Goa",
                        tag: "100% Flexible",
                      },
                    ].map((itin) => (
                      <button
                        key={itin.title}
                        type="button"
                        onClick={() => setSelectedItinerary(itin.title)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedItinerary === itin.title
                            ? "bg-[#063247] text-white border-[#063247] shadow-xs"
                            : "bg-white text-[#063247] border-[#DFE8EC] hover:border-[#288DA6]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-extrabold text-xs flex items-center gap-1.5">
                            <span>{itin.icon}</span>
                            <span>{itin.title}</span>
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              selectedItinerary === itin.title
                                ? "bg-[#288DA6] text-white"
                                : "bg-[#E4F2F5] text-[#288DA6]"
                            }`}
                          >
                            {itin.tag}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] leading-relaxed line-clamp-2 ${
                            selectedItinerary === itin.title ? "text-white/80" : "text-[#5A7184]"
                          }`}
                        >
                          {itin.places}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferRoute("airport")}
                    className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex justify-between items-center sm:flex-col sm:items-start ${
                      transferRoute === "airport"
                        ? "bg-[#063247] text-white border-[#063247] shadow-xs"
                        : "bg-white text-[#063247] border-[#DFE8EC] hover:border-[#288DA6]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Plane size={13} className={transferRoute === "airport" ? "text-[#288DA6]" : "text-[#063247]"} />
                      Airport Transfer
                    </div>
                    <div className="text-sm font-extrabold sm:mt-1">{formatINR(vehicle.transfers.airport)}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferRoute("margao")}
                    className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex justify-between items-center sm:flex-col sm:items-start ${
                      transferRoute === "margao"
                        ? "bg-[#063247] text-white border-[#063247] shadow-xs"
                        : "bg-white text-[#063247] border-[#DFE8EC] hover:border-[#288DA6]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Train size={13} className={transferRoute === "margao" ? "text-[#288DA6]" : "text-[#063247]"} />
                      Margao Station
                    </div>
                    <div className="text-sm font-extrabold sm:mt-1">{formatINR(vehicle.transfers.margao)}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferRoute("thivim")}
                    className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex justify-between items-center sm:flex-col sm:items-start ${
                      transferRoute === "thivim"
                        ? "bg-[#063247] text-white border-[#063247] shadow-xs"
                        : "bg-white text-[#063247] border-[#DFE8EC] hover:border-[#288DA6]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Train size={13} className={transferRoute === "thivim" ? "text-[#288DA6]" : "text-[#063247]"} />
                      Thivim Station
                    </div>
                    <div className="text-sm font-extrabold sm:mt-1">{formatINR(vehicle.transfers.thivim)}</div>
                  </button>
                </div>

                {transferRoute === "airport" && (
                  <Select value={airportName} onValueChange={setAirportName}>
                    <SelectTrigger className="w-full bg-white border-[#DFE8EC] rounded-xl h-10 text-xs font-bold text-[#063247]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#F7F7F7] border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                      <SelectItem value="Mopa Airport (GOX) - Manohar International">Mopa Airport (GOX) - Manohar International</SelectItem>
                      <SelectItem value="Dabolim Airport (GOI) - South Goa">Dabolim Airport (GOI) - South Goa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: SCHEDULE (PICKUP & DROP DATE / TIME) */}
          <div id="schedule-section" className="space-y-3 scroll-mt-24">
            <Label className="text-xs font-extrabold uppercase tracking-wider text-[#063247] block flex items-center gap-1.5">
              <CalIcon size={14} className="text-[#288DA6]" /> 2. Schedule &amp; Pickup Details
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F7F7] border border-[#DFE8EC]">
              {/* Pickup Schedule */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#063247] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#288DA6]" /> Pick-up Schedule
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#4C606E] block mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      min={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        try {
                          const p = new Date(e.target.value);
                          if (!isNaN(p.getTime())) {
                            setDropDate(format(addDays(p, days), "yyyy-MM-dd"));
                          }
                        } catch {}
                      }}
                      className="w-full h-10 bg-white border border-[#DFE8EC] rounded-xl px-2.5 text-xs font-bold text-[#063247] outline-none focus:border-[#288DA6] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#4C606E] block mb-1">Pickup Time</label>
                    <Select value={pickupTime} onValueChange={setPickupTime}>
                      <SelectTrigger className="w-full h-10 bg-white border-[#DFE8EC] rounded-xl text-xs font-bold text-[#063247]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#F7F7F7] border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                        {TIME_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#4C606E] block mb-1">Pickup Address / Hotel / Terminal *</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8496A2]" />
                    <Input
                      id="pickup-location-input"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="e.g. Mopa Airport / Hotel Taj Candolim"
                      className="h-10 pl-9 bg-white border-[#DFE8EC] rounded-xl text-xs text-[#063247] focus:border-[#288DA6]"
                    />
                  </div>
                </div>
              </div>

              {/* Drop-off Schedule */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#063247] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#288DA6]" /> Drop-off Schedule
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#4C606E] block mb-1 flex items-center justify-between">
                      <span>Drop Date</span>
                      {isCustomDays && <span className="text-[9px] text-[#288DA6] font-bold">Pick your end date</span>}
                    </label>
                    <input
                      ref={dropDateInputRef}
                      id="drop-date-input"
                      type="date"
                      value={dropDate}
                      min={pickupDate}
                      onChange={(e) => handleDropDateChange(e.target.value)}
                      className={`w-full h-10 bg-white border rounded-xl px-2.5 text-xs font-bold text-[#063247] outline-none transition-all cursor-pointer ${
                        isCustomDays
                          ? "border-[#288DA6] ring-2 ring-[#288DA6]/30"
                          : "border-[#DFE8EC] focus:border-[#288DA6]"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#4C606E] block mb-1">Drop Time</label>
                    <Select value={dropTime} onValueChange={setDropTime}>
                      <SelectTrigger className="w-full h-10 bg-white border-[#DFE8EC] rounded-xl text-xs font-bold text-[#063247]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#F7F7F7] border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                        {TIME_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#4C606E] block mb-1">Drop-off Address / Destination *</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8496A2]" />
                    <Input
                      id="drop-location-input"
                      value={dropLocation}
                      onChange={(e) => setDropLocation(e.target.value)}
                      placeholder="e.g. Baga Beach / Dabolim Airport"
                      className="h-10 pl-9 bg-white border-[#DFE8EC] rounded-xl text-xs text-[#063247] focus:border-[#288DA6]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: CUSTOMER CONTACT & VERIFICATION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-extrabold uppercase tracking-wider text-[#063247] block flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#288DA6]" /> 3. Guest &amp; Security Verification Details
              </Label>
            </div>

            {/* If NOT logged in: Security Notice Banner */}
            {!user && (
              <div className="p-4 rounded-2xl bg-[#E4F2F5] border border-[#288DA6]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#063247] text-[#288DA6] flex items-center justify-center shrink-0 mt-0.5">
                    <Lock size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#063247]">Authentication &amp; Security Check Required</h4>
                    <p className="text-[11px] text-[#4C606E] mt-0.5">
                      To prevent unauthorized bookings, please sign in or register before completing your cab reservation.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => nav("/login", { state: { from: `/booking/${vehicle.id}` } })}
                  className="px-4 py-2 bg-[#063247] hover:bg-[#042433] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  <LogIn size={13} className="text-[#288DA6]" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}

            {/* Input Fields: Name, Phone, Email, Aadhaar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#4C606E] block mb-1">Your Full Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8496A2]" />
                  <Input
                    id="passenger-name-input"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="h-11 pl-9 bg-[#F7F7F7] border-[#DFE8EC] rounded-xl text-xs text-[#063247] focus:border-[#288DA6]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4C606E] block mb-1">WhatsApp Phone (10 Digits) *</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8496A2]" />
                  <Input
                    id="passenger-phone-input"
                    type="tel"
                    maxLength={10}
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 9876543210"
                    className="h-11 pl-9 bg-[#F7F7F7] border-[#DFE8EC] rounded-xl text-xs font-mono text-[#063247] focus:border-[#288DA6]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4C606E] block mb-1">Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8496A2]" />
                  <Input
                    id="passenger-email-input"
                    type="email"
                    value={passengerEmail}
                    onChange={(e) => setPassengerEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="h-11 pl-9 bg-[#F7F7F7] border-[#DFE8EC] rounded-xl text-xs text-[#063247] focus:border-[#288DA6]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4C606E] block mb-1">
                  Aadhaar Card No. (12 Digits) *
                </label>
                <div className="relative">
                  <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8496A2]" />
                  <Input
                    id="aadhaar-input"
                    type="text"
                    maxLength={14}
                    value={aadhaarNumber}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                      const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
                      setAadhaarNumber(formatted);
                    }}
                    placeholder="12-digit Aadhaar Number"
                    className="h-11 pl-9 bg-[#F7F7F7] border-[#DFE8EC] rounded-xl text-xs font-mono text-[#063247] focus:border-[#288DA6]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FARE & BILLING SUMMARY */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#063247] text-white space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C3E7FA]">Total Fare</span>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#288DA6]">
                  {formatINR(totalAmount)}
                </div>
                <span className="text-xs text-[#E4F2F5]/90 font-normal">
                  {rateDescription} · Zero Advance Payment
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => handleBookNow(true)}
                  className="h-12 px-6 bg-[#25D366] hover:bg-[#1E7E34] text-white text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border-t border-white/20"
                >
                  <MessageSquare size={16} />
                  <span>Book via WhatsApp</span>
                </Button>

                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => handleBookNow(false)}
                  className="h-12 px-6 bg-[#288DA6] hover:bg-[#22768C] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border-t border-white/30"
                >
                  {busy ? <Loader2 size={16} className="animate-spin text-white" /> : <span>Instant Online Book</span>}
                  <ArrowRight size={15} className="text-white" />
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-y-1 text-[11px] text-[#DFE8EC]/85 font-mono">
              <span>• Extra Hour: ₹{vehicle.extraHr}/hr</span>
              <span>• Extra Km: ₹{vehicle.extraKm}/km</span>
              <span>• Night Charge: ₹{vehicle.nightCharge} (after 10 PM)</span>
              <span>• Zero Deposit: ₹0 · Pay to Driver</span>
            </div>
          </div>

        </div>

      </main>

      {/* ── MOBILE STICKY FLOATING BOTTOM BAR ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#063247]/95 backdrop-blur-md border-t border-white/10 p-3 px-4 shadow-2xl flex items-center justify-between text-left">
        <div>
          <span className="text-[9.5px] uppercase tracking-wider text-[#C3E7FA] font-bold block">
            {tourSubOption === "hourly" ? `${days} Day(s) Tour` : "Transfer Fare"}
          </span>
          <div className="text-xl font-black text-[#288DA6] leading-tight">
            {formatINR(totalAmount)}
          </div>
          <span className="text-[9.5px] text-white/80 font-medium">Pay to Driver</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleBookNow(true)}
            className="h-10 px-3 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
            title="Book via WhatsApp"
          >
            <MessageSquare size={14} />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => handleBookNow(false)}
            className="h-10 px-4 bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] text-[#090D16] rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <span>Book Now</span>}
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
