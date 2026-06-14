import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Home, IndianRupee, Clock, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "@/lib/auth-context";
import { endpoints } from "@/lib/api";
import AddProductForm from "@/components/admin/AddProductForm";
import { getDistanceKm } from "@/utils/distance";
import { calculateDeliveryCharge, isInternationalShipping } from "@/utils/deliveryCharge";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Vasista Pickles" }] }),
  component: AdminDashboard,
});

const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"];

function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "products" | "orders" | "customers">("overview");
  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [dateInputs, setDateInputs] = useState<Record<string, { shippingDate: any; expectedDeliveryDate: any }>>({});

  useEffect(() => {
    if (loading) return;
    if (pathname === "/admin/login") return;
    if (!user) nav({ to: "/admin/login" });
    else if (user.role !== "admin") nav({ to: "/" });
  }, [user, loading, nav, pathname]);

  const stats = useQuery({ queryKey: ["admin.dashboard"], queryFn: async () => (await endpoints.admin.dashboard()).data, enabled: user?.role === "admin", retry: 0 });
  const products = useQuery({ queryKey: ["admin.products"], queryFn: async () => (await endpoints.products.list({ limit: 100 })).data.items, enabled: user?.role === "admin" && tab === "products", retry: 0 });
  const orders = useQuery({ queryKey: ["admin.orders"], queryFn: async () => (await endpoints.orders.all()).data.orders, enabled: user?.role === "admin" && tab === "orders", retry: 0 });
  const customers = useQuery({ queryKey: ["admin.customers"], queryFn: async () => (await endpoints.admin.customers()).data.customers, enabled: user?.role === "admin" && tab === "customers", retry: 0 });

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  const [adminLocation, setAdminLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'pending' | 'ready' | 'denied' | 'unavailable' | 'error'>('pending');

  const refreshAdminLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('unavailable');
      return;
    }

    setGeoStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAdminLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus('ready');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoStatus('denied');
        } else {
          setGeoStatus('error');
        }
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    refreshAdminLocation();
  }, []);

  const getLiveDistanceKm = (order: any) => {
    if (adminLocation && order?.address?.location?.lat != null && order.address.location.lng != null) {
      return getDistanceKm(adminLocation, order.address.location);
    }
    return null;
  };

  const formatDistance = (value: number | null) => (value != null && Number.isFinite(value) ? `${value.toFixed(1)} km` : 'Location not found');

  const getLiveShippingFee = (order: any) => {
    if (!order) return null;
    const distance = getLiveDistanceKm(order);
    if (distance == null) return null;
    return calculateDeliveryCharge(distance, order.items?.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0), isInternationalShipping(order.address?.country));
  };

  const getGeoStatusLabel = () => {
    switch (geoStatus) {
      case 'pending':
        return 'Obtaining admin location...';
      case 'ready':
        return adminLocation ? `Admin GPS active at ${adminLocation.lat.toFixed(4)}, ${adminLocation.lng.toFixed(4)}` : 'Admin GPS active';
      case 'denied':
        return 'Admin location access denied';
      case 'unavailable':
        return 'Geolocation unavailable in this browser';
      case 'error':
        return 'Unable to read admin location';
      default:
        return 'Admin GPS status unknown';
    }
  };

  const normalizeDate = (dateString: string | undefined | null) => {
    if (!dateString) return { year: currentYear, month: '', day: '' };
    // Parse ISO date string directly (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.sssZ)
    const match = String(dateString).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return { year: currentYear, month: '', day: '' };
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    // Detect corrupted dates (year < 1900)
    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
      return { year: currentYear, month: '', day: '' };
    }
    return { year, month, day };
  };

  const makeDateString = (
    baseDate: string | undefined | null,
    overrides: { year?: number; month?: number | string; day?: number | string },
  ) => {
    const parsed = normalizeDate(baseDate);
    const year = overrides.year ?? parsed.year;
    const month = overrides.month !== undefined && overrides.month !== '' ? Number(overrides.month) : parsed.month || 1;
    const day = overrides.day !== undefined && overrides.day !== '' ? Number(overrides.day) : parsed.day || 1;
    // Only return date string if values are valid
    if (month < 1 || month > 12 || day < 1 || day > 31) return '';
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const setStatus = useMutation({
    mutationFn: (payload: any) => endpoints.orders.setStatus(payload.id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin.orders"] }),
  });

  const augmentStatusPayload = (payload: any) => ({
    ...payload,
    ...(adminLocation ? { adminLocation } : {}),
  });
  const delProduct = useMutation({
    mutationFn: (id: string) => endpoints.products.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin.products"] }),
  });

  if (pathname === "/admin/login") {
    if (user?.role === "admin") {
      nav({ to: "/admin" });
      return null;
    }
    return <Outlet />;
  }

  if (!user || user.role !== "admin") return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "customers", label: "Customers", icon: Users },
  ] as const;

  const cards = stats.data ? [
    { label: "Customers", value: stats.data.stats.customers, icon: Users },
    { label: "Orders", value: stats.data.stats.orders, icon: ShoppingCart },
    { label: "Products", value: stats.data.stats.products, icon: Package },
    { label: "Pending", value: stats.data.stats.pending, icon: Clock },
    { label: "Revenue", value: `₹${stats.data.stats.revenue}`, icon: IndianRupee },
  ] : [];

  return (
    <div className="min-h-screen bg-cream-deep/30">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-maroon-deep p-6 text-cream lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gold text-maroon-deep font-display font-bold">V</div>
          <div>
            <div className="font-display text-lg font-bold">Vasista</div>
            <div className="text-[10px] uppercase tracking-wider text-gold">Admin</div>
          </div>
        </Link>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${tab === t.id ? "bg-gold text-maroon-deep font-semibold" : "text-cream/80 hover:bg-cream/5"}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-cream/70 hover:bg-cream/5"><Home size={16} /> Site</Link>
          <button onClick={() => { logout(); nav({ to: "/" }); }} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-cream/70 hover:bg-cream/5"><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      <main className="lg:ml-64">
        <header className="border-b border-border bg-cream px-6 py-5 lg:px-10">
          <h1 className="font-display text-2xl font-bold text-maroon-deep">Admin Console</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </header>

        <div className="flex gap-2 overflow-x-auto px-6 py-4 lg:hidden">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${tab === t.id ? "bg-maroon text-cream" : "bg-card text-maroon"}`}>{t.label}</button>
          ))}
        </div>

        <div className="px-6 py-8 lg:px-10">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {tab === "overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {cards.map((c) => (
                    <div key={c.label} className="card-elevated p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                          <div className="mt-2 font-display text-2xl font-bold text-maroon-deep">{c.value}</div>
                        </div>
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gold/20 text-maroon"><c.icon size={16} /></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <div className="card-elevated p-6">
                    <div className="flex items-center gap-2 font-display text-lg font-bold text-maroon-deep"><TrendingUp size={18} /> Revenue (last 12 days)</div>
                    <div className="mt-6 h-72">
                      {stats.data?.revenueByDay?.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.data.revenueByDay} margin={{ top: 10, right: 12, left: -12, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              dataKey="_id"
                              tickFormatter={(value: string) => value.slice(5)}
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                              interval="preserveStartEnd"
                              minTickGap={12}
                            />
                            <YAxis
                              tickFormatter={(value: number) => `₹${value}`}
                              tick={{ fill: "#6b7280", fontSize: 10 }}
                            />
                            <Tooltip
                              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#7c2d12"
                              strokeWidth={3}
                              dot={{ r: 4, strokeWidth: 0 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full min-h-[170px] items-center justify-center text-sm text-muted-foreground">No data yet.</div>
                      )}
                    </div>
                    {stats.data?.revenueByDay?.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-card p-3 text-sm">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total revenue</div>
                          <div className="mt-2 font-display text-xl font-bold text-maroon-deep">
                            ₹{stats.data.revenueByDay.reduce((sum: number, item: any) => sum + item.revenue, 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="rounded-lg bg-card p-3 text-sm">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">Average per day</div>
                          <div className="mt-2 font-display text-xl font-bold text-maroon-deep">
                            ₹{Math.round(stats.data.revenueByDay.reduce((sum: number, item: any) => sum + item.revenue, 0) / stats.data.revenueByDay.length).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="card-elevated p-6">
                    <div className="font-display text-lg font-bold text-maroon-deep">Recent orders</div>
                    <div className="mt-4 space-y-2">
                      {(stats.data?.recentOrders || []).slice(0, 6).map((o: any) => (
                        <div key={o._id} className="flex items-center justify-between text-sm">
                          <span>{o.user?.name || "—"}</span>
                          <span className="text-muted-foreground">₹{o.amount}</span>
                          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-maroon-deep">{o.status}</span>
                        </div>
                      ))}
                      {!stats.data?.recentOrders?.length && <div className="text-sm text-muted-foreground">No orders yet.</div>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "products" && (
              <div>
                <div className="flex items-center justify-between mb-3 px-2">
                  <h2 className="font-display text-lg font-bold">Products</h2>
                  <div>
                    <button onClick={() => setShowAdd(true)} className="btn-gold">Add Product</button>
                  </div>
                </div>

                <div className="card-elevated overflow-x-auto p-2">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3" /></tr>
                    </thead>
                    <tbody>
                      {(products.data || []).map((p: any) => (
                        <tr key={p._id} className="border-t border-border">
                          <td className="flex items-center gap-3 p-3">
                            <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                            <span className="font-semibold text-maroon-deep">{p.name}</span>
                          </td>
                          <td className="p-3">{p.category}</td>
                          <td className="p-3">₹{p.price}</td>
                          <td className="p-3">{p.stock}</td>
                          <td className="p-3 text-right space-x-2">
                            <button onClick={() => setEditingProduct(p)} className="text-xs font-semibold text-primary hover:underline">Edit</button>
                            <button onClick={() => confirm("Delete this product?") && delProduct.mutate(p._id)} className="text-xs font-semibold text-destructive hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!products.data?.length && <div className="p-12 text-center text-muted-foreground">No products.</div>}
                </div>

                {(showAdd || editingProduct) && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-2xl rounded bg-cream p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-maroon-deep">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                        <button onClick={() => { setShowAdd(false); setEditingProduct(null); }} className="text-muted-foreground">Close</button>
                      </div>
                      <div className="mt-3">
                        <AddProductForm
                          product={editingProduct || undefined}
                          onCancel={() => { setShowAdd(false); setEditingProduct(null); }}
                          onSuccess={() => {
                            qc.invalidateQueries({ queryKey: ['admin.products'] });
                            setShowAdd(false);
                            setEditingProduct(null);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <p className="p-4 text-xs text-muted-foreground">Add/edit product UI can be extended via <code>POST/PUT /api/products</code>.</p>
              </div>
            )}

            {tab === "orders" && (
              <>
                <div className="card-elevated mb-4 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-maroon-deep">Admin live GPS status</div>
                      <div className="text-sm text-muted-foreground">{getGeoStatusLabel()}</div>
                    </div>
                    <button type="button" onClick={refreshAdminLocation} className="btn-gold btn-sm">
                      Refresh location
                    </button>
                  </div>
                </div>
                <div className="card-elevated overflow-x-auto p-2">
                  <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">Order</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Customer / Delivery</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Shipping</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orders.data || []).map((o: any) => {
                      const ship = normalizeDate(dateInputs[o._id]?.shippingDate ?? o.shippingDate);
                      const deliver = normalizeDate(dateInputs[o._id]?.expectedDeliveryDate ?? o.expectedDeliveryDate);
                      
                      const setLocalDateInput = (orderId: string, field: 'shippingDate' | 'expectedDeliveryDate', overrides: { year?: number; month?: number | string; day?: number | string }) => {
                        const currentValue = dateInputs[orderId]?.[field] ?? (field === 'shippingDate' ? o.shippingDate : o.expectedDeliveryDate);
                        setDateInputs(prev => ({
                          ...prev,
                          [orderId]: {
                            ...prev[orderId],
                            [field]: makeDateString(currentValue, overrides),
                          },
                        }));
                      };

                      const commitDateChange = (orderId: string, field: 'shippingDate' | 'expectedDeliveryDate') => {
                        const newValue = dateInputs[orderId]?.[field];
                        if (newValue) {
                          setStatus.mutate(augmentStatusPayload({
                            id: orderId,
                            [field]: newValue,
                            status: o.status,
                          }));
                          setDateInputs(prev => {
                            const copy = { ...prev };
                            if (copy[orderId]) {
                              delete copy[orderId][field];
                              if (Object.keys(copy[orderId]).length === 0) delete copy[orderId];
                            }
                            return copy;
                          });
                        }
                      };

                      return (
                        <tr key={o._id} className="border-t border-border">
                          <td className="p-3 font-mono text-xs">#{o._id.slice(-6).toUpperCase()}</td>
                          <td className="p-3">
                            <div className="flex flex-col items-center gap-2 text-center">
                              <img src={o.items?.[0]?.image || ''} alt={o.items?.[0]?.name || 'Product'} className="h-20 w-20 rounded object-cover border border-border" />
                              <div className="text-xs">
                                <div className="font-semibold text-maroon-deep">{o.items?.[0]?.name || '—'}</div>
                                <div className="text-muted-foreground">Qty: {o.items?.[0]?.quantity || 1}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 space-y-2">
                            <div className="font-semibold text-maroon-deep">{o.user?.name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{o.user?.email}</div>
                            <div className="text-xs text-muted-foreground">{o.address?.line1} {o.address?.line2}</div>
                            <div className="text-xs text-muted-foreground">{o.address?.city}, {o.address?.state} {o.address?.pincode}</div>
                            <div className="text-xs text-muted-foreground">{o.address?.phone}</div>
                          </td>
                          <td className="p-3 font-semibold">₹{o.amount}</td>
                          <td className="p-3 space-y-2 text-xs text-muted-foreground">
                            <div>Shipping fee: {o.shippingFee != null ? `₹${o.shippingFee}` : 'Unable to determine exact location'}</div>
                            <div>Distance from admin: {adminLocation && o?.address?.location?.lat != null && o.address.location.lng != null ? formatDistance(getLiveDistanceKm(o)) : 'Distance unavailable'}</div>
                            {adminLocation && o?.address?.location?.lat != null && o.address.location.lng != null ? (
                              <div>Live shipping estimate: {getLiveShippingFee(o) != null ? `₹${getLiveShippingFee(o)}` : 'Unable to determine exact location'}</div>
                            ) : (
                              <div>Live shipping estimate: Unable to determine exact location</div>
                            )}
                            <div>Ship on: {o.shippingDate ? new Date(o.shippingDate).toLocaleDateString() : '—'}</div>
                            <div>Deliver by: {o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString() : '—'}</div>
                          </td>
                          <td className="p-3 space-y-2">
                          <div>
                            <select value={o.status} onChange={(e) => setStatus.mutate(augmentStatusPayload({ id: o._id, status: e.target.value }))}
                              className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-maroon-deep w-full">
                              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <input id={`approved-${o._id}`} type="checkbox" checked={o.isApproved || false}
                              onChange={(e) => setStatus.mutate(augmentStatusPayload({ id: o._id, isApproved: e.target.checked, approvalNote: e.target.checked ? 'Approved by admin' : 'Approval revoked', status: o.status }))}
                              className="h-4 w-4 rounded border-border bg-card text-maroon-deep" />
                            <label htmlFor={`approved-${o._id}`}>Approved</label>
                          </div>
                          <div className="grid gap-2">
                            <div className="grid gap-1">
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Ship on</div>
                              <div className="flex gap-1 items-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="text-[9px] text-muted-foreground">MM</div>
                                  <select
                                    value={ship.month || ''}
                                    onChange={(e) => setLocalDateInput(o._id, 'shippingDate', { month: e.target.value })}
                                    onBlur={() => commitDateChange(o._id, 'shippingDate')}
                                    className="w-14 rounded border border-border bg-card px-1 py-1 text-xs"
                                  >
                                    <option value="">—</option>
                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
                                      <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="text-[9px] text-muted-foreground">DD</div>
                                  <select
                                    value={ship.day || ''}
                                    onChange={(e) => setLocalDateInput(o._id, 'shippingDate', { day: e.target.value })}
                                    onBlur={() => commitDateChange(o._id, 'shippingDate')}
                                    className="w-14 rounded border border-border bg-card px-1 py-1 text-xs"
                                  >
                                    <option value="">—</option>
                                    {Array.from({length: 31}, (_, i) => i + 1).map((d) => (
                                      <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="text-[9px] text-muted-foreground">YYYY</div>
                                  <select
                                    value={ship.year}
                                    onChange={(e) => setLocalDateInput(o._id, 'shippingDate', { year: Number(e.target.value) })}
                                    onBlur={() => commitDateChange(o._id, 'shippingDate')}
                                    className="rounded border border-border bg-card px-1 py-1 text-xs"
                                  >
                                    {yearOptions.map((year) => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="grid gap-1">
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Deliver by</div>
                              <div className="flex gap-1 items-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="text-[9px] text-muted-foreground">MM</div>
                                  <select
                                    value={deliver.month || ''}
                                    onChange={(e) => setLocalDateInput(o._id, 'expectedDeliveryDate', { month: e.target.value })}
                                    onBlur={() => commitDateChange(o._id, 'expectedDeliveryDate')}
                                    className="w-14 rounded border border-border bg-card px-1 py-1 text-xs"
                                  >
                                    <option value="">—</option>
                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
                                      <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="text-[9px] text-muted-foreground">DD</div>
                                  <select
                                    value={deliver.day || ''}
                                    onChange={(e) => setLocalDateInput(o._id, 'expectedDeliveryDate', { day: e.target.value })}
                                    onBlur={() => commitDateChange(o._id, 'expectedDeliveryDate')}
                                    className="w-14 rounded border border-border bg-card px-1 py-1 text-xs"
                                  >
                                    <option value="">—</option>
                                    {Array.from({length: 31}, (_, i) => i + 1).map((d) => (
                                      <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="text-[9px] text-muted-foreground">YYYY</div>
                                  <select
                                    value={deliver.year}
                                    onChange={(e) => setLocalDateInput(o._id, 'expectedDeliveryDate', { year: Number(e.target.value) })}
                                    onBlur={() => commitDateChange(o._id, 'expectedDeliveryDate')}
                                    className="rounded border border-border bg-card px-1 py-1 text-xs"
                                  >
                                    {yearOptions.map((year) => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
                {!orders.data?.length && <div className="p-12 text-center text-muted-foreground">No orders.</div>}
              </div>
            </>
            )}

            {tab === "customers" && (
              <div className="card-elevated overflow-x-auto p-2">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Joined</th></tr>
                  </thead>
                  <tbody>
                    {(customers.data || []).map((c: any) => (
                      <tr key={c._id} className="border-t border-border">
                        <td className="p-3 font-semibold text-maroon-deep">{c.name}</td>
                        <td className="p-3">{c.email}</td>
                        <td className="p-3">{c.phone || "—"}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!customers.data?.length && <div className="p-12 text-center text-muted-foreground">No customers yet.</div>}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
