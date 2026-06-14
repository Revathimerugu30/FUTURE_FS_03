import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Package, Heart, Bell, User as UserIcon, LogOut, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — Vasista Pickles" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, logout, loading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"orders" | "wishlist" | "notifications" | "profile">("orders");

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);

  const orders = useQuery({ queryKey: ["orders.mine"], queryFn: async () => (await endpoints.orders.mine()).data.orders, enabled: !!user, retry: 0 });
  const wishlist = useQuery({ queryKey: ["wishlist"], queryFn: async () => (await endpoints.wishlist.list()).data.items, enabled: !!user, retry: 0 });
  const notifs = useQuery({ queryKey: ["notifs"], queryFn: async () => (await endpoints.notifications.list()).data.notifications, enabled: !!user, retry: 0 });

  if (!user) return null;

  const tabs = [
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: UserIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-cream-deep/30">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-maroon-deep p-6 text-cream lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gold text-maroon-deep font-display font-bold">V</div>
          <div className="font-display text-lg font-bold">Vasista</div>
        </Link>
        <div className="mt-10 text-xs uppercase tracking-wider text-gold/70">Account</div>
        <div className="mt-2 font-display text-lg">{user.name}</div>
        <div className="text-xs text-cream/60">{user.email}</div>

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${tab === t.id ? "bg-gold text-maroon-deep font-semibold" : "text-cream/80 hover:bg-cream/5"}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-cream/70 hover:bg-cream/5"><Home size={16} /> Back to site</Link>
          <button onClick={() => { logout(); nav({ to: "/" }); }} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-cream/70 hover:bg-cream/5"><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      <main className="lg:ml-64">
        <header className="border-b border-border bg-cream px-6 py-5 lg:px-10">
          <h1 className="font-display text-2xl font-bold text-maroon-deep">Welcome back, {user.name.split(" ")[0]} ✨</h1>
          <p className="text-sm text-muted-foreground">Manage your orders, wishlist and account.</p>
        </header>

        <div className="flex gap-2 overflow-x-auto px-6 py-4 lg:hidden">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${tab === t.id ? "bg-maroon text-cream" : "bg-card text-maroon"}`}>{t.label}</button>
          ))}
        </div>

        <div className="px-6 py-8 lg:px-10">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {tab === "orders" && (
              <div className="space-y-3">
                {orders.data?.length ? orders.data.map((o: any) => (
                  <div key={o._id} className="card-elevated flex items-center justify-between p-5">
                    <div>
                      <div className="text-xs text-muted-foreground">Order #{o._id.slice(-6).toUpperCase()}</div>
                      <div className="mt-1 font-display text-lg font-bold text-maroon-deep">₹{o.amount}</div>
                      <div className="text-xs text-muted-foreground">{o.items.length} items · {new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-maroon-deep">{o.status}</span>
                  </div>
                )) : <div className="rounded-2xl border-2 border-dashed border-maroon/20 p-12 text-center text-muted-foreground">No orders yet. <Link to="/products" className="text-maroon underline">Start shopping</Link></div>}
              </div>
            )}
            {tab === "wishlist" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wishlist.data?.length ? wishlist.data.map((p: any) => (
                  <div key={p._id} className="card-elevated overflow-hidden">
                    <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
                    <div className="p-4">
                      <div className="font-display font-bold text-maroon-deep">{p.name}</div>
                      <div className="text-sm text-maroon">₹{p.price}</div>
                    </div>
                  </div>
                )) : <div className="col-span-full rounded-2xl border-2 border-dashed border-maroon/20 p-12 text-center text-muted-foreground">No items in wishlist.</div>}
              </div>
            )}
            {tab === "notifications" && (
              <div className="space-y-3">
                {notifs.data?.length ? notifs.data.map((n: any) => (
                  <div key={n._id} className={`card-elevated p-5 ${!n.isRead ? "border-l-4 border-gold" : ""}`}>
                    <div className="font-semibold text-maroon-deep">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.message}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                )) : <div className="rounded-2xl border-2 border-dashed border-maroon/20 p-12 text-center text-muted-foreground">No notifications.</div>}
              </div>
            )}
            {tab === "profile" && (
              <div className="card-elevated max-w-2xl p-7">
                <div className="font-display text-xl font-bold text-maroon-deep">Account details</div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Name</div><div className="mt-1 font-semibold">{user.name}</div></div>
                  <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div><div className="mt-1 font-semibold">{user.email}</div></div>
                  <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Phone</div><div className="mt-1 font-semibold">{user.phone || "—"}</div></div>
                  <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Role</div><div className="mt-1 font-semibold capitalize">{user.role}</div></div>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">Profile editing endpoints are wired (<code>PUT /api/users/me</code>, <code>PUT /api/users/me/password</code>) — extend this form to use them.</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
