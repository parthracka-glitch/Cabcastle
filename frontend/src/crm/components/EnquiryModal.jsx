import React from "react";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

const POPULAR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad",
  "Panaji", "Kolkata", "Ahmedabad", "Chennai", "Jaipur", "Surat", "Chandigarh", "Other"
];

const CAR_MODELS = [
  "Mahindra Thar 4x4", "Toyota Fortuner", "MINI Cooper Convertible",
  "Honda City", "Maruti Swift", "Tata Nexon EV", "General SUV", "General Convertible", "General"
];

const SOURCES = ["Phone Call", "WhatsApp", "Walk-in", "Website", "Instagram", "Referral", "Other"];
const STATUSES = ["New", "Contacted", "Follow-up", "Converted", "Lost"];

const EMPTY = {
  customer_name: "",
  phone: "",
  email: "",
  city: "Mumbai",
  custom_city: "",
  car_model_interested: "Mahindra Thar 4x4",
  source: "Phone Call",
  status: "New",
  notes: "",
};

export default function EnquiryModal({ open, onOpenChange, onSuccess }) {
  const [form, setForm] = React.useState(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);

  async function submitEnquiry() {
    const finalCity = form.city === "Other" ? form.custom_city : form.city;
    if (!form.customer_name || !form.phone || !finalCity) {
      toast.error("Please enter customer name, phone, and city");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/admin/enquiries", {
        ...form,
        city: finalCity,
      });
      toast.success("Enquiry logged successfully!");
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
      <DialogContent className="max-w-xl w-[95vw] bg-white border border-[#DFDCE8] text-[#212121] max-h-[92vh] overflow-y-auto no-scrollbar font-body rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 shadow-2xl" data-testid="enquiry-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold flex items-center gap-2.5 text-[#212121]">
            <div className="w-8 h-8 rounded-full bg-[#E8826B]/15 text-[#E8826B] flex items-center justify-center">
              <MessageSquarePlus size={16} />
            </div>
            <span>Log New Customer Enquiry</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-2 text-xs font-body">
          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Customer Name *</Label>
            <Input
              className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] focus:bg-white focus:border-[#212121] text-[#212121] font-semibold rounded-xl"
              placeholder="Enter customer name"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              data-testid="enq-name"
            />
          </div>
          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Phone Number *</Label>
            <Input
              className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] focus:bg-white focus:border-[#212121] text-[#212121] font-mono rounded-xl"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              data-testid="enq-phone"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Email (Optional)</Label>
            <Input
              className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] focus:bg-white focus:border-[#212121] text-[#212121] rounded-xl"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              data-testid="enq-email"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">City / Origin *</Label>
            <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
              <SelectTrigger className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] font-semibold rounded-xl" data-testid="enq-city-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFDCE8] text-[#212121] font-body">
                {POPULAR_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.city === "Other" && (
              <Input
                className="mt-2 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] rounded-xl"
                placeholder="Enter city name"
                value={form.custom_city}
                onChange={(e) => setForm({ ...form, custom_city: e.target.value })}
                data-testid="enq-custom-city"
              />
            )}
          </div>

          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Vehicle Interested</Label>
            <Select value={form.car_model_interested} onValueChange={(v) => setForm({ ...form, car_model_interested: v })}>
              <SelectTrigger className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] font-semibold rounded-xl" data-testid="enq-car-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFDCE8] text-[#212121] font-body">
                {CAR_MODELS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Lead Source</Label>
            <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
              <SelectTrigger className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] font-semibold rounded-xl" data-testid="enq-source-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFDCE8] text-[#212121] font-body">
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Enquiry Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] text-[#212121] font-semibold rounded-xl" data-testid="enq-status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFDCE8] text-[#212121] font-body">
                {STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6F6E73]">Notes / Requirements</Label>
            <Textarea
              className="mt-1.5 bg-[#FFFFFF] border-[#DFDCE8] focus:bg-white focus:border-[#212121] text-[#212121] rounded-xl font-body"
              placeholder="Enter enquiry notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              data-testid="enq-notes"
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
            onClick={submitEnquiry}
            disabled={submitting}
            className="bg-[#212121] hover:bg-[#212121] text-white rounded-full font-bold text-xs px-6 py-2.5 shadow-sm cursor-pointer"
            data-testid="enq-save"
          >
            {submitting ? "Saving…" : "Save Enquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
