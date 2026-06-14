import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/auth-context";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Vasista Pickles" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, update, remove } = useCart();
  const shipping = subtotal > 999 ? 0 : subtotal > 0 ? 60 : 0;
  return (
    <div className="bg-cream pt-32 pb-20">
      <div className="container-x">
        <h1 className="font-display text-4xl font-bold text-maroon-deep">Your Cart</h1>
        <div className="gold-divider !mx-0 !my-3" />
        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-maroon/20 p-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/products" className="btn-maroon mt-4">Browse pickles</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((i, idx) => (
                <motion.div key={i.product} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  className="card-elevated flex gap-4 p-4">
                  <img src={i.image} alt={i.name} className="h-24 w-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="font-display text-lg font-bold text-maroon-deep">{i.name}</div>
                    <div className="text-sm text-maroon">₹{i.price}</div>
                    <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-border px-3 py-1">
                      <button onClick={() => update(i.product, Math.max(1, i.quantity - 1))}><Minus size={14} /></button>
                      <span className="w-6 text-center text-sm font-semibold">{i.quantity}</span>
                      <button onClick={() => update(i.product, i.quantity + 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => remove(i.product)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                    <div className="font-bold text-maroon-deep">₹{i.price * i.quantity}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="card-elevated h-fit p-7">
              <h2 className="font-display text-xl font-bold text-maroon-deep">Order Summary</h2>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
                <div className="my-3 h-px bg-border" />
                <div className="flex justify-between text-lg font-bold text-maroon-deep"><span>Total</span><span>₹{subtotal + shipping}</span></div>
              </div>
              <Link to="/checkout" className="btn-maroon mt-6 w-full">Proceed to Checkout</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
