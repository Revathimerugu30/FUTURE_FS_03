import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const T = [
  { name: "Lakshmi P.", city: "Hyderabad", rating: 5, text: "Tastes exactly like my grandmother's avakaya. Genuinely nostalgic." },
  { name: "Rohit K.", city: "Bengaluru", rating: 5, text: "Chicken pickle is incredible. Mutton pickle is on another level." },
  { name: "Anitha R.", city: "Chennai", rating: 5, text: "Beautifully packed, arrived fresh, premium flavour. Worth every rupee." },
  { name: "Sandeep V.", city: "Mumbai", rating: 4, text: "Gongura pachadi reminded me of home in Vijayawada. Excellent." },
  { name: "Priya S.", city: "Pune", rating: 5, text: "Ordered the gift hamper for Sankranti — friends loved it. Will reorder." },
  { name: "Karthik M.", city: "Delhi", rating: 5, text: "Authentic, fresh, and the packaging is premium. Highly recommend." },
];

export const Route = createFileRoute("/testimonials")({
  head: () => ({ meta: [{ title: "Reviews — Vasista Pickles" }] }),
  component: () => (
    <div className="bg-cream pt-32 pb-20">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Customer Stories</span>
          <h1 className="section-title mt-3">Loved Across India</h1>
          <div className="gold-divider" />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {T.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="card-elevated p-7">
              <Quote className="text-gold/60" size={28} />
              <div className="mt-2 flex gap-1">{Array.from({ length: t.rating }).map((_, k) => <Star key={k} size={14} className="fill-gold text-gold" />)}</div>
              <p className="mt-3 text-sm">{t.text}</p>
              <div className="mt-4 font-display text-lg font-bold text-maroon-deep">{t.name}</div>
              <div className="text-xs uppercase tracking-wider text-gold">{t.city}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  ),
});
