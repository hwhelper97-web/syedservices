"use client";

import { motion } from "framer-motion";
import { FiClock, FiShield, FiHeadphones, FiCheck } from "react-icons/fi";

const reasons = [
  {
    title: "Fast Processing",
    desc: "We prioritize your time and ensure the quickest possible turnaround for all applications.",
    icon: <FiClock />,
  },
  {
    title: "Trusted Service",
    desc: "With 10+ years of experience, we have built a reputation for honesty and reliability.",
    icon: <FiShield />,
  },
  {
    title: "24/7 Support",
    desc: "Our dedicated experts are available around the clock to answer your queries.",
    icon: <FiHeadphones />,
  },
];

export default function WhyUs() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Thousands <span className="text-gradient">Trust</span> Syed Services
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              We don't just process papers; we build bridges to your future. Our commitment to excellence 
              has made us the leading consultancy in the region.
            </p>
            
            <ul className="space-y-4">
              {[
                "Government Registered Agency",
                "99% Visa Success Rate",
                "Transparent Pricing Structure",
                "Dedicated Case Managers"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-400/20 text-yellow-400 rounded-full flex items-center justify-center">
                    <FiCheck size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="flex-1 grid gap-6">
            {reasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 p-6 bg-[#0f172a] border border-slate-800 rounded-2xl group hover:border-yellow-400/30 transition-colors"
              >
                <div className="w-14 h-14 bg-yellow-400/10 text-yellow-400 rounded-xl flex items-center justify-center text-2xl group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                  {reason.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{reason.title}</h3>
                  <p className="text-slate-400 text-sm">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}