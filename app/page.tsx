import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import VisaSection from "../components/VisaSection";
import ExitSection from "../components/ExitSection";
import WhyUs from "../components/WhyUs";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";
import WhatsApp from "../components/WhatsApp";
import MainCTA from "../components/MainCTA";
import Stats from "../components/Stats";
import FinalCTA from "../components/FinalCTA";
import WorldMapPro from "../components/WorldMapPro";
import { whatsappLink } from "@/utils/whatsapp";

export default function Home() {
  return (
    <>
  <Navbar />
  <Hero />
  <WorldMapPro />
  <Services />
  <Stats />
  <WhyUs />
  <Testimonials />
  <ContactSection />
  <MainCTA />
   <FinalCTA />
  <Footer />
  <WhatsApp />
</>
  );
}