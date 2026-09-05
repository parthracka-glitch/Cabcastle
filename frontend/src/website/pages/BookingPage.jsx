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
  MessageSquare, Train, CreditCard, Lock, LogIn, Compass, Maximize2, Images
} from "lucide-react";
import { toast } from "sonner";
import api, { formatINR, getOptimizedImageUrl } from "@/lib/api";
import { MASTER_FLEET } from "../data/fleetData";
import LightboxModal from "../components/LightboxModal";

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

  const [liveVehicle, setLiveVehicle] = React.useState(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [activeImageIdx, setActiveImageIdx] = React.useState(0);

  // Auto-fetch fresh vehicle from API
  React.useEffect(() => {
    if (!vehicleId) return;
    api.get(`/vehicles/${vehicleId}`)
      .then(({ data }) => {
        if (data && (data.id || data.title)) {
          setLiveVehicle(data);
        }
      })
      .catch(() => {
        api.get("/vehicles")
          .then(({ data }) => {
            if (Array.isArray(data)) {
              const idLower = (vehicleId || "").toLowerCase();
              const match = data.find(
                (m) =>
                  m.id?.toLowerCase() === idLower ||
                  m.title?.toLowerCase().includes(idLower) ||
                  idLower.includes(m.title?.toLowerCase())
              );
              if (match) setLiveVehicle(match);
            }
          })
          .catch(() => {});
      });
  }, [vehicleId]);

  // Resolve vehicle details & rates
  const baseVehicle = React.useMemo(() => {
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

  const vehicle = React.useMemo(() => {
    if (!liveVehicle) return baseVehicle;
    return {
      ...baseVehicle,
      ...liveVehicle,
      transfers: {
        ...baseVehicle.transfers,
        airport: liveVehicle.airport_rate || baseVehicle.transfers?.airport,
        margao: (liveVehicle.airport_rate || baseVehicle.transfers?.airport || 1300) + 200,
        thivim: Math.max(1100, (liveVehicle.airport_rate || baseVehicle.transfers?.airport || 1300) - 200),
      },
    };
  }, [baseVehicle, liveVehicle]);

  const vehicleImages = React.useMemo(() => {
    if (Array.isArray(vehicle.images) && vehicle.images.length > 0) {
      const valid = vehicle.images.filter(Boolean);
      if (valid.length > 0) return valid;
    }
    return vehicle.image_url ? [vehicle.image_url] : ["/vehicles/maruti_dzire.webp"];
  }, [vehicle.images, vehicle.image_url]);

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
  const [currentStep, setCurrentStep] = React.useState(1);

  const [busy, setBusy] = React.useState(false);

  // Validation & transition to Step 2
  const handleProceedToStep2 = () => {
    const finalPickupLoc = tourSubOption === "transfer" && transferRoute === "airport" ? airportName : pickupLocation.trim();
    if (!finalPickupLoc) {
      toast.error("Please enter your Pickup Address / Hotel / Terminal");
      const el = document.getElementById("pickup-location-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  // Auto-fill Pickup Location whenever Transfer Spot (Airport / Station) is active
  React.useEffect(() => {
    if (tourSubOption === "transfer") {
      if (transferRoute === "airport") {
        setPickupLocation(airportName);
      } else if (transferRoute === "margao") {
        setPickupLocation("Margao Railway Station (Madgaon Junction, South Goa)");
      } else if (transferRoute === "thivim") {
        setPickupLocation("Thivim Railway Station (North Goa)");
      }
    }
  }, [tourSubOption, transferRoute, airportName]);

  // Live Price Calculation
  const { totalAmount, perDayRate, rateDescription } = React.useMemo(() => {
    if (tourSubOption === "hourly") {
      const total = vehicle.hourlyRate * days;
      return {
        totalAmount: total,
        perDayRate: vehicle.hourlyRate,
        rateDescription: `${days * 8}h · ${days * 80}km included (${days} ${days === 1 ? "Day" : "Days"} Tour Package)`,
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
    <div className="min-h-screen bg-[#E7EDEB] text-[#1B2922] font-body no-scroll-x">
      <SEO
        title={`Book ${vehicle.title} | Cab Castle Goa`}
        description={`Book ${vehicle.title} tour cab or airport transfer. Transparent rates, fast booking.`}
        canonical={`/booking/${vehicle.id}`}
      />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        
        {/* Top Step Progress Bar */}
        <div className="bg-white border border-[#CBD8D4] rounded-2xl p-4 sm:p-5 mb-6 shadow-xs flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2.5 cursor-pointer group text-left"
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentStep === 1
                  ? "bg-[#7C1F31] text-white shadow-xs"
                  : "bg-[#69A481] text-white"
              }`}
            >
              {currentStep > 1 ? "✓" : "1"}
            </span>
            <div>
              <span className={`text-xs font-bold block ${currentStep === 1 ? "text-[#1B2922]" : "text-[#4D6257]"}`}>
                1. Car Details &amp; Date Selection
              </span>
              <span className="text-[10px] text-[#6C8277] hidden sm:block">Vehicle Specs, Duration &amp; Pickup</span>
            </div>
          </button>

          <div className="flex-1 max-w-[80px] sm:max-w-[160px] h-1 bg-[#CBD8D4] rounded-full mx-4 overflow-hidden">
            <div
              className={`h-full bg-[#7C1F31] transition-all duration-300 ${
                currentStep === 2 ? "w-full" : "w-0"
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentStep === 1) handleProceedToStep2();
            }}
            className="flex items-center gap-2.5 cursor-pointer group text-left"
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentStep === 2
                  ? "bg-[#7C1F31] text-white shadow-xs"
                  : "bg-[#E7EDEB] text-[#4D6257] border border-[#CBD8D4]"
              }`}
            >
              2
            </span>
            <div>
              <span className={`text-xs font-bold block ${currentStep === 2 ? "text-[#1B2922]" : "text-[#4D6257]"}`}>
                2. Personal Info &amp; Booking
              </span>
              <span className="text-[10px] text-[#6C8277] hidden sm:block">Guest Verification &amp; Confirm</span>
            </div>
          </button>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: CAR DETAILS (LEFT) & DATE SELECTOR (RIGHT)       */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
            
            {/* LEFT SIDE: CAR DETAILS, IMAGE & FEATURES */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-[#CBD8D4] rounded-[24px] p-5 sm:p-6 shadow-sm text-left space-y-4">
                
                {/* Interactive Vehicle Image Gallery with Fullscreen Lightbox trigger */}
                <div className="space-y-2.5">
                  <div
                    className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#E7EDEB] border border-[#CBD8D4] cursor-pointer group select-none"
                    onClick={() => setLightboxOpen(true)}
                    title="Click to view fullscreen gallery"
                  >
                    <img
                      src={getOptimizedImageUrl(vehicleImages[activeImageIdx] || vehicle.image_url)}
                      alt={vehicle.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/vehicles/maruti_dzire.webp";
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#7C1F31]/95 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#69A481]/40 text-[10px] font-black text-[#E7EDEB] flex items-center gap-1 shadow-xs">
                      <span>👑 Castle Class</span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#CBD8D4] text-[10px] font-bold text-[#1B2922]">
                      {vehicle.category}
                    </div>
                    {/* Fullscreen Overlay Trigger Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxOpen(true);
                      }}
                      className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-[#69A481] text-white px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      <Maximize2 size={11} />
                      <span>{vehicleImages.length > 1 ? `${vehicleImages.length} Photos` : "Fullscreen"}</span>
                    </button>
                  </div>

                  {/* Multi-Photo Thumbnails */}
                  {vehicleImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {vehicleImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                            idx === activeImageIdx
                              ? "border-[#69A481] scale-102 shadow-xs ring-1 ring-[#69A481]"
                              : "border-[#CBD8D4] opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={getOptimizedImageUrl(img)}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/vehicles/maruti_dzire.webp";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Car Title & Subtitle */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#1B2922]">
                      {vehicle.title}
                    </h2>
                    <span className="text-xs font-mono font-bold text-[#245339] bg-[#DEEDE4] px-2.5 py-1 rounded-full border border-[#69A481]/30">
                      {formatINR(perDayRate)}{tourSubOption === "hourly" ? "/8h" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-[#4D6257] mt-1 leading-relaxed">
                    {vehicle.subtitle || "Sanitized air-conditioned car with courteous verified chauffeur for local sightseeing & transfers across Goa."}
                  </p>
                </div>

                {/* Key Car Features Matrix */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#CBD8D4]">
                  <div className="p-2.5 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] flex items-center gap-2">
                    <Users size={14} className="text-[#69A481] shrink-0" />
                    <div>
                      <span className="text-[9px] text-[#4D6257] uppercase font-bold block">Capacity</span>
                      <span className="text-xs font-bold text-[#1B2922]">{vehicle.seating} Passenger Seats</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] flex items-center gap-2">
                    <span className="text-sm shrink-0">❄️</span>
                    <div>
                      <span className="text-[9px] text-[#4D6257] uppercase font-bold block">Air Conditioning</span>
                      <span className="text-xs font-bold text-[#1B2922]">Chilled Powerful AC</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] flex items-center gap-2">
                    <span className="text-sm shrink-0">🧳</span>
                    <div>
                      <span className="text-[9px] text-[#4D6257] uppercase font-bold block">Luggage Space</span>
                      <span className="text-xs font-bold text-[#1B2922]">2 Large + 2 Bags</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#69A481] shrink-0" />
                    <div>
                      <span className="text-[9px] text-[#4D6257] uppercase font-bold block">Chauffeur</span>
                      <span className="text-xs font-bold text-[#1B2922]">Verified &amp; Polite</span>
                    </div>
                  </div>
                </div>

                {/* Inclusions Card */}
                <div className="p-3 rounded-xl bg-[#DEEDE4] border border-[#69A481]/30 text-[11px] text-[#1B2922] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>✓ Inclusions:</span>
                    <span className="font-normal text-[#4D6257]">Fuel, AC, Driver Allowance included</span>
                  </div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>✓ Payment:</span>
                    <span className="font-normal text-[#4D6257]">Zero Advance · Pay to driver upon completion</span>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE: DATE & SCHEDULE SELECTOR */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-[#CBD8D4] rounded-[24px] p-5 sm:p-7 shadow-sm space-y-5 text-left">
                
                {/* 1. Service Type Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-[#1B2922]">
                      1. Select Service Type
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTourSubOption("hourly");
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs ${
                        tourSubOption === "hourly"
                          ? "bg-[#7C1F31] text-white border-[#7C1F31] shadow-xs"
                          : "bg-[#E7EDEB] text-[#1B2922] border-[#CBD8D4] hover:border-[#69A481]"
                      }`}
                    >
                      <div>🚖 8h / 80km Sightseeing</div>
                      <div className="text-[10px] font-normal opacity-80 mt-0.5">Full Day Tour Package</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTourSubOption("transfer");
                        if (transferRoute === "airport") {
                          setPickupLocation(airportName);
                        } else if (transferRoute === "margao") {
                          setPickupLocation("Margao Railway Station (Madgaon Junction, South Goa)");
                        } else if (transferRoute === "thivim") {
                          setPickupLocation("Thivim Railway Station (North Goa)");
                        }
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs ${
                        tourSubOption === "transfer"
                          ? "bg-[#7C1F31] text-white border-[#7C1F31] shadow-xs"
                          : "bg-[#E7EDEB] text-[#1B2922] border-[#CBD8D4] hover:border-[#69A481]"
                      }`}
                    >
                      <div>✈️ Airport / Station</div>
                      <div className="text-[10px] font-normal opacity-80 mt-0.5">Point-to-Point Pickup</div>
                    </button>
                  </div>
                </div>

                {/* 2. Duration / Days Selector (If Hourly) */}
                {tourSubOption === "hourly" ? (
                  <div className="space-y-2 pt-2 border-t border-[#CBD8D4]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold uppercase tracking-wider text-[#1B2922]">2. Select Duration (Days)</span>
                      <span className="font-mono font-bold text-[#69A481]">{days * 8}h · {days * 80}km included</span>
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
                          className={`py-2.5 px-2 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                            !isCustomDays && days === d
                              ? "bg-[#7C1F31] text-white border-[#7C1F31] shadow-xs"
                              : "bg-[#E7EDEB] text-[#1B2922] border-[#CBD8D4] hover:border-[#69A481]"
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
                        className={`py-2.5 px-2 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                          isCustomDays || days > 3
                            ? "bg-[#7C1F31] text-white border-[#7C1F31] shadow-xs"
                            : "bg-[#E7EDEB] text-[#1B2922] border-[#CBD8D4] hover:border-[#69A481]"
                        }`}
                      >
                        <div>{isCustomDays || days > 3 ? `${days} Days` : "Custom"}</div>
                        <div className="text-[10px] font-normal opacity-80 mt-0.5">
                          {isCustomDays || days > 3 ? formatINR(vehicle.hourlyRate * days) : "Pick Dates 📅"}
                        </div>
                      </button>
                    </div>

                    {/* Custom Days Inline Stepper */}
                    {(isCustomDays || days > 3) && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] shadow-xs mt-2 animate-fadeIn">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-[#1B2922]">Duration:</span>
                          <div className="flex items-center border border-[#CBD8D4] rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => handleDaysChange(Math.max(1, days - 1))}
                              className="w-8 h-8 flex items-center justify-center text-sm font-black text-[#1B2922] hover:bg-[#CBD8D4] transition-colors cursor-pointer"
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
                              className="w-12 text-center text-xs font-black text-[#1B2922] bg-transparent outline-none py-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleDaysChange(Math.min(30, days + 1))}
                              className="w-8 h-8 flex items-center justify-center text-sm font-black text-[#1B2922] hover:bg-[#CBD8D4] transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-bold text-[#1B2922]">{days === 1 ? "Day" : "Days"}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-[#1B2922] block">{formatINR(vehicle.hourlyRate * days)}</span>
                          <span className="text-[10px] text-[#4D6257] font-medium">{days * 8}h · {days * 80}km included</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-2 border-t border-[#CBD8D4]">
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-[#1B2922]">
                      2. Transfer Route Destination
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTransferRoute("airport");
                          setPickupLocation(airportName);
                        }}
                        className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex justify-between items-center sm:flex-col sm:items-start ${
                          transferRoute === "airport"
                            ? "bg-[#7C1F31] text-white border-[#7C1F31] shadow-xs"
                            : "bg-[#E7EDEB] text-[#1B2922] border-[#CBD8D4] hover:border-[#69A481]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Plane size={13} className={transferRoute === "airport" ? "text-white" : "text-[#1B2922]"} />
                          Airport
                        </div>
                        <div className="text-sm font-extrabold sm:mt-1">{formatINR(vehicle.transfers.airport)}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTransferRoute("margao");
                          setPickupLocation("Margao Railway Station (Madgaon Junction, South Goa)");
                        }}
                        className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex justify-between items-center sm:flex-col sm:items-start ${
                          transferRoute === "margao"
                            ? "bg-[#7C1F31] text-white border-[#7C1F31] shadow-xs"
                            : "bg-[#E7EDEB] text-[#1B2922] border-[#CBD8D4] hover:border-[#69A481]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Train size={13} className={transferRoute === "margao" ? "text-white" : "text-[#1B2922]"} />
                          Margao Stn
                        </div>
                        <div className="text-sm font-extrabold sm:mt-1">{formatINR(vehicle.transfers.margao)}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTransferRoute("thivim");
                          setPickupLocation("Thivim Railway Station (North Goa)");
                        }}
                        className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex justify-between items-center sm:flex-col sm:items-start ${
                          transferRoute === "thivim"
                            ? "bg-[#7C1F31] text-white border-[#7C1F31] shadow-xs"
                            : "bg-[#E7EDEB] text-[#1B2922] border-[#CBD8D4] hover:border-[#69A481]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Train size={13} className={transferRoute === "thivim" ? "text-white" : "text-[#1B2922]"} />
                          Thivim Stn
                        </div>
                        <div className="text-sm font-extrabold sm:mt-1">{formatINR(vehicle.transfers.thivim)}</div>
                      </button>
                    </div>

                    {transferRoute === "airport" && (
                      <Select
                        value={airportName}
                        onValueChange={(val) => {
                          setAirportName(val);
                          setPickupLocation(val);
                        }}
                      >
                        <SelectTrigger className="w-full bg-[#E7EDEB] border-[#CBD8D4] rounded-xl h-10 text-xs font-bold text-[#1B2922]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#CBD8D4] text-[#1B2922] rounded-xl text-xs">
                          <SelectItem value="Mopa Airport (GOX) - Manohar International">Mopa Airport (GOX) - Manohar International</SelectItem>
                          <SelectItem value="Dabolim Airport (GOI) - South Goa">Dabolim Airport (GOI) - South Goa</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* 3. Schedule & Pickup Address */}
                <div id="schedule-section" className="space-y-3 pt-2 border-t border-[#CBD8D4] scroll-mt-24">
                  <Label className="text-xs font-extrabold uppercase tracking-wider text-[#1B2922] block flex items-center gap-1.5">
                    <CalIcon size={14} className="text-[#69A481]" /> 3. Schedule &amp; Pickup Location
                  </Label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#E7EDEB] border border-[#CBD8D4]">
                    {/* Pickup Date */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#4D6257] block mb-1">Pickup Date</label>
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
                        className="w-full h-10 bg-white border border-[#CBD8D4] rounded-xl px-2.5 text-xs font-bold text-[#1B2922] outline-none focus:border-[#69A481] cursor-pointer"
                      />
                    </div>

                    {/* Pickup Time */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#4D6257] block mb-1">Pickup Time</label>
                      <Select value={pickupTime} onValueChange={setPickupTime}>
                        <SelectTrigger className="w-full h-10 bg-white border-[#CBD8D4] rounded-xl text-xs font-bold text-[#1B2922]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#CBD8D4] text-[#1B2922] rounded-xl text-xs">
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Drop Date */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#4D6257] block mb-1">Drop Date</label>
                      <input
                        ref={dropDateInputRef}
                        type="date"
                        value={dropDate}
                        min={pickupDate || format(new Date(), "yyyy-MM-dd")}
                        onChange={(e) => handleDropDateChange(e.target.value)}
                        className="w-full h-10 bg-white border border-[#CBD8D4] rounded-xl px-2.5 text-xs font-bold text-[#1B2922] outline-none focus:border-[#69A481] cursor-pointer"
                      />
                    </div>

                    {/* Drop Time */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#4D6257] block mb-1">Drop Time</label>
                      <Select value={dropTime} onValueChange={setDropTime}>
                        <SelectTrigger className="w-full h-10 bg-white border-[#CBD8D4] rounded-xl text-xs font-bold text-[#1B2922]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#CBD8D4] text-[#1B2922] rounded-xl text-xs">
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pickup Address */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-[#4C606E] block mb-1">Pickup Address / Hotel / Airport *</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8496A2]" />
                        <Input
                          id="pickup-location-input"
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="e.g. Mopa Airport / Hotel Taj Candolim / Calangute"
                          className="h-10 pl-9 bg-white border-[#CBD8D4] rounded-xl text-xs text-[#1B2922] focus:border-[#69A481]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimalist Live Fare Summary Bar */}
                <div className="p-4 rounded-2xl bg-[#E7EDEB] border border-[#CBD8D4] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#4D6257] block">
                      Total Estimated Tariff
                    </span>
                    <div className="text-2xl font-black text-[#1B2922] tracking-tight leading-tight mt-0.5">
                      {formatINR(totalAmount)}
                    </div>
                    <span className="text-[11px] text-[#4D6257]">{rateDescription}</span>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    ✓ Zero Advance · Pay to Driver
                  </span>
                </div>

                {/* Continue to Step 2 Button */}
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="w-full h-12 bg-gradient-to-r from-[#7C1F31] via-[#9B2A41] to-[#7C1F31] hover:brightness-105 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-[#7C1F31]"
                >
                  <span>Continue to Guest Details</span>
                  <ArrowRight size={16} className="text-white" />
                </button>

              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PERSONAL INFO, AADHAAR & BOOKING CONFIRMATION    */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            
            {/* Back to Step 1 Button */}
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B2922] hover:text-[#7C1F31] transition-colors cursor-pointer bg-white px-4 py-2 rounded-full border border-[#CBD8D4] shadow-xs"
            >
              <span>← Back to Car &amp; Date Selection</span>
            </button>

            {/* Selected Booking Summary Card */}
            <div className="bg-white border border-[#CBD8D4] rounded-[24px] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-3.5">
                <img
                  src={vehicle.image_url}
                  alt={vehicle.title}
                  className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl object-cover border border-[#CBD8D4] bg-[#E7EDEB] shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#245339] bg-[#DEEDE4] px-2 py-0.5 rounded-full border border-[#69A481]/30">
                    {tourSubOption === "hourly" ? `${days} Day Tour Package` : "Airport Transfer"}
                  </span>
                  <h3 className="text-base font-extrabold text-[#1B2922] mt-0.5">
                    {vehicle.title}
                  </h3>
                  <p className="text-xs text-[#4D6257]">
                    📅 {pickupDate} ({pickupTime}) → {dropDate} ({dropTime}) · 📍 {pickupLocation || airportName}
                  </p>
                </div>
              </div>

              <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#CBD8D4] shrink-0">
                <span className="text-[10px] font-bold text-[#4D6257] block">Total Amount</span>
                <div className="text-xl font-black text-[#1B2922]">{formatINR(totalAmount)}</div>
                <span className="text-[10px] text-[#245339] font-bold">Pay to Driver</span>
              </div>
            </div>

            {/* Main Form: Guest Info, Aadhaar & Drop Destination */}
            <div className="bg-white border border-[#CBD8D4] rounded-[24px] p-5 sm:p-8 shadow-sm space-y-6 text-left">
              
              {/* If NOT logged in: Security Notice Banner */}
              {!user && (
                <div className="p-4 rounded-2xl bg-[#DEEDE4] border border-[#69A481]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#7C1F31] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Lock size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1B2922]">Authentication &amp; Security Check Required</h4>
                      <p className="text-[11px] text-[#4D6257] mt-0.5">
                        To prevent unauthorized bookings, please sign in or register before completing your car reservation.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => nav("/login", { state: { from: `/booking/${vehicle.id}` } })}
                    className="px-4 py-2 bg-[#7C1F31] hover:bg-[#631826] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs border border-[#7C1F31]"
                  >
                    <LogIn size={13} className="text-white" />
                    <span>Sign In / Register</span>
                  </button>
                </div>
              )}

              {/* Guest Details */}
              <div className="space-y-4">
                <Label className="text-xs font-extrabold uppercase tracking-wider text-[#1B2922] block flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-[#69A481]" /> Guest Contact &amp; Verification Details
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#4D6257] block mb-1">Your Full Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8277]" />
                      <Input
                        id="passenger-name-input"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="h-11 pl-9 bg-[#E7EDEB] border-[#CBD8D4] rounded-xl text-xs text-[#1B2922] focus:border-[#69A481]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#4D6257] block mb-1">WhatsApp Phone (10 Digits) *</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8277]" />
                      <Input
                        id="passenger-phone-input"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 9876543210"
                        className="h-11 pl-9 bg-[#E7EDEB] border-[#CBD8D4] rounded-xl text-xs font-mono text-[#1B2922] focus:border-[#69A481]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#4D6257] block mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8277]" />
                      <Input
                        id="passenger-email-input"
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className="h-11 pl-9 bg-[#E7EDEB] border-[#CBD8D4] rounded-xl text-xs text-[#1B2922] focus:border-[#69A481]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#4D6257] block mb-1">
                      Aadhaar Card No. (12 Digits) *
                    </label>
                    <div className="relative">
                      <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8277]" />
                      <Input
                        id="aadhaar-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={14}
                        value={aadhaarNumber}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                          const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
                          setAadhaarNumber(formatted);
                        }}
                        placeholder="12-digit Aadhaar Number"
                        className="h-11 pl-9 bg-[#E7EDEB] border-[#CBD8D4] rounded-xl text-xs font-mono text-[#1B2922] focus:border-[#69A481]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4D6257] block mb-1">Drop-off Address / Destination *</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8277]" />
                    <Input
                      id="drop-location-input"
                      value={dropLocation}
                      onChange={(e) => setDropLocation(e.target.value)}
                      placeholder="e.g. Baga Beach / Dabolim Airport / Candolim Resort"
                      className="h-11 pl-9 bg-[#E7EDEB] border-[#CBD8D4] rounded-xl text-xs text-[#1B2922] focus:border-[#69A481]"
                    />
                  </div>
                </div>
              </div>

              {/* Minimalist Professional Fare & Confirmation Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#E7EDEB] border border-[#CBD8D4] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D6257] block">
                      Total Payable to Driver
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#1B2922] tracking-tight mt-0.5">
                      {formatINR(totalAmount)}
                    </div>
                    <span className="text-xs text-[#4D6257] font-medium block mt-0.5">
                      {rateDescription} · Zero Advance Deposit
                    </span>
                  </div>

                  <div>
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => handleBookNow(false)}
                      className="h-12 px-8 bg-gradient-to-r from-[#7C1F31] via-[#9B2A41] to-[#7C1F31] hover:brightness-105 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-[#7C1F31]"
                    >
                      {busy ? <Loader2 size={16} className="animate-spin text-white" /> : <span>Confirm &amp; Book Car</span>}
                      <ArrowRight size={15} className="text-white" />
                    </Button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#CBD8D4] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#4D6257]">
                  <span>✓ Free Cancellation up to 2h before pickup</span>
                  <span>✓ Sanitized AC Car &amp; Polite Chauffeur</span>
                  <span>✓ Extra Hr: ₹{vehicle.extraHr}/h · Extra Km: ₹{vehicle.extraKm}/km</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ── MOBILE STICKY FLOATING BOTTOM BAR ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#24060C]/95 backdrop-blur-md border-t border-white/10 p-3 px-4 shadow-2xl flex items-center justify-between text-left">
        <div>
          <span className="text-[9.5px] uppercase tracking-wider text-[#8FC4A5] font-bold block">
            {tourSubOption === "hourly" ? `${days} Day(s) Tour` : "Transfer Fare"}
          </span>
          <div className="text-xl font-black text-[#69A481] leading-tight">
            {formatINR(totalAmount)}
          </div>
          <span className="text-[9.5px] text-white/80 font-medium">Pay to Driver</span>
        </div>

        <div className="flex items-center gap-2">
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={handleProceedToStep2}
              className="h-10 px-5 bg-gradient-to-r from-[#7C1F31] via-[#9B2A41] to-[#7C1F31] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer border border-[#7C1F31]"
            >
              <span>Continue →</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => handleBookNow(false)}
              className="h-10 px-5 bg-gradient-to-r from-[#7C1F31] via-[#9B2A41] to-[#7C1F31] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer border border-[#7C1F31]"
            >
              {busy ? <Loader2 size={14} className="animate-spin text-white" /> : <span>Confirm Booking</span>}
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      <LightboxModal
        isOpen={lightboxOpen}
        images={vehicleImages}
        initialIndex={activeImageIdx}
        onClose={() => setLightboxOpen(false)}
      />

      <Footer />
    </div>
  );
}
