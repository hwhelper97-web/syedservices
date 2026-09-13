"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import PackagesSection from "@/components/PackagesSection";

export default function PackagesCatalogPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <Navbar />
      <div className="pt-20">
        <PackagesSection />
      </div>
      <Footer />
      <WhatsApp />
    </div>
  );
}
