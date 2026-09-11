import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { FiCheckSquare, FiInfo, FiFileText, FiAlertTriangle } from "react-icons/fi";

export const metadata = {
  title: "Terms of Service | Syed Services",
  description: "Terms and conditions governing the services provided by Syed Services.",
};

export default function TermsPage() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-200">
      <Navbar />

      <section className="pt-32 pb-16 border-b border-slate-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-6">
            <FiFileText /> Terms & Conditions
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Terms of <span className="text-yellow-400">Service</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Please read these terms and conditions carefully before using the services of Syed Services.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-8 leading-relaxed text-slate-300">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <FiCheckSquare className="text-yellow-400" /> 1. Nature of Consultancy & Visa Services
            </h2>
            <p className="text-sm text-slate-400">
              Syed Services operates as a professional facilitation and travel advisory agency. We assist applicants in document preparation, submission verification, appointments, and submission to official government visa portals (such as NADRA, Ministry of Interior, and foreign embassies).
            </p>
            <p className="text-sm text-slate-400">
              <strong>Visa Issuance Authority:</strong> The ultimate decision to grant or reject any visa, entry permit, or work authorization rests entirely with the respective government embassy or immigration authorities. Syed Services does not guarantee visa approvals.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <FiInfo className="text-yellow-400" /> 2. Accuracy of Client Information
            </h2>
            <p className="text-sm text-slate-400">
              Clients are strictly responsible for providing genuine, truthful, and accurate documentation. Submission of fraudulent, counterfeit, or forged records is against international law and will result in immediate termination of service and potential reporting to statutory bodies.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <FiAlertTriangle className="text-yellow-400" /> 3. Fees and Refund Policy
            </h2>
            <p className="text-sm text-slate-400">
              Official government processing fees, visa voucher charges, and airline issuance tariffs paid to third-party institutions are non-refundable once lodged. Agency consultation charges cover document processing, legal review, and administrative time.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-white">4. Governing Law</h2>
            <p className="text-sm text-slate-400">
              These terms are governed in accordance with the laws of Pakistan. Any disputes arising shall be subject to the exclusive jurisdiction of the courts of Pakistan.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}
