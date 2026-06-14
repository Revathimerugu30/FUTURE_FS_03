import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/auth-context";

export type ProductLike = {
  _id: string;
  slug?: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  image: string;
  rating?: number;
  numReviews?: number;
};

export default function ProductCard({ p, index = 0 }: { p: ProductLike; index?: number }) {
  const { add } = useCart();
  const off = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="card-elevated group overflow-hidden"
    >
      <Link to="/products/$slug" params={{ slug: p.slug || p._id }}>
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-deep">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {off > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-maroon-deep">
              {off}% off
            </span>
          )}
          <span className="absolute right-3 top-3 rounded-full bg-maroon/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-cream backdrop-blur">
            {p.category}
          </span>
        </div>
      </Link>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-maroon-deep line-clamp-1">
          {p.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star size={12} className="fill-gold text-gold" />
          {(p.rating ?? 0).toFixed(1)} · {p.numReviews ?? 0} reviews
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-xl font-bold text-maroon">₹{p.price}</div>
            {!!p.mrp && p.mrp > p.price && (
              <div className="text-xs text-muted-foreground line-through">₹{p.mrp}</div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              add({ product: p._id, name: p.name, image: p.image, price: p.price });
            }}
            className="grid h-10 w-10 place-items-center rounded-full bg-maroon text-cream transition-transform hover:scale-110 hover:bg-maroon-deep"
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
