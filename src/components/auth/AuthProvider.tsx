"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ApiError } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import type { LoginResponse, RegisterInput, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = authStorage.getToken();
    const cached = authStorage.getUser();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    if (cached) setUser(cached);
    try {
      const data = await api.get<{ user: User }>("/api/auth/me");
      authStorage.setUser(data.user);
      setUser(data.user);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        authStorage.removeToken();
        authStorage.removeUser();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<LoginResponse>("/api/auth/login", { email, password }, false);
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await api.post<LoginResponse>("/api/auth/register", input, false);
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    authStorage.removeToken();
    authStorage.removeUser();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return ctx;
}
