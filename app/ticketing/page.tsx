"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiPhone, FiMail, FiMapPin, FiGlobe, FiAward, FiUser, FiChevronRight } from "react-icons/fi";
import Image from "next/image";

export default function TicketingPage() {
  const [formData, setFormData] = useState({
    departure: "",
    destination: "",
    date: "",
    phone: ""
  });

  const handleWhatsAppRedirect = () => {
    const { departure, destination, date, phone } = formData;
    const message = `*New Ticket Inquiry*\n\n` +
      `*From:* ${departure || "Not specified"}\n` +
      `*To:* ${destination || "Not specified"}\n` +
      `*Date:* ${date || "Not specified"}\n` +
      `*Phone:* ${phone || "Not specified"}\n\n` +
      `Please provide the best fare for this route.`;
    
    const whatsappUrl = `https://wa.me/923345668667?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors mb-8 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-6">
              <FiGlobe /> International & Domestic Ticketing
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Way to World <span className="text-yellow-400">International Travel</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Your gateway to the world. We provide seamless flight booking services for both 
              domestic and international destinations, ensuring the best rates and premium support.
            </p>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Info Cards */}
            <div className="space-y-6">
              <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-3xl relative overflow-hidden group hover:border-yellow-400/50 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Official Representative</h3>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-yellow-400 relative">
                    {/* Picture Place */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                    <Image 
                      src="/images/md-salman-sadiq.png" 
                      alt="MD. Salman Sadiq" 
                      fill 
                      className="object-cover"
                    /> 
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">MD. Salman Sadiq</h2>
                    <p className="text-slate-400 flex items-center gap-2">
                      <FiAward className="text-yellow-400" /> License No: PR-5233
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-3xl hover:border-yellow-400/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                    <FiPhone size={24} />
                  </div>
                  <h4 className="font-bold text-white mb-4">Contact Numbers</h4>
                  <ul className="space-y-2 text-slate-400">
                    <li className="hover:text-yellow-400 transition-colors"><a href="tel:03345668667">0334-5668667</a></li>
                    <li className="hover:text-yellow-400 transition-colors"><a href="tel:03005668667">0300-5668667</a></li>
                  </ul>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-3xl hover:border-yellow-400/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                    <FiMail size={24} />
                  </div>
                  <h4 className="font-bold text-white mb-4">Email Address</h4>
                  <p className="text-slate-400 text-sm break-all hover:text-yellow-400 transition-colors">
                    <a href="mailto:waytoworldinternationaltravel@gmail.com">waytoworldinternationaltravel@gmail.com</a>
                  </p>
                </div>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-3xl hover:border-yellow-400/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-6">
                  <FiMapPin size={24} />
                </div>
                <h4 className="font-bold text-white mb-4">Office Location</h4>
                <p className="text-slate-400 leading-relaxed">
                  Office No.3 Zafar Ali Market,<br />
                  Near Daewoo Bus Terminal Rashakai
                </p>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] relative">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
              
              <h2 className="text-3xl font-bold text-white mb-2">Request a Quote</h2>
              <p className="text-slate-400 mb-10">Fill in the details and our ticketing experts will contact you with the best available fares.</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Departure City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Islamabad" 
                      className="w-full bg-[#020617] border-slate-800 rounded-2xl px-5 py-4 focus:border-yellow-400/50 transition-all outline-none" 
                      value={formData.departure}
                      onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Destination City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dubai" 
                      className="w-full bg-[#020617] border-slate-800 rounded-2xl px-5 py-4 focus:border-yellow-400/50 transition-all outline-none" 
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Travel Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#020617] border-slate-800 rounded-2xl px-5 py-4 focus:border-yellow-400/50 transition-all outline-none text-slate-400" 
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+92 3XX XXXXXXX" 
                    className="w-full bg-[#020617] border-slate-800 rounded-2xl px-5 py-4 focus:border-yellow-400/50 transition-all outline-none" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <button 
                  onClick={handleWhatsAppRedirect}
                  className="w-full py-5 bg-yellow-400 text-black font-extrabold rounded-2xl hover:bg-yellow-300 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-2"
                >
                  Request Best Fare via WhatsApp
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#0f172a]/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { title: "Domestic Flights", desc: "Best fares for all major cities in Pakistan including Karachi, Lahore, and Islamabad." },
              { title: "International Travel", desc: "Global reach with bookings for all major international airlines at competitive prices." },
              { title: "24/7 Support", desc: "Our dedicated team is always ready to assist you with flight changes and cancellations." }
            ].map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mx-auto mb-6">
                  <FiGlobe size={32} />
                </div>
                <h4 className="text-xl font-bold text-white">{feature.title}</h4>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
