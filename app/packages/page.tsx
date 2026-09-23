"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import PackagesSection from "@/components/PackagesSection";
import { FiTag } from "react-icons/fi";

export default function PackagesCatalogPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <Navbar />
      
      {/* Dedicated Page Hero with primary H1 */}
      <section className="pt-32 pb-4 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-4">
          <FiTag size={12} /> Official Verified Deals
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
          All-Inclusive <span className="text-yellow-400">Travel & Visa Packages</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Browse verified country visa packages with transparent pricing in USD, PKR, and Afghani. Complete document requirements, fast-track processing, and dedicated travel support.
        </p>
      </section>

      <div>
        <PackagesSection />
      </div>
      <Footer />
      <WhatsApp />
    </div>
  );
}
