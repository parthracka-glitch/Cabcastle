import React from "react";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalIcon, Plus, Car } from "lucide-react";
import { toast } from "sonner";

const LOCATIONS = ["Candolim (Main Hub)", "Calangute", "Baga", "Dabolim Airport (GOI)", "Mopa Airport (GOX)"];

const EMPTY = {
  vehicle_id: "",
  customer: { name: "", phone: "", email: "" },
  start_date: null,
  end_date: null,
  pickup_location: "Candolim (Main Hub)",
  total_amount: 0,
  payment_method: "Cash",
  payment_status: "Paid",
  notes: "",
};

export default function OfflineBookingModal({ open, onOpenChange, onSuccess, initialData }) {
  const [vehicles, setVehicles] = React.useState([]);
  const [form, setForm] = React.useState(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      api.get("/vehicles").then(({ data }) => setVehicles(data)).catch(() => {});
      if (initialData) {
        setForm({
          ...EMPTY,
          ...initialData,
          customer: { ...EMPTY.customer, ...(initialData.customer || {}) },
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, initialData]);

  async function submitOffline() {
    if (!form.vehicle_id || !form.customer.name?.trim() || !form.customer.phone?.trim() || !form.start_date || !form.end_date) {
      toast.error("Please select vehicle, rental dates, and enter customer name & phone");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        customer_name: form.customer.name.trim(),
        customer_phone: form.customer.phone.trim(),
        customer_email: form.customer.email?.trim() || "",
        start_date: form.start_date.toISOString(),
        end_date: form.end_date.toISOString(),
      };
      await api.post("/admin/bookings/offline", payload);
      toast.success("Manual offline booking recorded successfully!");
      onOpenChange(false);
      setForm(EMPTY);
      if (onSuccess) onSuccess();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] bg-white border border-[#DFDCE8] text-[#212121] max-h-[92vh] overflow-y-auto no-scrollbar font-body rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 shadow-2xl" data-testid="offline-booking-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold flex items-center gap-2.5 text-[#212121]">
            <div className="w-8 h-8 rounded-full bg-[#82C4B7]/20 text-[#82C4B7] flex items-center justify-center">
              <Plus size={16} />
            </div>
            <span>Manual Offline Booking</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-2 text-xs font-body">
          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Vehicle</Label>
            <Select value={form.vehicle_id} onValueChange={(v) => setForm({ ...form, vehicle_id: v })}>
              <SelectTrigger className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] font-semibold rounded-xl" data-testid="off-vehicle">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFDCE8] text-[#212121] font-body">
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title} · {v.reg_no} (₹{v.daily_rate}/day)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Customer Name</Label>
            <Input
              className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] focus:bg-white focus:border-[#212121] text-[#212121] font-semibold rounded-xl"
              placeholder="Enter customer name"
              value={form.customer.name}
              onChange={(e) => setForm({ ...form, customer: { ...form.customer, name: e.target.value } })}
              data-testid="off-name"
            />
          </div>
          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Phone Number</Label>
            <Input
              className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] focus:bg-white focus:border-[#212121] text-[#212121] font-mono rounded-xl"
              placeholder="Enter phone number"
              value={form.customer.phone}
              onChange={(e) => setForm({ ...form, customer: { ...form.customer, phone: e.target.value } })}
              data-testid="off-phone"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Customer Email</Label>
            <Input
              className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] focus:bg-white focus:border-[#212121] text-[#212121] rounded-xl"
              placeholder="Enter email address"
              value={form.customer.email}
              onChange={(e) => setForm({ ...form, customer: { ...form.customer, email: e.target.value } })}
              data-testid="off-email"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full mt-1.5 flex items-center gap-2 border border-[#DFDCE8] rounded-xl px-3.5 py-2.5 bg-[#FFFFFF] text-xs font-semibold text-left text-[#212121] hover:bg-white transition-colors"
                  data-testid="off-start"
                >
                  <CalIcon size={14} className="text-[#E8826B]" />{" "}
                  {form.start_date ? format(form.start_date, "dd MMM yyyy") : "Pick date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto bg-white border border-[#DFDCE8] rounded-2xl shadow-xl">
                <Calendar mode="single" selected={form.start_date} onSelect={(d) => setForm({ ...form, start_date: d })} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full mt-1.5 flex items-center gap-2 border border-[#DFDCE8] rounded-xl px-3.5 py-2.5 bg-[#FFFFFF] text-xs font-semibold text-left text-[#212121] hover:bg-white transition-colors"
                  data-testid="off-end"
                >
                  <CalIcon size={14} className="text-[#E8826B]" />{" "}
                  {form.end_date ? format(form.end_date, "dd MMM yyyy") : "Pick date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto bg-white border border-[#DFDCE8] rounded-2xl shadow-xl">
                <Calendar mode="single" selected={form.end_date} onSelect={(d) => setForm({ ...form, end_date: d })} />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Pickup Location</Label>
            <Select value={form.pickup_location} onValueChange={(v) => setForm({ ...form, pickup_location: v })}>
              <SelectTrigger className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] font-semibold rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFDCE8] text-[#212121] font-body">
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Total Amount (₹)</Label>
            <Input
              type="number"
              className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] font-bold rounded-xl"
              value={form.total_amount}
              onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })}
              data-testid="off-amount"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Payment Method</Label>
            <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
              <SelectTrigger className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] font-semibold rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFDCE8] text-[#212121] font-body">
                {["Cash", "UPI", "Card", "Other"].map((x) => (
                  <SelectItem key={x} value={x}>
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Payment Status</Label>
            <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
              <SelectTrigger className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] font-semibold rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFDCE8] text-[#212121] font-body">
                {["Paid", "Partial", "Pending"].map((x) => (
                  <SelectItem key={x} value={x}>
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Notes</Label>
            <Textarea
              className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] focus:bg-white focus:border-[#212121] text-[#212121] rounded-xl font-body"
              placeholder="Enter booking notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter className="mt-6 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-[#FFFFFF] hover:bg-[#EAE4DC] text-[#212121] border border-[#DFDCE8] rounded-full font-bold text-xs px-5 py-2.5 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={submitOffline}
            disabled={submitting}
            className="bg-[#212121] hover:bg-[#212121] text-white rounded-full font-bold text-xs px-6 py-2.5 shadow-sm cursor-pointer"
            data-testid="off-save"
          >
            {submitting ? "Saving…" : "Save Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
