"use client";

import Link from "next/link";
import Logo from "./Logo"; // ✅ IMPORT LOGO

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
      
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* ✅ LOGO HERE */}
        <Logo />

        {/* MENU */}
        <div className="flex items-center gap-10 text-sm font-medium text-white">

          <Link href="/" className="hover:text-green-400 transition">
            Home
          </Link>

          <Link href="/visa/pakistan/normal" className="hover:text-green-400 transition">
            Visa
          </Link>

          <Link href="/visa/pakistan/exit" className="hover:text-green-400 transition">
            Exit Permit
          </Link>

          <Link href="/contact" className="hover:text-green-400 transition">
            Contact
          </Link>

        </div>

      </div>
    </nav>
  );
}