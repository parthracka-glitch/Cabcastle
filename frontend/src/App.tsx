import React, { lazy, Suspense, ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import "./App.css";

import AdminSkeleton from "./crm/components/AdminSkeleton";
import CustomerSkeleton from "./website/components/CustomerSkeleton";
import CookieConsentBanner from "./website/components/CookieConsentBanner";
import WhatsAppFloatingWidget from "./website/components/WhatsAppFloatingWidget";

// Lazy-loaded routes for 100% code-splitting and minimal initial bundle
const Landing = lazy(() => import("./website/pages/Landing"));
const FleetPage = lazy(() => import("./website/pages/FleetPage"));
const CustomerAuth = lazy(() => import("./website/pages/CustomerAuth"));
const AboutPage = lazy(() => import("./website/pages/AboutPage"));
const BookingPage = lazy(() => import("./website/pages/BookingPage"));
const BookingSuccess = lazy(() => import("./website/pages/BookingSuccess"));
const CustomerProfile = lazy(() => import("./website/pages/CustomerProfile"));
const NotFound = lazy(() => import("./website/pages/NotFound"));
const LegalPage = lazy(() => import("./website/pages/legal/LegalPage"));
const AdminLogin = lazy(() => import("./crm/pages/AdminLogin"));
const AdminLayout = lazy(() => import("./crm/pages/AdminLayout"));
const Dashboard = lazy(() => import("./crm/pages/Dashboard"));
const FleetManage = lazy(() => import("./crm/pages/FleetManage"));
const DriversManage = lazy(() => import("./crm/pages/DriversManage"));
const BookingsManage = lazy(() => import("./crm/pages/BookingsManage"));
const CouponsManage = lazy(() => import("./crm/pages/CouponsManage"));
const CalendarView = lazy(() => import("./crm/pages/CalendarView"));
const AdminSettings = lazy(() => import("./crm/pages/AdminSettings"));

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <AdminSkeleton />;
  }
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function RequireCustomerAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <CustomerSkeleton />;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return <>{children}</>;
}

function BookRedirect() {
  const { vehicleId } = useParams();
  const location = useLocation();
  return <Navigate to={`/booking/${vehicleId || ''}${location.search}`} replace />;
}

function ScrollToTop() {
  const { pathname, search, state } = useLocation();

  React.useEffect(() => {
    // If navigation didn't specify a custom scrollTo target state or hash
    if (!(state as any)?.scrollTo && !window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search, state]);

  return null;
}

function AppContent() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      {!isOnline && (
        <div className="bg-[#E8826B] text-white font-mono text-xs font-bold text-center py-2 px-4 sticky top-0 z-50 shadow-md">
          ⚠️ You are currently offline. Some live fleet availability data may not update automatically.
        </div>
      )}
      <Routes>
        {/* Customer Routes (Direct Booking, No Sign In / Sign Up Required) */}
        <Route path="/" element={<Suspense fallback={<CustomerSkeleton />}><FleetPage defaultService="tour" /></Suspense>} />
        <Route path="/fleet" element={<Suspense fallback={<CustomerSkeleton />}><FleetPage defaultService="tour" /></Suspense>} />
        <Route path="/self-drive" element={<Navigate to="/" replace />} />
        <Route path="/tour-packages" element={<Navigate to="/" replace />} />
        <Route path="/about" element={<Suspense fallback={<CustomerSkeleton />}><AboutPage /></Suspense>} />
        <Route path="/faqs" element={<Suspense fallback={<CustomerSkeleton />}><AboutPage /></Suspense>} />
        <Route path="/faq" element={<Suspense fallback={<CustomerSkeleton />}><AboutPage /></Suspense>} />
        <Route path="/booking/:vehicleId" element={<Suspense fallback={<CustomerSkeleton />}><BookingPage /></Suspense>} />
        <Route path="/book/:vehicleId" element={<BookRedirect />} />
        <Route path="/booking-success/:bookingId" element={<Suspense fallback={<CustomerSkeleton />}><BookingSuccess /></Suspense>} />
        <Route path="/my-bookings" element={<RequireCustomerAuth><Suspense fallback={<CustomerSkeleton />}><CustomerProfile /></Suspense></RequireCustomerAuth>} />
        <Route path="/profile" element={<Navigate to="/my-bookings" replace />} />
        <Route path="/login" element={<Suspense fallback={<CustomerSkeleton />}><CustomerAuth defaultSignup={false} /></Suspense>} />
        <Route path="/signup" element={<Suspense fallback={<CustomerSkeleton />}><CustomerAuth defaultSignup={true} /></Suspense>} />
        <Route path="/auth" element={<Suspense fallback={<CustomerSkeleton />}><CustomerAuth /></Suspense>} />

        {/* Production-Grade Legal & Statutory Policies */}
        <Route path="/legal" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="terms-of-service" /></Suspense>} />
        <Route path="/legal/:slug" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="privacy-policy" /></Suspense>} />
        <Route path="/privacy-policy" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="privacy-policy" /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="terms-of-service" /></Suspense>} />
        <Route path="/terms-of-service" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="terms-of-service" /></Suspense>} />
        <Route path="/cookies" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="cookie-policy" /></Suspense>} />
        <Route path="/cookie-policy" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="cookie-policy" /></Suspense>} />
        <Route path="/refund-policy" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="refund-policy" /></Suspense>} />
        <Route path="/cancellation-policy" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="cancellation-policy" /></Suspense>} />
        <Route path="/shipping-policy" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="shipping-policy" /></Suspense>} />
        <Route path="/delivery-policy" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="shipping-policy" /></Suspense>} />
        <Route path="/return-policy" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="return-policy" /></Suspense>} />
        <Route path="/disclaimer" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="disclaimer" /></Suspense>} />
        <Route path="/accessibility" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="accessibility-statement" /></Suspense>} />
        <Route path="/accessibility-statement" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="accessibility-statement" /></Suspense>} />
        <Route path="/dpa" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="dpa" /></Suspense>} />
        <Route path="/acceptable-use" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="acceptable-use" /></Suspense>} />
        <Route path="/security" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="security-policy" /></Suspense>} />
        <Route path="/security-policy" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="security-policy" /></Suspense>} />
        <Route path="/responsible-disclosure" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="responsible-disclosure" /></Suspense>} />
        <Route path="/community-guidelines" element={<Suspense fallback={<CustomerSkeleton />}><LegalPage defaultSlug="community-guidelines" /></Suspense>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Suspense fallback={<AdminSkeleton />}><AdminLogin /></Suspense>} />
        <Route
          path="/admin"
          element={
            <Protected>
              <Suspense fallback={<AdminSkeleton />}>
                <AdminLayout />
              </Suspense>
            </Protected>
          }
        >
          <Route index element={<Suspense fallback={<AdminSkeleton />}><Dashboard /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<AdminSkeleton />}><CalendarView /></Suspense>} />
          <Route path="fleet" element={<Suspense fallback={<AdminSkeleton />}><FleetManage /></Suspense>} />
          <Route path="drivers" element={<Suspense fallback={<AdminSkeleton />}><DriversManage /></Suspense>} />
          <Route path="bookings" element={<Suspense fallback={<AdminSkeleton />}><BookingsManage /></Suspense>} />
          <Route path="coupons" element={<Suspense fallback={<AdminSkeleton />}><CouponsManage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<AdminSkeleton />}><AdminSettings /></Suspense>} />
        </Route>

        <Route path="*" element={<Suspense fallback={<CustomerSkeleton />}><NotFound /></Suspense>} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <WhatsAppFloatingWidget />
          <CookieConsentBanner />
        </BrowserRouter>
        <Toaster position="top-right" closeButton />
      </AuthProvider>
    </div>
  );
}

export default App;
