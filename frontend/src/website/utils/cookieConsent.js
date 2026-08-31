/**
 * Coastal Cabs Goa - Cookie Consent Manager
 * GDPR & India DPDP Act 2023 baseline compliant
 */

export const COOKIE_CONSENT_KEY = "ccg_cookie_consent_v1";
export const COOKIE_CONSENT_VERSION = "1.0.0";
export const COOKIE_CONSENT_EXPIRY_DAYS = 365; // 12 Months
export const CONSENT_UPDATED_EVENT = "ccg_cookie_consent_updated";
export const OPEN_PREFERENCES_EVENT = "ccg_open_cookie_preferences";

export const CONSENT_CATEGORIES = {
  NECESSARY: "necessary",
  ANALYTICS: "analytics",
  MARKETING: "marketing",
  PREFERENCES: "preferences",
};

export const DEFAULT_CONSENT = {
  necessary: true, // Always true (non-toggleable)
  analytics: false, // Explicit opt-in
  marketing: false, // Explicit opt-in
  preferences: false, // Explicit opt-in
};

/**
 * Get stored consent from localStorage or Cookie
 */
export function getStoredConsent() {
  if (typeof window === "undefined") return null;

  try {
    // 1. Try LocalStorage
    const rawLocal = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (isConsentValid(parsed)) {
        return parsed;
      }
    }

    // 2. Try Cookie Fallback
    const match = document.cookie.match(new RegExp(`(^|\\s*)${COOKIE_CONSENT_KEY}=([^;]*)`));
    if (match && match[2]) {
      const decoded = decodeURIComponent(match[2]);
      const parsed = JSON.parse(decoded);
      if (isConsentValid(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading cookie consent:", e);
  }

  return null;
}

/**
 * Checks if the stored consent is within expiry and matches current version
 */
export function isConsentValid(consent) {
  if (!consent || typeof consent !== "object") return false;
  if (consent.version !== COOKIE_CONSENT_VERSION) return false;
  if (!consent.timestamp) return false;

  const now = Date.now();
  const consentTime = new Date(consent.timestamp).getTime();
  const maxAgeMs = COOKIE_CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  if (isNaN(consentTime) || now - consentTime > maxAgeMs) {
    return false;
  }

  return true;
}

/**
 * Check if user has consented to a specific category
 */
export function hasConsentFor(category) {
  if (category === CONSENT_CATEGORIES.NECESSARY) return true;
  const current = getStoredConsent();
  if (!current || !current.categories) return false;
  return Boolean(current.categories[category]);
}

/**
 * Persist consent choices to localStorage and Cookie
 */
export function saveConsent(categories, actionType = "custom") {
  if (typeof window === "undefined") return null;

  const payload = {
    version: COOKIE_CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    action: actionType, // 'accept_all' | 'reject_all' | 'custom'
    categories: {
      necessary: true, // Always true
      analytics: Boolean(categories?.analytics),
      marketing: Boolean(categories?.marketing),
      preferences: Boolean(categories?.preferences),
    },
  };

  try {
    // 1. LocalStorage
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload));

    // 2. Cookie (Expires in 365 days, SameSite=Lax, Path=/)
    const maxAgeSeconds = COOKIE_CONSENT_EXPIRY_DAYS * 24 * 60 * 60;
    const cookieVal = encodeURIComponent(JSON.stringify(payload));
    document.cookie = `${COOKIE_CONSENT_KEY}=${cookieVal}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;

    // 3. Dispatch global custom event
    window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: payload }));
  } catch (e) {
    console.error("Failed to save cookie consent:", e);
  }

  return payload;
}

/**
 * Open the cookie preferences manager programmatically
 */
export function openCookiePreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT));
  }
}

/**
 * Conditional script injector that executes only when required consent category is granted
 */
export function loadConditionalScript({ id, src, category, onLoad, innerHTML }) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (!hasConsentFor(category)) {
    // If not consented yet, listen for consent update
    const onConsentChange = (event) => {
      if (event.detail?.categories?.[category]) {
        window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentChange);
        loadConditionalScript({ id, src, category, onLoad, innerHTML });
      }
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentChange);
    return;
  }

  // Already loaded check
  if (id && document.getElementById(id)) return;

  const script = document.createElement("script");
  if (id) script.id = id;
  script.type = "text/javascript";
  script.async = true;

  if (src) {
    script.src = src;
    if (onLoad) script.onload = onLoad;
  } else if (innerHTML) {
    script.innerHTML = innerHTML;
  }

  document.head.appendChild(script);
}
