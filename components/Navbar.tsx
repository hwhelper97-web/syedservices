"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiPhone, FiChevronRight, FiLock } from "react-icons/fi";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Visa Services", href: "/visa" },
  { name: "Consultancy", href: "/consultancy" },
  { name: "Tickets", href: "/ticketing" },
  { name: "Exit Permit", href: "/visa/pakistan/exit" },
  { name: "Track Application", href: "/track" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-500 ${
      scrolled ? "bg-[#020617]/80 backdrop-blur-lg py-4 border-b border-white/5" : "bg-transparent py-6"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-bold text-xl group-hover:rotate-12 transition-transform">
            S
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block leading-none">SYED</span>
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Services</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-yellow-400 transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/admin/login" 
            className="text-slate-500 hover:text-yellow-400 transition-colors p-2"
            title="Admin Login"
          >
            <FiLock size={18} />
          </Link>
          <a 
            href="tel:+923099797771" 
            className="text-slate-300 hover:text-white transition-colors"
          >
            <FiPhone size={20} />
          </a>
          <button 
            className="premium-btn btn-primary !py-2 !px-6 text-sm"
            onClick={() => {
              const event = new CustomEvent('openLeadForm');
              window.dispatchEvent(event);
            }}
          >
            Apply Now <FiChevronRight />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0f172a] border-b border-white/5 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-slate-300 hover:text-yellow-400"
                >
                  {link.name}
                </Link>
              ))}
              <button 
                className="premium-btn btn-primary w-full mt-4"
                onClick={() => {
                  setIsOpen(false);
                  const event = new CustomEvent('openLeadForm');
                  window.dispatchEvent(event);
                }}
              >
                Apply Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}