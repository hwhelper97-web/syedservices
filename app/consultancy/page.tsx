"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { motion } from "framer-motion";
import { FiTarget, FiTrendingUp, FiSettings, FiCheck } from "react-icons/fi";

const consultancies = [
  {
    title: "Educational Consultancy",
    desc: "Helping students choose the right universities and courses worldwide for a bright career.",
    icon: <FiTarget />,
  },
  {
    title: "Career Counseling",
    desc: "Guidance for professionals looking to migrate or find employment opportunities abroad.",
    icon: <FiTrendingUp />,
  },
  {
    title: "Immigration Strategy",
    desc: "Strategic planning for PR and citizenship applications in Canada, Australia, and Europe.",
    icon: <FiSettings />,
  },
];

export default function ConsultancyPage() {
  const openForm = () => {
    const event = new CustomEvent('openLeadForm');
    window.dispatchEvent(event);
  };

  return (
    <main>
      <Navbar />
      
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-yellow-400/5 -skew-x-12 transform origin-top-right -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              Strategic <span className="text-gradient">Consultancy</span> for Global Success
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Unlock your international potential with expert guidance tailored to your specific goals. 
              We provide the clarity you need to make life-changing decisions.
            </p>
            <button onClick={openForm} className="premium-btn btn-primary px-10 py-5 text-lg">
              Book a Strategy Session
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {consultancies.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-10 hover:border-yellow-400/40 transition-all"
              >
                <div className="w-16 h-16 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center text-3xl mb-8">
                  {c.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{c.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {c.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
             <div className="relative rounded-3xl overflow-hidden border border-slate-800">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop" alt="Consultancy" className="w-full h-auto" />
             </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Proven Approach</h2>
            <div className="space-y-8">
              {[
                { t: "Step 1: Evaluation", d: "We conduct a thorough assessment of your goals and eligibility." },
                { t: "Step 2: Roadmap", d: "Creating a step-by-step plan to achieve your international objectives." },
                { t: "Step 3: Execution", d: "Full support through applications, documentation, and follow-ups." },
              ].map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 text-yellow-400 flex-shrink-0 flex items-center justify-center font-bold">
                    {i+1}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{step.t}</h4>
                    <p className="text-slate-400">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}
