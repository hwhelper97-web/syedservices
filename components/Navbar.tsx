"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiPhone, FiChevronRight, FiLock, FiChevronDown, FiGlobe, FiBriefcase, FiBook, FiShield, FiHeart, FiPlus, FiFileText, FiDollarSign, FiSearch } from "react-icons/fi";

const visaSubLinks = [
  { name: "Tourist Visa", href: "/visa/pakistan#tourist", icon: <FiGlobe /> },
  { name: "Business Visa", href: "/visa/pakistan#business", icon: <FiBriefcase /> },
  { name: "Student Visa", href: "/visa/pakistan#student", icon: <FiBook /> },
  { name: "Work Visa", href: "/visa/pakistan#work", icon: <FiShield /> },
  { name: "Medical Visa", href: "/visa/pakistan#medical", icon: <FiHeart /> },
  { name: "Visa Extensions", href: "/visa/pakistan#extension", icon: <FiPlus /> },
  { name: "Required Documents", href: "/visa/pakistan#hub", icon: <FiFileText /> },
  { name: "Visa Fees", href: "/visa/pakistan#fees", icon: <FiDollarSign /> },
  { name: "Eligibility Checker", href: "/visa/pakistan#finder", icon: <FiSearch /> },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Visa Services", href: "/visa/pakistan", dropdown: true },
  { name: "Consultancy", href: "/consultancy" },
  { name: "Tickets", href: "/ticketing" },
  { name: "Exit Permit", href: "/visa/pakistan/exit" },
  { name: "Track Application", href: "/track" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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
            <div 
              key={link.name}
              className="relative"
              onMouseEnter={() => link.dropdown && setShowDropdown(true)}
              onMouseLeave={() => link.dropdown && setShowDropdown(false)}
            >
              <Link 
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-yellow-400 transition-colors flex items-center gap-1 group"
              >
                {link.name}
                {link.dropdown && <FiChevronDown className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all group-hover:w-full" />
              </Link>

              {/* Dropdown Menu */}
              {link.dropdown && (
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-4 w-[480px] bg-[#0f172a] border border-white/5 rounded-3xl p-6 shadow-2xl grid grid-cols-2 gap-2"
                    >
                      {visaSubLinks.map((sub) => (
                        <Link 
                          key={sub.name}
                          href={sub.href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-yellow-400 transition-all"
                        >
                          <span className="text-lg opacity-50">{sub.icon}</span>
                          <span className="text-xs font-bold">{sub.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
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
                <div key={link.name}>
                  <Link 
                    href={link.href}
                    onClick={() => !link.dropdown && setIsOpen(false)}
                    className="text-lg font-medium text-slate-300 hover:text-yellow-400 flex items-center justify-between"
                  >
                    {link.name}
                    {link.dropdown && <FiChevronRight />}
                  </Link>
                  {link.dropdown && (
                    <div className="grid grid-cols-2 gap-2 mt-4 ml-2 pl-4 border-l border-white/5">
                      {visaSubLinks.map((sub) => (
                        <Link 
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setIsOpen(false)}
                          className="text-xs text-slate-500 hover:text-yellow-400 py-2 flex items-center gap-2"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
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