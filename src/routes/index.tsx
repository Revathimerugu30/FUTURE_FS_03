import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, Leaf, Truck, ShieldCheck, Star, Quote } from "lucide-react";
import { endpoints } from "@/lib/api";
import ProductCard from "@/components/site/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vasista Pickles — Authentic Homemade Pickles from Godavarikhani" },
      { name: "description", content: "Tradition in every bite, taste in every jar. Premium handcrafted Andhra & Telangana pickles." },
    ],
  }),
  component: HomePage,
});

const HERO_IMG =
  "/images/maindb.png";

const FEATURES = [
  { icon: Leaf, title: "100% Natural", text: "Hand-picked produce, no preservatives or artificial colours." },
  { icon: Award, title: "Heritage Recipes", text: "Three generations of authentic Andhra & Telangana craft." },
  { icon: Truck, title: "Pan-India Delivery", text: "Carefully packed and shipped to your doorstep." },
  { icon: ShieldCheck, title: "FSSAI Certified", text: "Hygienically prepared in our certified kitchen." },
];

const CATEGORIES = [
  { name: "Avakaya Pickle", img: "/images/avakaya-pickle.png" },
  { name: "Gongura Pickle", img: "/images/gongura.png" },
  { name: "Amla Pickle", img: "/images/amla.jpg" },
  { name: "Chicken Pickle", img: "/images/chick.png" },
  { name: "Prawn Pickle", img: "/images/prawn.png" },
];

const TESTIMONIALS = [
  { name: "Lakshmi P.", city: "Hyderabad", text: "Tastes exactly like the avakaya my grandmother used to make. Pure nostalgia in a jar.", rating: 5 },
  { name: "Rohit K.", city: "Bengaluru", text: "The chicken pickle is incredible — perfectly spiced and the mutton is on another level.", rating: 5 },
  { name: "Anitha R.", city: "Chennai", text: "Beautifully packed, arrived fresh, and the flavour is genuinely premium. Worth every rupee.", rating: 5 },
];

const STATS = [
  { value: "15+", label: "Years of Heritage" },
  { value: "25K+", label: "Happy Families" },
  { value: "9", label: "Signature Pickles" },
  { value: "100%", label: "Homemade" },
];

function HomePage() {
  const { data } = useQuery({
    queryKey: ["products", { featured: true }],
    queryFn: async () => (await endpoints.products.list({ featured: true, limit: 6 })).data,
    retry: 0,
  });
  const featured = data?.items || [];

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-maroon-deep text-cream">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-maroon-deep via-maroon-deep/85 to-maroon-deep/95" />
        </div>
        <div className="container-x relative grid gap-12 py-32 md:grid-cols-2 md:items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="eyebrow"
            >
              ✦ Godavarikhani · Telangana
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-4 font-display text-5xl font-bold leading-[1.05] text-cream md:text-7xl"
            >
              Authentic <span className="italic text-gold">Homemade</span> Pickles Crafted with Tradition
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 max-w-xl text-lg text-cream/80"
            >
              From Godavarikhani kitchens to homes across India — every jar carries
              three generations of recipes, slow craft, and uncompromising taste.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <Link to="/products" className="btn-gold">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="btn-outline">Explore Collection</Link>
            </motion.div>

            <div className="mt-12 grid grid-cols-4 gap-6 border-t border-gold/20 pt-8">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                >
                  <div className="font-display text-2xl font-bold text-gold md:text-3xl">{s.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-cream/60">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Floating jar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto aspect-square w-full max-w-md"
            >
              <div className="absolute inset-0 rounded-full bg-gold/20 blur-3xl" />
              <img
                src="/images/maindb.png"
                alt="Vasista Pickles jar"
                className="relative h-full w-full rounded-full object-cover ring-8 ring-gold/30"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-6 rounded-full border-2 border-dashed border-gold/40"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-cream py-20">
        <div className="container-x">
          <div className="text-center">
            <span className="eyebrow">Why Choose Vasista</span>
            <h2 className="section-title mt-3">A taste worth coming home to</h2>
            <div className="gold-divider" />
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-elevated p-7 text-center"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-maroon/5 text-maroon">
                  <f.icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-maroon-deep">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-cream-deep/40 py-20">
        <div className="container-x">
          <div className="text-center">
            <span className="eyebrow">Featured Categories</span>
            <h2 className="section-title mt-3">Discover our signature jars</h2>
            <div className="gold-divider" />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Link
                key={c.name}
                to="/products"
                search={{ category: c.name } as any}
                className="group block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="relative overflow-hidden rounded-2xl shadow-lg"
                >
                  <div className="aspect-[4/5]">
                    <img src={c.img} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-maroon-deep/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-xl font-bold text-cream">{c.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gold">Explore <ArrowRight size={12} /></div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="bg-cream py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Best Sellers</span>
              <h2 className="section-title mt-3">Crowd favourites</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-maroon hover:text-gold">View all →</Link>
          </div>
          {featured.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p: any, i: number) => (
                <ProductCard key={p._id} p={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl border-2 border-dashed border-maroon/20 bg-cream-deep/30 p-12 text-center text-muted-foreground">
              <p>Products will appear here once the backend is connected and seeded.</p>
              <p className="mt-1 text-xs">Set <code className="rounded bg-maroon/10 px-1.5 py-0.5">VITE_API_URL</code> and run <code className="rounded bg-maroon/10 px-1.5 py-0.5">npm run seed</code> in /backend.</p>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative bg-maroon-deep py-20 text-cream">
        <div className="container-x">
          <div className="text-center">
            <span className="eyebrow">Customer Stories</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-cream md:text-5xl">Loved across India</h2>
            <div className="gold-divider" />
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.blockquote
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-2xl bg-cream/5 p-8 ring-1 ring-gold/20"
              >
                <Quote size={28} className="text-gold/60" />
                <p className="mt-4 text-cream/85">"{t.text}"</p>
                <div className="mt-6 flex items-center gap-1 text-gold">
                  {Array.from({ length: t.rating }).map((_, k) => (
                    <Star key={k} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                <div className="mt-4 font-display text-lg font-bold text-cream">{t.name}</div>
                <div className="text-xs uppercase tracking-wider text-gold/80">{t.city}</div>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold/20 py-20">
        <div className="container-x text-center">
          <span className="eyebrow">Get in touch</span>
          <h2 className="section-title mt-3">Bulk orders, gifting & enquiries</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            From festive hampers to wedding favours, we craft bespoke pickle gift boxes.
            Let's create something memorable together.
          </p>
          <Link to="/contact" className="btn-maroon mt-8">Contact us</Link>
        </div>
      </section>
    </div>
  );
}
