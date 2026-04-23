"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Image from "next/image";

const spots = [
  {
    id: 1,
    title: "Hunza Valley",
    description: "The crown jewel of the North, where snow-capped peaks meet turquoise rivers.",
    image: "/images/tourism/hunza.png"
  },
  {
    id: 2,
    title: "Shangrila Resort, Skardu",
    description: "A heart-shaped lake surrounded by the majestic Karakoram mountains.",
    image: "/images/tourism/skardu.png"
  },
  {
    id: 3,
    title: "Faisal Mosque, Islamabad",
    description: "Modern Islamic architecture at the foothills of the Margalla Hills.",
    image: "/images/tourism/faisal.png"
  },
  {
    id: 4,
    title: "Badshahi Mosque, Lahore",
    description: "A historic masterpiece of Mughal architecture and intricate red sandstone.",
    image: "/images/tourism/badshahi.png"
  }
];

export default function TourismSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev === spots.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setIndex((prev) => (prev === spots.length - 1 ? 0 : prev + 1));
  const prev = () => setIndex((prev) => (prev === 0 ? spots.length - 1 : prev - 1));

  return (
    <section className="py-24 bg-[#020617] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4 block">Explore Pakistan</span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Discover the <span className="text-gradient">Untouched Beauty</span> of Pakistan
            </h2>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={prev}
              className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all"
            >
              <FiChevronLeft size={24} />
            </button>
            <button 
              onClick={next}
              className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image 
                src={spots[index].image} 
                alt={spots[index].title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute bottom-0 left-0 p-8 md:p-12 w-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-0.5 w-12 bg-yellow-400" />
                  <span className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Featured Destination</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4">{spots[index].title}</h3>
                <p className="text-slate-300 text-lg max-w-xl leading-relaxed">{spots[index].description}</p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-8 right-8 flex gap-2 z-20">
            {spots.map((_, i) => (
              <button 
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1 transition-all duration-300 rounded-full ${index === i ? 'w-8 bg-yellow-400' : 'w-4 bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
