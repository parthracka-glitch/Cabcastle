/* Brex Design System - Cookie Consent Manager */
import React, { useState, useEffect, useCallback } from "react";
import {
  Cookie,
  ShieldCheck,
  Lock,
  BarChart3,
  Megaphone,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { NdaModal } from "./LegalModals";
import {
  getStoredConsent,
  saveConsent,
  OPEN_PREFERENCES_EVENT,
  DEFAULT_CONSENT,
} from "../utils/cookieConsent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Preference switches state
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Check storage on mount
  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      // First-time or expired visitor: show banner
      setVisible(true);
    } else {
      // Load saved preferences into state in case user reopens
      setPreferences({
        necessary: true,
        analytics: Boolean(existing.categories?.analytics),
        marketing: Boolean(existing.categories?.marketing),
        preferences: Boolean(existing.categories?.preferences),
      });
      setVisible(false);
    }
  }, []);

  // Listen for global reopen event (e.g., from Footer link)
  useEffect(() => {
    const handleReopen = () => {
      const current = getStoredConsent();
      if (current?.categories) {
        setPreferences({
          necessary: true,
          analytics: Boolean(current.categories.analytics),
          marketing: Boolean(current.categories.marketing),
          preferences: Boolean(current.categories.preferences),
        });
      }
      setExpanded(true);
      setVisible(true);
    };

    window.addEventListener(OPEN_PREFERENCES_EVENT, handleReopen);
    return () => {
      window.removeEventListener(OPEN_PREFERENCES_EVENT, handleReopen);
    };
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allConsented = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allConsented, "accept_all");
    setPreferences(allConsented);
    setVisible(false);
    setExpanded(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(necessaryOnly, "reject_all");
    setPreferences(necessaryOnly);
    setVisible(false);
    setExpanded(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveConsent(preferences, "custom");
    setVisible(false);
    setExpanded(false);
  }, [preferences]);

  if (!visible) return null;

  return (
    <>
      <aside
        role="dialog"
        aria-live="polite"
        aria-label="Cookie and Privacy Consent"
        className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-5 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300 font-body"
        data-testid="cookie-consent-banner"
      >
        <div className="pointer-events-auto max-w-5xl mx-auto w-full bg-white border border-[#DFDCE8] rounded-[24px] shadow-2xl overflow-hidden text-[#212121]">
          {/* Main Banner Top Section */}
          <div className="p-5 sm:p-7 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Icon & Message */}
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-10 h-10 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] flex items-center justify-center text-[#212121] shrink-0 mt-0.5 shadow-xs">
                  <Cookie size={20} />
                </div>
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#212121] tracking-tight">
                      We Value Your Privacy &amp; Data Control
                    </h3>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#F6F5FA] text-[#6F6E73] border border-[#DFDCE8] font-bold">
                      GDPR &amp; DPDP Compliant
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4C606E] leading-relaxed max-w-3xl font-normal">
                    Cab Castle Goa uses cookies and secure local storage to keep your booking session safe, remember vehicle preferences, and measure browsing performance. You can customize your consent below.
                  </p>
                </div>
              </div>

              {/* Action Buttons (Collapsed Mode) */}
              {!expanded && (
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setExpanded(true)}
                    className="h-10 px-4 text-xs font-bold text-[#6F6E73] hover:text-[#212121] border-[#DFDCE8] bg-[#F6F5FA] hover:bg-[#EFEDF5] rounded-full cursor-pointer"
                    data-testid="cookie-customize-btn"
                  >
                    <SlidersHorizontal size={13} className="mr-1.5 text-[#6F6E73]" />
                    Customize
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRejectAll}
                    className="h-10 px-4 text-xs font-bold text-[#212121] border-[#DFDCE8] bg-white hover:bg-[#F6F5FA] rounded-full cursor-pointer"
                    data-testid="cookie-reject-all-btn"
                  >
                    Necessary Only
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAcceptAll}
                    className="h-10 px-6 text-xs font-bold uppercase tracking-wider text-white bg-[#212121] hover:bg-[#141414] active:bg-[#000000] rounded-full shadow-sm cursor-pointer"
                    data-testid="cookie-accept-all-btn"
                  >
                    Accept All
                  </Button>
                </div>
              )}
            </div>

            {/* Expanded Preference Toggles */}
            {expanded && (
              <div className="pt-3 border-t border-[#DFDCE8] space-y-4 text-left animate-in fade-in duration-200">
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* 1. Strictly Necessary */}
                  <div className="p-4 rounded-[18px] bg-[#F6F5FA] border border-[#DFDCE8] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock size={15} className="text-[#212121]" />
                        <span className="font-bold text-xs text-[#212121]">Strictly Necessary</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#4B8039] bg-[#CFDECA] px-2.5 py-0.5 rounded-full">
                        Always Active
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6F6E73] leading-normal font-normal">
                      Essential for authentication, secure booking checkout, identity verification &amp; CSRF protection. Cannot be disabled.
                    </p>
                  </div>

                  {/* 2. Analytics */}
                  <div className="p-4 rounded-[18px] bg-[#F6F5FA] border border-[#DFDCE8] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 size={15} className="text-[#212121]" />
                        <label htmlFor="toggle-analytics" className="font-bold text-xs text-[#212121] cursor-pointer">
                          Analytics &amp; Performance
                        </label>
                      </div>
                      <Switch
                        id="toggle-analytics"
                        checked={preferences.analytics}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, analytics: checked }))
                        }
                        className="data-[state=checked]:bg-[#212121] cursor-pointer"
                        data-testid="cookie-toggle-analytics"
                      />
                    </div>
                    <p className="text-[11px] text-[#6F6E73] leading-normal font-normal">
                      Measures anonymous page speeds, fleet view metrics, and system load to optimize rental platform reliability.
                    </p>
                  </div>

                  {/* 3. Marketing & Offers */}
                  <div className="p-4 rounded-[18px] bg-[#F6F5FA] border border-[#DFDCE8] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Megaphone size={15} className="text-[#212121]" />
                        <label htmlFor="toggle-marketing" className="font-bold text-xs text-[#212121] cursor-pointer">
                          Marketing &amp; Promotions
                        </label>
                      </div>
                      <Switch
                        id="toggle-marketing"
                        checked={preferences.marketing}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, marketing: checked }))
                        }
                        className="data-[state=checked]:bg-[#212121] cursor-pointer"
                        data-testid="cookie-toggle-marketing"
                      />
                    </div>
                    <p className="text-[11px] text-[#6F6E73] leading-normal font-normal">
                      Enables seasonal Goa car rental discounts, festive promo codes, and customized self-drive travel deals.
                    </p>
                  </div>

                  {/* 4. Preferences & Functional */}
                  <div className="p-4 rounded-[18px] bg-[#F6F5FA] border border-[#DFDCE8] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal size={15} className="text-[#212121]" />
                        <label htmlFor="toggle-preferences" className="font-bold text-xs text-[#212121] cursor-pointer">
                          Preferences &amp; Search Memory
                        </label>
                      </div>
                      <Switch
                        id="toggle-preferences"
                        checked={preferences.preferences}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, preferences: checked }))
                        }
                        className="data-[state=checked]:bg-[#212121] cursor-pointer"
                        data-testid="cookie-toggle-preferences"
                      />
                    </div>
                    <p className="text-[11px] text-[#6F6E73] leading-normal font-normal">
                      Remembers your selected pickup airport hubs, date presets, and preferred transmission (Automatic/Manual).
                    </p>
                  </div>
                </div>

                {/* Expanded Action Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-[#6F6E73] flex items-center gap-1.5 self-start sm:self-center">
                    <span>Learn more in our</span>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-[#212121] underline font-bold hover:text-[#000000] cursor-pointer"
                    >
                      Privacy &amp; Data Policy
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRejectAll}
                      className="h-10 px-4 text-xs font-bold text-[#212121] border-[#DFDCE8] bg-white hover:bg-[#F6F5FA] rounded-full cursor-pointer"
                      data-testid="cookie-reject-all-expanded-btn"
                    >
                      Necessary Only
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSavePreferences}
                      className="h-10 px-5 text-xs font-bold uppercase tracking-wider text-[#212121] bg-[#EFF0A3] hover:bg-[#E5E696] rounded-full shadow-xs cursor-pointer"
                      data-testid="cookie-save-preferences-btn"
                    >
                      Save Preferences
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAcceptAll}
                      className="h-10 px-6 text-xs font-bold uppercase tracking-wider text-white bg-[#212121] hover:bg-[#141414] active:bg-[#000000] rounded-full shadow-sm cursor-pointer"
                      data-testid="cookie-accept-all-expanded-btn"
                    >
                      Accept All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Privacy Policy Modal */}
      <NdaModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
    </>
  );
}
