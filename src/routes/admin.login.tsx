import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — Vasista Pickles" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr("");
    try {
      await adminLogin(form.email, form.password);
      // capture geolocation and persist to server
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            await (await import('@/lib/api')).endpoints.admin.setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          } catch (err) {}
        }, () => {}, { enableHighAccuracy: false, timeout: 10000 });
      }
      nav({ to: "/admin" });
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };

  // After successful admin login, attempt to capture and persist admin location
  // We listen for storage changes to detect the login event and then send geolocation.
  useEffect(() => {
    const trySendLocation = async () => {
      try {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          try {
            await (await import('@/lib/api')).endpoints.admin.setLocation({ lat, lng });
          } catch (err) {
            // ignore
          }
        }, () => {}, { enableHighAccuracy: false, timeout: 10000 });
      } catch (err) {}
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'vp_token' || e.key === 'vp_user') {
        trySendLocation();
      }
    };
    window.addEventListener('storage', onStorage);
    // attempt once on mount in case login happened in same tab
    trySendLocation();
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return (
    <div className="grid min-h-screen place-items-center bg-maroon-deep p-4 text-cream">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="w-full max-w-md rounded-3xl bg-cream p-8 text-foreground shadow-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-maroon text-gold"><ShieldCheck size={22} /></div>
        <h1 className="mt-4 text-center font-display text-2xl font-bold text-maroon-deep">Admin Console</h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">Vasista Pickles · Restricted access</p>
        <div className="mt-6 space-y-4">
          <input required type="email" placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
          <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button disabled={loading} className="btn-maroon w-full disabled:opacity-60">{loading ? "Authenticating..." : "Enter dashboard"}</button>
          
          <p className="text-center text-xs"><a href="/" className="text-maroon hover:text-gold">← Back to site</a></p>
        </div>
      </motion.form>
    </div>
  );
}
