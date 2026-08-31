import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Loader2, ArrowLeft, Car, Eye, EyeOff, Sparkles } from "lucide-react";
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
      toast.success("Welcome back");
      const to = loc.state?.from?.pathname || "/admin";
      nav(to, { replace: true });
    } else {
      toast.error(res.error || "Invalid email or password");
    }
  }

  const handleQuickFill = () => {
    setEmail("dasgiradur@gmail.com");
    setPassword("Admin@1234");
    toast.info("Admin credentials filled! Click 'Sign In' to proceed.");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden font-body text-[#063247] bg-[#F7F7F7]">
      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#E4F2F5]" />
        <div className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full bg-[#C3E7FA]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 px-5 sm:px-10 pt-4 pb-1 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-[#DFE8EC] bg-white flex items-center justify-center p-0.5 group-hover:scale-105 transition-all">
            <img
              src="/logo.png"
              alt="Cab Castle Goa"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="font-display font-extrabold text-base text-[#063247]">
              Cab<span className="text-[#288DA6]">Castle</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#4C606E]">
              Goa Cabs
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DFE8EC] text-[#063247] hover:bg-[#063247] hover:text-white font-mono text-xs font-bold transition-all shadow-sm group cursor-pointer"
          data-testid="return-to-site-btn"
        >
          <ArrowLeft size={14} className="text-[#2A8FA8] group-hover:text-white transition-colors" />
          <span>Return to Site</span>
        </Link>
      </header>

      {/* Center Admin Card */}
      <main className="relative z-10 py-6 sm:py-10 px-4 sm:px-6 flex-1 flex items-center justify-center my-auto">
        <div className="w-full max-w-[400px] bg-white border border-[#DFE8EC] rounded-[2rem] p-6 sm:p-8 shadow-2xl relative text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm border border-[#DFE8EC] bg-white flex items-center justify-center p-0.5 mx-auto mb-3">
            <img
              src="/logo.png"
              alt="Cab Castle Goa"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[#063247] tracking-tight mb-1">
            Cab Castle Admin
          </h1>
          <p className="text-xs text-[#8496A2] mb-6">Enter your administrator credentials to continue</p>

          <form onSubmit={submit} className="space-y-3.5 text-left" autoComplete="off">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-[#4C606E] font-bold">Email</Label>
              <div className="relative mt-1">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8496A2]" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dasgiradur@gmail.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="pl-10 pr-4 h-11 rounded-xl bg-[#F7F7F7] border border-[#DFE8EC] text-[#063247] font-body text-xs font-semibold placeholder-[#8496A2] focus-visible:ring-2 focus-visible:ring-[#2A8FA8]"
                  data-testid="admin-email"
                />
              </div>
            </div>

            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-[#4C606E] font-bold">Password</Label>
              <div className="relative mt-1">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8496A2]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="pl-10 pr-10 h-11 rounded-xl bg-[#F7F7F7] border border-[#DFE8EC] text-[#063247] font-body text-xs font-semibold placeholder-[#8496A2] focus-visible:ring-2 focus-visible:ring-[#2A8FA8]"
                  data-testid="admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8496A2] hover:text-[#063247] p-1 cursor-pointer transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#4C606E] hover:text-[#063247] transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-[#2A8FA8] cursor-pointer"
                  data-testid="admin-remember-me-checkbox"
                />
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-[#2A8FA8] hover:bg-[#22768C] text-white font-mono font-bold rounded-xl h-11 transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg mt-2"
              data-testid="admin-login-btn"
            >
              {busy ? <Loader2 size={15} className="animate-spin mr-2" /> : "Sign In to Dispatch"}
            </Button>

            {/* Quick Autofill Helper for Mobile / Desktop */}
            <div className="pt-2 border-t border-[#DFE8EC]/80 text-center">
              <button
                type="button"
                onClick={handleQuickFill}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0E7490] hover:text-[#063247] hover:underline cursor-pointer transition-colors"
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>Tap to Autofill Admin Credentials</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-2 text-center font-mono text-[10px] text-[#4C606E]">
        © {new Date().getFullYear()} Cab Castle Goa · Admin Console
      </footer>
    </div>
  );
}
