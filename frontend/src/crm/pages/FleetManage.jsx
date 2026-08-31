import React from "react";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  Car,
  Compass,
  Key,
  ShieldCheck,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  Fuel,
  Users,
  Check,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "../components/common/ConfirmModal";
import { MASTER_FLEET } from "@website/data/fleetData";

const CATEGORIES = ["All", "Hatchback", "Sedan", "SUV", "Luxury"];
const FUELS = ["Petrol", "Diesel", "Hybrid Petrol", "EV"];
const TRANS_OPTIONS = ["Manual", "Automatic", "Manual & Automatic"];
const STATUSES = ["Available", "Booked", "Maintenance"];

const EMPTY_VEHICLE = {
  title: "",
  subtitle: "",
  reg_no: "",
  category: "SUV",
  fuel_type: "Petrol",
  transmission: "Manual & Automatic",
  seating: 5,
  daily_rate: 2500, // Tour Package Rate (8h/80km)
  airport_rate: 1500, // Airport Flat Rate
  self_drive_rate: 1800, // Self Drive 24h Rate
  rate_manual: 1800,
  rate_auto: 2100,
  daily_rate_manual: 1800,
  daily_rate_automatic: 2100,
  security_deposit: 3000,
  delivery_fee: 500,
  image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
  images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"],
  status: "Available",
  description: "",
};

export default function FleetManage() {
  const [items, setItems] = React.useState([]);
  const [q, setQ] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [transFilter, setTransFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [viewMode, setViewMode] = React.useState("table"); // 'table' | 'grid'

  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(EMPTY_VEHICLE);
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("general"); // 'general' | 'pricing' | 'photos'
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = React.useState("");

  // In-app delete confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteTargetId, setDeleteTargetId] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  // Load vehicles from API, fallback to MASTER_FLEET
  const load = React.useCallback((showSpinner = false) => {
    if (showSpinner) setLoading(true);
    api
      .get("/vehicles", { params: { q: q || undefined, _t: Date.now() } })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          const combined = data.map((v) => {
            const master = MASTER_FLEET.find(
              (m) => m.id === v.id || m.title.toLowerCase() === (v.title || "").toLowerCase()
            );
            return {
              ...master,
              ...v,
              self_drive_rate: v.self_drive_rate || master?.self_drive_rate || v.daily_rate_manual || 1800,
              daily_rate: v.daily_rate || master?.daily_rate || 2500,
              airport_rate: v.airport_rate || master?.airport_rate || 1500,
              security_deposit: v.security_deposit !== undefined ? v.security_deposit : (master?.security_deposit || 3000),
              delivery_fee: v.delivery_fee !== undefined ? v.delivery_fee : (master?.delivery_fee || 500),
            };
          });
          setItems(combined);
        } else {
          setItems(MASTER_FLEET);
        }
      })
      .catch((err) => {
        console.error("Failed to load fleet, falling back to MASTER_FLEET:", err);
        setItems(MASTER_FLEET);
      })
      .finally(() => setLoading(false));
  }, [q]);

  React.useEffect(() => {
    load(true);
  }, [load]);

  // Update vehicle status directly inline
  async function updateVehicleStatus(vehicle, newStatus) {
    const vId = vehicle.id || vehicle._id;
    try {
      await api.patch(`/vehicles/${vId}`, { status: newStatus });
      setItems((prev) =>
        prev.map((v) => ((v.id === vId || v._id === vId) ? { ...v, status: newStatus } : v))
      );
      toast.success(`${vehicle.title} status changed to ${newStatus}`);
    } catch (err) {
      toast.error(formatApiError(err) || "Failed to update vehicle status");
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_VEHICLE);
    setNewPhotoUrl("");
    setActiveTab("general");
    setOpen(true);
  }

  function openEdit(v) {
    setEditing(v);
    const photos = Array.isArray(v.images) && v.images.length > 0
      ? v.images.filter(Boolean)
      : (v.image_url ? [v.image_url] : []);

    setForm({
      ...v,
      id: v.id || v._id,
      title: v.title || "",
      subtitle: v.subtitle || "",
      reg_no: v.reg_no || "",
      category: v.category || "SUV",
      fuel_type: v.fuel_type || "Petrol",
      transmission: v.transmission || "Manual & Automatic",
      seating: v.seating || 5,
      daily_rate: v.daily_rate || 2500,
      airport_rate: v.airport_rate || 1500,
      self_drive_rate: v.self_drive_rate || v.daily_rate_manual || 1800,
      rate_manual: v.rate_manual || v.daily_rate_manual || 1800,
      rate_auto: v.rate_auto || v.daily_rate_automatic || 2200,
      daily_rate_manual: v.daily_rate_manual || v.rate_manual || 1800,
      daily_rate_automatic: v.daily_rate_automatic || v.rate_auto || 2200,
      security_deposit: v.security_deposit !== undefined ? v.security_deposit : 3000,
      delivery_fee: v.delivery_fee !== undefined ? v.delivery_fee : 500,
      status: v.status || "Available",
      description: v.description || "",
      images: photos.length > 0 ? photos : [EMPTY_VEHICLE.image_url],
      image_url: photos[0] || v.image_url || EMPTY_VEHICLE.image_url,
    });
    setNewPhotoUrl("");
    setActiveTab("general");
    setOpen(true);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentImages = Array.isArray(form.images) ? form.images.filter(Boolean) : (form.image_url ? [form.image_url] : []);
    if (currentImages.length >= 6) {
      toast.error("Maximum 6 photos allowed per vehicle. Delete an existing photo first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const carSlug = (form.title || form.reg_no || "unnamed")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    formData.append("folder", `coastal_cabs_goa/vehicles/${carSlug}`);

    setUploading(true);
    try {
      const { data } = await api.post("/admin/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = data?.url;
      if (!uploadedUrl) throw new Error("No image URL returned from upload server");

      setForm((prev) => {
        const list = Array.isArray(prev.images) ? prev.images.filter(Boolean) : (prev.image_url ? [prev.image_url] : []);
        const updatedList = [...list, uploadedUrl].filter(Boolean).slice(0, 6);
        return {
          ...prev,
          images: updatedList,
          image_url: updatedList[0] || uploadedUrl,
        };
      });
      toast.success("Photo uploaded successfully");
    } catch (err) {
      toast.error(formatApiError(err) || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(idx) {
    setForm((prev) => {
      const list = Array.isArray(prev.images) ? prev.images.filter(Boolean) : (prev.image_url ? [prev.image_url] : []);
      const updated = list.filter((_, i) => i !== idx);
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || "",
      };
    });
    toast.success("Photo removed from gallery");
  }

  function addDirectPhotoUrl() {
    if (!newPhotoUrl || !newPhotoUrl.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }
    const cleanUrl = newPhotoUrl.trim();
    setForm((prev) => {
      const list = Array.isArray(prev.images) ? prev.images.filter(Boolean) : (prev.image_url ? [prev.image_url] : []);
      if (list.length >= 6) {
        toast.error("Maximum 6 photos allowed. Remove one first.");
        return prev;
      }
      const updated = [...list, cleanUrl];
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || cleanUrl,
      };
    });
    setNewPhotoUrl("");
    toast.success("Photo added to gallery");
  }

  async function save() {
    if (!form.title || !form.title.trim()) {
      toast.error("Vehicle model title is required");
      setActiveTab("general");
      return;
    }
    if (!form.reg_no || !form.reg_no.trim()) {
      toast.error("Registration plate number is required");
      setActiveTab("general");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      daily_rate: Number(form.daily_rate) || 2500,
      airport_rate: Number(form.airport_rate) || 1500,
      self_drive_rate: Number(form.self_drive_rate) || 1800,
      rate_manual: Number(form.rate_manual) || Number(form.self_drive_rate) || 1800,
      rate_auto: Number(form.rate_auto) || (Number(form.self_drive_rate) ? Number(form.self_drive_rate) + 300 : 2100),
      daily_rate_manual: Number(form.daily_rate_manual) || Number(form.self_drive_rate) || 1800,
      daily_rate_automatic: Number(form.daily_rate_automatic) || Number(form.rate_auto) || 2100,
      security_deposit: Number(form.security_deposit) || 0,
      delivery_fee: Number(form.delivery_fee) || 0,
      seating: parseInt(String(form.seating), 10) || 5,
      images: Array.isArray(form.images) && form.images.length > 0 ? form.images : [form.image_url],
      image_url: form.image_url || (Array.isArray(form.images) ? form.images[0] : ""),
    };

    try {
      if (editing) {
        const vId = editing.id || editing._id;
        const { data } = await api.patch(`/vehicles/${vId}`, payload);
        toast.success(`Updated ${payload.title} details successfully`);
        setItems((prev) => prev.map((v) => ((v.id === vId || v._id === vId) ? { ...v, ...data, ...payload } : v)));
      } else {
        const { data } = await api.post("/vehicles", payload);
        toast.success(`Added ${payload.title} to fleet`);
        setItems((prev) => [data, ...prev]);
      }
      setOpen(false);
      window.dispatchEvent(new Event("ccg_vehicles_updated"));
    } catch (err) {
      toast.error(formatApiError(err) || "Failed to save vehicle details");
    } finally {
      setSaving(false);
    }
  }

  function promptDelete(id) {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  }

  async function executeDelete() {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await api.delete(`/vehicles/${deleteTargetId}`);
      toast.success("Vehicle deleted from fleet");
      setItems((prev) => prev.filter((v) => (v.id !== deleteTargetId && v._id !== deleteTargetId)));
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      window.dispatchEvent(new Event("ccg_vehicles_updated"));
    } catch (err) {
      toast.error(formatApiError(err) || "Failed to delete vehicle");
    } finally {
      setDeleting(false);
    }
  }

  // Filter items
  const filtered = React.useMemo(() => {
    return items.filter((v) => {
      if (categoryFilter !== "All" && v.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (transFilter !== "All" && v.transmission !== transFilter) {
        return false;
      }
      if (statusFilter !== "All" && v.status !== statusFilter) {
        return false;
      }
      if (q.trim()) {
        const qStr = q.toLowerCase();
        const matchesTitle = (v.title || "").toLowerCase().includes(qStr);
        const matchesSubtitle = (v.subtitle || "").toLowerCase().includes(qStr);
        const matchesReg = (v.reg_no || "").toLowerCase().includes(qStr);
        const matchesCat = (v.category || "").toLowerCase().includes(qStr);
        if (!matchesTitle && !matchesSubtitle && !matchesReg && !matchesCat) return false;
      }
      return true;
    });
  }, [items, categoryFilter, transFilter, statusFilter, q]);

  const hasActiveFilters = categoryFilter !== "All" || transFilter !== "All" || statusFilter !== "All" || q.trim() !== "";

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* ── HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[#063247] tracking-tight">
              Fleet Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4F2F5] text-[#2A8FA8] border border-[#C3E7FA]">
              {items.length} Vehicles
            </span>
          </div>
          <p className="text-xs text-[#4C606E] mt-1 font-normal">
            Configure vehicle specs, rates (tour &amp; 24h self-drive), live status, and photo galleries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#DFE8EC]">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-white text-[#063247] shadow-xs"
                  : "text-[#8496A2] hover:text-[#063247]"
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-[#063247] shadow-xs"
                  : "text-[#8496A2] hover:text-[#063247]"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {/* Add Vehicle Button */}
          <Button
            onClick={openAdd}
            className="bg-[#063247] hover:bg-[#063247]/90 text-white font-semibold text-xs rounded-xl h-9 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>Add Vehicle</span>
          </Button>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="bg-white border border-[#DFE8EC] rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8496A2]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by car name, plate number, or category..."
              className="pl-9.5 pr-8 h-9 bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-xs text-[#063247] placeholder:text-[#8496A2] focus:border-[#2A8FA8] focus:bg-white transition-all"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8496A2] hover:text-[#063247] p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 text-xs rounded-xl px-3 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] min-w-[115px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="cursor-pointer">
                    {c === "All" ? "All Categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Transmission */}
            <Select value={transFilter} onValueChange={setTransFilter}>
              <SelectTrigger className="h-9 text-xs rounded-xl px-3 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] min-w-[125px]">
                <SelectValue placeholder="Transmission" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                <SelectItem value="All">All Transmissions</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Automatic">Automatic</SelectItem>
                <SelectItem value="Manual & Automatic">Manual &amp; Auto</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs rounded-xl px-3 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] min-w-[110px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCategoryFilter("All");
                  setTransFilter("All");
                  setStatusFilter("All");
                  setQ("");
                }}
                className="h-9 px-2.5 rounded-xl text-xs text-[#E8826B] hover:bg-[#E8826B]/10 flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── FLEET CONTENT CONTAINER (TABLE OR GRID) ── */}
      {loading ? (
        <div className="bg-white border border-[#DFE8EC] rounded-2xl p-12 text-center text-xs text-[#8496A2] shadow-xs">
          <div className="w-6 h-6 border-2 border-[#2A8FA8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading fleet catalog...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#DFE8EC] rounded-2xl p-12 text-center shadow-xs">
          <Car size={36} className="text-[#8496A2] mx-auto mb-2 opacity-50" />
          <div className="text-sm font-bold text-[#063247]">No vehicles match your criteria</div>
          <p className="text-xs text-[#8496A2] mt-1">Try adjusting the search query or filters.</p>
        </div>
      ) : viewMode === "table" ? (
        /* ── MINIMAL SYMMETRICAL TABLE ── */
        <div className="bg-white border border-[#DFE8EC] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#DFE8EC] text-[11px] font-bold text-[#4C606E] uppercase tracking-wider">
                  <th className="py-3 px-4 w-[34%] min-w-[240px]">Vehicle &amp; Specs</th>
                  <th className="py-3 px-3 w-[12%] min-w-[100px]">Category</th>
                  <th className="py-3 px-3 w-[22%] min-w-[170px]">Tour &amp; Airport Rates</th>
                  <th className="py-3 px-3 w-[14%] min-w-[120px]">Driver / AC</th>
                  <th className="py-3 px-3 w-[10%] min-w-[95px]">Status</th>
                  <th className="py-3 pr-4 pl-2 w-[10%] min-w-[95px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE8EC] text-xs">
                {filtered.map((v) => {
                  const img = v.image_url || (Array.isArray(v.images) ? v.images[0] : "");
                  const isAvail = v.status === "Available" || !v.status;
                  const isBooked = v.status === "Booked";

                  return (
                    <tr
                      key={v.id || v._id}
                      className="hover:bg-[#F8FAFC]/80 transition-colors group"
                    >
                      {/* Vehicle & Specs */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-xl overflow-hidden bg-[#F1F5F9] border border-[#DFE8EC] shrink-0 shadow-2xs">
                            <img
                              src={img}
                              alt={v.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#063247] text-xs truncate">
                                {v.title}
                              </span>
                              <span className="text-[10px] font-medium text-[#4C606E] bg-[#F1F5F9] px-1.5 py-0.5 rounded-md border border-[#DFE8EC] shrink-0">
                                {v.seating || 5} Seats
                              </span>
                            </div>
                            <div className="text-[10.5px] text-[#8496A2] truncate mt-0.5 font-normal">
                              {v.subtitle || v.description || "Premium rental vehicle"}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#288DA6] font-mono font-medium">
                              <span className="bg-[#E4F2F5] px-1.5 py-0.2 rounded border border-[#C3E7FA]/60">
                                {v.reg_no || "UNREGISTERED"}
                              </span>
                              <span className="text-[#8496A2]">·</span>
                              <span className="text-[#4C606E]">{v.fuel_type || "Petrol"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-medium ${
                          v.category === "Luxury"
                            ? "bg-[#FFF4E5] text-[#B76E00] border border-[#FFE2B8]"
                            : v.category === "SUV"
                            ? "bg-[#E4F2F5] text-[#288DA6] border border-[#C3E7FA]"
                            : "bg-[#F1F5F9] text-[#4C606E] border border-[#DFE8EC]"
                        }`}>
                          {v.category || "Hatchback"}
                        </span>
                      </td>

                      {/* Rates (Tour & Airport) */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#8496A2] font-sans font-medium">8h/80km:</span>
                            <span className="font-bold text-[#063247]">₹{(v.daily_rate || 2500).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#8496A2] font-sans font-medium">Airport:</span>
                            <span className="font-bold text-[#288DA6]">₹{(v.airport_rate || 1300).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </td>

                      {/* Driver Included */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-[11px] font-semibold text-[#063247]">
                          With Driver
                        </div>
                        <div className="text-[10px] text-[#8496A2] mt-0.5">
                          {v.seating || 5} Seats · AC Cab
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Select
                          value={v.status || "Available"}
                          onValueChange={(val) => updateVehicleStatus(v, val)}
                        >
                          <SelectTrigger className={`h-7 text-[10.5px] font-semibold rounded-full px-2.5 border transition-all ${
                            isAvail
                              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                              : isBooked
                              ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                              : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Booked">Booked</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-4 pl-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => openEdit(v)}
                            className="h-8 px-2.5 bg-[#E4F2F5] hover:bg-[#C3E7FA] text-[#2A8FA8] hover:text-[#185e70] font-semibold text-xs rounded-lg border border-[#C3E7FA]/80 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="Edit Vehicle Details & Rates"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => promptDelete(v.id || v._id)}
                            className="h-8 w-8 p-0 text-[#8496A2] hover:text-[#E8826B] hover:bg-[#E8826B]/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── MINIMAL GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v) => {
            const img = v.image_url || (Array.isArray(v.images) ? v.images[0] : "");
            const isAvail = v.status === "Available" || !v.status;
            const isBooked = v.status === "Booked";

            return (
              <div
                key={v.id || v._id}
                className="bg-white border border-[#DFE8EC] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  {/* Top Image + Badges */}
                  <div className="relative h-44 w-full bg-[#F1F5F9] overflow-hidden border-b border-[#DFE8EC]">
                    <img
                      src={img}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-white/95 text-[#063247] shadow-xs backdrop-blur-xs border border-white/40">
                        {v.category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold shadow-xs backdrop-blur-xs border ${
                        isAvail
                          ? "bg-[#ECFDF5]/95 text-[#059669] border-[#A7F3D0]"
                          : isBooked
                          ? "bg-[#FFFBEB]/95 text-[#D97706] border-[#FDE68A]"
                          : "bg-[#FEF2F2]/95 text-[#DC2626] border-[#FECACA]"
                      }`}>
                        {v.status || "Available"}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-[#063247] truncate">
                          {v.title}
                        </h3>
                        <span className="text-[10px] font-semibold text-[#4C606E] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#DFE8EC] shrink-0">
                          {v.seating || 5} Seats
                        </span>
                      </div>
                      <p className="text-xs text-[#8496A2] line-clamp-1 mt-0.5">
                        {v.subtitle || v.description || "Premium rental vehicle"}
                      </p>
                    </div>

                    {/* Reg Plate & Fuel */}
                    <div className="flex items-center gap-2 text-[11px] text-[#4C606E]">
                      <span className="font-mono text-[#2A8FA8] bg-[#E4F2F5] px-2 py-0.5 rounded-md font-semibold border border-[#C3E7FA]/60">
                        {v.reg_no || "UNREGISTERED"}
                      </span>
                      <span>·</span>
                      <span>{v.fuel_type || "Petrol"}</span>
                      <span>·</span>
                      <span>{v.transmission || "Manual"}</span>
                    </div>

                    {/* Pricing Matrix */}
                    <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#DFE8EC] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-[#8496A2] uppercase font-bold">Tour (8h/80k)</div>
                        <div className="font-mono font-bold text-[#063247] mt-0.5">
                          ₹{(v.daily_rate || 2500).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#8496A2] uppercase font-bold">Self-Drive 24h</div>
                        <div className="font-mono font-bold text-[#0D9488] mt-0.5">
                          ₹{(v.self_drive_rate || v.rate_manual || 1800).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-0 border-t border-[#DFE8EC] mt-3 flex items-center justify-between gap-2 pt-3">
                  <Button
                    onClick={() => openEdit(v)}
                    className="flex-1 h-9 bg-[#E4F2F5] hover:bg-[#C3E7FA] text-[#2A8FA8] hover:text-[#185e70] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#C3E7FA]"
                  >
                    <Pencil size={13} />
                    <span>Edit Details</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => promptDelete(v.id || v._id)}
                    className="h-9 w-9 p-0 text-[#8496A2] hover:text-[#E8826B] hover:bg-[#E8826B]/10 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Delete Vehicle"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VEHICLE DETAILS EDIT / CREATE MODAL ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#DFE8EC] p-0 shadow-2xl">
          {/* Modal Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#DFE8EC] shrink-0 bg-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E4F2F5] border border-[#C3E7FA] flex items-center justify-center text-[#2A8FA8] shrink-0">
                  <Car size={20} />
                </div>
                <div>
                  <DialogTitle className="font-display text-lg font-bold text-[#063247]">
                    {editing ? `Edit: ${form.title}` : "Add New Vehicle"}
                  </DialogTitle>
                  <p className="text-xs text-[#8496A2] font-normal mt-0.5">
                    {editing ? "Modify vehicle specs, pricing matrix, status, and photos." : "Register a new vehicle to the active fleet catalog."}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub Tabs for Clean Navigation */}
            <div className="flex items-center gap-2 mt-4 pt-1 border-t border-[#DFE8EC]">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "general"
                    ? "bg-[#063247] text-white"
                    : "text-[#4C606E] hover:bg-[#F1F5F9]"
                }`}
              >
                General Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "pricing"
                    ? "bg-[#063247] text-white"
                    : "text-[#4C606E] hover:bg-[#F1F5F9]"
                }`}
              >
                Rates &amp; Pricing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("photos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "photos"
                    ? "bg-[#063247] text-white"
                    : "text-[#4C606E] hover:bg-[#F1F5F9]"
                }`}
              >
                Photos &amp; Description
              </button>
            </div>
          </DialogHeader>

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 min-h-[300px]">
            {/* ── TAB 1: GENERAL DETAILS ── */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#063247]">Car Model Title *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Maruti Suzuki Swift"
                      className="h-10 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-[#063247]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#063247]">Subtitle / Short Tagline</Label>
                    <Input
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      placeholder="e.g. Nimble city hatch — ideal for Goa lanes"
                      className="h-10 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-[#063247]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#063247]">Reg Plate *</Label>
                    <Input
                      value={form.reg_no}
                      onChange={(e) => setForm({ ...form, reg_no: e.target.value })}
                      placeholder="GA01-XX-1234"
                      className="h-10 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-[#063247] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#063247]">Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(val) => setForm({ ...form, category: val })}
                    >
                      <SelectTrigger className="h-10 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-[#063247]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                        {CATEGORIES.filter((c) => c !== "All").map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#063247]">Seats Capacity</Label>
                    <Input
                      type="number"
                      min={2}
                      max={9}
                      value={form.seating}
                      onChange={(e) => setForm({ ...form, seating: parseInt(e.target.value, 10) || 5 })}
                      className="h-10 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-[#063247] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#063247]">Fuel Type</Label>
                    <Select
                      value={form.fuel_type}
                      onValueChange={(val) => setForm({ ...form, fuel_type: val })}
                    >
                      <SelectTrigger className="h-10 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-[#063247]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                        {FUELS.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#063247]">Transmission Type</Label>
                    <Select
                      value={form.transmission}
                      onValueChange={(val) => setForm({ ...form, transmission: val })}
                    >
                      <SelectTrigger className="h-10 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-[#063247]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                        {TRANS_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-[#063247]">Live Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(val) => setForm({ ...form, status: val })}
                    >
                      <SelectTrigger className="h-10 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl text-[#063247]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] rounded-xl text-xs">
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: PRICING & RATES ── */}
            {activeTab === "pricing" && (
              <div className="space-y-4">
                {/* Tour Package Rates */}
                <div className="p-4 bg-[#F8FAFC] border border-[#DFE8EC] rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#063247]">
                    <Compass size={15} className="text-[#2A8FA8]" />
                    <span>Tour &amp; Driver Package Rates</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-[#4C606E]">Tour Rate 8h / 80km (₹) *</Label>
                      <Input
                        type="number"
                        value={form.daily_rate}
                        onChange={(e) => setForm({ ...form, daily_rate: Number(e.target.value) })}
                        className="h-10 text-xs bg-white border-[#DFE8EC] rounded-xl font-mono text-[#063247]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-[#4C606E]">Airport Transfer Rate (₹)</Label>
                      <Input
                        type="number"
                        value={form.airport_rate}
                        onChange={(e) => setForm({ ...form, airport_rate: Number(e.target.value) })}
                        className="h-10 text-xs bg-white border-[#DFE8EC] rounded-xl font-mono text-[#063247]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: PHOTOS & DESCRIPTION ── */}
            {activeTab === "photos" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#063247]">Vehicle Photo Gallery</Label>
                  
                  {/* Photo Thumbnails */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {(form.images || []).map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-xl overflow-hidden border border-[#DFE8EC] bg-[#F1F5F9] group/img"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                          title="Remove photo"
                        >
                          <X size={11} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-[#063247] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            Cover Photo
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Upload & Add URL */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <label className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-[#E4F2F5] hover:bg-[#C3E7FA] text-[#2A8FA8] text-xs font-bold cursor-pointer transition-colors shrink-0">
                      <Upload size={13} />
                      <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>

                    <div className="flex flex-1 gap-1.5">
                      <Input
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="h-9 text-xs bg-[#F8FAFC] border-[#DFE8EC] rounded-xl"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={addDirectPhotoUrl}
                        className="h-9 px-3 bg-[#063247] hover:bg-[#063247]/90 text-white rounded-xl text-xs font-bold shrink-0"
                      >
                        Add URL
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1 pt-2">
                  <Label className="text-xs font-bold text-[#063247]">Description &amp; Highlights</Label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Comfortable AC vehicle with sanitized seats, power steering, dual airbags, Bluetooth audio..."
                    className="w-full text-xs p-3 bg-[#F8FAFC] border border-[#DFE8EC] rounded-xl text-[#063247] outline-none focus:border-[#2A8FA8] focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <DialogFooter className="px-6 py-4 border-t border-[#DFE8EC] shrink-0 bg-white flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl text-xs font-semibold text-[#8496A2] hover:text-[#063247] hover:bg-[#F1F5F9]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-[#063247] hover:bg-[#063247]/90 text-white font-semibold text-xs rounded-xl px-5 h-9 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>{editing ? "Save Changes" : "Create Vehicle"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={executeDelete}
        title="Delete Vehicle"
        description="Are you sure you want to remove this vehicle from the fleet? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}
