import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, useCart } from "@/lib/auth-context";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Vasista Pickles" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const [addr, setAddr] = useState({ 
    name: user?.name || "", 
    phone: "", 
    line1: "", 
    line2: "", 
    area: "", 
    city: "", 
    state: "", 
    pincode: "", 
    country: "India" 
  });
  const [pay, setPay] = useState<"COD" | "ONLINE">("COD");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [estimate, setEstimate] = useState<{ deliveryDistanceKm: number | null; shippingFee: number | null; message?: string } | null>(null);
  const [estimating, setEstimating] = useState(false);

  const discount = coupon === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  if (!user) return (
    <div className="container-x pt-40 text-center">
      <p>Please sign in to checkout.</p>
      <Link to="/login" className="btn-maroon mt-4">Sign in</Link>
    </div>
  );
  if (items.length === 0) return (
    <div className="container-x pt-40 text-center">
      <p>Your cart is empty.</p>
      <Link to="/products" className="btn-maroon mt-4">Browse pickles</Link>
    </div>
  );

  const place = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr("");
    try {
      await endpoints.orders.create({
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        address: addr, paymentMethod: pay, couponCode: coupon || undefined,
      });
      clear();
      nav({ to: "/dashboard" });
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };

  const doEstimate = async () => {
    setEstimating(true);
    setEstimate(null);
    try {
      const { data } = await endpoints.orders.estimate({ address: addr, subtotal });
      setEstimate({ deliveryDistanceKm: data.deliveryDistanceKm, shippingFee: data.shippingFee, message: data.message });
    } catch (err: any) {
      setEstimate({ deliveryDistanceKm: null, shippingFee: null, message: err.message });
    } finally { setEstimating(false); }
  };

  return (
    <div className="bg-cream pt-32 pb-20">
      <div className="container-x">
        <h1 className="font-display text-4xl font-bold text-maroon-deep">Checkout</h1>
        <div className="gold-divider !mx-0 !my-3" />
        <form onSubmit={place} className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="card-elevated space-y-4 p-7 lg:col-span-2">
            <h2 className="font-display text-xl font-bold text-maroon-deep">Shipping address</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {(["name", "phone", "line1", "line2", "area", "city", "state", "pincode"] as const).map((k) => (
                <input key={k} required={["name", "phone", "line1", "city", "state", "pincode"].includes(k)} placeholder={k === 'line1' ? 'House / Building / Street' : k === 'line2' ? 'Landmark / Locality' : k} value={(addr as any)[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })}
                  className="rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
              ))}
            </div>

            <h2 className="mt-6 font-display text-xl font-bold text-maroon-deep">Payment</h2>
            <div className="grid gap-2 md:grid-cols-2">
              {(["COD", "ONLINE"] as const).map((p) => (
                <label key={p} className={`cursor-pointer rounded-lg border-2 p-4 text-sm ${pay === p ? "border-gold bg-gold/10" : "border-border"}`}>
                  <input type="radio" name="pay" className="mr-2" checked={pay === p} onChange={() => setPay(p)} />
                  {p === "COD" ? "Cash on Delivery" : "Online Payment"}
                </label>
              ))}
            </div>

            <h2 className="mt-6 font-display text-xl font-bold text-maroon-deep">Coupon</h2>
            <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Try WELCOME10" className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/40" />
            {err && <p className="text-sm text-destructive">{err}</p>}
          </div>

          <div className="card-elevated h-fit p-7">
            <h2 className="font-display text-xl font-bold text-maroon-deep">Order summary</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.product} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>₹{i.price * i.quantity}</span></li>
              ))}
            </ul>
            <div className="my-4 h-px bg-border" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{estimate ? (estimate.shippingFee != null ? `₹${estimate.shippingFee}` : estimate.message || 'Unable to determine exact location') : 'Not estimated'}</span></div>
              <div className="flex justify-between"><span>Estimated delivery distance</span><span>{estimate ? (estimate.deliveryDistanceKm != null ? `${estimate.deliveryDistanceKm.toFixed(1)} km` : estimate.message || 'Distance unavailable') : 'Not estimated'}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>− ₹{discount}</span></div>}
              <div className="flex justify-between border-t border-border pt-2 text-lg font-bold text-maroon-deep"><span>Total (excl. shipping)</span><span>₹{total}</span></div>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={doEstimate} disabled={estimating} className="btn-gold btn-sm">{estimating ? 'Estimating…' : 'Estimate shipping'}</button>
                <button type="button" onClick={place} disabled={loading || estimating} className="btn-maroon btn-sm">{loading ? 'Placing order...' : 'Place order'}</button>
              </div>
            </div>
            <button disabled={loading} className="btn-maroon mt-6 w-full disabled:opacity-60">{loading ? "Placing order..." : "Place order"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
