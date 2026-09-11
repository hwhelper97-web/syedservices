import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { FiShield, FiLock, FiFileText, FiEye } from "react-icons/fi";

export const metadata = {
  title: "Privacy Policy | Syed Services",
  description: "Learn how Syed Services collects, protects, and manages your personal and travel data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-200">
      <Navbar />

      <section className="pt-32 pb-16 border-b border-slate-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-6">
            <FiShield /> Legal & Compliance
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Privacy <span className="text-yellow-400">Policy</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Last updated: September 2026. This policy outlines how Syed Services safeguards your personal and travel documentation.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-8 leading-relaxed text-slate-300">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <FiEye className="text-yellow-400" /> 1. Information We Collect
            </h2>
            <p className="text-sm text-slate-400">
              To provide visa processing, flight bookings, and immigration consultancy, we collect necessary personal details including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-400">
              <li>Full name, date of birth, marital status, and nationality</li>
              <li>Passport information, expiry dates, and previous travel history</li>
              <li>Contact details including phone number, email address, and residential address</li>
              <li>Supporting documents (passport scans, photographs, bank statements, invitation letters)</li>
            </ul>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <FiLock className="text-yellow-400" /> 2. How We Protect Your Data
            </h2>
            <p className="text-sm text-slate-400">
              Your security is paramount. All uploaded documents are stored in enterprise-grade encrypted cloud storage. Access is strictly limited to authorized case officers, registered travel agents, and legal counsel assigned to your file.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <FiFileText className="text-yellow-400" /> 3. Disclosure to Authorities
            </h2>
            <p className="text-sm text-slate-400">
              We only share your information with government embassies, consulates, immigration departments (such as NADRA and Ministry of Interior), and airline booking systems required to execute your requested visa or ticketing service.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">4. Contact Our Data Protection Officer</h2>
            <p className="text-sm text-slate-400">
              If you have any questions or wish to request data erasure or updates, please contact us at:
            </p>
            <p className="text-sm font-semibold text-yellow-400">
              Email: info@syedservices.com.pk | WhatsApp: +92 309 9797771
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}
