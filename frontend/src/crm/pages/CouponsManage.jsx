import React from "react";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInDays } from "date-fns";
import { Plus, Pencil, Trash2, Calendar as CalIcon, Ticket, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "../components/common/ConfirmModal";

const EMPTY = {
  code: "", type: "Percentage", value: 10, min_amount: 0,
  expiry: null, active: true,
};

export default function CouponsManage() {
  const [items, setItems] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(EMPTY);
  const [loading, setLoading] = React.useState(true);

  // In-app delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteTargetId, setDeleteTargetId] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback((showSpinner = false) => {
    if (showSpinner) setLoading(true);
    api.get("/admin/coupons")
      .then(({ data }) => setItems(data))
      .catch((e) => toast.error(formatApiError(e)))
      .finally(() => setLoading(false));
  }, []);
  
  React.useEffect(() => { load(true); }, [load]);

  function openAdd() { setEditing(null); setForm({ ...EMPTY, expiry: null }); setOpen(true); }
  function openEdit(c) {
    setEditing(c);
    setForm({ ...c, expiry: c.expiry ? new Date(c.expiry) : null });
    setOpen(true);
  }
  async function save() {
    if (!form.code || !form.expiry) { toast.error("Code and expiry deadline required"); return; }
    try {
      const payload = { ...form, expiry: form.expiry.toISOString() };
      if (editing) {
        await api.put(`/admin/coupons/${editing.id}`, payload);
        toast.success("Coupon updated successfully");
      } else {
        await api.post("/admin/coupons", payload);
        toast.success("Coupon created successfully");
      }
      setOpen(false);
      load(false);
    } catch (e) { toast.error(formatApiError(e)); }
  }

  function promptDelete(id) {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return;
    setDeleting(true);
    setItems((prev) => prev.filter((item) => item.id !== deleteTargetId));
    try {
      await api.delete(`/admin/coupons/${deleteTargetId}`);
      toast.success("Deleted coupon successfully");
      load(false);
    } catch (e) {
      toast.error(formatApiError(e));
      load(true);
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  }

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-8 font-body text-[#063247] text-left">
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[#063247] tracking-tight">
              Promotional Coupons
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4F2F5] text-[#0E7490] border border-[#C3E7FA]">
              {items.length} Promo Codes
            </span>
          </div>
          <p className="text-xs text-[#4C606E] mt-1 font-normal">
            Manage promotional discount codes, validity windows, and automated expirations.
          </p>
        </div>

        <Button onClick={openAdd} className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#063247] hover:bg-[#063247]/90 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 self-start sm:self-auto shrink-0">
          <Plus size={14} className="font-bold stroke-[2.5]" />
          <span>New Coupon</span>
        </Button>
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="rounded-2xl border border-[#DFE8EC] bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse min-w-[700px]">
            <TableHeader>
              <tr className="bg-[#F8FAFC] border-b border-[#DFE8EC] text-[11px] font-bold text-[#4C606E] uppercase tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-3">Discount Value</th>
                <th className="py-3 px-3">Min Order</th>
                <th className="py-3 px-3">Validity Expiry</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </TableHeader>
            <TableBody className="divide-y divide-[#DFE8EC]">
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-[#5A7184] py-12 text-xs font-medium">Loading coupons...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-[#5A7184] py-12 text-xs font-medium">No promo coupons registered</TableCell></TableRow>
              ) : items.map((c) => {
                const expDate = c.expiry ? new Date(c.expiry) : null;
                const isExpired = expDate ? differenceInDays(expDate, new Date()) < 0 : false;
                const daysLeft = expDate ? differenceInDays(expDate, new Date()) : null;

                return (
                  <TableRow key={c.id} className="hover:bg-[#F8FAFC]/80 transition-colors group">
                    <TableCell className="py-3.5 px-4">
                      <div className="font-mono text-xs font-bold text-[#063247] flex items-center gap-1.5">
                        <Ticket size={13} className="text-[#0E7490]" />
                        <span className="bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#DFE8EC]">{c.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-3 font-semibold text-xs text-[#063247]">
                      {c.type === "Percentage" ? `${c.value}% OFF` : `₹${c.value} FLAT`}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-xs text-[#5A7184] font-mono">
                      {c.min_amount > 0 ? `₹${c.min_amount}` : "No minimum"}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-xs">
                      <div className="text-[#063247] font-medium font-mono">{expDate ? format(expDate, "dd MMM yyyy") : "—"}</div>
                      {daysLeft !== null && (
                        <div className={`text-[10px] ${isExpired ? "text-rose-600 font-semibold" : "text-[#5A7184]"}`}>
                          {isExpired ? "Expired" : `${daysLeft} days left`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                        !c.active || isExpired
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {!c.active ? "Disabled" : isExpired ? "Expired" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 pr-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" onClick={() => openEdit(c)} className="h-8 px-2.5 bg-[#E4F2F5] hover:bg-[#C3E7FA] text-[#0E7490] font-semibold text-xs rounded-lg border border-[#C3E7FA]/80 flex items-center gap-1 transition-all cursor-pointer shadow-2xs">
                          <Pencil size={12}/> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => promptDelete(c.id)} className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
                          <Trash2 size={13}/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── CREATE / EDIT COUPON DIALOG ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-white border-[#DFE8EC] text-[#063247] font-body rounded-2xl p-5 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#063247]">
              {editing ? "Edit Promo Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-[#063247]">Coupon Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. GOASUMMER20"
                className="mt-1 font-mono uppercase bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-[#063247]">Type</Label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                  <SelectTrigger className="mt-1 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#DFE8EC] text-[#063247] text-xs rounded-xl shadow-lg">
                    <SelectItem value="Percentage">Percentage (%)</SelectItem>
                    <SelectItem value="Fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#063247]">Discount Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  className="mt-1 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#063247]">Minimum Booking Amount (₹)</Label>
              <Input
                type="number"
                value={form.min_amount}
                onChange={(e) => setForm({ ...form, min_amount: Number(e.target.value) })}
                className="mt-1 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#063247]">Expiry Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-1 justify-start text-xs font-normal bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] h-9 rounded-xl">
                    <CalIcon size={14} className="mr-2 text-[#0E7490]" />
                    {form.expiry ? format(form.expiry, "PPP") : <span className="text-[#94A3B8]">Select expiration date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-[#DFE8EC] rounded-2xl shadow-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={form.expiry}
                    onSelect={(d) => setForm({ ...form, expiry: d })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE8EC]">
              <div>
                <div className="text-xs font-bold text-[#063247]">Active Status</div>
                <div className="text-[10px] text-[#5A7184]">Allow customers to redeem this code at checkout</div>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setOpen(false)} className="text-xs font-semibold text-[#5A7184] rounded-xl h-9">
              Cancel
            </Button>
            <Button onClick={save} className="bg-[#063247] hover:bg-[#063247]/90 text-white text-xs font-bold rounded-xl h-9 px-4 cursor-pointer shadow-xs">
              Save Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Coupon Promo Code?"
        description="Are you sure you want to permanently delete this coupon? Customers will no longer be able to use this discount code at checkout."
        confirmText="Delete Coupon"
        variant="destructive"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
