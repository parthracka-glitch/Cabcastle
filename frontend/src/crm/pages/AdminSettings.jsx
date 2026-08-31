import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User, Settings, KeyRound, BellRing, Phone, Mail, ShieldCheck, Save, CheckCircle2, LogOut
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  
  const [profile, setProfile] = useState({
    name: user?.name || "Dasgir Adur",
    email: user?.email || "dasgiradur@gmail.com",
    phone: "+91 70266 48960",
    supportEmail: "dasgiradur@gmail.com",
    autoConfirm: true,
    emailAlerts: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });

  const [saving, setSaving] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  useEffect(() => {
    api.get("/admin/settings")
      .then(({ data }) => {
        if (data) {
          setProfile((prev) => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            supportEmail: data.supportEmail || prev.supportEmail,
            autoConfirm: data.autoConfirm !== undefined ? data.autoConfirm : prev.autoConfirm,
            emailAlerts: data.emailAlerts !== undefined ? data.emailAlerts : prev.emailAlerts,
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to load admin settings:", err);
      });
  }, []);

  async function handleSignout() {
    await logout();
    toast.success("Signed out successfully");
    nav("/admin/login");
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/settings", profile);
      toast.success("Admin Profile & Settings saved!");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass || !passwords.confirmPass) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      toast.error("New passwords do not match");
      return;
    }
    setUpdatingPass(true);
    try {
      await api.post("/admin/change-password", {
        current_password: passwords.current,
        new_password: passwords.newPass,
      });
      toast.success("Admin password updated successfully!");
      setPasswords({ current: "", newPass: "", confirmPass: "" });
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setUpdatingPass(false);
    }
  }

  return (
    <div className="space-y-5 max-w-[1000px] mx-auto pb-8 font-body text-[#063247] text-left">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[#063247] tracking-tight">
              Settings &amp; Profile
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4F2F5] text-[#0E7490] border border-[#C3E7FA]">
              Admin Control
            </span>
          </div>
          <p className="text-xs text-[#4C606E] mt-1 font-normal">
            Manage dispatch profile parameters, business hotline, notifications, and security credentials.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSignout}
          variant="outline"
          className="h-9 px-3.5 rounded-xl text-xs font-semibold text-rose-700 bg-white border-rose-200 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
          data-testid="admin-settings-logout-top"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </Button>
      </div>

      {/* ── PROFILE & CONFIG CARD ── */}
      <div className="bg-white border border-[#DFE8EC] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[#DFE8EC]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#DFE8EC] bg-[#F8FAFC] p-0.5 shrink-0">
              <img
                src="/3d-character-saiesh.png"
                alt="Admin Avatar"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#063247]">{profile.name}</h2>
              <div className="text-xs text-[#5A7184] font-medium">{profile.email}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#063247]">Admin Name</Label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="pl-8.5 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
                  data-testid="settings-name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#063247]">Admin Email</Label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="pl-8.5 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
                  data-testid="settings-email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#063247]">WhatsApp Helpline Number</Label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="pl-8.5 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
                  data-testid="settings-phone"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#063247]">Support Email</Label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  value={profile.supportEmail}
                  onChange={(e) => setProfile({ ...profile, supportEmail: e.target.value })}
                  className="pl-8.5 bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
                  data-testid="settings-support-email"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-[#DFE8EC]" />

          {/* System Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#063247] uppercase tracking-wider">System Preferences</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE8EC]">
                <div>
                  <div className="font-semibold text-xs text-[#063247]">Auto-Confirm Online Deposits</div>
                  <div className="text-[11px] text-[#5A7184] mt-0.5">Automatically mark bookings confirmed upon successful online payment</div>
                </div>
                <Switch
                  checked={profile.autoConfirm}
                  onCheckedChange={(v) => setProfile({ ...profile, autoConfirm: v })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE8EC]">
                <div>
                  <div className="font-semibold text-xs text-[#063247]">Instant Lead Alerts</div>
                  <div className="text-[11px] text-[#5A7184] mt-0.5">Receive immediate notification alerts when a customer submits an inquiry</div>
                </div>
                <Switch
                  checked={profile.emailAlerts}
                  onCheckedChange={(v) => setProfile({ ...profile, emailAlerts: v })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#063247] hover:bg-[#063247]/90 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              data-testid="save-settings-btn"
            >
              <Save size={13} />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* ── CHANGE PASSWORD CARD ── */}
      <div className="bg-white border border-[#DFE8EC] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#DFE8EC]">
          <KeyRound size={16} className="text-[#0E7490]" />
          <h2 className="font-display text-base font-bold text-[#063247]">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#063247]">Current Password</Label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
                placeholder="••••••••"
                data-testid="current-password-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#063247]">New Password</Label>
              <Input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                className="bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
                placeholder="••••••••"
                data-testid="new-password-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#063247]">Confirm New Password</Label>
              <Input
                type="password"
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                className="bg-[#F8FAFC] border-[#DFE8EC] text-[#063247] text-xs h-9 rounded-xl focus:border-[#063247] focus:bg-white"
                placeholder="••••••••"
                data-testid="confirm-password-input"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updatingPass}
              className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#063247] hover:bg-[#063247]/90 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              data-testid="update-password-btn"
            >
              <KeyRound size={13} />
              <span>{updatingPass ? "Updating..." : "Update Password"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
