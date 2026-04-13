"use client";

import Link from "next/link";
import { whatsappLink } from "@/utils/whatsapp";

export default function Hero() {
  return (
    <section className="relative bg-black text-white overflow-hidden">
      
      {/* 🌍 Background Map */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="/world-map.svg"
          alt="world map"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ✨ Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Fast & Reliable Visa Services Worldwide
          </h1>

          <p className="mt-4 text-gray-300 text-lg">
            We help you get visas, book tickets, and travel stress-free — trusted by hundreds of clients.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex gap-4">

            {/* ✅ Apply → Visa Page */}
            <Link
              href="/visa/pakistan/normal"
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold transition shadow-lg shadow-yellow-500/20"
            >
              Apply for Visa
            </Link>

            {/* ✅ WhatsApp */}
            <a
              href={whatsappLink("Hi, I need consultation for visa")}
              target="_blank"
              className="border border-yellow-500 text-yellow-400 px-6 py-3 rounded-lg hover:bg-yellow-500 hover:text-black transition"
            >
              Talk to Expert
            </a>

          </div>

          {/* TRUST */}
          <p className="mt-6 text-sm text-gray-400">
            ✔ 100% Guidance &nbsp; ✔ Fast Processing &nbsp; ✔ Trusted Service
          </p>
        </div>

        {/* RIGHT */}
        <div className="hidden md:block"></div>
      </div>
    </section>
  );
}