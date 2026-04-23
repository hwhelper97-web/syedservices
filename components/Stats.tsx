"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Visas Approved", value: "5,000+" },
  { label: "Success Rate", value: "99%" },
  { label: "Countries Served", value: "40+" },
  { label: "Years Experience", value: "10+" },
];

export default function Stats() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">
                {stat.value}
              </h3>
              <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Divider Line */}
      <div className="max-w-7xl mx-auto px-6 mt-20">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>
    </section>
  );
}