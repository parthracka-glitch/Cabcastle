import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, User, FileText } from "lucide-react";

export default function NotesModal({
  open,
  onOpenChange,
  title = "Enquiry Notes",
  subtitle,
  notes,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-[#DFDCE8] rounded-[1.8rem] sm:rounded-[2.2rem] p-6 sm:p-7 shadow-2xl max-w-md w-[92vw] sm:w-full outline-none">
        <DialogHeader className="pb-3 border-b border-[#FFFFFF]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#82C4B7]/20 text-[#82C4B7] font-mono text-[10px] uppercase font-bold tracking-wider mb-2 w-fit">
            <MessageSquarePlus size={12} />
            Customer Lead Note
          </div>
          <DialogTitle className="font-display text-lg sm:text-xl font-extrabold text-[#212121] tracking-tight">
            {title}
          </DialogTitle>
          {subtitle && (
            <p className="font-mono text-xs text-[#6F6E73] mt-1">{subtitle}</p>
          )}
        </DialogHeader>

        <div className="py-4">
          <div className="bg-[#F6F5FA] border border-[#DFDCE8] rounded-2xl p-4 text-xs font-body text-[#212121] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {notes || "No notes attached to this lead."}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-[#212121] hover:bg-[#212121]/90 text-white rounded-full px-6 py-2.5 h-auto text-xs font-bold font-mono transition-all cursor-pointer shadow-sm"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
