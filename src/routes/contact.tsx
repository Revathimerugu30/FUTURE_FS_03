import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Vasista Pickles" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try { await endpoints.contact.send(form); setStatus("ok"); setForm({ name: "", email: "", phone: "", message: "" }); }
    catch (e: any) { setStatus("err"); setErr(e.message); }
  };

  return (
    <div className="bg-cream pt-32 pb-20">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Get in Touch</span>
          <h1 className="section-title mt-3">We'd Love to Hear From You</h1>
          <div className="gold-divider" />
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 lg:col-span-2">
            {[
              { icon: MapPin, title: "Visit us", lines: ["Godavarikhani, Telangana", "India - 505209"] },
              { icon: Phone, title: "Call us", lines: ["+91 98765 43210", "Mon - Sat, 9am - 7pm"] },
              { icon: Mail, title: "Email us", lines: ["hello@vasistapickles.com"] },
              { icon: Clock, title: "Business hours", lines: ["Monday – Saturday: 9:00 - 19:00", "Sunday: Closed"] },
            ].map((c) => (
              <div key={c.title} className="card-elevated flex gap-4 p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-maroon/5 text-maroon"><c.icon size={18} /></div>
                <div>
                  <div className="font-display text-lg font-bold text-maroon-deep">{c.title}</div>
                  {c.lines.map((l) => <div key={l} className="text-sm text-muted-foreground">{l}</div>)}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit} className="card-elevated space-y-4 p-7 lg:col-span-3">
            <div className="grid gap-4 md:grid-cols-2">
              <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
              <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            </div>
            <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            <textarea required rows={6} placeholder="Tell us about your enquiry..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            <button disabled={status === "sending"} className="btn-maroon w-full disabled:opacity-60">{status === "sending" ? "Sending..." : "Send message"}</button>
            {status === "ok" && <p className="text-sm text-green-700">✓ Message sent! We'll get back to you soon.</p>}
            {status === "err" && <p className="text-sm text-destructive">{err}</p>}
          </motion.form>
        </div>
      </div>
    </div>
  );
}
