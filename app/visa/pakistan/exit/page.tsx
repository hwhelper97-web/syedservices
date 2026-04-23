"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsApp from "@/components/WhatsApp";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiFileText, FiUser, FiGlobe, FiCheckCircle, FiUploadCloud, 
  FiArrowRight, FiArrowLeft, FiAlertCircle, FiInfo, FiDollarSign, FiClock 
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { countries } from "@/utils/countries";

const overstayFees = [
  { range: "Up to 2 Weeks", fee: "No surcharge" },
  { range: "2 Weeks to 1 Month", fee: "US$ 59" },
  { range: "1 Month to 3 Months", fee: "US$ 213" },
  { range: "3 Months to 1 Year", fee: "US$ 418" },
  { range: "Processing Fee", fee: "US$ 60" },
];

export default function ExitPermitPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: "Exit Permit",
    type: "normal",
    applyType: "individual",
    familyCount: "1",
    name: "",
    phone: "",
    email: "",
    fatherName: "",
    motherName: "",
    nationality: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [id]: file }));
    }
  };

  const [trackingId, setTrackingId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    
    // Append all selected files
    Object.values(selectedFiles).forEach(file => {
      data.append("files", file);
    });

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        setTrackingId(result.trackingId);
        setStep(4); // Success step
      } else {
        alert(result.error || "Submission failed.");
      }
    } catch (err) {
      alert("Error submitting application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[#020617] min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-slate-900/50 relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
              Ministry of Interior Guidelines
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Pakistan <span className="text-gradient">Exit Permit</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Exit Permit facilitates foreigners who intend to leave Pakistan but do not possess a valid visa 
              (expired, cancelled, or rejected). Valid for 15 days from the date of issuance.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                <FiClock className="text-yellow-400" /> 48-72 Hours Processing
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                <FiGlobe className="text-yellow-400" /> 192 Countries Eligible
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 border-yellow-400/20 bg-yellow-400/5"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiDollarSign className="text-yellow-400" /> Overstay Surcharges
            </h3>
            <div className="space-y-3">
              {overstayFees.map((item, i) => (
                <div key={i} className={`flex justify-between items-center py-2 border-b border-white/5 last:border-0 ${item.range === 'Processing Fee' ? 'text-yellow-400 font-bold mt-2' : ''}`}>
                  <span className={`${item.range === 'Processing Fee' ? '' : 'text-slate-400'} text-sm`}>{item.range}</span>
                  <span className="text-white font-bold">{item.fee}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-4 italic">
              * This fee structure applies to **Normal Exit Permits** for Foreign Nationals (General).
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rules & Regulations */}
      <section className="py-20 bg-black/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-yellow-400/10 text-yellow-400 rounded-xl flex items-center justify-center text-2xl">
                <FiInfo />
              </div>
              <h3 className="text-xl font-bold">Eligibility Rules</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2"><FiCheckCircle className="text-yellow-400 mt-1 flex-shrink-0" /> Application if Visa rejected or cancelled</li>
                <li className="flex items-start gap-2"><FiCheckCircle className="text-yellow-400 mt-1 flex-shrink-0" /> Application if Visa has expired</li>
                <li className="flex items-start gap-2"><FiCheckCircle className="text-yellow-400 mt-1 flex-shrink-0" /> Foreign Nationals with Pakistan Origin</li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-400/10 text-blue-400 rounded-xl flex items-center justify-center text-2xl">
                <FiFileText />
              </div>
              <h3 className="text-xl font-bold">Required Documents</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Valid Passport Scan</li>
                <li>• Recent Photograph (White Background)</li>
                <li>• Proof of Last Pakistani Visa</li>
                <li>• Proof of Entry Stamp into Pakistan</li>
                <li>• Rejection Letter (If applicable)</li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-400/10 text-green-400 rounded-xl flex items-center justify-center text-2xl">
                <FiAlertCircle />
              </div>
              <h3 className="text-xl font-bold">Important Terms</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The applicant must provide absolutely CORRECT information. False information will lead to rejection 
                and non-refundable fees. Exit permit is valid for 15 days only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="apply" className="py-24 px-6 bg-[#020617]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Start Your Application</h2>
            <p className="text-slate-400">Secure and professional processing by Syed Services</p>
          </div>

          <div className="glass-card p-8 md:p-12 border-slate-800">
            {/* Progress Bar (Shortened) */}
            <div className="flex justify-between mb-12">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-yellow-400' : 'text-slate-600'}`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= s ? 'border-yellow-400 bg-yellow-400/10' : 'border-slate-800'}`}>{s}</div>
                   <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Step {s}</span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  <h3 className="text-xl font-bold">Step 1: Application Category</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setFormData({...formData, type: "normal"})} className={`p-6 rounded-2xl border-2 text-left ${formData.type === 'normal' ? 'border-yellow-400 bg-yellow-400/5' : 'border-slate-800'}`}>
                      <h4 className="font-bold mb-1">Normal Permit</h4>
                      <p className="text-xs text-slate-500">Expired or Rejected Visa cases.</p>
                    </button>
                    <button onClick={() => setFormData({...formData, type: "humanitarian"})} className={`p-6 rounded-2xl border-2 text-left ${formData.type === 'humanitarian' ? 'border-yellow-400 bg-yellow-400/5' : 'border-slate-800'}`}>
                      <h4 className="font-bold mb-1">Humanitarian</h4>
                      <p className="text-xs text-slate-500">Emergency or Amnesty cases.</p>
                    </button>
                  </div>
                  <button onClick={() => setStep(2)} className="premium-btn btn-primary w-full py-4">Next Step <FiArrowRight /></button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  <h3 className="text-xl font-bold">Step 2: Who is Applying?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setFormData({...formData, applyType: "individual"})} className={`p-6 rounded-2xl border-2 text-left ${formData.applyType === 'individual' ? 'border-yellow-400 bg-yellow-400/5' : 'border-slate-800'}`}>
                      <h4 className="font-bold mb-1">Individual</h4>
                      <p className="text-xs text-slate-500">Single person application.</p>
                    </button>
                    <button onClick={() => setFormData({...formData, applyType: "family"})} className={`p-6 rounded-2xl border-2 text-left ${formData.applyType === 'family' ? 'border-yellow-400 bg-yellow-400/5' : 'border-slate-800'}`}>
                      <h4 className="font-bold mb-1">Family</h4>
                      <p className="text-xs text-slate-500">Multiple family members.</p>
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-800 rounded-xl font-bold">Back</button>
                    <button onClick={() => setStep(3)} className="flex-[2] premium-btn btn-primary py-4">Continue</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="text-xl font-bold">Step 3: Personal Information</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input required name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} />
                      <input required name="phone" placeholder="WhatsApp Number" value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <input required name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleInputChange} />
                      <input name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleInputChange} />
                    </div>
                    <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white">
                      <option value="">Select Nationality</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    <div className="pt-4 border-t border-slate-800 mt-8">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Required Document Scans</h4>
                       <div className="space-y-4">
                          {[
                            { id: "passport", label: "Valid Passport Scan" },
                            { id: "photo", label: "Recent Photograph (White Background)" },
                            { id: "last_visa", label: "Proof of Last Pakistani Visa" },
                            { id: "entry_stamp", label: "Proof of Entry Stamp into Pakistan" },
                            ...(formData.type === 'normal' ? [{ id: "rejection", label: "Rejection/Cancellation Letter (Optional)" }] : [])
                          ].map((doc) => (
                            <div key={doc.id} className="space-y-2">
                              <label className="text-xs text-slate-400 block ml-1">{doc.label} *</label>
                              <div className="relative group">
                                <div className={`flex items-center justify-between p-4 bg-slate-900/80 border rounded-xl group-hover:border-yellow-400/50 transition-all ${selectedFiles[doc.id] ? 'border-green-500/50 bg-green-500/5' : 'border-slate-800'}`}>
                                  <span className={`text-xs truncate pr-4 ${selectedFiles[doc.id] ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                                    {selectedFiles[doc.id] ? `✓ ${selectedFiles[doc.id].name}` : "Select file (PDF or JPG)"}
                                  </span>
                                  <FiUploadCloud className={`${selectedFiles[doc.id] ? 'text-green-400' : 'text-slate-600'} group-hover:text-yellow-400 transition-colors shrink-0`} />
                                   <input 
                                     type="file" 
                                     accept=".pdf,.jpg,.jpeg"
                                    onChange={(e) => handleFileSelect(doc.id, e)}
                                     className="absolute inset-0 opacity-0 cursor-pointer"
                                   />
                                 </div>
                              </div>
                            </div>
                          ))}
                       </div>
                       <p className="text-[10px] text-slate-600 mt-6 italic bg-yellow-400/5 p-3 rounded-lg border border-yellow-400/10">
                         <FiAlertCircle className="inline mr-1" />
                         Documents must be clear and readable. Total file size should not exceed 10MB.
                       </p>
                    </div>

                    <div className="flex gap-4 pt-8">
                      <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors">Back</button>
                      <button disabled={isSubmitting} type="submit" className="flex-[2] premium-btn btn-primary py-4 text-lg">
                        {isSubmitting ? "Processing..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Application Received!</h3>
                  <p className="text-slate-400 mb-8">Your Exit Permit application has been submitted successfully.</p>
                  
                  <div className="bg-yellow-400/10 border border-yellow-400/20 p-6 rounded-2xl mb-8">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Your Tracking ID</p>
                    <p className="text-3xl font-black text-yellow-400 font-mono">{trackingId}</p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => router.push(`/track?id=${trackingId}`)}
                      className="premium-btn btn-primary w-full py-4"
                    >
                      Track Application Status
                    </button>
                    <p className="text-xs text-slate-500">
                      We have sent a confirmation email to <strong>{formData.email}</strong>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsApp />
    </main>
  );
}