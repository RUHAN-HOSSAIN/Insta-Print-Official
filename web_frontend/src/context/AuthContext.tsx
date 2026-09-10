import { createContext, useState, type ReactNode } from "react";

// ─── User type ────────────────────────────────────────────────────────────────
// Backend এর UserMetadata + extra fields
export interface User {
  id: string;
  roll: number;
  name: string;
  email: string;               // ruet_stdn_mail
  gender: "male" | "female";
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

// ─── Initial state (localStorage থেকে) ───────────────────────────────────────

const getInitialToken = (): string | null => {
  const expiresAt = Number(localStorage.getItem("auth_expires_at"));
  if (!expiresAt || expiresAt <= Date.now()) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_expires_at");
    return null;
  }
  return localStorage.getItem("auth_token");
};

const getInitialUser = (): User | null => {
  const expiresAt = Number(localStorage.getItem("auth_expires_at"));
  if (!expiresAt || expiresAt <= Date.now()) return null;
  try {
    const saved = localStorage.getItem("auth_user");
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
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    localStorage.setItem(
      "auth_expires_at",
      String(Date.now() + (rememberMe ? REMEMBERED_SESSION_MS : DEFAULT_SESSION_MS)),
    );
    localStorage.setItem("auth_remember_me", String(rememberMe));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_expires_at");
    localStorage.removeItem("auth_remember_me");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem("auth_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading: false, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };