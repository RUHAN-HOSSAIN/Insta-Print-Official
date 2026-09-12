import { createContext, useState, type ReactNode } from "react";

// ─── User type ────────────────────────────────────────────────────────────────
// Backend এর UserMetadata + extra fields

// ─── User type ────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  roll: number;
  name: string;
  email: string;
  gender: "Male" | "Female";
  wallet_balance: number;
  preferred_hall_id: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_SESSION_MS = 24 * 60 * 60 * 1000;
const REMEMBERED_SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const AUTH_KEYS = ["auth_token", "auth_user", "auth_expires_at"];

const clearAuth = (storage: Storage) => {
  AUTH_KEYS.forEach((key) => storage.removeItem(key));
};

const getStoredAuth = (): { storage: Storage; token: string } | null => {
  const sessionToken = sessionStorage.getItem("auth_token");
  if (sessionToken) {
    const expiresAt = Number(sessionStorage.getItem("auth_expires_at"));
    if (expiresAt > Date.now()) return { storage: sessionStorage, token: sessionToken };
    clearAuth(sessionStorage);
  }

  return null;
};

const getInitialToken = (): string | null => {
  return getStoredAuth()?.token ?? null;
};

const getInitialUser = (): User | null => {
  const storedAuth = getStoredAuth();
  if (!storedAuth) return null;
  try {
    const saved = storedAuth.storage.getItem("auth_user");
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(getInitialToken);

  const login = (newToken: string, newUser: User, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    clearAuth(otherStorage);
    storage.setItem("auth_token", newToken);
    storage.setItem("auth_user", JSON.stringify(newUser));
    storage.setItem(
    "auth_expires_at",
      String(Date.now() + (rememberMe ? REMEMBERED_SESSION_MS : DEFAULT_SESSION_MS)),
    );
    storage.setItem("auth_remember_me", String(rememberMe));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearAuth(localStorage);
    clearAuth(sessionStorage);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    const storage = getStoredAuth()?.storage ?? sessionStorage;
    storage.setItem("auth_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading: false, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };