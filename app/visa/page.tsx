"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { motion } from "framer-motion";
import { FiGlobe, FiBriefcase, FiMap, FiArrowRight } from "react-icons/fi";

const visaTypes = [
  {
    title: "Tourist Visa",
    desc: "Explore new horizons. We handle tourist visas for Europe, USA, UAE, and more.",
    icon: <FiMap />,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1421&auto=format&fit=crop",
  },
  {
    title: "Business Visa",
    desc: "Seamless business travel. Expert handling of corporate and business visit visas.",
    icon: <FiBriefcase />,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1470&auto=format&fit=crop",
  },
  {
    title: "Family Visa",
    desc: "Bring your loved ones together. Assistance with family reunion and dependent visas.",
    icon: <FiGlobe />,
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1470&auto=format&fit=crop",
  },
];

export default function VisaPage() {
  const openForm = () => {
    const event = new CustomEvent('openLeadForm');
    window.dispatchEvent(event);
  };

  return (
    <main>
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Visa <span className="text-gradient">Services</span>
          </motion.h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            We offer comprehensive visa assistance for travelers, students, and professionals 
            seeking to cross borders with confidence.
          </p>
        </div>
      </section>

      {/* Visa Types */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {visaTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={openForm}
              >
                <div className="relative h-64 mb-6 rounded-3xl overflow-hidden border border-slate-800">
                  <img src={type.image} alt={type.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-yellow-400 text-3xl">
                    {type.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-400 transition-colors">{type.title}</h3>
                <p className="text-slate-400 mb-6">{type.desc}</p>
                <span className="flex items-center gap-2 text-yellow-400 font-bold">
                  Apply Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Elements */}
      <section className="py-24 bg-[#0f172a] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Expert Guidance at Every Step</h2>
            <div className="space-y-6">
              {[
                { title: "Personalized Consultation", desc: "We analyze your profile to suggest the best visa category." },
                { title: "Document Verification", desc: "Meticulous review of all documents to ensure high success rate." },
                { title: "Interview Preparation", desc: "Mock interviews and tips for embassy appointments." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-10 bg-yellow-400/5">
            <h3 className="text-2xl font-bold mb-6">Request a Call Back</h3>
            <p className="text-slate-400 mb-8">Not sure which visa you need? Leave your details and our experts will call you back.</p>
            <button 
              onClick={openForm}
              className="premium-btn btn-primary w-full"
            >
              Consult with Experts
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}
