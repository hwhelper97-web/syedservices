"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Stats from "../components/Stats";
import WhyUs from "../components/WhyUs";
import Testimonials from "../components/Testimonials";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import WhatsApp from "../components/WhatsApp";
import WorldMapPro from "../components/WorldMapPro";
import LeadForm from "../components/LeadForm";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const handleOpenForm = () => setIsFormOpen(true);
    window.addEventListener('openLeadForm', handleOpenForm);
    return () => window.removeEventListener('openLeadForm', handleOpenForm);
  }, []);

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <WorldMapPro />
      <Services />
      <Stats />
      <WhyUs />
      <Testimonials />
      <FinalCTA />
      <Footer />
      <WhatsApp />
      
      {isFormOpen && <LeadForm onClose={() => setIsFormOpen(false)} />}
    </main>
  );
}