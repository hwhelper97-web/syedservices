"use client";

import Link from "next/link";
import { 
  FiFacebook, 
  FiInstagram, 
  FiTwitter, 
  FiLinkedin, 
  FiMail, 
  FiPhone, 
  FiLock 
} from "react-icons/fi";

const serviceLinks = [
  { name: "Tourist Visa", href: "/visa/pakistan#tourist" },
  { name: "Business Visa", href: "/visa/pakistan#business" },
  { name: "Student Visa", href: "/visa/pakistan#student" },
  { name: "Work Visa", href: "/visa/pakistan#work" },
  { name: "Medical Visa", href: "/visa/pakistan#medical" },
];

const companyLinks = [
  { name: "About Us", href: "/consultancy" },
  { name: "Our Offices", href: "/offices" },
  { name: "Our Success", href: "/success" },
  { name: "Testimonials", href: "/#testimonials" },
  { name: "Contact", href: "/contact" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Cookie Policy", href: "/terms" },
];

const socialLinks = [
  { Icon: FiFacebook, href: "https://facebook.com", name: "Facebook" },
  { Icon: FiTwitter, href: "https://twitter.com", name: "Twitter" },
  { Icon: FiInstagram, href: "https://instagram.com", name: "Instagram" },
  { Icon: FiLinkedin, href: "https://linkedin.com", name: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-slate-800/80 pt-6 md:pt-10 pb-5 md:pb-6 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Grid: Desktop 5 columns / Mobile compact structure */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 mb-6 md:mb-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 md:w-9 md:h-9 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                  S
                </div>
                <div>
                  <span className="text-base md:text-lg font-black tracking-tight text-white block leading-none">
                    SYED
                  </span>
                  <span className="text-[9px] md:text-[10px] font-bold text-yellow-400 uppercase tracking-widest">
                    Services
                  </span>
                </div>
              </Link>

              {/* Socials & Login on Mobile Header (keeps mobile ultra compact) */}
              <div className="flex lg:hidden items-center gap-1.5">
                {socialLinks.map(({ Icon, href, name }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="w-7 h-7 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-yellow-400 hover:text-black transition-colors"
                  >
                    <Icon size={13} />
                  </a>
                ))}
                <Link
                  href="/portal/login"
                  className="w-7 h-7 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-lg flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors ml-1"
                  title="Portal Login"
                  aria-label="Portal Login"
                >
                  <FiLock size={12} />
                </Link>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed hidden sm:block">
              Premier partner for fast, reliable, and secure visa and international mobility solutions worldwide.
            </p>

            {/* Quick Contact Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <a 
                href="tel:+923099797771" 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-yellow-400 hover:border-yellow-400/30 transition-colors"
              >
                <FiPhone className="text-yellow-400 text-xs shrink-0" />
                <span>+92 309 9797771</span>
              </a>
              <a 
                href="mailto:info@syedservices.com.pk" 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-yellow-400 hover:border-yellow-400/30 transition-colors"
              >
                <FiMail className="text-yellow-400 text-xs shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-none">info@syedservices.com.pk</span>
              </a>
            </div>

            {/* Socials & Portal for Desktop */}
            <div className="hidden lg:flex items-center gap-2 pt-1">
              {socialLinks.map(({ Icon, href, name }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all"
                >
                  <Icon size={14} />
                </a>
              ))}
              <Link
                href="/portal/login"
                className="ml-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-yellow-400/40 rounded-xl flex items-center gap-1.5 text-xs text-slate-300 hover:text-yellow-400 transition-all font-medium"
                title="Client & Agent Portal"
              >
                <FiLock size={12} className="text-yellow-400" />
                <span>Portal</span>
              </Link>
            </div>
          </div>

          {/* Links Section: On Mobile 2 columns side-by-side (NO endless scrolling), on Desktop 3 distinct columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:col-span-3 gap-4 md:gap-6 pt-1 lg:pt-0">
            {/* Column 1: Services */}
            <div>
              <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 md:mb-3">
                Services
              </h4>
              <ul className="space-y-1.5 md:space-y-2">
                {serviceLinks.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-yellow-400 transition-colors inline-block py-0.5"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Company */}
            <div>
              <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 md:mb-3">
                Company
              </h4>
              <ul className="space-y-1.5 md:space-y-2">
                {companyLinks.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-yellow-400 transition-colors inline-block py-0.5"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal (Visible on tablet & desktop, on mobile shown in bottom bar) */}
            <div className="hidden sm:block">
              <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 md:mb-3">
                Legal
              </h4>
              <ul className="space-y-1.5 md:space-y-2">
                {legalLinks.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-yellow-400 transition-colors inline-block py-0.5"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-3 md:pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-500">
          <p className="order-2 sm:order-1 text-center sm:text-left">
            © {new Date().getFullYear()} Syed Services Pakistan. All rights reserved.
          </p>

          {/* Legal Links (Always accessible, compact inline on mobile) */}
          <div className="order-1 sm:order-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
            {legalLinks.map((link, idx) => (
              <span key={idx} className="flex items-center gap-3">
                <Link href={link.href} className="text-slate-400 hover:text-yellow-400 transition-colors">
                  {link.name}
                </Link>
                {idx < legalLinks.length - 1 && <span className="text-slate-700">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}