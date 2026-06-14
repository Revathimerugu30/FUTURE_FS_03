import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, User as UserIcon, LogOut } from "lucide-react";
import { useAuth, useCart } from "@/lib/auth-context";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/gallery", label: "Gallery" },
  { to: "/testimonials", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="container-x flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-maroon text-gold shadow-lg shadow-maroon/20">
            <span className="font-display text-xl font-bold">V</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-bold text-maroon-deep">
              Vasista
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gold">
              Pickles
            </div>
          </div>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                className="relative text-sm font-medium text-maroon-deep/80 transition-colors hover:text-maroon"
                activeProps={{ className: "text-maroon" }}
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1.5 left-0 h-0.5 w-full bg-gold"
                      />
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-maroon/5 text-maroon hover:bg-maroon hover:text-cream transition-colors"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-maroon-deep">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="flex items-center gap-2 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream hover:bg-maroon-deep transition-colors"
              >
                <UserIcon size={14} />
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="grid h-9 w-9 place-items-center rounded-full text-maroon hover:bg-maroon/10"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full border border-maroon px-4 py-2 text-sm font-medium text-maroon hover:bg-maroon hover:text-cream transition-colors md:inline-block"
            >
              Sign In
            </Link>
          )}

          <button
            className="grid h-10 w-10 place-items-center rounded-full bg-maroon/5 text-maroon lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-cream/95 backdrop-blur-md"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="block rounded-lg px-3 py-3 text-sm font-medium text-maroon-deep hover:bg-maroon/5"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 flex gap-2">
                {user ? (
                  <>
                    <Link to={user.role === "admin" ? "/admin" : "/dashboard"} className="btn-maroon flex-1">
                      Dashboard
                    </Link>
                    <button onClick={logout} className="btn-outline border-maroon text-maroon">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-maroon flex-1">Sign In</Link>
                    <Link to="/register" className="btn-gold flex-1">Sign Up</Link>
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
