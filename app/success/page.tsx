"use client";

import { motion } from "framer-motion";
import { FiCheckCircle, FiArrowLeft, FiHome } from "react-icons/fi";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-12 text-center"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 text-green-500 rounded-full mb-8">
          <FiCheckCircle size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Application Received!</h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          Thank you for choosing Syed Services. Your application has been successfully submitted. 
          Our expert consultants will review your documents and contact you within 24 hours.
        </p>

        <div className="space-y-4">
          <Link 
            href="/" 
            className="premium-btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <FiHome /> Back to Homepage
          </Link>
          <p className="text-xs text-slate-600 uppercase tracking-widest font-bold">
            Stay tuned for updates
          </p>
        </div>
      </motion.div>
    </div>
  );
}