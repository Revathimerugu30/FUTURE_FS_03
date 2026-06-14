import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { endpoints } from "@/lib/api";
import { useCart } from "@/lib/auth-context";

export const Route = createFileRoute("/products/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await endpoints.products.get(slug)).data,
    retry: 0,
  });
  const { data: rev } = useQuery({
    queryKey: ["reviews", slug],
    queryFn: async () => (await endpoints.reviews.list(data!.product._id)).data,
    enabled: !!data?.product?._id,
    retry: 0,
  });

  if (isLoading) return <div className="container-x pt-40 text-center text-muted-foreground">Loading...</div>;
  const p = data?.product;
  if (!p) return <div className="container-x pt-40 text-center"><p>Product not found.</p><Link to="/products" className="btn-maroon mt-4">Browse products</Link></div>;

  return (
    <div className="bg-cream pt-32 pb-20">
      <div className="container-x grid gap-12 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-elevated overflow-hidden">
          <img src={p.image} alt={p.name} className="w-full" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
          <span className="eyebrow">{p.category}</span>
          <h1 className="mt-3 font-display text-4xl font-bold text-maroon-deep md:text-5xl">{p.name}</h1>
          <div className="mt-3 flex items-center gap-1 text-sm">
            <Star size={14} className="fill-gold text-gold" />
            <span className="font-semibold">{(p.rating ?? 0).toFixed(1)}</span>
            <span className="text-muted-foreground">· {p.numReviews ?? 0} reviews</span>
          </div>
          <p className="mt-5 text-muted-foreground">{p.description}</p>
          <div className="mt-6 flex items-end gap-4">
            <div className="text-4xl font-bold text-maroon">₹{p.price}</div>
            {!!p.mrp && p.mrp > p.price && <div className="pb-1 text-muted-foreground line-through">₹{p.mrp}</div>}
          </div>
          {!!p.ingredients?.length && (
            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-maroon">Ingredients</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.ingredients.map((i: string) => <span key={i} className="rounded-full bg-maroon/5 px-3 py-1 text-xs text-maroon-deep">{i}</span>)}
              </div>
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <button onClick={() => add({ product: p._id, name: p.name, image: p.image, price: p.price })} className="btn-maroon flex-1"><ShoppingBag size={16} /> Add to Cart</button>
            <Link to="/cart" className="btn-gold"><Heart size={16} /> Buy Now</Link>
          </div>
        </motion.div>
      </div>

      <div className="container-x mt-20">
        <h2 className="font-display text-2xl font-bold text-maroon-deep">Customer Reviews</h2>
        <div className="gold-divider !mx-0 !my-3" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(rev?.reviews || []).map((r: any) => (
            <div key={r._id} className="card-elevated p-5">
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} className="fill-gold" />)}
              </div>
              <p className="mt-2 text-sm">{r.review}</p>
              <div className="mt-3 text-xs font-semibold text-maroon-deep">— {r.user?.name || "Anonymous"}</div>
            </div>
          ))}
          {!rev?.reviews?.length && <div className="text-sm text-muted-foreground">No reviews yet.</div>}
        </div>
      </div>
    </div>
  );
}
