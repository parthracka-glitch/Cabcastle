/* Coastal Cabs Goa Design System */
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, ExternalLink, Ticket, AlertCircle, Loader2, ShieldCheck, Car } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import api, { formatINR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function MyBookingsModal({ open, onOpenChange }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!open) return;
    const savedEmail = user?.email || localStorage.getItem("ccg_customer_email") || "";
    if (savedEmail) {
      setQuery(savedEmail);
      fetchBookings(savedEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const fetchBookings = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q || q.trim().length < 3) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/customer/bookings/search?q=${encodeURIComponent(q.trim())}`);
      setBookings(data);
      if (q.includes("@")) {
        localStorage.setItem("ccg_customer_email", q.trim());
      }
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#F7F7F7] text-[#063247] border border-[#DFE8EC] rounded-[24px] p-6 sm:p-8 font-body" data-testid="my-bookings-modal">
        <DialogHeader className="mb-4 text-left">
          <DialogTitle className="font-display text-xl sm:text-2xl font-extrabold text-[#063247] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#063247] p-1 border border-[#DFE8EC] flex items-center justify-center shrink-0">
              <Car size={20} className="text-[#2A8FA8]" />
            </div>
            Customer Profile &amp; My Bookings
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#4C606E] mt-1 font-normal">
            View your verified profile details and cab rental history.
          </DialogDescription>
        </DialogHeader>

        {/* Logged-In User Profile Card */}
        {user && (
          <div className="bg-white border border-[#DFE8EC] rounded-[18px] p-4 mb-4 flex items-center justify-between gap-4 shadow-sm" data-testid="logged-in-profile-card">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[#DFE8EC] shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#063247] text-white flex items-center justify-center font-display font-bold text-sm shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div>
                <div className="font-display font-bold text-[#063247] text-sm sm:text-base leading-tight">{user.name || "Customer Account"}</div>
                <div className="text-xs text-[#4C606E] mt-0.5">{user.email} {user.phone ? `· ${user.phone}` : ""}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#2A8FA8] bg-[#E4F2F5] px-3 py-1 rounded-full shrink-0">
              <ShieldCheck size={12} />
              <span>Verified</span>
            </div>
          </div>
        )}

        {/* Search Bar Input */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8496A2]" />
            <Input
              type="text"
              placeholder="Enter email address, phone number, or booking reference"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 rounded-full bg-white border-[#DFE8EC] text-[#063247] font-body text-xs font-normal focus-visible:ring-1 focus-visible:ring-[#2A8FA8]"
              data-testid="profile-booking-search-input"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-[#2A8FA8] hover:bg-[#22768C] text-white rounded-full px-6 h-11 uppercase tracking-wider text-xs font-bold shadow-sm cursor-pointer"
            data-testid="profile-booking-search-btn"
          >
            {loading ? <Loader2 size={14} className="animate-spin text-white" /> : "Search"}
          </Button>
        </form>

        {/* Results Display */}
        <div className="space-y-3">
          {loading && (
            <div className="py-10 text-center text-[#4C606E] flex flex-col items-center gap-2">
              <Loader2 size={22} className="animate-spin text-[#2A8FA8]" />
              <span className="text-xs uppercase tracking-wider font-normal">Finding your bookings…</span>
            </div>
          )}

          {!loading && searched && bookings.length === 0 && (
            <div className="py-8 text-center bg-white border border-[#DFE8EC] rounded-[20px] p-6 shadow-sm">
              <AlertCircle size={24} className="mx-auto text-[#063247] mb-2 opacity-80" />
              <div className="font-display font-bold text-[#063247] text-sm">No Bookings Found</div>
              <p className="text-xs mt-1 max-w-sm mx-auto text-[#4C606E]">
                We couldn't find any active or past rentals matching "{query}". Please double-check your email or booking ID.
              </p>
            </div>
          )}

          {!loading && bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-[#DFE8EC] rounded-[20px] p-5 shadow-sm hover:border-[#2A8FA8] transition-all relative overflow-hidden text-left"
              data-testid={`profile-booking-item-${b.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFE8EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F7F7F7] text-[#063247] flex items-center justify-center font-bold text-xs border border-[#DFE8EC]">
                    <Ticket size={14} />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[#8496A2] font-bold">Booking Ref</div>
                    <div className="font-mono text-xs font-bold text-[#063247]">{b.booking_no || b.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                      b.status === "Confirmed"
                        ? "bg-[#E4F2F5] text-[#2A8FA8]"
                        : b.status === "Completed"
                        ? "bg-[#063247] text-white"
                        : "bg-[#C3E7FA] text-[#063247]"
                    }`}
                  >
                    {b.status}
                  </span>
                  <Link
                    to={`/booking-success/${b.id}`}
                    onClick={() => onOpenChange(false)}
                    className="p-1.5 rounded-full bg-[#F7F7F7] hover:bg-[#063247] hover:text-white transition-colors text-[#063247] text-xs flex items-center gap-1 border border-[#DFE8EC]"
                    title="View Receipt"
                  >
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              {/* Booking Vehicle & Details */}
              <div className="py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {b.vehicle?.image_url && (
                  <img
                    src={b.vehicle.image_url}
                    alt={b.vehicle.title}
                    className="w-20 h-14 rounded-[12px] object-cover border border-[#DFE8EC] flex-shrink-0 bg-[#F7F7F7]"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <h4 className="font-display text-sm font-bold text-[#063247]">
                    {b.vehicle?.title || "Cab Castle Vehicle"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#4C606E] font-normal">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-[#2A8FA8]" />
                      {b.start_date ? format(new Date(b.start_date), "dd MMM yyyy") : ""} — {b.end_date ? format(new Date(b.end_date), "dd MMM yyyy") : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-[#2A8FA8]" />
                      {b.pickup_location}
                    </span>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <div className="text-[9px] uppercase tracking-wider text-[#8496A2] font-medium">Total Paid</div>
                  <div className="font-display text-base font-bold text-[#063247]">
                    {formatINR(b.total_amount || b.amount)}
                  </div>
                </div>
              </div>

              {/* Customer Info Footer */}
              <div className="pt-2 border-t border-[#DFE8EC] flex items-center justify-between text-xs text-[#4C606E] font-normal">
                <div>Customer: <strong className="text-[#063247] font-bold">{b.customer?.name}</strong> ({b.customer?.phone})</div>
                <div className="text-[#063247] font-bold text-[11px]">Payment: {b.payment_status || "Paid"}</div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
