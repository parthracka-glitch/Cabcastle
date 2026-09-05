import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cookie, ShieldCheck, Check, Info } from "lucide-react";
import { toast } from "sonner";

export default function CookiePreferencesModal({ open, onOpenChange }) {
  const [preferences, setPreferences] = React.useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
  });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("ccg_cookie_preferences");
      if (saved) {
        setPreferences({ ...JSON.parse(saved), necessary: true });
      }
    } catch {
      // ignore
    }
  }, [open]);

  function savePreferences(custom) {
    const toSave = custom || preferences;
    try {
      localStorage.setItem("ccg_cookie_preferences", JSON.stringify(toSave));
      localStorage.setItem("ccg_cookie_consent_given", "true");
      toast.success("Cookie preferences saved successfully");
    } catch {
      // ignore
    }
    onOpenChange(false);
  }

  function handleAcceptAll() {
    const all = { necessary: true, functional: true, analytics: true, marketing: true };
    setPreferences(all);
    savePreferences(all);
  }

  function handleRejectOptional() {
    const min = { necessary: true, functional: false, analytics: false, marketing: false };
    setPreferences(min);
    savePreferences(min);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[94vw] sm:w-full bg-[#E7EDEB] rounded-3xl border border-[#CBD8D4] p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-left border-b border-[#CBD8D4] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DEEDE4] text-[#69A481] flex items-center justify-center shrink-0 border border-[#69A481]/30">
              <Cookie size={20} />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-bold text-[#1B2922]">
                Cookie &amp; Privacy Preferences
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6C8277] mt-0.5 font-normal">
                Customize how Cab Castle Goa stores data in your browser for booking and security.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-left">
          {/* Strictly Necessary */}
          <div className="p-4 rounded-2xl bg-white border border-[#CBD8D4] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#1B2922]">Strictly Necessary Cookies</span>
                <span className="text-[9.5px] bg-[#DEEDE4] text-[#245339] font-bold px-2 py-0.5 rounded-full border border-[#69A481]/30">
                  Always Active
                </span>
              </div>
              <p className="text-[11px] text-[#4D6257] leading-relaxed">
                Essential for core website security, authentication tokens, CSRF protection, and keeping your car booking session active.
              </p>
            </div>
            <Switch checked={true} disabled className="mt-1" />
          </div>

          {/* Functional & Preferences */}
          <div className="p-4 rounded-2xl bg-white border border-[#CBD8D4] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-xs text-[#1B2922]">Functional &amp; Preference Cookies</span>
              <p className="text-[11px] text-[#4D6257] leading-relaxed">
                Remembers your selected pickup locations (e.g. Candolim, Mopa Airport), currency, and customer dashboard layout.
              </p>
            </div>
            <Switch
              checked={preferences.functional}
              onCheckedChange={(val) => setPreferences({ ...preferences, functional: val })}
              className="mt-1"
            />
          </div>

          {/* Performance & Analytics */}
          <div className="p-4 rounded-2xl bg-white border border-[#CBD8D4] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-xs text-[#1B2922]">Performance &amp; Analytics Cookies</span>
              <p className="text-[11px] text-[#4D6257] leading-relaxed">
                Helps us measure page load speeds, fix broken links, and analyze traffic volume without tracking personal identities.
              </p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(val) => setPreferences({ ...preferences, analytics: val })}
              className="mt-1"
            />
          </div>

          {/* Marketing */}
          <div className="p-4 rounded-2xl bg-white border border-[#CBD8D4] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-xs text-[#1B2922]">Marketing &amp; Promotional Cookies</span>
              <p className="text-[11px] text-[#4D6257] leading-relaxed">
                Allows relevant travel offers and festival discounts to be displayed on Google and social channels.
              </p>
            </div>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(val) => setPreferences({ ...preferences, marketing: val })}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-[#CBD8D4] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleRejectOptional}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold text-[#4D6257] border-[#CBD8D4] hover:bg-[#DEEDE4] flex-1 sm:flex-initial cursor-pointer"
            >
              Reject Optional
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAcceptAll}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold text-[#1B2922] border-[#CBD8D4] hover:bg-[#DEEDE4] flex-1 sm:flex-initial cursor-pointer"
            >
              Accept All
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => savePreferences()}
            className="h-9 px-5 rounded-xl text-xs font-bold bg-[#7C1F31] hover:bg-[#631826] text-white w-full sm:w-auto cursor-pointer border border-[#7C1F31]"
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
