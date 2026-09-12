import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  clearRememberMePreference,
  getActiveSupabaseClient,
  setRememberMePreference,
  supabasePersistent,
  supabaseSessionOnly,
} from "../lib/supabase";

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
  login: (token: string, user: User, rememberMe?: boolean, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_SESSION_MS = 24 * 60 * 60 * 1000;
const REMEMBERED_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

const AUTH_KEYS = ["auth_token", "auth_user", "auth_expires_at", "auth_remember_me"];

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

  const rememberedToken = localStorage.getItem("auth_token");
  if (rememberedToken) {
    const expiresAt = Number(localStorage.getItem("auth_expires_at"));
    const remembered = localStorage.getItem("auth_remember_me") === "true";
    if (remembered && expiresAt > Date.now()) {
      return { storage: localStorage, token: rememberedToken };
    }
    clearAuth(localStorage);
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

const persistAuth = (token: string, user: User, rememberMe: boolean) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;
  clearAuth(otherStorage);

  storage.setItem("auth_token", token);
  storage.setItem("auth_user", JSON.stringify(user));
  storage.setItem(
    "auth_expires_at",
    String(Date.now() + (rememberMe ? REMEMBERED_SESSION_MS : DEFAULT_SESSION_MS)),
  );
  storage.setItem("auth_remember_me", String(rememberMe));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      setLoading(true);
      try {
        const client = getActiveSupabaseClient();
        const { data, error } = await client.auth.getSession();

        if (error || !data.session) {
          clearAuth(localStorage);
          clearAuth(sessionStorage);
          clearRememberMePreference();
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }

        const authUser = getInitialUser();
        if (authUser) {
          setUser(authUser);
          setToken(data.session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();

    const persistentSubscription = supabasePersistent.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        clearAuth(localStorage);
        clearAuth(sessionStorage);
        clearRememberMePreference();
        setUser(null);
        setToken(null);
      }
    });

    const sessionSubscription = supabaseSessionOnly.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        clearAuth(localStorage);
        clearAuth(sessionStorage);
        clearRememberMePreference();
        setUser(null);
        setToken(null);
      }
    });

    return () => {
      persistentSubscription.data.subscription.unsubscribe();
      sessionSubscription.data.subscription.unsubscribe();
    };
  }, []);

  const login = async (newToken: string, newUser: User, rememberMe = false, refreshToken?: string) => {
    const client = getActiveSupabaseClient();
    if (refreshToken) {
      await client.auth.setSession({ access_token: newToken, refresh_token: refreshToken });
    }

    persistAuth(newToken, newUser, rememberMe);
    setRememberMePreference(rememberMe);
    setToken(newToken);
    setUser(newUser);
    if (!rememberMe) {
      clearAuth(localStorage);
    }
  };

  const logout = async () => {
    try {
      await getActiveSupabaseClient().auth.signOut();
    } catch {
      // Ignore sign-out errors; we still clear local app state.
    }

    clearAuth(localStorage);
    clearAuth(sessionStorage);
    clearRememberMePreference();
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
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };