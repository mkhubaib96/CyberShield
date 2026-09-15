import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { backendMode, supabase } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "@/lib/secure-local";

export interface User { id: string; name: string; email: string; }
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mode: "cloud" | "local";
  login: (email: string, password: string, name?: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = "cybershield_user";
const ACCOUNT_KEY = "cybershield_account_v2";
const DEMO_EMAIL = "demo@cybershield.app";
const DEMO_PASSWORD = "CyberShield123!";

function getLocalUser(): User | null {
  try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) as User : null; } catch { return null; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => backendMode === "local" ? getLocalUser() : null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (backendMode === "local" || !supabase) { setIsLoading(false); return; }
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const sessionUser = data.session?.user;
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? "", name: String(sessionUser.user_metadata?.full_name ?? sessionUser.email?.split("@")[0] ?? "Parent") } : null);
      setIsLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? "", name: String(sessionUser.user_metadata?.full_name ?? sessionUser.email?.split("@")[0] ?? "Parent") } : null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const persistLocal = (next: User) => { setUser(next); localStorage.setItem(USER_KEY, JSON.stringify(next)); };

  const login = useCallback(async (email: string, password: string, name?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (backendMode === "cloud" && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error || !data.user) throw new Error(error?.message ?? "Unable to sign in.");
      setUser({ id: data.user.id, email: data.user.email ?? normalizedEmail, name: String(data.user.user_metadata?.full_name ?? name ?? normalizedEmail.split("@")[0]) });
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      persistLocal({ id: "demo-parent", name: name || "Demo Parent", email: DEMO_EMAIL });
      return;
    }

    const savedRaw = localStorage.getItem(ACCOUNT_KEY);
    if (!savedRaw) throw new Error(`Invalid credentials. Try the demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    let saved: { name: string; email: string; salt: string; hash: string } | null = null;
    try { saved = JSON.parse(savedRaw); } catch { saved = null; }
    if (!saved || saved.email.toLowerCase() !== normalizedEmail || !(await verifyPassword(password, saved.salt, saved.hash))) throw new Error(`Invalid credentials. Try the demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    persistLocal({ id: `local-${saved.email.toLowerCase()}`, name: saved.name, email: saved.email });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (backendMode === "cloud" && supabase) {
      const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password, options: { data: { full_name: name.trim() } } });
      if (error) throw new Error(error.message);
      if (data.user && data.session) setUser({ id: data.user.id, email: data.user.email ?? normalizedEmail, name: name.trim() });
      else throw new Error("Account created. Check your email to confirm the account, then sign in.");
      return;
    }

    const { salt, hash } = await hashPassword(password);
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ name: name.trim(), email: normalizedEmail, salt, hash }));
    persistLocal({ id: `local-${normalizedEmail}`, name: name.trim(), email: normalizedEmail });
  }, []);

  const logout = useCallback(async () => {
    if (backendMode === "cloud" && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    }
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value = useMemo(() => ({ user, isAuthenticated: !!user, isLoading, mode: backendMode, login, register, logout }), [user, isLoading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used within AuthProvider"); return ctx; }
