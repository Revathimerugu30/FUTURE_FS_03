import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const PHONE = "919000012345";
const MSG = encodeURIComponent(
  "Hello Vasista Pickles, I would like to know more about your products."
);

export default function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${PHONE}?text=${MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
      <MessageCircle size={26} />
    </motion.a>
  );
}
