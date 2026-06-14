import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { endpoints, type User } from "./api";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<User>;
  logout: () => void;
  setUser: (u: User | null) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

const STORAGE_TOKEN = "vp_token";
const STORAGE_USER = "vp_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_USER);
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
    setLoading(false);
  }, []);

  const persist = (token: string, u: User) => {
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const { data } = await endpoints.auth.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  };
  const adminLogin = async (email: string, password: string) => {
    const { data } = await endpoints.auth.adminLogin({ email, password });
    persist(data.token, data.user);
    return data.user;
  };
  const register: AuthCtx["register"] = async (payload) => {
    const { data } = await endpoints.auth.register(payload);
    persist(data.token, data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, adminLogin, register, logout, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// --- Cart (localStorage) ---
export type CartItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

const CART_KEY = "vp_cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setItems(JSON.parse(localStorage.getItem(CART_KEY) || "[]")); } catch {}
  }, []);
  const save = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("vp:cart"));
  };
  useEffect(() => {
    const h = () => {
      try { setItems(JSON.parse(localStorage.getItem(CART_KEY) || "[]")); } catch {}
    };
    window.addEventListener("vp:cart", h);
    return () => window.removeEventListener("vp:cart", h);
  }, []);
  return {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
    add: (it: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const q = it.quantity || 1;
      const i = items.findIndex((x) => x.product === it.product);
      if (i >= 0) {
        const next = [...items];
        next[i] = { ...next[i], quantity: next[i].quantity + q };
        save(next);
      } else save([...items, { ...it, quantity: q }]);
    },
    update: (productId: string, quantity: number) =>
      save(items.map((i) => (i.product === productId ? { ...i, quantity } : i))),
    remove: (productId: string) =>
      save(items.filter((i) => i.product !== productId)),
    clear: () => save([]),
  };
}
