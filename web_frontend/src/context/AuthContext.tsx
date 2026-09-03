import {
  createContext,
  useState,
  type ReactNode,  // ← fix #1: type-only import
} from "react";

export interface User {
  roll: number;
  name: string;
  ruet_stdn_mail: string;
  gender: "male" | "female";
  wallet_balance: number;
  preferreable_hall_id: string | null;
  account_creted_date: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_SESSION_MS = 24 * 60 * 60 * 1000;

// ── fix #2: useEffect বাদ, সরাসরি localStorage পড়ো ──
const getInitialToken = () => {
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
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(getInitialToken);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    localStorage.setItem("auth_expires_at", String(Date.now() + AUTH_SESSION_MS));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_expires_at");
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
    <AuthContext.Provider
      value={{ user, token, loading: false, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; // ← fix #3: useAuth আলাদা file এ নিয়ে যাবো