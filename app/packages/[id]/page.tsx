"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { 
  FiArrowLeft, FiGlobe, FiClock, FiCalendar, FiFileText, 
  FiCheckCircle, FiShare2, FiCopy, FiCheck, FiPhone, 
  FiDollarSign, FiShield, FiSend, FiUser, FiInfo, FiTag, FiAward
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram, FaFacebook } from "react-icons/fa";

interface PackageData {
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
  createdAt: string;
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;

  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState<"ALL" | "USD" | "PKR" | "AFN">("ALL");
  
  // Quick Inquiry Form State
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    if (!idOrSlug) return;
    fetchPackage();
  }, [idOrSlug]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/packages/${idOrSlug}`);
      const data = await res.json();
      if (res.ok && data.package) {
        setPkg(data.package);
      } else {
        setError(data.error || "Package not found");
      }
    } catch (err: any) {
      console.error("Fetch package failed:", err);
      setError("Failed to load package details");
    } finally {
      setLoading(false);
    }
  };

  const getFullShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return `https://www.syedservices.com.pk/packages/${idOrSlug}`;
  };

  const handleCopyLink = () => {
    const url = getFullShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!pkg) return;
    const url = getFullShareUrl();
    const prices = [
      pkg.priceUSD ? `$${pkg.priceUSD.toLocaleString()} USD` : null,
      pkg.pricePKR ? `₨ ${pkg.pricePKR.toLocaleString()} PKR` : null,
      pkg.priceAFN ? `؋ ${pkg.priceAFN.toLocaleString()} AFN` : null,
    ].filter(Boolean).join(" | ");

    const text = `🌟 *${pkg.title}*\n\n` +
      `📍 *Country:* ${pkg.country} (${pkg.visaType || "Visa"})\n` +
      `💰 *Package Price:* ${prices || "Contact for pricing"}\n` +
      `⏱️ *Processing Time:* ${pkg.processingTime || "Standard"}\n` +
      `📞 *Travel Agency Number:* ${pkg.agencyNumber}\n\n` +
      `📄 *Check Package Details & Document Requirements:* \n${url}\n\n` +
      `_Syed Services - Official Travel & Visa Partner_`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleTelegramShare = () => {
    if (!pkg) return;
    const url = getFullShareUrl();
    const text = `🌟 ${pkg.title} - ${pkg.country} (${pkg.visaType || "Visa"})\n` +
      `Agency Contact: ${pkg.agencyNumber}\n` +
      `USD: $${pkg.priceUSD || "N/A"} | PKR: ₨ ${pkg.pricePKR || "N/A"} | AFN: ؋ ${pkg.priceAFN || "N/A"}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleFacebookShare = () => {
    const url = getFullShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  };

  const handleDirectAgencyWhatsApp = () => {
    if (!pkg) return;
    const cleanNumber = pkg.agencyNumber.replace(/[^0-9]/g, "");
    const url = getFullShareUrl();
    const message = `Hello Syed Services! I am interested in booking or inquiring about this package:\n\n*${pkg.title}*\nCountry: ${pkg.country}\nVisa Type: ${pkg.visaType || "Tourist Visa"}\n\nPackage Link: ${url}\n\nPlease guide me on the next steps.`;
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg || !inquiryName || !inquiryPhone) return;

    setInquirySending(true);
    try {
      const cleanNumber = pkg.agencyNumber.replace(/[^0-9]/g, "");
      const url = getFullShareUrl();
      const message = `*NEW PACKAGE INQUIRY*\n\n` +
        `*Package:* ${pkg.title}\n` +
        `*Country:* ${pkg.country} (${pkg.visaType || 'Visa'})\n` +
        `*Client Name:* ${inquiryName}\n` +
        `*Client Contact:* ${inquiryPhone}\n` +
        `*Client Notes:* ${inquiryMessage || 'Interested in this package'}\n\n` +
        `*Link:* ${url}`;

      window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, "_blank");
      setInquirySuccess(true);
    } catch (err) {
      console.error("Inquiry error:", err);
    } finally {
      setInquirySending(false);
    }
  };

  const parseDocuments = (docsText: string) => {
    if (!docsText) return [];
    return docsText
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => item.replace(/^[0-9]+[\.\)\-]\s*/, "").replace(/^[-*•]\s*/, ""));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32">
          <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Loading package details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-6 py-32 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
            !
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Package Not Found</h1>
          <p className="text-slate-400 mb-8">{error || "The package you are looking for does not exist or has been removed."}</p>
          <Link
            href="/#packages"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-yellow-400/20"
          >
            <FiArrowLeft /> Browse All Packages
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const documentItems = parseDocuments(pkg.documents);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0b1329] via-[#020617] to-[#020617]">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-yellow-400/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb & Back */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              href="/#packages"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors text-sm font-semibold group"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Packages</span>
            </Link>

            {/* Quick Share Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">Share with friends:</span>
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                title="Share to WhatsApp"
              >
                <FaWhatsapp className="text-sm" />
                <span className="hidden md:inline">WhatsApp</span>
              </button>
              <button
                onClick={handleTelegramShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all cursor-pointer"
                title="Share to Telegram"
              >
                <FaTelegram className="text-sm" />
                <span className="hidden md:inline">Telegram</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                title="Copy package link"
              >
                {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Title and Badges */}
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-xs font-extrabold uppercase tracking-wider">
                <FiGlobe /> {pkg.country}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <FiTag /> {pkg.visaType || "Visa Service"}
              </span>
              {pkg.featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                  ★ Featured Exclusive
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                ● {pkg.status || "ACTIVE"}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              {pkg.title}
            </h1>

            {/* Travel Agency Contact Banner */}
            <div className="inline-flex flex-wrap items-center gap-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl mb-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold">
                  <FiPhone size={18} />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Official Agency Number</div>
                  <a 
                    href={`tel:${pkg.agencyNumber.replace(/[^0-9+]/g, "")}`}
                    className="text-white font-extrabold text-lg hover:text-yellow-400 transition-colors tracking-wide"
                  >
                    {pkg.agencyNumber}
                  </a>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDirectAgencyWhatsApp}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <FaWhatsapp size={16} /> Chat with Agent
                </button>
                <a
                  href={`tel:${pkg.agencyNumber.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700"
                >
                  <FiPhone size={14} /> Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left / Center 2 Columns: Package Details, Multi-Currency Pricing, Documents */}
          <div className="lg:col-span-2 space-y-10">

            {/* Multi-Currency Price Cards */}
            <div className="bg-[#0f172a]/90 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-sm shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-black text-yellow-400 uppercase tracking-widest block mb-1">
                    Multi-Currency Package Rates
                  </span>
                  <h2 className="text-2xl font-black text-white">Transparent Pricing Breakdown</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs font-bold">
                  <button 
                    onClick={() => setActiveCurrency("ALL")} 
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeCurrency === "ALL" ? "bg-yellow-400 text-black" : "text-slate-400 hover:text-white"}`}
                  >
                    Show All
                  </button>
                  <button 
                    onClick={() => setActiveCurrency("USD")} 
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeCurrency === "USD" ? "bg-yellow-400 text-black" : "text-slate-400 hover:text-white"}`}
                  >
                    $ USD
                  </button>
                  <button 
                    onClick={() => setActiveCurrency("PKR")} 
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeCurrency === "PKR" ? "bg-yellow-400 text-black" : "text-slate-400 hover:text-white"}`}
                  >
                    ₨ PKR
                  </button>
                  <button 
                    onClick={() => setActiveCurrency("AFN")} 
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeCurrency === "AFN" ? "bg-yellow-400 text-black" : "text-slate-400 hover:text-white"}`}
                  >
                    ؋ AFN
                  </button>
                </div>
              </div>

              {/* Currency Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* USD Card */}
                {(activeCurrency === "ALL" || activeCurrency === "USD") && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-extrabold text-emerald-400 mb-2">
                      <span>UNITED STATES DOLLAR</span>
                      <span className="text-base">🇺🇸</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {pkg.priceUSD ? `$${pkg.priceUSD.toLocaleString()}` : "Inquire"}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">Standard international base rate</p>
                  </div>
                )}

                {/* PKR Card */}
                {(activeCurrency === "ALL" || activeCurrency === "PKR") && (
                  <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-extrabold text-yellow-400 mb-2">
                      <span>PAKISTANI RUPEE</span>
                      <span className="text-base">🇵🇰</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {pkg.pricePKR ? `₨ ${pkg.pricePKR.toLocaleString()}` : "Inquire"}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">All taxes & Embassy fees included</p>
                  </div>
                )}

                {/* AFN Card */}
                {(activeCurrency === "ALL" || activeCurrency === "AFN") && (
                  <div className="bg-gradient-to-br from-sky-500/10 to-transparent border border-sky-500/20 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-extrabold text-sky-400 mb-2">
                      <span>AFGHAN AFGHANI</span>
                      <span className="text-base">🇦🇫</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {pkg.priceAFN ? `؋ ${pkg.priceAFN.toLocaleString()}` : "Inquire"}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">Direct Afghan client exchange rate</p>
                  </div>
                )}
              </div>

              {/* Key Specs Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <FiClock className="text-yellow-400" /> Processing Time
                  </div>
                  <div className="text-sm font-black text-white">{pkg.processingTime || "3-5 Working Days"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <FiCalendar className="text-yellow-400" /> Duration
                  </div>
                  <div className="text-sm font-black text-white">{pkg.duration || "30 Days Stay"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <FiShield className="text-yellow-400" /> Guarantee
                  </div>
                  <div className="text-sm font-black text-white">99% Approval Rate</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <FiAward className="text-yellow-400" /> Assistance
                  </div>
                  <div className="text-sm font-black text-white">Full Concierge</div>
                </div>
              </div>
            </div>

            {/* Package Description Detail */}
            <div className="bg-[#0f172a]/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center font-bold">
                  <FiInfo size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Package Description & Overview</h3>
                  <p className="text-xs text-slate-400">Everything covered under this package offering</p>
                </div>
              </div>

              <div className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line space-y-4">
                {pkg.description}
              </div>
            </div>

            {/* Documents Requirement Detail */}
            <div className="bg-[#0f172a]/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center font-bold">
                  <FiFileText size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Required Documents Detail</h3>
                  <p className="text-xs text-slate-400">Please have these items ready for application processing</p>
                </div>
              </div>

              {documentItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {documentItems.map((doc, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-yellow-400/30 transition-all group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                        <FiCheckCircle size={14} />
                      </div>
                      <div className="text-xs md:text-sm font-semibold text-slate-200 group-hover:text-white leading-snug">
                        {doc}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">{pkg.documents}</p>
              )}

              <div className="mt-6 p-4 rounded-2xl bg-yellow-400/5 border border-yellow-400/20 flex items-start gap-3">
                <FiInfo className="text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-yellow-400 font-bold">Need assistance with paperwork?</strong> Our visa advisors can verify your documents beforehand and assist with translations, attestations, and photograph formats free of charge.
                </p>
              </div>
            </div>

            {/* Share in Groups with Friends Callout */}
            <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-indigo-500/20 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden">
              <div className="max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4 text-xl">
                  <FiShare2 />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-2">
                  Share this Package with Friends & Family
                </h3>
                <p className="text-xs md:text-sm text-slate-300 mb-6">
                  Planning a family vacation, Umrah pilgrimage, or group business visit? Share this direct link with full pricing in USD, PKR, and AFN into your groups.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-sm transition-all shadow-lg shadow-[#25D366]/20 cursor-pointer"
                  >
                    <FaWhatsapp size={18} /> Share in WhatsApp Group
                  </button>
                  <button
                    onClick={handleTelegramShare}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1f8cc0] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#229ED9]/20 cursor-pointer"
                  >
                    <FaTelegram size={18} /> Share on Telegram
                  </button>
                  <button
                    onClick={handleFacebookShare}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#1877F2]/20 cursor-pointer"
                  >
                    <FaFacebook size={18} /> Facebook
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700 cursor-pointer"
                  >
                    {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                    <span>{copied ? "Link Copied to Clipboard!" : "Copy Public Link"}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Action & Inquiry Card */}
          <div className="space-y-6">
            
            {/* Quick Action Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-8 sticky top-28 shadow-2xl">
              <div className="text-center pb-6 border-b border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Ready to apply?
                </span>
                <div className="text-3xl font-black text-white">
                  {pkg.priceUSD ? `$${pkg.priceUSD.toLocaleString()}` : (pkg.pricePKR ? `₨ ${pkg.pricePKR.toLocaleString()}` : "Custom Quote")}
                </div>
                <div className="text-xs text-yellow-400 font-bold mt-1">
                  {pkg.pricePKR && `₨ ${pkg.pricePKR.toLocaleString()} PKR`}
                  {pkg.priceAFN && ` | ؋ ${pkg.priceAFN.toLocaleString()} AFN`}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="py-6 space-y-3">
                <button
                  onClick={handleDirectAgencyWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 px-4 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <FaWhatsapp size={18} /> Inquire on WhatsApp
                </button>

                <a
                  href={`tel:${pkg.agencyNumber.replace(/[^0-9+]/g, "")}`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all border border-slate-700"
                >
                  <FiPhone size={16} /> Call Agency: {pkg.agencyNumber}
                </a>

                <Link
                  href="/portal/client/apply"
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black py-3.5 px-4 rounded-xl font-black text-sm transition-all shadow-lg shadow-yellow-400/10"
                >
                  <FiSend size={16} /> Apply Online in Client Portal
                </Link>
              </div>

              {/* Quick Callback Form */}
              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2">
                  <FiUser className="text-yellow-400" /> Request Direct Callback
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Leave your contact details and our agency agent will reach out immediately.
                </p>

                {inquirySuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center">
                    ✓ Your inquiry has been forwarded to our WhatsApp agent! We will respond shortly.
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone / WhatsApp Number"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        placeholder="Special questions or dates (optional)"
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={inquirySending}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-400/20 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {inquirySending ? "Connecting..." : "Submit Callback Request"}
                    </button>
                  </form>
                )}
              </div>

              {/* Agency Guarantee */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <FiShield className="text-emerald-400 shrink-0 text-lg" />
                <div className="text-[11px] text-slate-400 leading-tight">
                  Official Travel Agency License #3492. Secure document processing & transparent refunds policy.
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      <Footer />
      <WhatsApp />
    </div>
  );
}
