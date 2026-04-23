"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiPhoneCall } from "react-icons/fi";
import { whatsappLink } from "@/utils/whatsapp";

export default function FinalCTA() {
  const openForm = () => {
    const event = new CustomEvent('openLeadForm');
    window.dispatchEvent(event);
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-yellow-400 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-400 to-yellow-500 z-0" />
      
      {/* Abstract Shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full -ml-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full -mr-48 -mb-48 blur-3xl" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Ready to Start Your <br />Global Journey?
          </h2>
          <p className="text-black/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of successful applicants who achieved their dreams with Syed Services. 
            Get expert consultation today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={openForm}
              className="px-10 py-5 bg-black text-white rounded-full font-bold text-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-2xl hover:translate-y-[-2px]"
            >
              Apply Now <FiArrowRight />
            </button>
            <Link 
              href="/visa/pakistan/exit"
              className="px-10 py-5 bg-white/20 border-2 border-black/10 text-black rounded-full font-bold text-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2"
            >
              Exit Permit <FiArrowRight />
            </Link>
          </div>
          
          <p className="mt-8 text-black/50 text-sm font-semibold uppercase tracking-widest">
            Fast Response • 100% Secure • Expert Guidance
          </p>
        </motion.div>
      </div>
    </section>
  );
}