"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { motion } from "framer-motion";
import { FiBriefcase, FiGlobe, FiFileText, FiTrendingUp, FiArrowRight, FiCheck } from "react-icons/fi";

const permitTypes = [
  {
    title: "Skilled Worker Visa",
    desc: "For professionals with a job offer in a shortage occupation or skilled role.",
    icon: <FiBriefcase />,
    points: ["Employer Sponsorship", "Health & Care Options", "Path to PR"],
  },
  {
    title: "Business & Investment",
    desc: "For entrepreneurs looking to set up or expand business operations globally.",
    icon: <FiTrendingUp />,
    points: ["Innovation Visa", "Startup Support", "Self-Sponsorship"],
  },
  {
    title: "Intra-company Transfer",
    desc: "Transferring employees from overseas branches to local offices.",
    icon: <FiGlobe />,
    points: ["Fast Processing", "L1/ICT Categories", "Multi-national Support"],
  },
];

export default function WorkPermitsPage() {
  const openForm = () => {
    const event = new CustomEvent('openLeadForm');
    window.dispatchEvent(event);
  };

  return (
    <main className="bg-[#020617] min-h-screen">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Global <span className="text-gradient">Work Permits</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
              Unlock international career opportunities with our professional work permit consultancy. 
              We bridge the gap between global employers and talented professionals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {permitTypes.map((type, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 hover:border-yellow-400/40 transition-all group"
            >
              <div className="w-16 h-16 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                {type.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{type.title}</h3>
              <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                {type.desc}
              </p>
              <ul className="space-y-3 mb-10">
                {type.points.map((point, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-slate-300">
                    <FiCheck className="text-yellow-400" /> {point}
                  </li>
                ))}
              </ul>
              <button 
                onClick={openForm}
                className="flex items-center gap-2 text-yellow-400 font-bold group/btn"
              >
                Apply for Assessment <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us for Work Permits */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">Professional Guidance for Employers & Employees</h2>
              <div className="space-y-6">
                {[
                  { t: "Legal Compliance", d: "We ensure all applications meet the latest labor market requirements." },
                  { t: "Employer Sponsorship", d: "Assisting companies in obtaining and maintaining sponsorship licenses." },
                  { t: "Interview Coaching", d: "Tailored preparation for embassy and home office interviews." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="w-12 h-12 bg-yellow-400/10 text-yellow-400 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      <FiFileText />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{item.t}</h4>
                      <p className="text-slate-400 text-sm">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1470&auto=format&fit=crop" alt="Work Permit Team" className="w-full h-auto" />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto glass-card p-12 border-yellow-400/20 bg-yellow-400/5">
          <h2 className="text-3xl font-bold mb-4">Start Your Global Career Today</h2>
          <p className="text-slate-400 mb-8">Book a comprehensive assessment with our work permit specialists.</p>
          <button onClick={openForm} className="premium-btn btn-primary px-10 py-5 text-lg">
            Book Appointment
          </button>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}
