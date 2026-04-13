"use client";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsApp() {
  return (
    <a
      href="https://wa.me/923099797771"
      target="_blank"
      className="fixed bottom-6 right-6 bg-green-500 p-4 rounded-full text-white text-2xl shadow-lg hover:scale-110 transition"
    >
      <FaWhatsapp />
    </a>
  );
}