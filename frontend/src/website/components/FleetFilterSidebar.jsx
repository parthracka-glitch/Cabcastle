/* Brex Design System */
import React from "react";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  MapPin,
  Car,
  Plane,
  Clock,
  Zap,
  Filter,
  Cog,
  Fuel,
  RotateCcw,
  Check,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const LOCATIONS = [
  "Candolim (Main Hub)",
  "Calangute",
  "Baga",
  "Dabolim Airport (GOI)",
  "Mopa Airport (GOX)",
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

export default function FleetFilterSidebar({
  pickup,
  drop,
  onPickupChange,
  onDropChange,
  onDatesChange,
  onOneDayExpress,
  location,
  onLocationChange,
  airport,
  onAirportChange,
  category,
  onCategoryChange,
  transmission,
  onTransmissionChange,
  fuelType,
  onFuelTypeChange,
  categories = ["All", "Sedan", "SUV"],
  transmissions = ["All", "Manual", "Automatic"],
  fuelTypes = ["All", "Petrol", "Diesel"],
  categoryCounts = {},
  totalCount = 0,
  onReset,
  hasActiveFilters = false,
  activeFilterCount = 0,
  variant = "desktop",
  onApplyMobile,
}) {
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [dropCalendarOpen, setDropCalendarOpen] = React.useState(false);

  const isAirportLoc = location?.toLowerCase().includes("airport");
  const durationHours = (drop.getTime() - pickup.getTime()) / (1000 * 60 * 60);
  const durationDays = Math.max(1, Math.ceil((durationHours - 0.001) / 24));
  const minDropDate = new Date(pickup.getFullYear(), pickup.getMonth(), pickup.getDate() + 1);

  const handlePickupDateSelect = (newDate) => {
    if (!newDate) return;
    const pTime = format(pickup, "HH:mm");
    const updatedPickup = setTimeOnDate(newDate, pTime);
    onPickupChange(updatedPickup);
    const targetDays = Math.max(1, durationDays);
    const dTime = format(drop, "HH:mm");
    onDropChange(setTimeOnDate(addDays(newDate, targetDays), dTime));
    setPickupCalendarOpen(false);
  };

  const handleDropDateSelect = (newDate) => {
    if (!newDate) return;
    const dTime = format(drop, "HH:mm");
    const updatedDrop = setTimeOnDate(newDate, dTime);
    if (updatedDrop.getTime() <= pickup.getTime()) {
      onDropChange(setTimeOnDate(addDays(pickup, 1), dTime));
    } else {
      onDropChange(updatedDrop);
    }
    setDropCalendarOpen(false);
  };

  const handlePickupTime = (timeStr) => {
    const updated = setTimeOnDate(pickup, timeStr);
    onPickupChange(updated);
    if (drop.getTime() <= updated.getTime()) {
      onDropChange(setTimeOnDate(addDays(updated, 1), timeStr));
    }
  };

  const handleDropTime = (timeStr) => {
    const updated = setTimeOnDate(drop, timeStr);
    if (updated.getTime() <= pickup.getTime()) {
      onDropChange(setTimeOnDate(addDays(pickup, 1), timeStr));
    } else {
      onDropChange(updated);
    }
  };

  return (
    <aside
      className={`w-full text-[#212121] ${
        variant === "desktop"
          ? "bg-white border border-[#DFDCE8] rounded-[24px] p-5 sm:p-6 shadow-sm sticky top-24"
          : "bg-white p-4"
      }`}
      data-testid="fleet-filter-sidebar"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#DFDCE8]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#EFF0A3] flex items-center justify-center text-[#212121]">
            <Filter size={14} className="text-[#212121]" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-[#212121] tracking-tight">
              Refine Fleet
            </h3>
            <p className="text-[11px] text-[#6F6E73] font-normal">
              {totalCount} vehicles available
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium text-[#212121] bg-[#EFEDF5] hover:bg-[#DFDCE8] transition-all cursor-pointer"
            data-testid="reset-filters-btn"
          >
            <RotateCcw size={11} />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 1. Rental Dates & Express */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6F6E73] uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon size={13} className="text-[#212121]" /> Dates & Times
            </span>
            <span className="text-[11px] font-bold text-[#212121] bg-[#EFF0A3] px-2.5 py-0.5 rounded-full">
              {durationDays} {durationDays === 1 ? "Day" : "Days"}
            </span>
          </div>

          <div className="mb-2.5">
            <button
              type="button"
              onClick={onOneDayExpress}
              className="w-full flex items-center justify-between p-3 rounded-[16px] bg-[#F6F5FA] hover:bg-[#EFEDF5] border border-[#DFDCE8] transition-all text-left cursor-pointer group"
              data-testid="sidebar-express-btn"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#212121] text-white flex items-center justify-center text-[10px] font-bold">
                  <Zap size={12} />
                </span>
                <div>
                  <div className="text-xs font-bold text-[#212121]">1-Day Express</div>
                  <div className="text-[10px] text-[#6F6E73]">Today 9:00 AM – 9:00 PM</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#212121] group-hover:underline">
                Quick Apply
              </span>
            </button>
          </div>

          <div className="space-y-2">
            {/* Pickup Selector */}
            <div className="p-3 rounded-[16px] bg-[#F6F5FA] border border-[#DFDCE8]">
              <div className="text-[10px] uppercase font-bold text-[#6F6E73] mb-1.5">
                Pickup Date & Time
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Popover open={pickupCalendarOpen} onOpenChange={setPickupCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setPickupCalendarOpen(true)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-full bg-white border border-[#DFDCE8] hover:border-[#212121] text-xs font-medium text-[#212121] cursor-pointer"
                      data-testid="sidebar-pickup-date-btn"
                    >
                      <span className="truncate">{format(pickup, "dd MMM yyyy")}</span>
                      <CalendarIcon size={12} className="text-[#6F6E73] shrink-0 ml-1" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border border-[#DFDCE8] rounded-2xl shadow-lg z-50" align="start">
                    <div className="p-3 border-b border-[#DFDCE8] bg-[#F6F5FA]">
                      <div className="text-xs font-bold text-[#212121]">Select Pickup Date</div>
                      <div className="text-[11px] text-[#6F6E73]">Pick your journey starting date in Goa</div>
                    </div>
                    <Calendar
                      mode="single"
                      selected={pickup}
                      onSelect={handlePickupDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      numberOfMonths={1}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>

                <Select value={format(pickup, "HH:mm")} onValueChange={handlePickupTime}>
                  <SelectTrigger className="w-full h-8 px-3 bg-white border border-[#DFDCE8] hover:border-[#212121] rounded-full text-xs font-medium text-[#212121]">
                    <Clock size={11} className="text-[#6F6E73] mr-1 shrink-0" />
                    <SelectValue>{formatTime12(format(pickup, "HH:mm"))}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-56 bg-white border border-[#DFDCE8] rounded-xl shadow-lg z-50">
                    {TIME_OPTIONS.map((t) => (
                      <SelectItem key={`p-${t}`} value={t} className="text-xs">
                        {formatTime12(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Drop-off Selector */}
            <div className="p-3 rounded-[16px] bg-[#F6F5FA] border border-[#DFDCE8]">
              <div className="text-[10px] uppercase font-bold text-[#6F6E73] mb-1.5">
                Drop-off Date & Time
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Popover open={dropCalendarOpen} onOpenChange={setDropCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setDropCalendarOpen(true)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-full bg-white border border-[#DFDCE8] hover:border-[#212121] text-xs font-medium text-[#212121] cursor-pointer"
                      data-testid="sidebar-drop-date-btn"
                    >
                      <span className="truncate">{format(drop, "dd MMM yyyy")}</span>
                      <CalendarIcon size={12} className="text-[#6F6E73] shrink-0 ml-1" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border border-[#DFDCE8] rounded-2xl shadow-lg z-50" align="start">
                    <div className="p-3 border-b border-[#DFDCE8] bg-[#F6F5FA]">
                      <div className="text-xs font-bold text-[#212121]">Select Drop-off Date</div>
                      <div className="text-[11px] text-[#6F6E73]">Pick your vehicle return date in Goa</div>
                    </div>
                    <Calendar
                      mode="single"
                      selected={drop}
                      onSelect={handleDropDateSelect}
                      disabled={(date) => date < minDropDate}
                      numberOfMonths={1}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>

                <Select value={format(drop, "HH:mm")} onValueChange={handleDropTime}>
                  <SelectTrigger className="w-full h-8 px-3 bg-white border border-[#DFDCE8] hover:border-[#212121] rounded-full text-xs font-medium text-[#212121]">
                    <Clock size={11} className="text-[#6F6E73] mr-1 shrink-0" />
                    <SelectValue>{formatTime12(format(drop, "HH:mm"))}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-56 bg-white border border-[#DFDCE8] rounded-xl shadow-lg z-50">
                    {TIME_OPTIONS.map((t) => (
                      <SelectItem key={`d-${t}`} value={t} className="text-xs">
                        {formatTime12(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Pickup Location */}
        <div>
          <label className="text-xs font-medium text-[#6F6E73] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <MapPin size={13} className="text-[#212121]" /> Pickup Hub
          </label>
          <Select value={location} onValueChange={onLocationChange}>
            <SelectTrigger
              className="w-full h-10 bg-[#F6F5FA] border border-[#DFDCE8] hover:border-[#212121] rounded-full text-xs font-medium text-[#212121]"
              data-testid="sidebar-location-select"
            >
              <SelectValue placeholder="Select Pickup Location" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-[#DFDCE8] rounded-xl shadow-lg z-50">
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc} className="text-xs font-medium py-2">
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Airport delivery toggle */}
          <div className="mt-2 pt-2 border-t border-[#DFDCE8] flex items-center justify-between">
            <label
              htmlFor="airport-delivery-sidebar"
              className="text-xs text-[#212121] flex items-center gap-2 cursor-pointer select-none font-medium"
            >
              <Plane size={13} className="text-[#212121]" />
              <span>Airport Delivery Required</span>
            </label>
            <Checkbox
              id="airport-delivery-sidebar"
              checked={airport || isAirportLoc}
              onCheckedChange={(checked) => {
                onAirportChange(!!checked);
                if (checked && !isAirportLoc) {
                  onLocationChange("Dabolim Airport (GOI)");
                } else if (!checked && isAirportLoc) {
                  onLocationChange("Candolim (Main Hub)");
                }
              }}
              className="data-[state=checked]:bg-[#212121] data-[state=checked]:border-[#212121] border-[#DFDCE8] rounded-md"
              data-testid="sidebar-airport-checkbox"
            />
          </div>
        </div>

        {/* 3. Vehicle Category Segmented Pills */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[#6F6E73] uppercase tracking-wider flex items-center gap-1.5">
              <Car size={13} className="text-[#212121]" /> Category
            </span>
            {category !== "All" && (
              <button
                type="button"
                onClick={() => onCategoryChange("All")}
                className="text-[10px] text-[#212121] hover:underline font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5" data-testid="sidebar-category-pills">
            {categories.map((cat) => {
              const isSelected = category.toLowerCase() === cat.toLowerCase();
              const count = cat === "All" ? totalCount : (categoryCounts[cat] ?? 0);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#212121] text-white shadow-xs font-bold"
                      : "bg-[#F6F5FA] text-[#212121] hover:bg-[#DFDCE8]/40 border border-[#DFDCE8]"
                  }`}
                  data-testid={`sidebar-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="truncate">{cat}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-[#EFF0A3]"
                        : "bg-white text-[#6F6E73] border border-[#DFDCE8]/60"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>



        {/* 5. Fuel Type Segmented Control */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[#6F6E73] uppercase tracking-wider flex items-center gap-1.5">
              <Fuel size={13} className="text-[#212121]" /> Fuel Type
            </span>
            {fuelType !== "All" && (
              <button
                type="button"
                onClick={() => onFuelTypeChange("All")}
                className="text-[10px] text-[#212121] hover:underline font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex rounded-full p-1 bg-[#F6F5FA] border border-[#DFDCE8]">
            {fuelTypes.map((f) => {
              const isSelected = fuelType.toLowerCase() === f.toLowerCase();
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFuelTypeChange(f)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#212121] text-white font-bold shadow-xs"
                      : "text-[#6F6E73] hover:text-[#212121]"
                  }`}
                  data-testid={`sidebar-fuel-${f.toLowerCase()}`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Apply Action Button */}
      {variant === "mobile" && (
        <div className="mt-6 pt-4 border-t border-[#DFDCE8] flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-2.5 rounded-full border border-[#212121] bg-transparent text-[#212121] text-xs font-medium hover:bg-[#212121]/5 transition-all cursor-pointer"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={onApplyMobile}
            className="flex-2 py-2.5 rounded-full bg-[#212121] hover:bg-[#141414] text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
            data-testid="sidebar-mobile-apply-btn"
          >
            Show {totalCount} Cars
          </button>
        </div>
      )}
    </aside>
  );
}
