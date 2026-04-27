"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiPhone, FiChevronRight, FiLock, FiChevronDown, FiGlobe, FiBriefcase, FiBook, FiShield, FiHeart, FiPlus, FiFileText, FiDollarSign, FiSearch } from "react-icons/fi";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'dr', name: 'دری', flag: '🇦🇫' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 px-3 py-1.5 rounded-full border border-white/5 transition-all text-xs font-bold"
      >
        <span>{languages.find(l => l.code === language)?.flag}</span>
        <span className="uppercase">{language}</span>
        <FiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 right-0 bg-[#0f172a] border border-white/5 rounded-2xl p-2 shadow-2xl min-w-[120px]"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-white/5 transition-colors ${language === lang.code ? 'text-yellow-400 font-bold' : 'text-slate-400'}`}
              >
                <span>{lang.name}</span>
                <span>{lang.flag}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Navbar() {
  const { t, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const visaSubLinks = [
    { name: t('tourist_visa') || "Tourist Visa", href: "/visa/pakistan#tourist", icon: <FiGlobe /> },
    { name: t('business_visa') || "Business Visa", href: "/visa/pakistan#business", icon: <FiBriefcase /> },
    { name: t('student_visa') || "Student Visa", href: "/visa/pakistan#student", icon: <FiBook /> },
    { name: t('work_visa') || "Work Visa", href: "/visa/pakistan#work", icon: <FiShield /> },
    { name: t('medical_visa') || "Medical Visa", href: "/visa/pakistan#medical", icon: <FiHeart /> },
    { name: t('visa_extensions') || "Visa Extensions", href: "/visa/pakistan#extension", icon: <FiPlus /> },
    { name: t('required_documents') || "Required Documents", href: "/visa/pakistan#hub", icon: <FiFileText /> },
    { name: t('visa_fees') || "Visa Fees", href: "/visa/pakistan#fees", icon: <FiDollarSign /> },
    { name: t('eligibility_checker') || "Eligibility Checker", href: "/visa/pakistan#finder", icon: <FiSearch /> },
  ];

  const navLinks = [
    { name: t('home'), href: "/" },
    { name: t('visa_services'), href: "/visa/pakistan", dropdown: true },
    { name: t('consultancy'), href: "/consultancy" },
    { name: t('tickets'), href: "/ticketing" },
    { name: t('exit_permit'), href: "/visa/pakistan/exit" },
    { name: t('track'), href: "/track" },
  ];

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
                      className={`absolute top-full mt-4 w-[480px] bg-[#0f172a] border border-white/5 rounded-3xl p-6 shadow-2xl grid grid-cols-2 gap-2 ${dir === 'rtl' ? 'right-0' : 'left-0'}`}
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
          <LanguageSwitcher />
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
            {t('apply_now')} <FiChevronRight className={dir === 'rtl' ? 'rotate-180' : ''} />
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
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Language</span>
                <LanguageSwitcher />
              </div>
              {navLinks.map((link) => (
                <div key={link.name}>
                  <Link 
                    href={link.href}
                    onClick={() => !link.dropdown && setIsOpen(false)}
                    className="text-lg font-medium text-slate-300 hover:text-yellow-400 flex items-center justify-between"
                  >
                    {link.name}
                    {link.dropdown && <FiChevronRight className={dir === 'rtl' ? 'rotate-180' : ''} />}
                  </Link>
                  {link.dropdown && (
                    <div className={`grid grid-cols-2 gap-2 mt-4 ml-2 pl-4 border-l border-white/5 ${dir === 'rtl' ? 'mr-2 pr-4 border-l-0 border-r border-white/5' : ''}`}>
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
                {t('apply_now')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}