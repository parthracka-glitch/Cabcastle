import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api, { formatApiError } from "@/lib/api";
import { IUser } from "@/types";

interface AuthContextType {
  user: IUser | false | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: (googleData: any) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<IUser>) => void;
  refreshUser: () => Promise<void>;
}

const AuthCtx = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | false | null>(null); // null = unknown, false = anon
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchCurrentUser() {
    const token = localStorage.getItem("dh_token");
    if (!token) {
      setUser(false);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<IUser>("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("dh_token");
      setUser(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("dh_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  }

  async function loginWithGoogle(googleData: any) {
    try {
      const { data } = await api.post("/auth/google", googleData);
      localStorage.setItem("dh_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  }

  function updateUser(updatedData: Partial<IUser>) {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : prev));
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("dh_token");
    localStorage.removeItem("ccg_last_booking");
    localStorage.removeItem("ccg_customer_email");
    localStorage.removeItem("ccg_customer_name");
    localStorage.removeItem("ccg_customer_phone");
    localStorage.removeItem("ccg_customer_aadhar");
    localStorage.removeItem("ccg_customer_dl");
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("ccg_booking_") || key.startsWith("dh_")) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
    setUser(false);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, loginWithGoogle, logout, updateUser, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
