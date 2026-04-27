"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { motion } from "framer-motion";
import { 
  FiMapPin, FiPhone, FiMail, FiMessageCircle, FiClock, 
  FiChevronRight, FiGlobe, FiAward, FiShield, FiSend
} from "react-icons/fi";
import Image from "next/image";

const offices = [
  {
    city: "Jalalabad",
    country: "Afghanistan",
    agency: "Safi Afghan Travel Agency",
    manager: "Saeed Arman",
    role: "CEO & Founder",
    address: "Malang Jan Wat, Shams Tareen Plaza, 3rd Floor, Office No: 332, Jalalabad, Afghanistan",
    phones: [
      { name: "Direct Contact", number: "+93 764260062", whatsapp: "93764260062" },
    ],
    email: "Safiafghan352@gmail.com",
    image: "/images/md-saeed-arman.png",
    status: "Active - Open 9:00 AM - 6:00 PM"
  }
];

export default function OfficesPage() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-200 selection:bg-yellow-400 selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('/world-map.svg')] bg-center bg-no-repeat bg-contain" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-6"
            >
              <FiGlobe /> Global Network
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-none"
            >
              Our Strategic <br /> <span className="text-yellow-400">Offices.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl"
            >
              Syed Services partners with top-tier agencies across the region to provide 
              personalized, on-ground support for your travel and immigration needs.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Offices Grid */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {offices.map((office, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Image & Profile */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-5 space-y-8"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-yellow-400/20 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                    <Image 
                      src={office.image}
                      alt={office.manager}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10">
                      <h2 className="text-3xl font-black text-white mb-1">{office.manager}</h2>
                      <p className="text-yellow-400 font-bold uppercase tracking-widest text-xs">{office.role}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                    <FiAward className="text-yellow-400 text-2xl mb-4" />
                    <h4 className="text-white font-bold mb-1">Top Rated</h4>
                    <p className="text-xs text-slate-500">Official Partner Agency</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                    <FiShield className="text-yellow-400 text-2xl mb-4" />
                    <h4 className="text-white font-bold mb-1">Verified</h4>
                    <p className="text-xs text-slate-500">Licensed Professional</p>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Office Details */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-7 space-y-10"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-400 text-black rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-yellow-400/20">
                      {office.city[0]}
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-white">{office.city}, {office.country}</h3>
                      <p className="text-slate-500 font-medium">{office.agency}</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest mt-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {office.status}
                  </div>
                </div>

                <div className="max-w-2xl">
                  {/* Unified 3D Contact Hub */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.01, rotateY: 2, rotateX: -2 }}
                    style={{ perspective: 1500 }}
                    className="bg-[#0f172a] border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl relative group"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none group-hover:bg-yellow-400/10 transition-colors" />
                    
                    {/* Location Section */}
                    <div className="p-10 border-b border-slate-800/50 relative z-10">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 shrink-0 group-hover:scale-110 transition-transform">
                          <FiMapPin size={28} />
                        </div>
                        <div className="space-y-4 flex-1">
                          <div>
                            <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-1">Our Headquarters</h4>
                            <p className="text-slate-200 text-xl font-bold leading-tight">{office.address}</p>
                          </div>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Shams Tareen Plaza, Jalalabad, Afghanistan")}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-yellow-400/10 text-yellow-400 text-xs font-bold hover:bg-yellow-400 hover:text-black transition-all border border-yellow-400/20"
                          >
                            Open in Google Maps <FiChevronRight />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Email Section */}
                    <div className="p-10 relative z-10 bg-slate-900/20">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                          <FiMail size={28} />
                        </div>
                        <div className="space-y-4 flex-1">
                          <div>
                            <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-1">Official Email</h4>
                            <p className="text-slate-200 text-xl font-bold leading-tight">{office.email}</p>
                          </div>
                          <a 
                            href={`mailto:${office.email}`}
                            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-blue-400/10 text-blue-400 text-xs font-bold hover:bg-blue-400 hover:text-white transition-all border border-blue-400/20"
                          >
                            Send an Email <FiChevronRight />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* 3D Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.div>
                </div>

                {/* Contact List */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] overflow-hidden">
                  <div className="p-8 border-b border-slate-800 bg-slate-900/30">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs">Direct Contact Channels</h4>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {office.phones.map((phone, pIdx) => (
                      <div key={pIdx} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-yellow-400/10 group-hover:text-yellow-400 transition-colors">
                            <FiPhone size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{phone.name}</p>
                            <p className="text-white font-bold">{phone.number}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <a 
                            href={`https://wa.me/${phone.whatsapp}`}
                            target="_blank"
                            className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all"
                            title="Chat on WhatsApp"
                          >
                            <FiMessageCircle size={20} />
                          </a>
                          <a 
                            href={`tel:${phone.number}`}
                            className="p-3 bg-slate-800 text-slate-300 hover:bg-yellow-400 hover:text-black rounded-xl transition-all"
                            title="Call Now"
                          >
                            <FiPhone size={20} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick CTA */}
                <div className="bg-yellow-400 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-yellow-400/20">
                  <div>
                    <h3 className="text-2xl font-black text-black">Need a Quick Response?</h3>
                    <p className="text-black/60 text-sm font-medium">Chat directly with CEO Saeed Arman on WhatsApp</p>
                  </div>
                  <a 
                    href="https://wa.me/93764260062"
                    target="_blank"
                    className="flex items-center gap-3 px-8 py-4 bg-black text-white font-black rounded-2xl hover:scale-105 transition-transform shadow-xl"
                  >
                    <FiMessageCircle size={24} /> WhatsApp Now
                  </a>
                </div>
              </motion.div>

            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Why Contact Our Global Offices?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Local Expertise", desc: "Our on-ground teams understand local regulations and customs better than anyone.", icon: <FiGlobe /> },
              { title: "In-Person Support", desc: "Visit us for physical document submission and direct consultations.", icon: <FiUser /> },
              { title: "Fast Resolution", desc: "Direct channels to local authorities ensure your case moves as fast as possible.", icon: <FiSend /> }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-800 bg-[#0f172a]/50">
                <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mx-auto mb-6">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-4">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}

// Missing FiUser import fix
const FiUser = ({ size }: { size?: number }) => (
  <svg 
    stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" 
    strokeLinecap="round" strokeLinejoin="round" height={size || "1em"} width={size || "1em"} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
