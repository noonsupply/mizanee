import type { User } from "@/types/auth";

const TOKEN_KEY = "mizanee_token";
const USER_KEY = "mizanee_user";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export const authStorage = {
  getToken(): string | null {
    if (!canUseStorage()) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (!canUseStorage()) return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (!canUseStorage()) return;
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): User | null {
    if (!canUseStorage()) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    if (!canUseStorage()) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    if (!canUseStorage()) return;
    localStorage.removeItem(USER_KEY);
  },
};
