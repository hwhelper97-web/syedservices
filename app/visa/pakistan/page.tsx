"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiGlobe, FiCheckCircle, FiArrowRight, FiInfo, FiDollarSign, FiClock, 
  FiShield, FiBriefcase, FiHome, FiHeart, FiBook, FiRepeat, FiMap, 
  FiFileText, FiSearch, FiCheck, FiChevronDown, FiExternalLink, FiPlus, FiAlertCircle
} from "react-icons/fi";
import Link from "next/link";

// --- Data Structures ---

const visaCategories = [
  {
    id: "tourist",
    title: "Tourist Visa",
    icon: <FiGlobe />,
    shortDesc: "Experience the rich culture and landscapes of Pakistan.",
    longDesc: "Pakistan offers a wide range of tourism opportunities, from the majestic peaks of the Karakoram to the ancient ruins of the Indus Valley. The Tourist E-Visa is designed for individuals visiting for recreation or travel.",
    eligibility: "Open to citizens of 192 countries. Must have a valid passport with at least 6 months validity.",
    docs: {
      common: ["Passport Scan (Bio page)", "Photograph (White background)", "Proof of Stay (Hotel booking)"],
      specific: ["Invitation Letter (if applicable)", "Bank Statement (some nationalities)"]
    },
    processing: "Normal: 7-10 Days | Urgent: 24 Hours",
    faqs: [
      { q: "Can I extend my tourist visa?", a: "Yes, tourist visas can usually be extended up to 6 months through the online portal." },
      { q: "Do I need a sponsor?", a: "Most nationalities can apply with a hotel booking, but some may require an invitation letter from a registered tour operator." }
    ]
  },
  {
    id: "family",
    title: "Family Visit Visa",
    icon: <FiHome />,
    shortDesc: "Visit your loved ones and reconnect with your heritage.",
    longDesc: "Designed for foreign nationals of Pakistani origin or those with immediate family in Pakistan. This category offers longer stay durations and easier documentation for family reunions.",
    eligibility: "Available for spouses, children, or immediate relatives of Pakistani citizens or POC holders.",
    docs: {
      common: ["Passport Scan", "Photograph", "Proof of Relationship (Nikah Nama, Birth Certificate)"],
      specific: ["Host's CNIC/Passport Copy", "Proof of Residence in Pakistan"]
    },
    processing: "7 - 10 Working Days",
    faqs: [
      { q: "Is multiple entry available?", a: "Yes, family visit visas are typically granted as multiple entry for up to 5 years (for POC holders)." }
    ]
  },
  {
    id: "business",
    title: "Business Visa",
    icon: <FiBriefcase />,
    shortDesc: "Expand your horizons in the emerging Pakistani market.",
    longDesc: "Pakistan is a land of opportunities. The Business Visa facilitates investors and professionals coming for meetings, conferences, or trade exhibitions.",
    eligibility: "Business professionals from 147 Business Friendly List (BVL) countries get prioritized processing.",
    docs: {
      common: ["Passport Scan", "Photograph", "Business Letter (Chamber of Commerce)"],
      specific: ["Letter of Invitation (E-LIV) from Pakistani company", "Sponsor's Business Registration"]
    },
    processing: "BVL Countries: 24 Hours | Non-BVL: 4 Weeks",
    faqs: [
      { q: "What is an E-LIV?", a: "It is an Electronic Letter of Invitation issued through the official portal of the Chamber of Commerce in Pakistan." }
    ]
  },
  {
    id: "work",
    title: "Work Visa",
    icon: <FiShield />,
    shortDesc: "Official authorization for professional employment.",
    longDesc: "For skilled professionals invited by companies registered in Pakistan. This category requires rigorous documentation and approval from the Board of Investment (BOI).",
    eligibility: "Must have a valid job offer and contract from a registered entity in Pakistan.",
    docs: {
      common: ["Passport Scan", "Photograph", "Employment Contract"],
      specific: ["BOI Recommendation Letter", "Company Registration Documents", "FBR Profile of Employer"]
    },
    processing: "4 - 8 Weeks (Requires BOI Clearance)",
    faqs: [
      { q: "Can I switch employers?", a: "No, a work visa is tied to a specific employer. A new application is required if you change jobs." }
    ]
  },
  {
    id: "student",
    title: "Student Visa",
    icon: <FiBook />,
    shortDesc: "Pursue excellence in Pakistan's top universities.",
    longDesc: "International students can apply for long-term study visas after securing admission in an HEC-recognized institution in Pakistan.",
    eligibility: "Must have an admission letter and NOC from the Higher Education Commission (HEC) or Ministry of Education.",
    docs: {
      common: ["Passport Scan", "Photograph", "Admission Letter"],
      specific: ["HEC/Ministry NOC", "Proof of Funds", "Educational Transcripts"]
    },
    processing: "4 - 6 Weeks",
    faqs: [
      { q: "Is the student visa renewable?", a: "Yes, it is renewed annually based on the student's academic progress and enrollment status." }
    ]
  },
  {
    id: "medical",
    title: "Medical Visa",
    icon: <FiHeart />,
    shortDesc: "Quality healthcare with dedicated visa support.",
    longDesc: "For individuals seeking specialized medical treatment or surgery in Pakistan's leading healthcare facilities.",
    eligibility: "Must have a medical appointment or referral from a recognized hospital in Pakistan.",
    docs: {
      common: ["Passport Scan", "Photograph", "Medical Reports"],
      specific: ["Hospital Acceptance Letter", "Proof of Funds for Treatment"]
    },
    processing: "7 Working Days (Urgent processing available)",
    faqs: [
      { q: "Can an attendant come with me?", a: "Yes, up to two attendants are typically allowed on a separate Medical Attendant Visa." }
    ]
  },
  {
    id: "transit",
    title: "Transit Visa",
    icon: <FiMap />,
    shortDesc: "Short stay for travelers passing through Pakistan.",
    longDesc: "If you have a layover in Pakistan and wish to leave the airport, a Transit Visa allows you to stay for up to 72 hours.",
    eligibility: "Must have a confirmed onward ticket and a valid visa for the final destination.",
    docs: {
      common: ["Passport Scan", "Photograph"],
      specific: ["Confirmed Onward Ticket", "Visa for Final Destination"]
    },
    processing: "24 - 48 Hours",
    faqs: [
      { q: "Can I apply at the airport?", a: "No, all transit visas must be applied for online before arrival." }
    ]
  },
  {
    id: "religious",
    title: "Religious / Pilgrimage",
    icon: <FiRepeat />,
    shortDesc: "Spiritual journeys to the land of diverse faiths.",
    longDesc: "Pakistan is home to significant religious sites for Muslims, Sikhs, Buddhists, and Hindus. Special visas are issued for pilgrims visiting these holy places.",
    eligibility: "Open to individuals or groups for specific religious events or site visits.",
    docs: {
      common: ["Passport Scan", "Photograph"],
      specific: ["NOC from Ministry of Religious Affairs (for groups)", "Proof of Pilgrimage Purpose"]
    },
    processing: "4 Weeks",
    faqs: [
      { q: "Are group visas available?", a: "Yes, religious tourism is often processed in groups through registered operators." }
    ]
  },
  {
    id: "extension",
    title: "Visa Extensions",
    icon: <FiPlus />,
    shortDesc: "Extend your stay in Pakistan legally.",
    longDesc: "If your current visa is about to expire and you wish to stay longer, we assist with the official extension process.",
    eligibility: "Must have a valid existing visa. Application must be submitted before the current visa expires.",
    docs: {
      common: ["Passport Scan", "Current Visa Copy", "Stay Permit"],
      specific: ["Reason for Extension", "Proof of Valid Stay"]
    },
    processing: "7 - 10 Working Days",
    faqs: [
      { q: "How many times can I extend?", a: "This depends on the visa category, but most tourist visas can be extended twice." }
    ]
  }
];

// --- Components ---

const SmartVisaFinder = () => {
  const [purpose, setPurpose] = useState("");
  const [recommendation, setRecommendation] = useState<typeof visaCategories[0] | null>(null);

  const findVisa = () => {
    let found = null;
    if (purpose === "vacation") found = visaCategories.find(v => v.id === "tourist");
    else if (purpose === "family") found = visaCategories.find(v => v.id === "family");
    else if (purpose === "business") found = visaCategories.find(v => v.id === "business");
    else if (purpose === "work") found = visaCategories.find(v => v.id === "work");
    else if (purpose === "study") found = visaCategories.find(v => v.id === "student");
    else if (purpose === "medical") found = visaCategories.find(v => v.id === "medical");
    else if (purpose === "transit") found = visaCategories.find(v => v.id === "transit");
    else if (purpose === "religion") found = visaCategories.find(v => v.id === "religious");
    
    setRecommendation(found || null);
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 md:p-12">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Smart Visa Finder</h3>
        <p className="text-slate-400 mb-8">Not sure which category fits your needs? Let us recommend the best option.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <select 
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="flex-1 bg-[#020617] border border-slate-800 rounded-2xl px-6 py-4 text-slate-300 focus:border-yellow-400 outline-none transition-all"
          >
            <option value="">What is your purpose of travel?</option>
            <option value="vacation">Tourism & Sightseeing</option>
            <option value="family">Visiting Friends or Family</option>
            <option value="business">Meetings, Trade or Investment</option>
            <option value="work">Employment / Job</option>
            <option value="study">Education / University</option>
            <option value="medical">Medical Treatment</option>
            <option value="transit">Short Layover (72h)</option>
            <option value="religion">Pilgrimage / Spiritual</option>
          </select>
          <button 
            onClick={findVisa}
            className="premium-btn btn-primary px-8 py-4 whitespace-nowrap"
          >
            Find My Visa
          </button>
        </div>

        <AnimatePresence>
          {recommendation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-yellow-400/5 border border-yellow-400/20 rounded-3xl p-6 text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl text-yellow-400 bg-yellow-400/10 w-12 h-12 rounded-xl flex items-center justify-center">
                  {recommendation.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white">{recommendation.title} Recommended</h4>
                  <p className="text-xs text-yellow-400/70 font-medium">Best fit for your purpose</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-6">{recommendation.shortDesc}</p>
              <button 
                onClick={() => {
                  const el = document.getElementById(recommendation.id);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-yellow-400 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
              >
                View Detailed Requirements <FiArrowRight />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DocumentModule = ({ category }: { category: typeof visaCategories[0] }) => {
  const [open, setOpen] = useState<string | null>("common");

  return (
    <div className="space-y-4">
      <div className="border border-slate-800 rounded-2xl overflow-hidden">
        <button 
          onClick={() => setOpen(open === "common" ? null : "common")}
          className="w-full flex justify-between items-center p-5 bg-[#0f172a] hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiFileText className="text-blue-400" />
            <span className="font-bold text-white">Common Documents</span>
          </div>
          <FiChevronDown className={`transition-transform ${open === "common" ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open === "common" && (
            <motion.div 
              initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              className="overflow-hidden bg-[#020617]"
            >
              <div className="p-6 space-y-3">
                {category.docs.common.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                    <FiCheck className="text-green-500 shrink-0" /> {doc}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border border-slate-800 rounded-2xl overflow-hidden">
        <button 
          onClick={() => setOpen(open === "specific" ? null : "specific")}
          className="w-full flex justify-between items-center p-5 bg-[#0f172a] hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FiShield className="text-yellow-400" />
            <span className="font-bold text-white">Category-Specific Documents</span>
          </div>
          <FiChevronDown className={`transition-transform ${open === "specific" ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open === "specific" && (
            <motion.div 
              initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              className="overflow-hidden bg-[#020617]"
            >
              <div className="p-6 space-y-3">
                {category.docs.specific.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                    <FiCheck className="text-green-500 shrink-0" /> {doc}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FeeSection = () => {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          <FiDollarSign /> Fee Information
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Transparent <span className="text-yellow-400">Fee Structure</span></h2>
        <p className="text-slate-400 mb-12 text-lg leading-relaxed max-w-2xl mx-auto">
          Official government fees for Pakistan E-Visas are dynamic and depend on your nationality, visa category, 
          and stay duration. We ensure you pay the correct amount through the official channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#020617] p-8 rounded-3xl border border-slate-800">
            <h4 className="font-bold text-white mb-2">Reciprocity Basis</h4>
            <p className="text-sm text-slate-500">Fees are set based on bilateral agreements between Pakistan and your country.</p>
          </div>
          <div className="bg-[#020617] p-8 rounded-3xl border border-slate-800">
            <h4 className="font-bold text-white mb-2">Currency</h4>
            <p className="text-sm text-slate-500">Official fees are typically denominated in US Dollars (USD).</p>
          </div>
          <div className="bg-[#020617] p-8 rounded-3xl border border-slate-800">
            <h4 className="font-bold text-white mb-2">Payment Methods</h4>
            <p className="text-sm text-slate-500">We assist in secure payments via Credit/Debit Cards (Visa/Mastercard).</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a 
            href="https://visa.nadra.gov.pk/fee-structure/" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-yellow-400 font-bold hover:underline"
          >
            Check Latest Official Fees <FiExternalLink />
          </a>
          <button 
            onClick={() => {
              const event = new CustomEvent('openLeadForm');
              window.dispatchEvent(event);
            }}
            className="premium-btn btn-primary px-10 py-4"
          >
            Get a Personalized Fee Quote
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function VisaServicesHub() {
  const [activeTab, setActiveTab] = useState(visaCategories[0].id);
  const activeCategory = visaCategories.find(v => v.id === activeTab) || visaCategories[0];

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && visaCategories.find(v => v.id === hash)) {
      setActiveTab(hash);
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <main className="bg-[#020617] min-h-screen text-slate-200 selection:bg-yellow-400 selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-6"
            >
              <FiShield /> Premium Visa Assistance
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-none"
            >
              Visa Services <br /> <span className="text-yellow-400">Redefined.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl"
            >
              Expert guidance for your journey to Pakistan. We simplify complex immigration rules 
              and provide professional end-to-end support for your e-visa application.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => {
                  const el = document.getElementById('hub');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="premium-btn btn-primary px-8 py-4"
              >
                Explore Categories <FiArrowRight />
              </button>
              <button 
                onClick={() => {
                  const event = new CustomEvent('openLeadForm');
                  window.dispatchEvent(event);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-2xl transition-all"
              >
                Talk to an Expert
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smart Finder */}
      <section id="finder" className="py-20 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <SmartVisaFinder />
        </div>
      </section>

      {/* Visa Hub Section */}
      <section id="hub" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Visa Categories Hub</h2>
            <p className="text-slate-400">Discover detailed requirements and processing times for every visa type.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-2">
              {visaCategories.map((cat) => (
                <button
                  key={cat.id}
                  id={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${
                    activeTab === cat.id 
                    ? 'bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-400/20' 
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm">{cat.title}</span>
                  </div>
                  {activeTab === cat.id && <FiChevronDown className="-rotate-90" />}
                </button>
              ))}
            </div>

            {/* Category Details Area */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 md:p-12"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-3xl text-yellow-400">{activeCategory.icon}</div>
                        <h2 className="text-3xl md:text-4xl font-black text-white">{activeCategory.title}</h2>
                      </div>
                      <p className="text-slate-400 text-lg leading-relaxed">{activeCategory.longDesc}</p>
                    </div>
                    <div className="shrink-0 space-y-4">
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl min-w-[200px]">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                          <FiClock /> Processing Time
                        </div>
                        <p className="text-white font-bold">{activeCategory.processing}</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                          <FiGlobe /> Eligibility
                        </div>
                        <p className="text-white text-xs leading-relaxed">{activeCategory.eligibility}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 mb-12">
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Document Checklists</h4>
                        <DocumentModule category={activeCategory} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Frequently Asked Questions</h4>
                      <div className="space-y-4">
                        {activeCategory.faqs.map((faq, i) => (
                          <div key={i} className="bg-[#020617] border border-slate-800 rounded-2xl p-5">
                            <h5 className="font-bold text-white text-sm mb-2">Q: {faq.q}</h5>
                            <p className="text-slate-500 text-sm">A: {faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center gap-6">
                    <button 
                      onClick={() => {
                        const event = new CustomEvent('openLeadForm');
                        window.dispatchEvent(event);
                      }}
                      className="premium-btn btn-primary w-full md:w-auto px-12 py-5 text-lg"
                    >
                      Start Application
                    </button>
                    <a 
                      href="https://wa.me/923099797771" 
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
                    >
                      Inquire via WhatsApp <FiArrowRight />
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* Fees Section */}
      <section id="fees" className="py-24 bg-black/30">
        <div className="max-w-7xl mx-auto px-6">
          <FeeSection />
        </div>
      </section>

      {/* Service Assistance Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-white mb-6">Professional <span className="text-yellow-400">Assistance</span></h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Applying for a visa can be complex. Syed Services acts as your professional advisor, 
                ensuring your application meets all government standards for the highest success rate.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: "Eligibility Review", desc: "We pre-assess your documents to ensure you qualify for the category." },
                  { title: "Documentation Support", desc: "Complete guidance on invitation letters, NOCs, and financial proof." },
                  { title: "Application Guidance", desc: "Step-by-step help in filling the complex official portal forms." },
                  { title: "Appointment Assistance", desc: "Helping you secure early slots for interviews if required." },
                  { title: "Follow-up Support", desc: "Real-time updates and direct follow-ups with relevant authorities." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-800 bg-[#0f172a]/50">
                    <div className="w-10 h-10 bg-yellow-400/10 rounded-full flex items-center justify-center text-yellow-400 shrink-0">
                      <FiCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 blur-[120px] rounded-full pointer-events-none" />
              <div className="relative bg-[#0f172a] border border-slate-800 rounded-[3rem] p-12 overflow-hidden">
                <div className="text-center mb-10">
                  <FiAlertCircle className="text-yellow-400 text-5xl mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">Advisory Notice</h3>
                  <p className="text-slate-400 text-sm">
                    Syed Services is a private travel consultancy. We are NOT a government agency. 
                    We provide expert assistance to help you navigate the official e-visa process 
                    efficiently. Final approval rests with the Government of Pakistan.
                  </p>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('openLeadForm');
                      window.dispatchEvent(event);
                    }}
                    className="premium-btn btn-primary w-full py-5"
                  >
                    Get Started Now
                  </button>
                  <p className="text-center text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
                    Trusted by 1000+ Travelers Worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}
