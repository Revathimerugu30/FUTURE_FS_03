import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { endpoints } from "@/lib/api";
import ProductCard from "@/components/site/ProductCard";

const CATS = ["All", "Avakaya Pickle", "Gongura Pickle", "Lemon Pickle", "Amla Pickle", "Garlic Pickle", "Mango Pickle", "Chicken Pickle", "Mutton Pickle", "Fish Pickle", "Prawn Pickle", "kakarkaya Pickle"];

const CATEGORY_IMAGES: Record<string, string> = {
  "Avakaya Pickle": "/images/avakaya-pickle.png",
  "Gongura Pickle": "/images/gongura.png",
  "Lemon Pickle": "/images/lemon.png",
  "Amla Pickle": "/images/amla.jpg",
  "Garlic Pickle": "/images/garlic.png",
  "Mango Pickle": "/images/mango.png",
  "Chicken Pickle": "/images/chick.png",
  "Mutton Pickle": "/images/mutton.jpeg",
  "Fish Pickle": "/images/fish.png",
  "Prawn Pickle": "/images/prawn.png",
  "kakarkaya Pickle": "/images/kakarkaya.png",
};

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Our Pickles — Vasista Pickles" }, { name: "description", content: "Browse our complete collection of authentic homemade pickles." }] }),
  validateSearch: (s: Record<string, unknown>) => ({ category: (s.category as string) || "", q: (s.q as string) || "", sort: (s.sort as string) || "-createdAt" }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const [q, setQ] = useState(search.q);

  const { data, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: async () => (await endpoints.products.list({ category: search.category || undefined, q: search.q || undefined, sort: search.sort, limit: 48 })).data,
    retry: 0,
  });

  const selectedCategory = (search.category as string) || "";
  const categoryImage = selectedCategory ? CATEGORY_IMAGES[selectedCategory] : undefined;

  return (
    <div className="bg-cream pt-32 pb-20">
      <div className="container-x">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="eyebrow">Our Collection</span>
          <h1 className="section-title mt-3">Handcrafted Pickles</h1>
          <div className="gold-divider" />
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Browse our complete range of authentic Andhra & Telangana pickles.</p>
        </motion.div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={(e) => { e.preventDefault(); nav({ search: (s: any) => ({ ...s, q }) }); }} className="relative w-full max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pickles..." className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none ring-gold/40 focus:ring-2" />
          </form>
          <select value={search.sort} onChange={(e) => nav({ search: (s: any) => ({ ...s, sort: e.target.value }) })} className="rounded-full border border-border bg-card px-5 py-3 text-sm outline-none">
            <option value="-createdAt">Newest</option>
            <option value="price">Price: Low → High</option>
            <option value="-price">Price: High → Low</option>
            <option value="-rating">Top Rated</option>
          </select>
        </div>

        {selectedCategory && categoryImage && (
          <div className="mt-6 rounded-lg overflow-hidden">
            <img src={categoryImage} alt={selectedCategory} className="w-full h-44 object-cover rounded-lg" />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {CATS.map((c) => {
            const active = (search.category || "All") === c;
            return (
              <button key={c} onClick={() => nav({ search: (s: any) => ({ ...s, category: c === "All" ? "" : c }) })}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${active ? "bg-maroon text-cream" : "bg-card text-maroon hover:bg-maroon/10"}`}>
                {c}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="mt-16 text-center text-muted-foreground">Loading products...</div>
        ) : data?.items?.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p: any, i: number) => <ProductCard key={p._id} p={p} index={i} />)}
          </div>
        ) : (
          <div className="mt-16 rounded-2xl border-2 border-dashed border-maroon/20 p-12 text-center text-muted-foreground">
            <p>No products found. Make sure the backend is running and seeded.</p>
            <Link to="/" className="mt-4 inline-block text-sm font-semibold text-maroon hover:text-gold">← Back home</Link>
          </div>
        )}
      </div>
    </div>
  );
}
