/* Coastal Cabs Goa Design System */
import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, MapPin, Car, Plane, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays } from "date-fns";
import Tilt3DCard from "./Tilt3DCard";

const CATEGORIES = ["Sedan", "SUV"];
const LOCATIONS = [
  "Candolim (Main Hub)",
  "Calangute",
  "Baga",
  "Dabolim Airport (GOI)",
  "Mopa Airport (GOX)",
  "Margao Railway Station",
  "Thivim Railway Station",
];

const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00", "01:00", "02:00"
];

function formatTime12(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function setTimeOnDate(dateObj, timeStr) {
  if (!dateObj) return dateObj;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const newDate = new Date(dateObj);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

function FieldLabel({ children }) {
  return (
    <span className="block text-xs font-semibold text-[#4C606E] mb-1.5 tracking-normal text-left">
      {children}
    </span>
  );
}

export default function SearchWidget({ variant = "hero" }) {
  const nav = useNavigate();
  const [pickup, setPickup] = React.useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [drop, setDrop] = React.useState(() => {
    const d = addDays(new Date(), 1);
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [category, setCategory] = React.useState("All");
  const [location, setLocation] = React.useState(LOCATIONS[0]);
  const [airport, setAirport] = React.useState(false);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const [draftRange, setDraftRange] = React.useState({ from: pickup, to: drop });

  React.useEffect(() => {
    if (calendarOpen) {
      setDraftRange({ from: pickup, to: drop });
    }
  }, [calendarOpen, pickup, drop]);

  const isAirportLoc = location.toLowerCase().includes("airport");

  const handleRangeSelect = (range) => {
    if (!range) return;

    if (range?.from) {
      const pTime = format(pickup, "HH:mm");
      const newPickup = setTimeOnDate(range.from, pTime);
      setPickup(newPickup);

      if (range?.to) {
        if (range.to < range.from) {
          const nextDay = addDays(range.from, 1);
          const dTime = format(drop, "HH:mm");
          const newDrop = setTimeOnDate(nextDay, dTime);
          setDrop(newDrop);
          setDraftRange({ from: range.from, to: nextDay });
        } else {
          const dTime = format(drop, "HH:mm");
          const newDrop = setTimeOnDate(range.to, dTime);
          setDrop(newDrop);
          setDraftRange(range);
        }
      } else {
        const nextDay = addDays(range.from, 1);
        const dTime = format(drop, "HH:mm");
        const newDrop = setTimeOnDate(nextDay, dTime);
        setDrop(newDrop);
        setDraftRange({ from: range.from, to: undefined });
      }
    }
  };

  function applyPresetDays(days) {
    const p = new Date();
    p.setHours(9, 0, 0, 0);
    const d = addDays(p, days);
    d.setHours(9, 0, 0, 0);
    setPickup(p);
    setDrop(d);
    setDraftRange({ from: p, to: d });
  }

  function confirmDates() {
    if (draftRange?.from) {
      const pTime = format(pickup, "HH:mm");
      const newPickup = setTimeOnDate(draftRange.from, pTime);
      setPickup(newPickup);

      let targetTo = draftRange.to;
      if (!targetTo || targetTo <= draftRange.from) {
        targetTo = addDays(draftRange.from, 1);
      }
      const dTime = format(drop, "HH:mm");
      const newDrop = setTimeOnDate(targetTo, dTime);
      setDrop(newDrop);
      setDraftRange({ from: draftRange.from, to: targetTo });
    }
    setCalendarOpen(false);
  }

  const durationHours = (drop.getTime() - pickup.getTime()) / (1000 * 60 * 60);
  const durationDays = Math.max(1, Math.ceil(durationHours / 24));

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      start: pickup.toISOString(),
      end: drop.toISOString(),
      location,
      ...(category !== "All" && { category }),
      ...(airport && { airport: "1" }),
    });
    nav(`/fleet?${params.toString()}`);
  };

  const handleOneDayExpress = (e) => {
    e.preventDefault();
    const p = new Date();
    p.setHours(9, 0, 0, 0);
    const d = new Date(p);
    d.setHours(21, 0, 0, 0);

    const params = new URLSearchParams({
      start: p.toISOString(),
      end: d.toISOString(),
      location,
      ...(category !== "All" && { category }),
      ...(airport && { airport: "1" }),
    });
    nav(`/fleet?${params.toString()}`);
  };

  return (
    <Tilt3DCard maxTilt={2} scale={1.005} className="rounded-[24px]">
      <div
        className="bg-white text-[#0F172A] rounded-[24px] p-5 sm:p-7 md:p-8 border border-[#E8E0D2] shadow-md font-body"
        data-testid="search-widget"
      >
        <form onSubmit={handleSearch} className="space-y-4 sm:space-y-5">
          {/* Quick Presets Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E0D2]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#475569] font-medium">
                Quick Select:
              </span>
              <button
                type="button"
                onClick={handleOneDayExpress}
                className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF2DE] text-[#B87A18] hover:bg-[#F6D285]/40 border border-[#E5A93C]/35 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
              >
                <Zap size={12} className="text-[#E5A93C]" /> 1-Day Express (8h / 80km)
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-[#475569]">
              <span>Duration:</span>
              <span className="font-bold text-[#0F172A]">{durationDays} {durationDays === 1 ? "Day" : "Days"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Pickup Date & Time */}
            <div className="space-y-1">
              <FieldLabel>Pickup Date &amp; Time</FieldLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    data-testid="search-pickup-date"
                    onClick={() => setCalendarOpen(true)}
                    className="flex items-center justify-between w-full h-11 border border-[#E8E0D2] rounded-full px-4 bg-[#FAF8F5] hover:bg-white hover:border-[#E5A93C] transition-all text-left cursor-pointer shadow-none group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CalendarIcon size={15} className="text-[#E5A93C] shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-xs sm:text-sm text-[#0F172A] block leading-tight">
                          {format(pickup, "dd MMM yyyy")}
                        </span>
                        <span className="text-[#475569] font-mono text-[11px] block leading-tight">
                          {formatTime12(format(pickup, "HH:mm"))}
                        </span>
                      </div>
                    </div>
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  className="w-[calc(100vw-32px)] sm:w-[350px] max-w-[350px] p-0 bg-white border border-[#E8E0D2] shadow-xl rounded-2xl overflow-hidden z-50"
                >
                  <div className="p-4 bg-[#0F172A] text-white flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] uppercase tracking-wider text-[#F6D285] font-bold">
                        {draftRange?.from && !draftRange?.to ? "Select Drop-off Date" : "Rental Duration"}
                      </div>
                      <span className="text-xs font-mono bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] text-[#090D16] px-2.5 py-0.5 rounded-full font-black">
                        {durationDays} {durationDays === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-medium text-white flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                      <div className="text-center">
                        <div className="text-[9px] text-[#F6D285] uppercase">Pickup</div>
                        <div>{format(pickup, "dd MMM yyyy")}</div>
                      </div>
                      <span className="text-[#E5A93C] font-bold text-sm">→</span>
                      <div className="text-center">
                        <div className="text-[9px] text-[#F6D285] uppercase">Drop-off</div>
                        <div>{format(drop, "dd MMM yyyy")}</div>
                      </div>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 flex items-center justify-between gap-2 border-b border-[#E8E0D2] bg-[#FAF8F5]">
                    <span className="text-[10px] uppercase text-[#475569] font-bold">Presets:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 3, 5, 7].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => applyPresetDays(days)}
                          className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-[#0F172A] border border-[#E8E0D2] hover:border-[#E5A93C] hover:text-[#B87A18] transition-all cursor-pointer"
                        >
                          +{days}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 flex justify-center">
                    <Calendar
                      mode="range"
                      selected={draftRange}
                      onSelect={handleRangeSelect}
                      disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                      initialFocus
                    />
                  </div>

                  <div className="p-3 border-t border-[#E8E0D2] bg-[#FAF8F5] flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-[#475569] mb-1 uppercase">Pickup Time</label>
                        <Select
                          value={format(pickup, "HH:mm")}
                          onValueChange={(val) => setPickup(setTimeOnDate(pickup, val))}
                        >
                          <SelectTrigger className="w-full border border-[#E8E0D2] rounded-full px-3 py-1.5 font-medium text-[#0F172A] bg-white h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-56 bg-white border border-[#E8E0D2] text-[#0F172A] rounded-xl">
                            {TIME_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t}>{formatTime12(t)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#475569] mb-1 uppercase">Drop Time</label>
                        <Select
                          value={format(drop, "HH:mm")}
                          onValueChange={(val) => setDrop(setTimeOnDate(drop, val))}
                        >
                          <SelectTrigger className="w-full border border-[#E8E0D2] rounded-full px-3 py-1.5 font-medium text-[#0F172A] bg-white h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-56 bg-white border border-[#E8E0D2] text-[#0F172A] rounded-xl">
                            {TIME_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t}>{formatTime12(t)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={confirmDates}
                      className="w-full bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] hover:brightness-105 text-[#090D16] font-black uppercase tracking-wider text-xs h-9 rounded-full shadow-gold transition-all cursor-pointer active:scale-96 flex items-center justify-center border border-[#E5A93C]/40"
                    >
                      Apply Dates
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* 2. Drop-off Date & Time */}
            <div className="space-y-1">
              <FieldLabel>Drop-off Date &amp; Time</FieldLabel>
              <button
                type="button"
                data-testid="search-drop-date"
                onClick={() => setCalendarOpen(true)}
                className="flex items-center justify-between w-full h-11 border border-[#E8E0D2] rounded-full px-4 bg-[#FAF8F5] hover:bg-white hover:border-[#E5A93C] transition-all text-left cursor-pointer shadow-none group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <CalendarIcon size={15} className="text-[#E5A93C] shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-xs sm:text-sm text-[#0F172A] block leading-tight">
                      {format(drop, "dd MMM yyyy")}
                    </span>
                    <span className="text-[#475569] font-mono text-[11px] block leading-tight">
                      {formatTime12(format(drop, "HH:mm"))}
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* 3. Pickup Location */}
            <div className="space-y-1">
              <FieldLabel>Pickup Location</FieldLabel>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger
                  className="bg-[#FAF8F5] border-[#E8E0D2] rounded-full text-xs sm:text-sm font-medium text-[#0F172A] h-11 hover:bg-white hover:border-[#E5A93C] transition-all px-4"
                  data-testid="search-location"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin size={15} className="text-[#E5A93C] shrink-0" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E8E0D2] text-[#0F172A] rounded-xl">
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Vehicle Type */}
            <div className="space-y-1">
              <FieldLabel>Vehicle Type</FieldLabel>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  className="bg-[#FAF8F5] border-[#E8E0D2] rounded-full text-xs sm:text-sm font-medium text-[#0F172A] h-11 hover:bg-white hover:border-[#E5A93C] transition-all px-4"
                  data-testid="search-category"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Car size={15} className="text-[#E5A93C] shrink-0" />
                    <SelectValue placeholder="All Vehicle Types" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E8E0D2] text-[#0F172A] rounded-xl">
                  <SelectItem value="All">All Vehicle Types</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bottom Bar: Airport Toggle + Search CTA */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="airport-chk"
                checked={airport || isAirportLoc}
                disabled={isAirportLoc}
                onCheckedChange={(v) => setAirport(!!v)}
                className="data-[state=checked]:bg-[#E5A93C] data-[state=checked]:border-[#E5A93C] border-[#E8E0D2] rounded-md"
                data-testid="airport-pickup-toggle"
              />
              <label
                htmlFor="airport-chk"
                className="text-xs font-medium text-[#475569] flex items-center gap-1 cursor-pointer"
              >
                <Plane size={14} className="text-[#E5A93C]" />
                Airport Delivery / Pickup Required
              </label>
            </div>

            <Button
              type="submit"
              data-testid="search-submit"
              className="bg-gradient-to-r from-[#D4901F] via-[#E5A93C] to-[#F5C765] hover:brightness-105 active:brightness-95 text-[#090D16] font-black h-11 px-8 rounded-full uppercase tracking-wider text-xs shadow-gold active:scale-98 transition-all duration-150 cursor-pointer border border-[#E5A93C]/40"
            >
              Search Available Fleet →
            </Button>
          </div>
        </form>
      </div>
    </Tilt3DCard>
  );
}
