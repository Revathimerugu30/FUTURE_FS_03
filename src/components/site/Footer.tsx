import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-maroon-deep text-cream/90">
      <div className="container-x grid gap-12 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gold text-maroon-deep">
              <span className="font-display text-xl font-bold">V</span>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-cream">Vasista Pickles</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Since Tradition</div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-cream/70">
            Authentic Andhra & Telangana style homemade pickles, lovingly handcrafted in
            Godavarikhani and delivered across India.
          </p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Facebook, Youtube].map((I, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 text-gold hover:bg-gold hover:text-maroon-deep transition-colors">
                <I size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-gold">Explore</div>
          <ul className="space-y-2 text-sm">
            {[
              ["Home", "/"],
              ["About Us", "/about"],
              ["Products", "/products"],
              ["Gallery", "/gallery"],
              ["Reviews", "/testimonials"],
              ["Contact", "/contact"],
            ].map(([l, h]) => (
              <li key={h}>
                <Link to={h as string} className="text-cream/70 hover:text-gold transition-colors">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-gold">Categories</div>
          <ul className="space-y-2 text-sm">
            {["Avakaya", "Gongura", "Mango", "Chicken", "Mutton", "Prawn"].map((c) => (
              <li key={c}>
                <Link to="/products" search={{ category: `${c} Pickle` } as any} className="text-cream/70 hover:text-gold transition-colors">{c} Pickle</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-gold">Reach Us</div>
          <ul className="space-y-3 text-sm text-cream/80">
            <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" /> Godavarikhani, Telangana, India — 505209</li>
            <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-gold" /> +91 98765 43210</li>
            <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-gold" /> hello@vasistapickles.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/15">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream/60 md:flex-row">
          <span>© {new Date().getFullYear()} Vasista Pickles. Crafted with tradition.</span>
          <span className="text-gold/80">Tradition in Every Bite, Taste in Every Jar.</span>
        </div>
      </div>
    </footer>
  );
}
