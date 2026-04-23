"use client";

import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

export default function WhatsApp() {
  return (
    <motion.a
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      href="https://wa.me/923099797771"
      target="_blank"
      className="fixed bottom-8 right-8 z-[70] bg-[#25D366] p-4 rounded-full text-white text-3xl shadow-[0_10px_30px_rgba(37,211,102,0.4)] flex items-center justify-center group"
    >
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      <FaWhatsapp className="relative z-10" />
      <span className="absolute right-full mr-4 bg-[#0f172a] text-white text-xs font-bold py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-800">
        Chat with us
      </span>
    </motion.a>
  );
}