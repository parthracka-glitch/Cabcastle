import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Clock, ClipboardList, Car, Ticket, MessageSquare, Trash2, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { format } from "date-fns";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchRealNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem("dh_read_notifs") || "[]"));
      const dismissedIds = new Set(JSON.parse(localStorage.getItem("dh_dismissed_notifs") || "[]"));

      const [resBookings, resEnquiries, resCoupons, resVehicles] = await Promise.allSettled([
        api.get("/admin/bookings"),
        api.get("/admin/enquiries"),
        api.get("/admin/coupons"),
        api.get("/vehicles"),
      ]);

      const items = [];

      // 1. Real Customer Bookings
      if (resBookings.status === "fulfilled" && Array.isArray(resBookings.value.data)) {
        resBookings.value.data.slice(0, 5).forEach((b) => {
          const id = `booking-${b.id || b.booking_no}`;
          if (!dismissedIds.has(id)) {
            items.push({
              id,
              title: `Booking #${b.booking_no || b.id}`,
              message: `${b.customer_name || "Customer"} reserved ${b.vehicle_title || b.vehicle_snapshot?.title || "Vehicle"} (${b.status || "Confirmed"})`,
              time: b.created_at ? format(new Date(b.created_at), "dd MMM, HH:mm") : "Recent",
              read: readIds.has(id),
              type: "booking",
              link: "/admin/bookings",
              icon: ClipboardList,
              color: "text-[#82C4B7] bg-[#82C4B7]/15",
            });
          }
        });
      }

      // 2. Real Lead Enquiries
      if (resEnquiries.status === "fulfilled" && Array.isArray(resEnquiries.value.data)) {
        resEnquiries.value.data.slice(0, 5).forEach((e) => {
          const id = `enquiry-${e.id}`;
          if (!dismissedIds.has(id)) {
            items.push({
              id,
              title: `Lead Enquiry: ${e.status || "New"}`,
              message: `${e.customer_name || e.name || "Lead"} requested ${e.vehicle_interest || "fleet vehicle"} (${e.phone || e.email || "Contact"})`,
              time: e.created_at ? format(new Date(e.created_at), "dd MMM, HH:mm") : "Recent",
              read: readIds.has(id),
              type: "lead",
              link: "/admin",
              icon: MessageSquare,
              color: "text-[#82C4B7] bg-[#82C4B7]/15",
            });
          }
        });
      }

      // 3. Real Promo Coupons
      if (resCoupons.status === "fulfilled" && Array.isArray(resCoupons.value.data)) {
        resCoupons.value.data.slice(0, 3).forEach((c) => {
          const id = `coupon-${c.id || c.code}`;
          if (!dismissedIds.has(id)) {
            items.push({
              id,
              title: `Promo Code: ${c.code}`,
              message: `Discount code ${c.code} (${c.discount_pct}% OFF) is ${c.active ? "active" : "expired"}.`,
              time: "System",
              read: readIds.has(id),
              type: "coupon",
              link: "/admin/coupons",
              icon: Ticket,
              color: "text-[#82C4B7] bg-[#82C4B7]/15",
            });
          }
        });
      }

      // 4. Real Fleet Vehicle Statuses
      if (resVehicles.status === "fulfilled" && Array.isArray(resVehicles.value.data)) {
        resVehicles.value.data.filter((v) => v.status !== "Available").slice(0, 3).forEach((v) => {
          const id = `fleet-${v.id}`;
          if (!dismissedIds.has(id)) {
            items.push({
              id,
              title: `Fleet Status: ${v.status}`,
              message: `${v.title} (${v.reg_no}) is currently tagged as ${v.status}.`,
              time: "Live Fleet",
              read: readIds.has(id),
              type: "fleet",
              link: "/admin/fleet",
              icon: Car,
              color: v.status === "Booked" ? "text-[#82C4B7] bg-[#82C4B7]/15" : "text-[#E8826B] bg-[#E8826B]/15",
            });
          }
        });
      }

      setNotifications(items);
    } catch (err) {
      console.error("Failed to fetch real project notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealNotifications();
  }, [fetchRealNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => {
      const readIds = new Set(JSON.parse(localStorage.getItem("dh_read_notifs") || "[]"));
      prev.forEach((n) => readIds.add(n.id));
      localStorage.setItem("dh_read_notifs", JSON.stringify(Array.from(readIds)));
      return prev.map((n) => ({ ...n, read: true }));
    });
    toast.success("All notifications marked as read");
  }

  function toggleRead(id, e) {
    e.stopPropagation();
    setNotifications((prev) => {
      const readIds = new Set(JSON.parse(localStorage.getItem("dh_read_notifs") || "[]"));
      const next = prev.map((n) => {
        if (n.id === id) {
          const newRead = !n.read;
          if (newRead) readIds.add(id);
          else readIds.delete(id);
          return { ...n, read: newRead };
        }
        return n;
      });
      localStorage.setItem("dh_read_notifs", JSON.stringify(Array.from(readIds)));
      return next;
    });
  }

  function deleteNotification(id, e) {
    e.stopPropagation();
    const dismissedIds = new Set(JSON.parse(localStorage.getItem("dh_dismissed_notifs") || "[]"));
    dismissedIds.add(id);
    localStorage.setItem("dh_dismissed_notifs", JSON.stringify(Array.from(dismissedIds)));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function clearAll() {
    const dismissedIds = new Set(JSON.parse(localStorage.getItem("dh_dismissed_notifs") || "[]"));
    notifications.forEach((n) => dismissedIds.add(n.id));
    localStorage.setItem("dh_dismissed_notifs", JSON.stringify(Array.from(dismissedIds)));
    setNotifications([]);
    toast.success("Notification center cleared");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2.5 rounded-full bg-[#FFFFFF] hover:bg-white border border-[#DFDCE8] text-[#212121] transition-all cursor-pointer shadow-xs group"
          title="Real System Notifications"
          data-testid="admin-notifications-btn"
        >
          <Bell size={16} className="group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8826B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E8826B] text-[8px] font-mono font-bold text-white items-center justify-center">
                {unreadCount}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 bg-white border border-[#DFDCE8] rounded-3xl shadow-2xl overflow-hidden font-body text-[#212121] z-50"
      >
        {/* Popover Header */}
        <div className="p-4 bg-[#F6F5FA] border-b border-[#DFDCE8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[#82C4B7]" />
            <h3 className="font-display font-bold text-sm text-[#212121]">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-[#E8826B] text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRealNotifications}
              title="Refresh notifications"
              className="p-1 text-[#6F6E73] hover:text-[#212121] transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-mono font-bold text-[#82C4B7] hover:text-[#212121] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#DFDCE8] no-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-[#6F6E73] font-mono text-xs">
              <RefreshCw size={20} className="animate-spin mx-auto text-[#82C4B7] mb-2" />
              Loading real activity...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-[#82C4B7]" />
              <p className="font-mono text-xs font-bold text-[#212121]">All caught up!</p>
              <p className="text-[11px] text-[#6F6E73]">No unread system notifications at this time.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const IconComponent = n.icon;
              return (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-[#F6F5FA] ${
                    !n.read ? "bg-[#F6F5FA]" : "opacity-80"
                  }`}
                >
                  <div className={`p-2 rounded-2xl shrink-0 mt-0.5 ${n.color}`}>
                    <IconComponent size={15} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={n.link}
                      onClick={() => {
                        setNotifications((prev) => {
                          const readIds = new Set(JSON.parse(localStorage.getItem("dh_read_notifs") || "[]"));
                          readIds.add(n.id);
                          localStorage.setItem("dh_read_notifs", JSON.stringify(Array.from(readIds)));
                          return prev.map((item) => (item.id === n.id ? { ...item, read: true } : item));
                        });
                        setOpen(false);
                      }}
                      className="block group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#212121] group-hover:text-[#E8826B] transition-colors truncate">
                          {n.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#6F6E73] shrink-0 flex items-center gap-1">
                          <Clock size={10} /> {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6F6E73] mt-0.5 line-clamp-2">{n.message}</p>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => toggleRead(n.id, e)}
                      title={n.read ? "Mark as unread" : "Mark as read"}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        n.read ? "text-[#6F6E73] hover:text-[#212121]" : "text-[#82C4B7] hover:text-[#82C4B7]"
                      }`}
                    >
                      <CheckCheck size={13} />
                    </button>
                    <button
                      onClick={(e) => deleteNotification(n.id, e)}
                      title="Delete notification"
                      className="p-1 text-[#6F6E73] hover:text-[#E8826B] transition-colors cursor-pointer"
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
          <div className="p-3 bg-[#F6F5FA] border-t border-[#DFDCE8] flex items-center justify-between text-xs">
            <button
              onClick={clearAll}
              className="text-[11px] font-mono text-[#E8826B] hover:underline font-bold cursor-pointer"
            >
              Clear all
            </button>
            <Link
              to="/admin/bookings"
              onClick={() => setOpen(false)}
              className="text-[11px] font-mono text-[#212121] font-bold hover:underline"
            >
              View all activities →
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
