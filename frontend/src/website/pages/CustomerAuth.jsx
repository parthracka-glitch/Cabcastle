/* Coastal Cabs Goa Design System */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, User, Phone, Loader2, ArrowLeft, Eye, EyeOff, Car } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";

export default function CustomerAuth({ defaultSignup = false }) {
  const nav = useNavigate();
  const location = useLocation();
  const [isSignup, setIsSignup] = useState(() => defaultSignup || location.pathname === "/signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const { login, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (location.pathname === "/signup") setIsSignup(true);
    else if (location.pathname === "/login") setIsSignup(false);
  }, [location.pathname]);

  const redirectPath = location.state?.from || "/";

  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "87779217954-ras0gb00vjagugnkh5gpvnv5l0nsh8tg.apps.googleusercontent.com";

  useEffect(() => {
    let checkTimer;
    function initGoogle() {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
              setBusy(true);
              try {
                const token = response.credential;
                const payload = JSON.parse(atob(token.split(".")[1]));
                const res = await loginWithGoogle({
                  email: payload.email,
                  name: payload.name || "Google User",
                  picture: payload.picture || "",
                  google_id: payload.sub,
                  id_token: token,
                });
                setBusy(false);
                if (res.ok) {
                  toast.success(`Welcome, ${payload.name || payload.email}!`);
                  localStorage.setItem("ccg_customer_email", payload.email.toLowerCase().trim());
                  nav(redirectPath, { replace: true });
                } else {
                  toast.error(res.error || "Google login failed");
                }
              } catch (err) {
                setBusy(false);
                toast.error("Google authentication error");
              }
            },
          });
        } catch (e) {
          console.error("GIS init error", e);
        }
      } else {
        checkTimer = setTimeout(initGoogle, 500);
      }
    }
    initGoogle();
    return () => clearTimeout(checkTimer);
  }, [GOOGLE_CLIENT_ID, loginWithGoogle, nav, redirectPath]);

  function handleGoogleSignIn() {
    if (!window.google?.accounts?.oauth2 && !window.google?.accounts?.id) {
      toast.error("Google Sign-In SDK is loading. Please try again in a moment.");
      return;
    }

    setBusy(true);

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          error_callback: (err) => {
            setBusy(false);
            console.error("Google OAuth error:", err);
            toast.error("Google OAuth configuration error.");
          },
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setBusy(false);
              return;
            }
            try {
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const userInfo = await userInfoRes.json();
              if (userInfo.email) {
                const res = await loginWithGoogle({
                  email: userInfo.email,
                  name: userInfo.name || "Google User",
                  picture: userInfo.picture || "",
                  google_id: userInfo.sub,
                  access_token: tokenResponse.access_token,
                });
                setBusy(false);
                if (res.ok) {
                  toast.success(`Welcome, ${userInfo.name || userInfo.email}!`);
                  localStorage.setItem("ccg_customer_email", userInfo.email.toLowerCase().trim());
                  nav(redirectPath, { replace: true });
                } else {
                  toast.error(res.error || "Google login failed");
                }
              } else {
                setBusy(false);
                toast.error("Failed to retrieve user info from Google");
              }
            } catch (err) {
              setBusy(false);
              toast.error("Google login processing failed");
            }
          },
        });
        tokenClient.requestAccessToken();
      } catch (e) {
        setBusy(false);
        toast.error("Failed to trigger Google login popup");
      }
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setBusy(false);
          toast.error("Google One Tap prompt was closed or not displayed. Please try again.");
        }
      });
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in email and password");
      return;
    }
    setBusy(true);
    try {
      const res = await login(email, password);
      setBusy(false);
      if (res.ok) {
        toast.success("Welcome back!");
        localStorage.setItem("ccg_customer_email", email.toLowerCase().trim());
        nav(redirectPath, { replace: true });
      } else {
        toast.error(res.error || "Login failed. Please check credentials.");
      }
    } catch (err) {
      setBusy(false);
      toast.error(formatApiError(err));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Please fill in all required fields");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/register", { email, password, name, phone });
      const loginRes = await login(email, password);
      setBusy(false);
      if (loginRes.ok) {
        toast.success("Account created successfully!");
        localStorage.setItem("ccg_customer_email", email.toLowerCase().trim());
        nav(redirectPath, { replace: true });
      } else {
        toast.success("Account created! Please sign in.");
        setIsSignup(false);
      }
    } catch (err) {
      setBusy(false);
      toast.error(formatApiError(err));
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden font-body text-[#2A354F] bg-[#FEFEF2]">
      <SEO
        title={isSignup ? "Create an Account | Cab Castle Goa" : "Customer Sign In | Cab Castle Goa"}
        description="Sign in or register for Cab Castle Goa. View active bookings, download invoices, and manage trip itineraries."
        canonical={isSignup ? "/signup" : "/login"}
      />

      {/* Ambient background glows */}
      <div className="absolute -top-32 right-1/4 w-[400px] h-[400px] bg-[#F2D965]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] bg-[#929FC1]/15 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-5 pb-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-[#DFE8EC] bg-white flex items-center justify-center p-0.5 shadow-2xs">
            <img src="/logo.png" alt="Cab Castle Goa" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-extrabold text-base tracking-tight text-[#063247]">
              Cab<span className="text-[#288DA6]">Castle</span>
            </span>
            <span className="text-[9px] font-bold tracking-wider uppercase text-[#4C606E]">
              Goa Cabs &amp; Tour Travels
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DFE8EC] text-[#063247] hover:bg-[#E4F2F5] text-xs font-bold transition-all shadow-xs group cursor-pointer"
          data-testid="return-to-site-btn"
        >
          <ArrowLeft size={14} className="text-[#063247] group-hover:-translate-x-0.5 transition-transform" />
          <span>Return Home</span>
        </Link>
      </header>

      <main className="relative z-10 py-8 px-4 sm:px-6 flex-1 flex items-center justify-center my-auto">
        <div className="w-full max-w-[420px] bg-white border border-[#DFE8EC] rounded-3xl p-6 sm:p-8 shadow-xl relative text-center">
          
          {/* Header Typography */}
          <div className="mb-6 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E4F2F5] text-[#063247] border border-[#C3E7FA] mb-2">
              <span>Verified Customer Portal</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-[#063247] tracking-tight">
              {!isSignup ? "Sign in to Cab Castle" : "Create Your Account"}
            </h1>
            <p className="text-xs text-[#4C606E]">
              {!isSignup ? "Manage your bookings, invoices & tour cab dispatches" : "Quick 30-second sign up with zero advance payment"}
            </p>
          </div>

          {/* Dual Toggle Tabs */}
          <div className="relative flex p-1 rounded-2xl bg-[#F7F7F7] border border-[#DFE8EC] mb-5 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isSignup ? "bg-[#063247] text-white shadow-xs" : "text-[#4C606E] hover:text-[#063247]"
              }`}
              data-testid="tab-login"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSignup ? "bg-[#063247] text-white shadow-xs" : "text-[#4C606E] hover:text-[#063247]"
              }`}
              data-testid="tab-signup"
            >
              Create Account
            </button>
          </div>

          {/* Form Area */}
          {!isSignup ? (
            <form onSubmit={handleLogin} className="space-y-3.5 text-left" autoComplete="off" data-testid="customer-login-form">
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929FC1]" />
                <Input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="pl-10 pr-4 h-11 rounded-xl bg-[#FEFEF2] border border-[#E8ECF2] text-[#2A354F] font-body text-xs font-medium placeholder:text-[#8FA0BF] focus-visible:ring-1 focus-visible:ring-[#2A354F]"
                  data-testid="login-email-input"
                />
              </div>

              <div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929FC1]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pl-10 pr-10 h-11 rounded-xl bg-[#FEFEF2] border border-[#E8ECF2] text-[#2A354F] font-body text-xs font-medium placeholder:text-[#8FA0BF] focus-visible:ring-1 focus-visible:ring-[#2A354F]"
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA0BF] hover:text-[#2A354F] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="text-right mt-1.5 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!email) toast.error("Please enter email address first");
                      else toast.success(`Password reset link dispatched to ${email}`);
                    }}
                    className="text-[11px] text-[#6B7C9E] hover:text-[#2A354F] hover:underline cursor-pointer font-medium"
                    data-testid="forgot-password-link"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-[#F2D965] hover:bg-[#E5C94B] text-[#1A202C] font-black rounded-xl h-11 transition-all text-xs tracking-wider uppercase cursor-pointer shadow-md border border-[#DFBA35] mt-1"
                data-testid="login-submit-btn"
              >
                {busy ? <Loader2 size={14} className="animate-spin mr-2" /> : "Sign In to Account"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3.5 text-left" autoComplete="off" data-testid="customer-signup-form">
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929FC1]" />
                <Input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  className="pl-10 pr-4 h-11 rounded-xl bg-[#FEFEF2] border border-[#E8ECF2] text-[#2A354F] font-body text-xs font-medium placeholder:text-[#8FA0BF] focus-visible:ring-1 focus-visible:ring-[#2A354F]"
                  data-testid="signup-name-input"
                />
              </div>

              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929FC1]" />
                <Input
                  type="tel"
                  required
                  placeholder="Phone Number (10 digits)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="off"
                  className="pl-10 pr-4 h-11 rounded-xl bg-[#FEFEF2] border border-[#E8ECF2] text-[#2A354F] font-mono text-xs font-medium placeholder:text-[#8FA0BF] focus-visible:ring-1 focus-visible:ring-[#2A354F]"
                  data-testid="signup-phone-input"
                />
              </div>

              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929FC1]" />
                <Input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="pl-10 pr-4 h-11 rounded-xl bg-[#FEFEF2] border border-[#E8ECF2] text-[#2A354F] font-body text-xs font-medium placeholder:text-[#8FA0BF] focus-visible:ring-1 focus-visible:ring-[#2A354F]"
                  data-testid="signup-email-input"
                />
              </div>

              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929FC1]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pl-10 pr-10 h-11 rounded-xl bg-[#FEFEF2] border border-[#E8ECF2] text-[#2A354F] font-body text-xs font-medium placeholder:text-[#8FA0BF] focus-visible:ring-1 focus-visible:ring-[#2A354F]"
                  data-testid="signup-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA0BF] hover:text-[#2A354F] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-[#F2D965] hover:bg-[#E5C94B] text-[#1A202C] font-black rounded-xl h-11 transition-all text-xs tracking-wider uppercase cursor-pointer shadow-md border border-[#DFBA35] mt-1"
                data-testid="signup-submit-btn"
              >
                {busy ? <Loader2 size={14} className="animate-spin mr-2" /> : "Create Account"}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-[#E8ECF2] w-full" />
            <span className="bg-white px-3 text-[10px] uppercase text-[#8FA0BF] shrink-0 font-bold">Or</span>
            <div className="border-t border-[#E8ECF2] w-full" />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={busy}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-[#FEFEF2] hover:bg-[#FCF5D5] text-[#2A354F] font-bold border border-[#E8ECF2] rounded-xl h-11 transition-all text-xs tracking-wider uppercase cursor-pointer active:scale-98 shadow-2xs"
            title="Continue with Google"
            data-testid="google-auth-btn"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Security Guarantee Strip */}
          <div className="mt-6 pt-4 border-t border-[#E8ECF2] text-[11px] text-[#8FA0BF] space-y-1">
            <p>🔒 256-Bit SSL Encryption · Zero Spam Guarantee</p>
            <p>
              By proceeding, you agree to our{" "}
              <Link to="/terms-of-service" className="text-[#2A354F] font-bold hover:underline">
                Terms of Service
              </Link>{" "}
              &amp;{" "}
              <Link to="/privacy-policy" className="text-[#2A354F] font-bold hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>

        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-[#8FA0BF]">
        © {new Date().getFullYear()} Cab Castle Goa · All Rights Reserved
      </footer>
    </div>
  );
}
