"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, FiFileText, FiBookOpen, FiGlobe, 
  FiArrowRight, FiArrowLeft, FiCheckCircle, FiLoader 
} from "react-icons/fi";

const STEPS = [
  { id: 1, name: "Personal & Passport", icon: <FiUser size={18} /> },
  { id: 2, name: "Family & Visa", icon: <FiGlobe size={18} /> },
  { id: 3, name: "Education & Job", icon: <FiBookOpen size={18} /> },
  { id: 4, name: "Document Upload", icon: <FiFileText size={18} /> },
];

export default function VisaApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [trackingId, setTrackingId] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    name: "", gender: "Male", dob: "", nationality: "Afghan", birthPlace: "", religion: "Islam",
    profession: "", qualification: "", phone: "", currentAddress: "", permanentAddress: "",
    // Passport Info
    passportNumber: "", passportIssueDate: "", passportExpiryDate: "", passportIssuePlace: "",
    
    // Step 2: Family & Visa Info
    fatherName: "", motherName: "", spouseName: "", childrenCount: "0", emergencyContact: "",
    country: "Pakistan", visaCategory: "Tourist Visa", duration: "30 Days", entryType: "Single",
    travelDate: "", returnDate: "", purpose: "Tourism", sponsor: "", reference: "",

    // Step 3: Education & Employment
    highSchool: "", college: "", bachelor: "", master: "", graduationYear: "", cgpa: "",
    companyName: "", position: "", salary: "", experienceYears: "", employerAddress: "",

    // Step 4: Travel History
    visitedCountries: "", previousVisas: "", visaRefusals: "", previousPassportNumber: "",
  });

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.passportNumber || !formData.dob || !formData.phone) {
        setError("Passport number, DOB, and phone number are required.");
        return;
      }
    } else if (step === 2) {
      if (!formData.country || !formData.visaCategory) {
        setError("Destination country and Visa category are required.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (isDraft = false) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isDraft }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setTrackingId(data.application.trackingId);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <FiCheckCircle size={44} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">Application Submitted!</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Your visa application file has been logged in our system. A travel agent will verify your documents shortly.
          </p>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-3xl max-w-sm mx-auto">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Your Tracking ID</p>
          <p className="text-xl font-mono font-black text-yellow-400">{trackingId}</p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => router.push("/portal/client")}
            className="px-8 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-4">
        {STEPS.map((s) => {
          const isCompleted = step > s.id;
          const isActive = step === s.id;
          return (
            <div key={s.id} className="text-center space-y-2">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto border transition-all ${
                isCompleted ? "bg-green-500/10 text-green-500 border-green-500/20" :
                isActive ? "bg-yellow-400 text-black border-yellow-400" :
                "bg-slate-900 text-slate-550 border-slate-800"
              }`}>
                {s.icon}
              </div>
              <p className={`text-[9px] font-bold uppercase tracking-widest hidden md:block ${isActive ? "text-yellow-400" : "text-slate-500"}`}>
                {s.name}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Form Content Card */}
      <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-black text-white tracking-tight border-b border-slate-800 pb-3">Personal & Passport Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">DOB *</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateField("dob", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+93 764260062"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Passport Number *</label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => updateField("passportNumber", e.target.value)}
                    placeholder="P0000000"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.passportExpiryDate}
                    onChange={(e) => updateField("passportExpiryDate", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Current Residence Address</label>
                  <input
                    type="text"
                    value={formData.currentAddress}
                    onChange={(e) => updateField("currentAddress", e.target.value)}
                    placeholder="City, District, State..."
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-black text-white tracking-tight border-b border-slate-800 pb-3">Family Profile & Visa Choice</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Father Name</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => updateField("fatherName", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Mother Name</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => updateField("motherName", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Destination Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  >
                    <option>Pakistan</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Turkey</option>
                    <option>Saudi Arabia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Visa Type *</label>
                  <select
                    value={formData.visaCategory}
                    onChange={(e) => updateField("visaCategory", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  >
                    <option>Tourist Visa</option>
                    <option>Business Visa</option>
                    <option>Student Visa</option>
                    <option>Work Visa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Planned Travel Date</label>
                  <input
                    type="date"
                    value={formData.travelDate}
                    onChange={(e) => updateField("travelDate", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-black text-white tracking-tight border-b border-slate-800 pb-3">Education & Professional Employment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Highest Qualification</label>
                  <input
                    type="text"
                    value={formData.bachelor || formData.master || ""}
                    onChange={(e) => updateField("bachelor", e.target.value)}
                    placeholder="Bachelor of Science, etc."
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Graduation Year</label>
                  <input
                    type="text"
                    value={formData.graduationYear}
                    onChange={(e) => updateField("graduationYear", e.target.value)}
                    placeholder="e.g. 2022"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => updateField("position", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Monthly Salary (USD)</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => updateField("salary", e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-black text-white tracking-tight border-b border-slate-800 pb-3">Verify Details & Submit</h3>

              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Destination:</span>
                    <p className="font-bold text-white mt-0.5">{formData.country}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Visa Category:</span>
                    <p className="font-bold text-white mt-0.5">{formData.visaCategory}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Passport Number:</span>
                    <p className="font-bold text-white mt-0.5">{formData.passportNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact Number:</span>
                    <p className="font-bold text-white mt-0.5">{formData.phone}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/10 text-yellow-400/80 text-[11px] leading-relaxed">
                📢 **Important Note**: Standard visa documents (Passport Scan, CNIC, and Photo) can be uploaded on the Documents Center inside your portal dashboard immediately after finalizing this application form.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer controls */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-3 border border-slate-800 text-xs font-bold rounded-2xl hover:bg-slate-900 transition-all cursor-pointer"
              >
                <FiArrowLeft size={16} /> Back
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-5 py-3 border border-slate-800 text-xs font-bold rounded-2xl hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              Save Draft
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
              >
                Continue <FiArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3.5 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <FiLoader className="animate-spin" size={16} />
                ) : (
                  <>
                    Final Submit <FiCheckCircle size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
