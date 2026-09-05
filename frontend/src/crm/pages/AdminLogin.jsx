import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (user && user.role === "admin") nav("/admin", { replace: true });
  }, [user, nav]);

  React.useEffect(() => {
    const savedEmail = localStorage.getItem("ccg_admin_remember_email");
    const savedRemember = localStorage.getItem("ccg_admin_remember_me") === "true";
    if (savedRemember && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error("Please enter both email and password");
      return;
    }

    setBusy(true);
    const res = await login(cleanEmail, cleanPassword);
    setBusy(false);
    if (res.ok) {
      if (rememberMe) {
        localStorage.setItem("ccg_admin_remember_email", cleanEmail);
        localStorage.setItem("ccg_admin_remember_me", "true");
      } else {
        localStorage.removeItem("ccg_admin_remember_email");
        localStorage.removeItem("ccg_admin_remember_me");
      }
      toast.success("Welcome to Dispatch Console");
      const to = loc.state?.from?.pathname || "/admin";
      nav(to, { replace: true });
    } else {
      toast.error(res.error || "Invalid administrator credentials");
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden font-body text-[#1B2922] bg-[#E7EDEB]">
      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#DEEDE4]/60 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full bg-[#7C1F31]/10 blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 px-5 sm:px-10 pt-5 pb-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-[#CBD8D4] bg-white flex items-center justify-center p-0.5 group-hover:scale-105 transition-all">
            <img
              src="/logo.png"
              alt="Cab Castle Goa"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="font-display font-black text-base text-[#1B2922]">
              Cab<span className="text-[#69A481]">Castle</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4D6257]">
              Goa Fleet Dispatch
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#CBD8D4] text-[#1B2922] hover:bg-[#DEEDE4] text-xs font-bold transition-all shadow-xs group cursor-pointer"
          data-testid="return-to-site-btn"
        >
          <ArrowLeft size={14} className="text-[#1B2922] group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Site</span>
        </Link>
      </header>

      {/* Center Admin Card */}
      <main className="relative z-10 py-6 sm:py-10 px-4 sm:px-6 flex-1 flex items-center justify-center my-auto">
        <div className="w-full max-w-[400px] bg-white border border-[#CBD8D4] rounded-3xl p-6 sm:p-8 shadow-xl relative text-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xs border border-[#CBD8D4] bg-white flex items-center justify-center p-1 mx-auto mb-3">
            <img
              src="/logo.png"
              alt="Cab Castle Goa"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#DEEDE4] text-[#245339] border border-[#69A481]/30 mb-2">
            <ShieldCheck size={12} />
            <span>Authorized Dispatch Only</span>
          </div>
          <h1 className="font-display text-2xl font-black text-[#1B2922] tracking-tight mb-1">
            Admin Console
          </h1>
          <p className="text-xs text-[#4D6257] mb-6">Enter your administrator credentials to access fleet dispatch</p>

          <form onSubmit={submit} className="space-y-4 text-left" autoComplete="off">
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-[#4D6257] font-bold">Email</Label>
              <div className="relative mt-1">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C8277]" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cabcastlegoa.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="pl-10 pr-4 h-11 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] text-[#1B2922] font-body text-xs font-semibold placeholder:text-[#6C8277] focus-visible:ring-1 focus-visible:ring-[#69A481]"
                  data-testid="admin-email"
                />
              </div>
            </div>

            <div>
              <Label className="text-[11px] uppercase tracking-wider text-[#4D6257] font-bold">Password</Label>
              <div className="relative mt-1">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C8277]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="pl-10 pr-10 h-11 rounded-xl bg-[#E7EDEB] border border-[#CBD8D4] text-[#1B2922] font-body text-xs font-semibold placeholder:text-[#6C8277] focus-visible:ring-1 focus-visible:ring-[#69A481]"
                  data-testid="admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C8277] hover:text-[#1B2922] p-1 cursor-pointer transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs py-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4D6257] hover:text-[#1B2922] transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-[#7C1F31] cursor-pointer"
                  data-testid="admin-remember-me-checkbox"
                />
                Remember email on this device
              </label>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-[#7C1F31] hover:bg-[#631826] text-white font-black rounded-xl h-11 transition-all text-xs uppercase tracking-wider cursor-pointer shadow-sm border border-[#7C1F31] mt-2"
              data-testid="admin-login-btn"
            >
              {busy ? <Loader2 size={15} className="animate-spin mr-2" /> : "Sign In to Dispatch Console"}
            </Button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#6C8277]">
        © {new Date().getFullYear()} Cab Castle Goa · Internal Dispatch Console
      </footer>
    </div>
  );
}
