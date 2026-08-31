import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, CheckCircle2, ShieldAlert, X } from "lucide-react";

export default function ConfirmModal({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive", // "destructive" | "warning" | "info"
  loading = false,
  onConfirm,
}) {
  const isDestructive = variant === "destructive";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-[#DFDCE8] rounded-[1.8rem] sm:rounded-[2.2rem] p-6 sm:p-7 shadow-2xl max-w-md w-[92vw] sm:w-full overflow-hidden outline-none">
        
        {/* Header section with theme badge */}
        <div className="flex items-start justify-between gap-4 pb-3">
          <div>
            <DialogTitle className="font-display text-lg sm:text-xl font-extrabold text-[#212121] tracking-tight">
              {title}
            </DialogTitle>
          </div>
        </div>

        {/* Description body */}
        <DialogDescription className="text-xs sm:text-sm text-[#6F6E73] font-body leading-relaxed border-t border-b border-[#FFFFFF] py-4 my-1">
          {description}
        </DialogDescription>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="bg-[#F6F5FA] hover:bg-[#FFFFFF] text-[#212121] border border-[#DFDCE8] rounded-full px-5 py-2.5 h-auto text-xs font-bold font-mono transition-all cursor-pointer"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-full px-5 py-2.5 h-auto text-xs font-bold font-mono transition-all cursor-pointer shadow-sm ${
              isDestructive
                ? "bg-[#212121] hover:bg-[#E8826B] text-white"
                : "bg-[#212121] hover:bg-[#82C4B7] text-white"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                {isDestructive && <Trash2 size={13} />}
                {confirmText}
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
