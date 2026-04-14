"use client";
import { useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur border-b border-white/10">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link href="/" className="text-yellow-400 font-bold text-lg tracking-wide">
          Syed Services
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">

          <Link href="/" className="nav-link">
            Home
          </Link>

          <Link href="/visa/pakistan/normal" className="nav-link">
            Visa
          </Link>

          <Link href="/visa/pakistan/exit" className="nav-link">
            Exit Permit
          </Link>

          <Link href="/contact" className="nav-link">
            Contact
          </Link>

          {/* ADMIN BUTTON */}
          <Link
            href="/admin/login"
            className="ml-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold
                       hover:scale-105 transition shadow-lg hover:shadow-[0_0_15px_rgba(250,204,21,0.6)]"
          >
            Admin
          </Link>

        </div>

        {/* MOBILE ICON */}
        <div
          className="md:hidden text-yellow-400 text-xl cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-black border-t border-white/10 px-6 py-6 space-y-6 text-center">

          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block nav-link"
          >
            Home
          </Link>

          <Link
            href="/visa/pakistan/normal"
            onClick={() => setOpen(false)}
            className="block nav-link"
          >
            Visa
          </Link>

          <Link
            href="/visa/pakistan/exit"
            onClick={() => setOpen(false)}
            className="block nav-link"
          >
            Exit Permit
          </Link>

          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="block nav-link"
          >
            Contact
          </Link>

          {/* ADMIN BUTTON MOBILE */}
          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="block mx-auto w-fit px-6 py-2 bg-yellow-500 text-black rounded-lg font-semibold
                       hover:scale-105 transition"
          >
            Admin Panel
          </Link>

        </div>
      )}
    </nav>
  );
}