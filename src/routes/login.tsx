import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Vasista Pickles" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try { const u = await login(form.email, form.password); nav({ to: u.role === "admin" ? "/admin" : "/dashboard" }); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon-deep to-maroon pt-28 pb-12">
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="text-cream">
          <span className="eyebrow">Welcome back</span>
          <h1 className="mt-3 font-display text-4xl font-bold text-cream md:text-5xl">Sign in to your account</h1>
          <p className="mt-4 text-cream/80">Continue your journey with Vasista Pickles — track orders, manage wishlist, and unlock member offers.</p>
          <p className="mt-6 text-xs text-cream/60">Demo customer: <span className="text-gold">customer@test.com / Customer@123</span></p>
          <p className="mt-2 text-xs text-cream/60">Admin? <Link to="/admin/login" className="text-gold underline">Sign in here →</Link></p>
        </div>
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="rounded-3xl bg-cream p-8 shadow-2xl">
          <h2 className="font-display text-2xl font-bold text-maroon-deep">Sign in</h2>
          <div className="mt-6 space-y-4">
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button disabled={loading} className="btn-maroon w-full disabled:opacity-60">{loading ? "Signing in..." : "Sign In"}</button>
            <p className="text-center text-sm text-muted-foreground">No account? <Link to="/register" className="font-semibold text-maroon hover:text-gold">Create one</Link></p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
