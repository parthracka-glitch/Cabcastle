import React from "react";
import api, { API, formatApiError, formatINR, safeFormatDate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, MoreHorizontal, RotateCcw, ClipboardList, MessageSquare } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import OfflineBookingModal from "../components/OfflineBookingModal";
import ConfirmModal from "../components/common/ConfirmModal";
import RefundModal from "../components/RefundModal";
import { WhatsAppBookingModal } from "@/components/common/WhatsAppBookingModal";

const STATUSES = ["Confirmed", "Completed", "Cancelled"];

// Memoized Booking Row
const BookingRow = React.memo(function BookingRow({
  b,
  changeStatus,
  setCancelTargetId,
  setCancelModalOpen,
  onOpenRefund,
  onOpenWhatsApp,
}) {
  if (!b) return null;

  return (
    <TableRow className="border-[#DFE8EC] hover:bg-[#F8FAFC]/80 transition-colors group" data-testid={`booking-row-${b.id}`}>
      <TableCell className="whitespace-nowrap py-3.5 px-4">
        <div className="font-mono text-xs font-bold text-[#0E7490]">{b.booking_no || "DHG-BOOKING"}</div>
        <div className="text-[10px] text-[#5A7184] font-normal mt-0.5">{safeFormatDate(b.created_at, "dd MMM · HH:mm", "Recent")}</div>
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 px-3">
        <div className="font-bold text-xs text-[#063247]">{b.customer?.name || "Customer"}</div>
        <div className="text-[11px] text-[#5A7184] font-mono mt-0.5">{b.customer?.phone || "—"}</div>
      </TableCell>
      <TableCell className="text-xs font-semibold text-[#063247] whitespace-nowrap py-3.5 px-3">
        {b.vehicle_snapshot?.title || "Self-Drive Vehicle"}
      </TableCell>
      <TableCell className="text-xs text-[#5A7184] font-mono whitespace-nowrap py-3.5 px-3">
        <div className="text-[#063247] font-medium">{safeFormatDate(b.start_date, "dd MMM")} → {safeFormatDate(b.end_date, "dd MMM")}</div>
        <span className="text-[10px] text-[#5A7184]">{b.days || 1} day(s)</span>
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 px-3">
        <div className="font-bold text-xs text-[#063247]">{formatINR(b.total_amount)}</div>
        <div className="mt-0.5">
          <span className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-semibold ${
            b.payment_status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : b.payment_status === "Refunded" ? "bg-amber-50 text-amber-700 border border-amber-200"
            : "bg-[#F1F5F9] text-[#5A7184] border border-[#DFE8EC]"
          }`}>
            {b.payment_status || "Pending"}
          </span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 px-3">
        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
          b.source === "Offline" ? "bg-[#F1F5F9] text-[#063247] border border-[#DFE8EC]" : "bg-[#E4F2F5] text-[#0E7490] border border-[#C3E7FA]"
        }`}>
          {b.source || "Online"}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 px-3">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
          b.status === "Confirmed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : b.status === "Completed" ? "bg-[#063247] text-white"
          : "bg-rose-50 text-rose-700 border border-rose-200"
        }`}>
          {b.status || "Pending"}
        </span>
      </TableCell>
      <TableCell className="text-right whitespace-nowrap py-3.5 pr-4 pl-2">
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenWhatsApp(b)}
            className="h-8 px-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer rounded-lg inline-flex items-center gap-1 font-bold text-xs"
            title="Send WhatsApp Reminder / Dispatch Notice"
            data-testid={`whatsapp-btn-${b.id}`}
          >
            <MessageSquare size={14} className="fill-emerald-600/30 text-emerald-600" />
            <span className="hidden xl:inline">WhatsApp</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#5A7184] hover:text-[#063247] hover:bg-[#F8FAFC] cursor-pointer rounded-lg" data-testid={`booking-actions-${b.id}`}>
                <MoreHorizontal size={15}/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-[#DFE8EC] text-[#063247] text-xs shadow-xl rounded-xl p-1.5 min-w-[180px]">
              <DropdownMenuItem onClick={() => onOpenWhatsApp(b)} className="hover:bg-emerald-50 text-emerald-700 cursor-pointer rounded-lg font-semibold flex items-center gap-1.5">
                <MessageSquare size={13} className="text-emerald-600" /> WhatsApp Dispatch
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#DFE8EC]"/>
              <DropdownMenuItem asChild className="hover:bg-[#F8FAFC] cursor-pointer rounded-lg font-semibold">
                <a href={`${API}/bookings/${b.id}/invoice`} target="_blank" rel="noreferrer" data-testid={`invoice-${b.id}`}>Download Invoice</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#DFE8EC]"/>
              <DropdownMenuItem onClick={() => changeStatus(b.id, "Confirmed")} className="hover:bg-[#F8FAFC] cursor-pointer rounded-lg font-semibold">Mark Confirmed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeStatus(b.id, "Completed")} className="hover:bg-[#F8FAFC] cursor-pointer rounded-lg font-semibold">Mark Completed</DropdownMenuItem>
              {b.payment_status === "Paid" && b.status !== "Cancelled" && (
                <DropdownMenuItem onClick={() => onOpenRefund(b)} className="hover:bg-amber-50 text-amber-700 cursor-pointer rounded-lg font-semibold flex items-center gap-1.5">
                  <RotateCcw size={12} /> Process Refund
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => { setCancelTargetId(b.id); setCancelModalOpen(true); }} className="hover:bg-rose-50 text-rose-700 cursor-pointer rounded-lg font-semibold">
                Cancel Booking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
});

export default function BookingsManage() {
  const [items, setItems] = React.useState([]);
  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [sourceFilter, setSourceFilter] = React.useState("All");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const [cancelTargetId, setCancelTargetId] = React.useState(null);
  const [cancelling, setCancelling] = React.useState(false);

  // Refund Modal State
  const [refundModalOpen, setRefundModalOpen] = React.useState(false);
  const [refundTargetBooking, setRefundTargetBooking] = React.useState(null);
  const [refunding, setRefunding] = React.useState(false);

  // WhatsApp Modal State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = React.useState(false);
  const [whatsAppTargetBooking, setWhatsAppTargetBooking] = React.useState(null);

  const load = React.useCallback((showSpinner = false) => {
    if (showSpinner) setLoading(true);
    api
      .get("/admin/bookings", {
        params: {
          q: q || undefined,
          status: statusFilter === "All" ? undefined : statusFilter,
          source: sourceFilter === "All" ? undefined : sourceFilter,
        },
      })
      .then(({ data }) => setItems(data))
      .catch((e) => toast.error(formatApiError(e)))
      .finally(() => setLoading(false));
  }, [q, statusFilter, sourceFilter]);

  React.useEffect(() => {
    load(true);
  }, [load]);

  async function changeStatus(id, status) {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      toast.success(`Marked ${status}`);
      load(false);
    } catch (e) { toast.error(formatApiError(e)); }
  }

  async function handleRefund({ amount, reason }) {
    if (!refundTargetBooking) return;
    setRefunding(true);
    try {
      await api.post(`/admin/bookings/${refundTargetBooking.id}/refund`, { amount, reason });
      toast.success(`Refund of ₹${amount} processed successfully!`);
      setRefundModalOpen(false);
      setRefundTargetBooking(null);
      load(false);
    } catch (e) {
      toast.error(formatApiError(e) || "Refund failed");
    } finally {
      setRefunding(false);
    }
  }

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-8 font-body text-[#063247] text-left">
      {/* ── HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[#063247] tracking-tight">
              Bookings Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4F2F5] text-[#0E7490] border border-[#C3E7FA]">
              {items.length} Bookings
            </span>
          </div>
          <p className="text-xs text-[#4C606E] mt-1 font-normal">
            Real-time customer reservations, online payments, security deposits & dispatch status.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <a href={`${API}/admin/export/excel`} target="_blank" rel="noreferrer">
            <Button variant="outline" className="h-9 px-3 rounded-xl text-xs font-semibold text-[#063247] bg-white border-[#DFE8EC] hover:bg-[#F8FAFC] flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <Download size={13} className="text-[#0E7490]"/> Excel
            </Button>
          </a>
          <a href={`${API}/admin/export/pdf`} target="_blank" rel="noreferrer">
            <Button variant="outline" className="h-9 px-3 rounded-xl text-xs font-semibold text-[#063247] bg-white border-[#DFE8EC] hover:bg-[#F8FAFC] flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <Download size={13} className="text-[#063247]"/> PDF
            </Button>
          </a>
          <Button onClick={() => setOpen(true)} className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#063247] hover:bg-[#063247]/90 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 shrink-0" data-testid="add-offline-btn">
            <Plus size={14} className="font-bold stroke-[2.5]" />
            <span>New Booking</span>
          </Button>
        </div>
      </div>

      {/* ── SEARCH & FILTER TOOLBAR ── */}
      <div className="bg-white border border-[#DFE8EC] rounded-2xl p-3 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"/>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking #, customer, or phone..." className="pl-9.5 h-9 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs rounded-xl focus:border-[#063247] focus:bg-white" data-testid="bookings-search"/>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs font-medium rounded-xl" data-testid="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] text-xs rounded-xl shadow-lg">
                <SelectItem value="All">All Statuses</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-32 h-9 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs font-medium rounded-xl" data-testid="filter-source">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] text-xs rounded-xl shadow-lg">
                <SelectItem value="All">All Sources</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="rounded-2xl border border-[#DFE8EC] bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse min-w-[750px]">
            <TableHeader>
              <tr className="bg-[#F8FAFC] border-b border-[#DFE8EC] text-[11px] font-bold text-[#4C606E] uppercase tracking-wider">
                <th className="py-3 px-4">Booking #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Rental Dates</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </TableHeader>
            <TableBody className="divide-y divide-[#DFE8EC]">
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center text-[#5A7184] py-12 text-xs font-medium">Loading bookings...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-[#5A7184] py-12 text-xs font-medium" data-testid="no-bookings">No bookings found matching filters</TableCell></TableRow>
              ) : items.map((b) => (
                <BookingRow
                  key={b.id}
                  b={b}
                  changeStatus={changeStatus}
                  setCancelTargetId={setCancelTargetId}
                  setCancelModalOpen={setCancelModalOpen}
                  onOpenRefund={(booking) => {
                    setRefundTargetBooking(booking);
                    setRefundModalOpen(true);
                  }}
                  onOpenWhatsApp={(booking) => {
                    setWhatsAppTargetBooking(booking);
                    setWhatsAppModalOpen(true);
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <OfflineBookingModal open={open} onOpenChange={setOpen} onSuccess={load} />

      <WhatsAppBookingModal
        isOpen={whatsAppModalOpen}
        onClose={() => {
          setWhatsAppModalOpen(false);
          setWhatsAppTargetBooking(null);
        }}
        booking={whatsAppTargetBooking}
      />

      <RefundModal
        open={refundModalOpen}
        onOpenChange={setRefundModalOpen}
        booking={refundTargetBooking}
        loading={refunding}
        onConfirm={handleRefund}
      />

      <ConfirmModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        title="Cancel Customer Booking?"
        description="Are you sure you want to cancel this booking? This will release the vehicle back to active inventory."
        confirmText="Cancel Booking"
        variant="destructive"
        loading={cancelling}
        onConfirm={async () => {
          if (!cancelTargetId) return;
          setCancelling(true);
          try {
            await changeStatus(cancelTargetId, "Cancelled");
          } finally {
            setCancelling(false);
            setCancelModalOpen(false);
            setCancelTargetId(null);
          }
        }}
      />
    </div>
  );
}
