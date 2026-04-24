"use client";

import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";

const testimonials = [
  {
    name: "Ahmad Raza",
    role: "Student, UK",
    content: "Syed Services made my UK student visa process incredibly smooth. Their team is professional and always ready to help.",
    image: "https://i.pravatar.cc/150?u=ahmad",
  },
  {
    name: "Sarah Khan",
    role: "Traveler",
    content: "I got my Schengen visa in just 2 weeks! Highly recommend their services for anyone looking for reliable visa assistance.",
    image: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    name: "Zubair Ahmed",
    role: "Business Owner",
    content: "Professional consultancy for work permits. They handled all the complex documentation for my team.",
    image: "https://i.pravatar.cc/150?u=zubair",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">What Our <span className="text-gradient">Clients</span> Say</h2>
          <p className="text-slate-400">Real stories from people we've helped achieve their dreams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0f172a] p-8 rounded-3xl border border-slate-800 flex flex-col h-full"
            >
              <div className="flex gap-1 text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => <FiStar key={i} fill="currentColor" />)}
              </div>
              <p className="text-slate-300 italic mb-8 flex-grow">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-lg shadow-[0_0_15px_rgba(250,204,21,0.3)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  {t.name.split(' ').map(n => n[0]).join('')}
                  <div className="absolute inset-0 rounded-full border-2 border-yellow-400/20 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}