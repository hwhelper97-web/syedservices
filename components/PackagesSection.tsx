"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiGlobe, FiClock, FiFileText, FiShare2, FiCopy, FiCheck, 
  FiArrowRight, FiPhone, FiDollarSign, FiTag, FiShield, FiExternalLink 
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram, FaFacebook } from "react-icons/fa";

interface PackageItem {
  id: number;
  title: string;
  slug: string | null;
  country: string;
  visaType: string | null;
  agencyNumber: string;
  priceUSD: number | null;
  pricePKR: number | null;
  priceAFN: number | null;
  duration: string | null;
  processingTime: string | null;
  description: string;
  documents: string;
  image: string | null;
  featured: boolean;
  status: string;
}

export default function PackagesSection() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCurrency, setActiveCurrency] = useState<"USD" | "PKR" | "AFN">("USD");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [shareModalPkg, setShareModalPkg] = useState<PackageItem | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      if (res.ok && data.packages) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const countries = ["ALL", ...Array.from(new Set(packages.map((p) => p.country)))];

  const filteredPackages = packages.filter((p) => {
    if (selectedCountry === "ALL") return true;
    return p.country.toLowerCase() === selectedCountry.toLowerCase();
  });

  const getPriceDisplay = (pkg: PackageItem) => {
    if (activeCurrency === "USD") {
      return pkg.priceUSD ? `$${pkg.priceUSD.toLocaleString()}` : "Contact Agency";
    }
    if (activeCurrency === "PKR") {
      return pkg.pricePKR ? `₨ ${pkg.pricePKR.toLocaleString()}` : "Contact Agency";
    }
    if (activeCurrency === "AFN") {
      return pkg.priceAFN ? `؋ ${pkg.priceAFN.toLocaleString()}` : "Contact Agency";
    }
    return "Contact";
  };

  const getPackageUrl = (pkg: PackageItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.syedservices.com.pk";
    return `${origin}/packages/${pkg.slug || pkg.id}`;
  };

  const handleCopyLink = (pkg: PackageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getPackageUrl(pkg);
    navigator.clipboard.writeText(url);
    setCopiedId(pkg.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openWhatsApp = (pkg: PackageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanNumber = pkg.agencyNumber.replace(/[^0-9]/g, "");
    const url = getPackageUrl(pkg);
    const message = `Hello Syed Services! I am interested in this package:\n\n*${pkg.title}*\nCountry: ${pkg.country} (${pkg.visaType || 'Visa'})\nPrice: $${pkg.priceUSD || 'N/A'} | ₨ ${pkg.pricePKR || 'N/A'} | ؋ ${pkg.priceAFN || 'N/A'}\n\nLink: ${url}\n\nPlease share further details.`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="packages" className="py-24 bg-[#020617] relative overflow-hidden border-b border-slate-800/80">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-400/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-black uppercase tracking-widest shadow-inner">
              <FiTag className="text-sm" /> Exclusive Travel & Visa Packages
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              All-Inclusive <span className="bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">Visa & Tour Deals</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
              Verified country visas, official travel agency support, complete document requirements, and guaranteed rates in USD, PKR, and Afghani. Easily share any package with friends and groups!
            </p>
          </div>

          {/* Currency Switcher */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Currency:</span>
            <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-xl">
              {(["USD", "PKR", "AFN"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setActiveCurrency(curr)}
                  className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer ${
                    activeCurrency === curr
                      ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20 scale-105"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {curr === "USD" ? "$ USD" : curr === "PKR" ? "₨ PKR" : "؋ AFN"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        {countries.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCountry(c)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCountry === c
                    ? "bg-white text-black border-white shadow-lg font-black"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                {c === "ALL" ? "All Packages" : c}
              </button>
            ))}
          </div>
        )}

        {/* Packages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-900/40 border border-slate-800/80 animate-pulse" />
            ))}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800 rounded-3xl p-8">
            <FiGlobe className="mx-auto text-4xl text-slate-600 mb-3" />
            <h3 className="text-white font-bold text-lg">No Packages Found</h3>
            <p className="text-xs text-slate-400 mt-1">Check back soon for new visa and travel deals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => {
              const docLines = pkg.documents
                .split("\n")
                .map((d) => d.trim())
                .filter(Boolean)
                .slice(0, 3);

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group bg-[#0b1329]/70 hover:bg-[#0f172a] border border-slate-800/80 hover:border-yellow-400/40 rounded-[2.5rem] overflow-hidden transition-all duration-300 flex flex-col shadow-2xl hover:shadow-yellow-400/5 hover:-translate-y-1.5"
                >
                  {/* Cover Image Container */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                    <img
                      src={pkg.image || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329] via-[#0b1329]/40 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <span className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-yellow-400 border border-yellow-400/30 flex items-center gap-1.5 shadow-lg">
                        <FiGlobe className="text-xs" /> {pkg.country}
                      </span>
                      {pkg.featured && (
                        <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-black shadow-lg">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Price Tag pill on bottom of image */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Package Price</span>
                        <span className="text-2xl font-black text-yellow-400 drop-shadow">
                          {getPriceDisplay(pkg)}
                        </span>
                      </div>
                      {pkg.duration && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-[10px] font-bold text-slate-300 border border-white/10 backdrop-blur-sm">
                          {pkg.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <FiTag className="shrink-0" />
                        <span className="truncate">{pkg.visaType || "Visa & Travel Package"}</span>
                        {pkg.processingTime && (
                          <span className="ml-auto text-[10px] text-slate-400 font-semibold flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                            <FiClock className="text-yellow-400" /> {pkg.processingTime}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-white group-hover:text-yellow-400 transition-colors line-clamp-2 leading-snug">
                        {pkg.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {pkg.description}
                      </p>

                      {/* Multi-currency breakdown chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-bold text-slate-400">
                        {pkg.priceUSD && (
                          <span className={`px-2 py-0.5 rounded-lg border ${activeCurrency === 'USD' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' : 'bg-slate-900 border-slate-800'}`}>
                            ${pkg.priceUSD.toLocaleString()} USD
                          </span>
                        )}
                        {pkg.pricePKR && (
                          <span className={`px-2 py-0.5 rounded-lg border ${activeCurrency === 'PKR' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' : 'bg-slate-900 border-slate-800'}`}>
                            ₨ {pkg.pricePKR.toLocaleString()} PKR
                          </span>
                        )}
                        {pkg.priceAFN && (
                          <span className={`px-2 py-0.5 rounded-lg border ${activeCurrency === 'AFN' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' : 'bg-slate-900 border-slate-800'}`}>
                            ؋ {pkg.priceAFN.toLocaleString()} AFN
                          </span>
                        )}
                      </div>

                      {/* Documents snippet */}
                      <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          <FiFileText className="text-yellow-400" /> Required Documents:
                        </div>
                        <ul className="space-y-1">
                          {docLines.map((doc, idx) => (
                            <li key={idx} className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 shrink-0" />
                              <span className="truncate">{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Agency & Actions */}
                    <div className="space-y-3 pt-3 border-t border-slate-800/80">
                      {/* Agency Number & WhatsApp */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center">
                            <FiPhone size={14} />
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-slate-500 uppercase">Agency Contact</span>
                            <span className="font-bold text-white tracking-wide font-mono text-xs">{pkg.agencyNumber}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => openWhatsApp(pkg, e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black transition-all text-xs font-bold cursor-pointer"
                        >
                          <FaWhatsapp size={14} /> Inquire
                        </button>
                      </div>

                      {/* Buttons Grid: View & Share */}
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/packages/${pkg.slug || pkg.id}`}
                          className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black tracking-wider transition-all shadow-lg shadow-yellow-400/10 hover:scale-[1.02]"
                        >
                          Details <FiArrowRight size={14} />
                        </Link>

                        <button
                          onClick={(e) => handleCopyLink(pkg, e)}
                          className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-yellow-400/40 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          {copiedId === pkg.id ? (
                            <>
                              <FiCheck className="text-green-400" size={14} /> Copied!
                            </>
                          ) : (
                            <>
                              <FiShare2 size={14} /> Share Link
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Global Share Banner */}
        <div className="mt-16 bg-gradient-to-r from-yellow-400/10 via-slate-900 to-yellow-400/5 border border-yellow-400/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-black text-white">Need a Customized Group Package?</h4>
            <p className="text-xs text-slate-400 max-w-xl">
              We provide tailored travel agency rates for Umrah groups, corporate business visas, and family visits with dedicated visa processing managers.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/923345668667?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20a%20customized%20travel%20visa%20package."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-3.5 bg-green-500 hover:bg-green-400 text-black font-black text-xs rounded-2xl transition-transform hover:scale-105 shadow-xl shadow-green-500/20"
            >
              <FaWhatsapp size={16} /> WhatsApp Agency Directly
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
