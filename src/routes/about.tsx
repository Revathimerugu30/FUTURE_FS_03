import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Vasista Pickles" }, { name: "description", content: "Our story, heritage and traditional preparation process." }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-cream pt-32 pb-20">
      <div className="container-x">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="eyebrow">Our Story</span>
          <h1 className="section-title mt-3">A Heritage in Every Jar</h1>
          <div className="gold-divider" />
        </motion.div>

        <div className="mt-16 grid gap-12 md:grid-cols-2 md:items-center">
          <motion.img initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            src="https://images.unsplash.com/photo-1599050751795-6cdaafbc2319?w=900&auto=format&fit=crop" alt="Heritage" className="rounded-2xl shadow-xl" />
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold text-maroon-deep">From a family kitchen in Godavarikhani</h2>
            <p className="mt-4 text-muted-foreground">Vasista Pickles was born from a simple promise — to preserve the authentic flavours of Telangana and Andhra in every jar. What began as small-batch pickles for family and neighbours has grown into a beloved brand reaching homes across India.</p>
            <p className="mt-4 text-muted-foreground">Every recipe is honoured exactly as it was passed down: sun-dried produce, cold-pressed sesame oil, hand-pounded spices and the unhurried patience that great pickles demand.</p>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            { title: "Our Mission", text: "To bring authentic, healthy, preservative-free homemade pickles to every Indian household." },
            { title: "Our Vision", text: "To become India's most-loved heritage pickle brand while empowering local women artisans." },
            { title: "Our Promise", text: "Pure ingredients. Traditional recipes. No shortcuts. Just pickles that taste like home." },
          ].map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} className="card-elevated p-7">
              <h3 className="font-display text-xl font-bold text-maroon-deep">{c.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{c.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20">
          <h2 className="text-center font-display text-3xl font-bold text-maroon-deep">Our Traditional Process</h2>
          <div className="gold-divider" />
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {["Sourcing", "Sun Drying", "Hand Crafting", "Maturing"].map((step, i) => (
              <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-maroon-deep p-7 text-cream">
                <div className="font-display text-3xl text-gold">0{i + 1}</div>
                <h3 className="mt-3 font-display text-lg font-bold">{step}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
