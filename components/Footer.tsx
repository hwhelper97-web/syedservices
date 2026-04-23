"use client";

import Link from "next/link";
import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiMail, FiMapPin, FiPhone, FiLock } from "react-icons/fi";

const footerLinks = [
  {
    title: "Services",
    links: [
      { name: "Visa Services", href: "#" },
      { name: "Study Abroad", href: "#" },
      { name: "Work Permits", href: "#" },
      { name: "Immigration", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "Our Success", href: "#" },
      { name: "Testimonials", href: "#" },
      { name: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-slate-800 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-bold text-xl">S</div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-none">SYED</span>
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Services</span>
              </div>
            </Link>
            <p className="text-slate-400 mb-8 max-w-sm">
              Your premier partner for international mobility. We specialize in fast, reliable, and secure 
              visa and immigration solutions for clients worldwide.
            </p>
            <div className="flex gap-4 items-center">
              {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-yellow-400 hover:text-black transition-all">
                  <Icon size={18} />
                </a>
              ))}
              <Link href="/admin/login" className="ml-4 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-yellow-400 hover:text-black transition-all" title="Admin Login">
                <FiLock size={18} />
              </Link>
            </div>
          </div>

          {/* Links Cols */}
          {footerLinks.map((col, i) => (
            <div key={i}>
              <h4 className="text-white font-bold mb-6">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">
            © 2026 Syed Services Pakistan. All rights reserved.
          </p>
          <div className="flex gap-8">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <FiPhone className="text-yellow-400" /> +92 309 9797771
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <FiMail className="text-yellow-400" /> info@syedservices.com.pk
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}