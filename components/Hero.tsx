"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiShield, FiGlobe, FiZap, FiCheckCircle, FiMapPin } from "react-icons/fi";
import { whatsappLink } from "@/utils/whatsapp";

const slides = [
  {
    src: "/images/pakistan/fairy-meadows.png",
    name: "Fairy Meadows",
    location: "Gilgit-Baltistan"
  },
  {
    src: "/images/pakistan/attabad-lake.png",
    name: "Attabad Lake",
    location: "Hunza Valley"
  },
  {
    src: "/images/pakistan/neelum-valley.png",
    name: "Neelum Valley",
    location: "Azad Kashmir"
  },
  {
    src: "/images/pakistan/k2.png",
    name: "K2 Base Camp",
    location: "Karakoram Range"
  },
  {
    src: "/images/pakistan/faisal-mosque.png",
    name: "Faisal Mosque",
    location: "Islamabad"
  },
  {
    src: "/images/pakistan/hunza-valley.png",
    name: "Hunza Valley",
    location: "Gilgit-Baltistan"
  },
  {
    src: "/images/pakistan/skardu.png",
    name: "Shangrila Lake",
    location: "Skardu"
  },
  {
    src: "/images/pakistan/badshahi-mosque.png",
    name: "Badshahi Mosque",
    location: "Lahore"
  }
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const openForm = () => {
    const event = new CustomEvent('openLeadForm');
    window.dispatchEvent(event);
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
            <FiZap className="animate-pulse" /> Your Trusted Visa Partner
          </span>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
            Explore the <span className="text-gradient">World</span> Without Limits
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-lg">
            Syed Services provides expert guidance for visas, study abroad, and immigration. 
            We turn your international dreams into reality with 99% success rate.
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={openForm}
              className="premium-btn btn-primary group"
            >
              Start Your Application
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href={whatsappLink("Hi, I'm interested in your services")}
              target="_blank"
              className="premium-btn btn-outline"
            >
              Consult via WhatsApp
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { icon: <FiShield />, label: "Secure & Trusted" },
              { icon: <FiGlobe />, label: "Global Reach" },
              { icon: <FiZap />, label: "Fast Process" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-start gap-2">
                <div className="text-yellow-400 text-xl">{item.icon}</div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative hidden md:block h-[500px]"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-full w-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={slides[currentIndex].src}
                alt={slides[currentIndex].name}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent pointer-events-none" />
            
            {/* Image Details - Bottom Right */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute bottom-6 right-6 text-right z-30 pointer-events-none"
              >
                <p className="text-white font-black text-xl md:text-2xl drop-shadow-lg">{slides[currentIndex].name}</p>
                <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest flex items-center justify-end gap-1 drop-shadow-md">
                  <FiMapPin size={10} /> {slides[currentIndex].location}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Indicators - Bottom Center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {slides.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-6 bg-yellow-400' : 'w-1.5 bg-white/20'}`}
                />
              ))}
            </div>
          </div>
          
          {/* Floating Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-2xl z-20 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
              <FiCheckCircle size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1000+</p>
              <p className="text-xs text-slate-400">Applications Approved</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}