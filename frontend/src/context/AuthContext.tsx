"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, saveToken, getRefreshToken ,removeToken, saveRefreshToken,removeRefreshToken } from "@/lib/token";
import api from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = getToken();
    if (savedToken) {
      setToken(savedToken);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser() {
    try {
      const res = await api.get("/api/account");
      setUser(res.data.user);
    } catch {
      removeToken();
    }
    setLoading(false);
  }

  async function login(email: string, password: string) {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, refreshToken, user } = res.data;
      saveToken(token);
      saveRefreshToken(refreshToken);  // ← add this
      setToken(token);
      setUser(user);
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.error || "Login failed" };
    }
  }

  async function logout() {
    const refreshToken = getRefreshToken();
    try {
      await api.post("/api/auth/logout", { refreshToken });
    } catch {}
    removeToken();
    removeRefreshToken();
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}