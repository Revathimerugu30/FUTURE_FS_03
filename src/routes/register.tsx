import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create Account — Vasista Pickles" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr("");
    try { await register(form); nav({ to: "/dashboard" }); }
    catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon-deep to-maroon pt-28 pb-12">
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="text-cream">
          <span className="eyebrow">Join the family</span>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Create your account</h1>
          <p className="mt-4 text-cream/80">Unlock member offers, save your favourites, and get priority access to seasonal batches.</p>
        </div>
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="rounded-3xl bg-cream p-8 shadow-2xl">
          <h2 className="font-display text-2xl font-bold text-maroon-deep">Create account</h2>
          <div className="mt-6 space-y-4">
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            <input required type="password" placeholder="Password (min 6 chars)" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button disabled={loading} className="btn-maroon w-full disabled:opacity-60">{loading ? "Creating..." : "Create account"}</button>
            <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-maroon">Sign in</Link></p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
