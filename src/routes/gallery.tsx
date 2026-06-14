import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

const IMGS = [
  "/images/avakaya-pickle.png",
  "/images/garlic.png",
  "/images/kakarkaya.png",
  "/images/lemon.png",
  "/images/gongura.png",
  "/images/chick.png",
  "/images/fish.png",
  "/images/mutton.jpeg",
  "/images/prawn.png",
];

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Vasista Pickles" }] }),
  component: () => (
    <div className="bg-cream pt-32 pb-20">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">Gallery</span>
          <h1 className="section-title mt-3">A Visual Feast</h1>
          <div className="gold-divider" />
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
          {IMGS.map((src, i) => (
            <motion.div key={src} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.05 }}
              className="overflow-hidden rounded-2xl shadow-lg">
              <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-110" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  ),
});
