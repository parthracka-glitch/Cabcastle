import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/api";

export default function RefundModal({
  open,
  onOpenChange,
  booking,
  loading = false,
  onConfirm,
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (booking) {
      setAmount(String(booking.total_amount || 0));
      setReason("Customer cancellation");
    }
  }, [booking, open]);

  if (!booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    onConfirm({ amount: numAmount, reason });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-[#DFDCE8] rounded-[1.8rem] sm:rounded-[2.2rem] p-6 sm:p-7 shadow-2xl max-w-md w-[92vw] sm:w-full overflow-hidden outline-none font-mono">
        <DialogHeader>
          <div className="flex items-center gap-2 pb-1">
            <div className="w-8 h-8 rounded-full bg-[#E8826B]/15 flex items-center justify-center text-[#E8826B]">
              <RotateCcw size={16} />
            </div>
            <DialogTitle className="font-display text-lg sm:text-xl font-extrabold text-[#212121] tracking-tight">
              Process Booking Refund
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#6F6E73] font-body">
            Booking #{booking.booking_no} · {booking.customer?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="bg-[#F6F5FA] border border-[#DFDCE8] rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between text-[#6F6E73]">
              <span>Original Paid Amount:</span>
              <span className="font-bold text-[#212121]">{formatINR(booking.total_amount)}</span>
            </div>
            <div className="flex justify-between text-[#6F6E73]">
              <span>Payment Method:</span>
              <span className="font-semibold text-[#212121]">{booking.payment_method || "Razorpay"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#212121]">Refund Amount (₹)</Label>
            <Input
              type="number"
              min="1"
              max={booking.total_amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-[#F6F5FA] border-[#DFDCE8] text-[#212121] text-xs h-9 focus:border-[#212121] rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#212121]">Refund Reason</Label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer cancellation, Flight rescheduled"
              required
              className="bg-[#F6F5FA] border-[#DFDCE8] text-[#212121] text-xs h-9 focus:border-[#212121] rounded-xl"
            />
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#E8826B]/10 border border-[#E8826B]/20 text-[11px] text-[#E8826B] leading-relaxed">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>Processing this refund will cancel the reservation and release the vehicle back to available fleet inventory.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="bg-[#F6F5FA] hover:bg-[#FFFFFF] text-[#212121] border border-[#DFDCE8] rounded-full px-5 py-2 h-auto text-xs font-bold font-mono transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !amount || Number(amount) <= 0}
              className="bg-[#E8826B] hover:bg-[#D46B54] text-white rounded-full px-5 py-2 h-auto text-xs font-bold font-mono transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              Process Refund
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
