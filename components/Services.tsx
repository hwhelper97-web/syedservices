"use client";

import { motion } from "framer-motion";
import { FiGlobe, FiBookOpen, FiBriefcase, FiMap, FiUsers, FiChevronRight } from "react-icons/fi";

const FiCheckCircle = ({ className }: { className?: string }) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const services = [
  {
    title: "Visa Services",
    desc: "Tourist, business, and transit visas for all major countries with full documentation support.",
    icon: <FiGlobe />,
    color: "yellow",
  },
  {
    title: "Study Abroad",
    desc: "Complete assistance for international admissions, scholarships, and student visa processing.",
    icon: <FiBookOpen />,
    color: "blue",
  },
  {
    title: "Exit Permit",
    desc: "Facilitating foreigners with expired or rejected visas to exit Pakistan legally and safely.",
    icon: <FiBriefcase />,
    color: "purple",
  },
  {
    title: "Travel & Tours",
    desc: "Customized holiday packages, flight bookings, and hotel reservations worldwide.",
    icon: <FiMap />,
    color: "green",
  },
  {
    title: "Immigration",
    desc: "Expert consultancy for permanent residency and citizenship applications.",
    icon: <FiUsers />,
    color: "red",
  },
  {
    title: "Document Legalization",
    desc: "Notarization, MOFA attestation, and document verification services.",
    icon: <FiCheckCircle />,
    color: "indigo",
  }
];

export default function Services() {
  const openForm = () => {
    const event = new CustomEvent('openLeadForm');
    window.dispatchEvent(event);
  };

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Comprehensive <span className="text-gradient">Solutions</span>
          </motion.h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            We provide a wide range of services to make your international journey smooth and successful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -mr-16 -mt-16 group-hover:bg-yellow-400/10 transition-colors" />
              
              <div className="text-3xl text-yellow-400 mb-6 bg-yellow-400/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {service.desc}
              </p>
              
              <button 
                onClick={openForm}
                className="flex items-center gap-2 text-sm font-bold text-yellow-400 group/btn"
              >
                Learn More 
                <FiChevronRight className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}