import axios from "axios";

const baseURL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:5000/api";

export const api = axios.create({ baseURL, withCredentials: false });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vp_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err?.response?.data?.message || err?.message || "Something went wrong";
    return Promise.reject(new Error(msg));
  }
);

// --- helpers ---
export const endpoints = {
  auth: {
    register: (data: any) => api.post("/auth/register", data),
    login: (data: any) => api.post("/auth/login", data),
    adminLogin: (data: any) => api.post("/auth/admin/login", data),
    me: () => api.get("/auth/me"),
    forgot: (email: string) => api.post("/auth/forgot-password", { email }),
    reset: (token: string, password: string) =>
      api.post("/auth/reset-password", { token, password }),
  },
  products: {
    list: (params: any = {}) => api.get("/products", { params }),
    get: (slug: string) => api.get(`/products/${slug}`),
    categories: () => api.get("/products/categories"),
    create: (data: any) => api.post("/products", data),
    update: (id: string, data: any) => api.put(`/products/${id}`, data),
    remove: (id: string) => api.delete(`/products/${id}`),
  },
  orders: {
    create: (data: any) => api.post("/orders", data),
    estimate: (data: any) => api.post("/orders/estimate", data),
    mine: () => api.get("/orders/mine"),
    all: () => api.get("/orders/all"),
    get: (id: string) => api.get(`/orders/${id}`),
    setStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
  },
  reviews: {
    list: (productId: string) => api.get(`/reviews/product/${productId}`),
    upsert: (productId: string, data: any) =>
      api.post(`/reviews/product/${productId}`, data),
  },
  wishlist: {
    list: () => api.get("/wishlist"),
    toggle: (productId: string) => api.post(`/wishlist/${productId}`),
  },
  notifications: {
    list: () => api.get("/notifications"),
    read: (id: string) => api.put(`/notifications/${id}/read`),
    readAll: () => api.put("/notifications/read-all"),
  },
  contact: {
    send: (data: any) => api.post("/contact", data),
  },
  admin: {
    dashboard: () => api.get("/admin/dashboard"),
    customers: (q = "") => api.get("/admin/customers", { params: { q } }),
    deleteCustomer: (id: string) => api.delete(`/admin/customers/${id}`),
    setLocation: (data: any) => api.put('/admin/location', data),
  },
  user: {
    update: (data: any) => api.put("/users/me", data),
    changePassword: (data: any) => api.put("/users/me/password", data),
  },
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  profileImage?: string;
};
