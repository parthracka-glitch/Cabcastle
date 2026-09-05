import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Bell, CheckCheck, Clock, ClipboardList, Car, Ticket,
  MessageSquare, Trash2, CheckCircle2, RefreshCw, AlertCircle,
  ExternalLink, Sparkles, Volume2, VolumeX, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import api, { formatINR } from "@/lib/api";
import { format } from "date-fns";

// Web Audio API notification chime generator (zero external asset dependency)
function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("ccg_notif_sound") !== "false";
  });

  const knownIdsRef = useRef(new Set());
  const initialLoadRef = useRef(true);

  // Toggle audio chime
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("ccg_notif_sound", String(next));
    if (next) {
      playChime();
      toast.info("Notification chimes enabled");
    } else {
      toast.info("Notification chimes muted");
    }
  };

  const fetchLiveNotifications = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem("ccg_read_notifs") || "[]"));
      const dismissedIds = new Set(JSON.parse(localStorage.getItem("ccg_dismissed_notifs") || "[]"));

      const [resBookings, resEnquiries, resVehicles] = await Promise.allSettled([
        api.get("/admin/bookings", { params: { limit: 20 } }),
        api.get("/admin/enquiries", { params: { limit: 15 } }),
        api.get("/vehicles"),
      ]);

      const items = [];
      const newIncomingAlerts = [];

      // 1. Process Live Customer Bookings & Dispatch Status Changes
      if (resBookings.status === "fulfilled" && Array.isArray(resBookings.value.data)) {
        resBookings.value.data.slice(0, 15).forEach((b) => {
          const id = `booking-${b.id || b.booking_no || b._id}`;
          const isKnown = knownIdsRef.current.has(id);
          
          if (!isKnown && !initialLoadRef.current && !dismissedIds.has(id)) {
            newIncomingAlerts.push({
              title: `New Booking #${b.booking_no || "Live"}`,
              desc: `${b.customer?.name || b.customer_name || "Customer"} · ${b.vehicle_snapshot?.title || "Car"} (₹${b.total_amount || 0})`,
              link: "/admin/bookings",
            });
          }
          knownIdsRef.current.add(id);

          if (!dismissedIds.has(id)) {
            const isConfirmed = b.status === "Confirmed";
            const isCompleted = b.status === "Completed";
            const isCancelled = b.status === "Cancelled";

            items.push({
              id,
              rawDate: b.created_at || new Date().toISOString(),
              title: `Booking #${b.booking_no || b.id || "CCG-LIVE"}`,
              message: `${b.customer?.name || b.customer_name || "Customer"} reserved ${b.vehicle_snapshot?.title || b.vehicle_title || "Tour Vehicle"} · ${b.service_type === "transfer" ? "Airport Transfer" : "Sightseeing Tour"} (${b.status || "Confirmed"})`,
              time: b.created_at ? format(new Date(b.created_at), "dd MMM, HH:mm") : "Just now",
              read: readIds.has(id),
              category: "bookings",
              link: "/admin/bookings",
              icon: ClipboardList,
              statusBadge: b.status || "Confirmed",
              color: isCancelled
                ? "text-[#7C1F31] bg-[#7C1F31]/10 border-[#7C1F31]/20"
                : isCompleted
                ? "text-[#245339] bg-[#DEEDE4] border-[#69A481]/30"
                : "text-[#1B2922] bg-[#E7EDEB] border-[#CBD8D4]",
            });
          }
        });
      }

      // 2. Process Real Lead Enquiries
      if (resEnquiries.status === "fulfilled" && Array.isArray(resEnquiries.value.data)) {
        resEnquiries.value.data.slice(0, 10).forEach((e) => {
          const id = `enquiry-${e.id || e._id}`;
          const isKnown = knownIdsRef.current.has(id);

          if (!isKnown && !initialLoadRef.current && !dismissedIds.has(id)) {
            newIncomingAlerts.push({
              title: `New Lead: ${e.name || e.customer_name || "Guest"}`,
              desc: `${e.car_model_interested || "Rental inquiry"} · ${e.phone || ""}`,
              link: "/admin",
            });
          }
          knownIdsRef.current.add(id);

          if (!dismissedIds.has(id)) {
            items.push({
              id,
              rawDate: e.created_at || new Date().toISOString(),
              title: `Inquiry: ${e.name || e.customer_name || "New Lead"}`,
              message: `Requested ${e.car_model_interested || "Goa Cab"} · ${e.message || "Awaiting dispatch contact"}`,
              time: e.created_at ? format(new Date(e.created_at), "dd MMM, HH:mm") : "Recent",
              read: readIds.has(id),
              category: "enquiries",
              link: "/admin",
              icon: MessageSquare,
              statusBadge: e.status || "New",
              color: "text-[#245339] bg-[#DEEDE4] border-[#69A481]/30",
            });
          }
        });
      }

      // 3. Process Live Fleet Vehicle Statuses
      if (resVehicles.status === "fulfilled" && Array.isArray(resVehicles.value.data)) {
        resVehicles.value.data
          .filter((v) => v.status !== "Available")
          .slice(0, 6)
          .forEach((v) => {
            const id = `fleet-${v.id}-${v.status}`;
            if (!dismissedIds.has(id)) {
              items.push({
                id,
                rawDate: new Date().toISOString(),
                title: `Fleet Alert: ${v.title}`,
                message: `${v.reg_no || v.title} is currently marked as ${v.status}.`,
                time: "Live Fleet",
                read: readIds.has(id),
                category: "fleet",
                link: "/admin/fleet",
                icon: Car,
                statusBadge: v.status,
                color: v.status === "Booked"
                  ? "text-[#69A481] bg-[#DEEDE4] border-[#69A481]/30"
                  : "text-[#7C1F31] bg-[#7C1F31]/10 border-[#7C1F31]/20",
              });
            }
          });
      }

      // Sort chronological (most recent first)
      items.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
      setNotifications(items);

      // Trigger live in-app toast & sound alert if new live activities occurred during polling
      if (newIncomingAlerts.length > 0) {
        if (soundEnabled) playChime();
        newIncomingAlerts.slice(0, 2).forEach((alert) => {
          toast(alert.title, {
            description: alert.desc,
            action: {
              label: "View",
              onClick: () => navigate(alert.link),
            },
          });
        });
      }

      if (initialLoadRef.current) {
        initialLoadRef.current = false;
      }
    } catch (err) {
      console.error("Live notification polling error:", err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [navigate, soundEnabled]);

  // Live real-time polling every 12 seconds
  useEffect(() => {
    fetchLiveNotifications(false);
    const interval = setInterval(() => {
      fetchLiveNotifications(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchLiveNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    return n.category === activeFilter;
  });

  function markAllRead() {
    setNotifications((prev) => {
      const readIds = new Set(JSON.parse(localStorage.getItem("ccg_read_notifs") || "[]"));
      prev.forEach((n) => readIds.add(n.id));
      localStorage.setItem("ccg_read_notifs", JSON.stringify(Array.from(readIds)));
      return prev.map((n) => ({ ...n, read: true }));
    });
    toast.success("All notifications marked as read");
  }

  function toggleRead(id, e) {
    e.stopPropagation();
    setNotifications((prev) => {
      const readIds = new Set(JSON.parse(localStorage.getItem("ccg_read_notifs") || "[]"));
      const next = prev.map((n) => {
        if (n.id === id) {
          const newRead = !n.read;
          if (newRead) readIds.add(id);
          else readIds.delete(id);
          return { ...n, read: newRead };
        }
        return n;
      });
      localStorage.setItem("ccg_read_notifs", JSON.stringify(Array.from(readIds)));
      return next;
    });
  }

  function deleteNotification(id, e) {
    e.stopPropagation();
    const dismissedIds = new Set(JSON.parse(localStorage.getItem("ccg_dismissed_notifs") || "[]"));
    dismissedIds.add(id);
    localStorage.setItem("ccg_dismissed_notifs", JSON.stringify(Array.from(dismissedIds)));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function clearAll() {
    const dismissedIds = new Set(JSON.parse(localStorage.getItem("ccg_dismissed_notifs") || "[]"));
    notifications.forEach((n) => dismissedIds.add(n.id));
    localStorage.setItem("ccg_dismissed_notifs", JSON.stringify(Array.from(dismissedIds)));
    setNotifications([]);
    toast.success("Notification center cleared");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2.5 rounded-full bg-white hover:bg-[#DEEDE4] border border-[#CBD8D4] text-[#1B2922] transition-all cursor-pointer shadow-xs group"
          title="Live In-App Notifications & Dispatch Feed"
          data-testid="admin-notifications-btn"
        >
          <Bell size={16} className="group-hover:rotate-12 transition-transform text-[#1B2922]" />
          
          {/* Pulsing Live Unread Counter */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C1F31] opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#7C1F31] text-[9px] font-mono font-black text-white items-center justify-center shadow-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] sm:w-[420px] p-0 bg-white border border-[#CBD8D4] rounded-3xl shadow-2xl overflow-hidden font-body text-[#1B2922] z-50 animate-fadeIn"
      >
        {/* Popover Header */}
        <div className="p-4 bg-[#E7EDEB] border-b border-[#CBD8D4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#7C1F31] text-white flex items-center justify-center shadow-xs">
              <Bell size={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm text-[#1B2922]">Live Notifications</h3>
                {unreadCount > 0 && (
                  <Badge className="bg-[#7C1F31] text-white font-mono text-[9px] px-2 py-0.2 rounded-full font-bold">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-[#4D6257] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 12s Dispatch Sync
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Chime Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute notification chimes" : "Enable notification chimes"}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled
                  ? "bg-white border-[#CBD8D4] text-[#245339] hover:bg-[#DEEDE4]"
                  : "bg-[#E7EDEB] border-transparent text-[#6C8277] hover:text-[#1B2922]"
              }`}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchLiveNotifications(false)}
              title="Refresh live activity"
              className="p-1.5 rounded-lg bg-white border border-[#CBD8D4] text-[#1B2922] hover:bg-[#DEEDE4] transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>

            {/* Mark All Read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                title="Mark all as read"
                className="p-1.5 px-2.5 rounded-lg bg-white border border-[#CBD8D4] text-[#7C1F31] hover:bg-[#7C1F31] hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <CheckCheck size={12} />
                <span>Read all</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-2 bg-[#F6F5FA] border-b border-[#CBD8D4] overflow-x-auto text-[11px] font-bold">
          {[
            { id: "all", label: "All Activity" },
            { id: "bookings", label: "Bookings" },
            { id: "enquiries", label: "Leads" },
            { id: "fleet", label: "Fleet" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer shrink-0 ${
                activeFilter === tab.id
                  ? "bg-[#7C1F31] text-white shadow-xs"
                  : "text-[#4D6257] hover:bg-[#E7EDEB] hover:text-[#1B2922]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications Stream */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#CBD8D4]/60 no-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-[#4D6257] font-mono text-xs">
              <RefreshCw size={22} className="animate-spin mx-auto text-[#69A481] mb-2" />
              Syncing live system activity...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-[#69A481]" />
              <p className="font-bold text-xs text-[#1B2922]">No notifications</p>
              <p className="text-[11px] text-[#4D6257]">You are completely up-to-date with live dispatch.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const IconComponent = n.icon;
              return (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-[#DEEDE4]/40 ${
                    !n.read ? "bg-[#DEEDE4]/20" : "opacity-80"
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${n.color}`}>
                    <IconComponent size={14} />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={n.link}
                      onClick={() => {
                        setNotifications((prev) => {
                          const readIds = new Set(JSON.parse(localStorage.getItem("ccg_read_notifs") || "[]"));
                          readIds.add(n.id);
                          localStorage.setItem("ccg_read_notifs", JSON.stringify(Array.from(readIds)));
                          return prev.map((item) => (item.id === n.id ? { ...item, read: true } : item));
                        });
                        setOpen(false);
                      }}
                      className="block group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#1B2922] group-hover:text-[#7C1F31] transition-colors truncate">
                          {n.title}
                        </span>
                        <span className="text-[9.5px] text-[#6C8277] shrink-0 flex items-center gap-1 font-mono">
                          <Clock size={9} /> {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4D6257] mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => toggleRead(n.id, e)}
                      title={n.read ? "Mark as unread" : "Mark as read"}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        n.read ? "text-[#6C8277] hover:text-[#1B2922]" : "text-[#69A481] hover:text-[#245339]"
                      }`}
                    >
                      <CheckCheck size={13} />
                    </button>
                    <button
                      onClick={(e) => deleteNotification(n.id, e)}
                      title="Dismiss notification"
                      className="p-1 text-[#6C8277] hover:text-[#7C1F31] transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Popover Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-[#E7EDEB] border-t border-[#CBD8D4] flex items-center justify-between text-xs">
            <button
              onClick={clearAll}
              className="text-[11px] text-[#7C1F31] hover:underline font-bold cursor-pointer"
            >
              Clear all
            </button>
            <Link
              to="/admin/bookings"
              onClick={() => setOpen(false)}
              className="text-[11px] text-[#1B2922] font-bold hover:text-[#7C1F31] flex items-center gap-1"
            >
              <span>Manage all dispatches</span>
              <ExternalLink size={10} />
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
