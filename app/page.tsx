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
import PackagesSection from "../components/PackagesSection";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <WorldMapPro />
      <PackagesSection />
      <Services />
      <Stats />
      <WhyUs />
      <Testimonials />
      <FinalCTA />
      <Footer />
      <WhatsApp />
    </main>
  );
}