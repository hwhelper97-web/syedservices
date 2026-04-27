"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUpload, FiCheckCircle, FiLoader, FiGlobe } from "react-icons/fi";
import { countries } from "@/utils/countries";

const services = [
  "Visa Services",
  "Tickets",
  "Work Permits",
  "Travel & Tours",
  "Immigration Consultancy",
];

const visaCategories = [
  "Tourist Visa",
  "Family Visit Visa",
  "Business Visa",
  "Work Visa",
  "Student Visa",
  "Medical Visa",
  "Transit Visa",
  "Religious/Pilgrimage",
  "Visa Extensions",
];

export default function LeadForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    passport: null,
    photo: null,
    license: null,
    bankStatement: null,
    invitationLetter: null,
    others: null,
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: services[0],
    visaCategory: visaCategories[0],
    country: "",
    message: "",
    // Visa specific fields
    passportNumber: "",
    passportExpiry: "",
    dob: "",
    fatherName: "",
    motherName: "",
    maritalStatus: "Single",
    spouseName: "",
    occupation: "",
    hasInvitation: "No",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    // Common fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    
    // Append files
    Object.entries(files).forEach(([key, file]) => {
      if (file) data.append(key, file);
    });

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const result = await res.json();
        setFormData(prev => ({ ...prev, trackingId: result.trackingId }));
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 10000); 
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form.");
    } finally {
      setLoading(false);
    }
  };

  const isVisa = formData.service === "Visa Services";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative w-full ${isVisa ? 'max-w-2xl' : 'max-w-lg'} glass-card overflow-hidden flex flex-col max-h-[90vh] transition-all duration-500`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-yellow-400 p-5 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-bold text-black">{isVisa ? "Full Visa Application" : "Start Your Journey"}</h2>
              <p className="text-black/70 text-xs">{isVisa ? "Please provide accurate details for official processing" : "Fill out the form for a free consultation"}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/10 rounded-full transition-colors text-black"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 text-green-500 rounded-full mb-4">
                  <FiCheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Application Submitted!</h3>
                <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-xl mb-4">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Your Tracking ID</p>
                  <p className="text-xl font-black text-yellow-400 font-mono">{(formData as any).trackingId || "88008XXXXXX"}</p>
                </div>
                <p className="text-slate-400 text-xs">Please save this ID to track your status.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Primary Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Full name as per passport"
                        className="w-full text-sm py-2"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="your@email.com"
                        className="w-full text-sm py-2"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+92 300 1234567"
                        className="w-full text-sm py-2"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interested Service *</label>
                      <select
                        required
                        className="w-full text-sm py-2"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      >
                        {services.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Conditional Visa Detail Section */}
                <AnimatePresence>
                  {isVisa && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 overflow-hidden"
                    >
                      {/* Visa Category & Country */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visa Category *</label>
                          <select
                            required
                            className="w-full text-sm py-2"
                            value={formData.visaCategory}
                            onChange={(e) => setFormData({ ...formData, visaCategory: e.target.value })}
                          >
                            {visaCategories.map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Nationality *</label>
                          <select
                            required
                            className="w-full text-sm py-2"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          >
                            <option value="">Select Country</option>
                            {countries.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Personal Details */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Personal & Family Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Birth *</label>
                            <input
                              required={isVisa}
                              type="date"
                              className="w-full text-sm py-2"
                              value={formData.dob}
                              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Father's Name *</label>
                            <input
                              required={isVisa}
                              type="text"
                              placeholder="Full Name"
                              className="w-full text-sm py-2"
                              value={formData.fatherName}
                              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mother's Name *</label>
                            <input
                              required={isVisa}
                              type="text"
                              placeholder="Full Name"
                              className="w-full text-sm py-2"
                              value={formData.motherName}
                              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Marital Status *</label>
                            <select
                              required={isVisa}
                              className="w-full text-sm py-2"
                              value={formData.maritalStatus}
                              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                            >
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                            </select>
                          </div>
                          {formData.maritalStatus === "Married" && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Spouse Name *</label>
                              <input
                                required={isVisa && formData.maritalStatus === "Married"}
                                type="text"
                                placeholder="Full Name"
                                className="w-full text-sm py-2"
                                value={formData.spouseName}
                                onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Passport Details */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Passport Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Passport Number *</label>
                            <input
                              required={isVisa}
                              type="text"
                              placeholder="Passport No"
                              className="w-full text-sm py-2"
                              value={formData.passportNumber}
                              onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Passport Expiry *</label>
                            <input
                              required={isVisa}
                              type="date"
                              className="w-full text-sm py-2"
                              value={formData.passportExpiry}
                              onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Document Uploads for Visa */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Required Document Scans</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'passport', label: 'Passport Scan *', icon: <FiGlobe /> },
                            { id: 'photo', label: 'Recent Photograph *', icon: <FiUpload /> },
                            { id: 'license', label: 'Driving License / Local ID *', icon: <FiUpload /> },
                            { id: 'bankStatement', label: 'Bank Statement (1-3 Months) *', icon: <FiUpload /> },
                          ].map((doc) => (
                            <div key={doc.id} className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{doc.label}</label>
                              <div className="relative group">
                                <div className={`border border-dashed ${files[doc.id] ? 'border-green-500 bg-green-500/5' : 'border-slate-700 bg-slate-900/50'} rounded-xl p-3 flex items-center gap-3 transition-colors`}>
                                  <div className={`shrink-0 ${files[doc.id] ? 'text-green-500' : 'text-slate-500'}`}>{doc.icon}</div>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {files[doc.id] ? (files[doc.id] as File).name : "Upload Scan"}
                                  </p>
                                  <input
                                    required={isVisa}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange(e, doc.id)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Invitation Letter Section */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invitation Letter from Pakistan</h4>
                              <p className="text-[10px] text-slate-400">Do you have an invitation letter? If not, we can provide one.</p>
                            </div>
                            <div className="flex gap-4">
                              {['Yes', 'No'].map((opt) => (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="hasInvitation" 
                                    value={opt}
                                    checked={formData.hasInvitation === opt}
                                    onChange={(e) => setFormData({ ...formData, hasInvitation: e.target.value })}
                                    className="accent-yellow-400"
                                  />
                                  <span className="text-xs text-slate-300">{opt === 'Yes' ? 'I Have It' : 'I Need One'}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {formData.hasInvitation === 'Yes' ? (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Invitation Letter *</label>
                              <div className="relative group">
                                <div className={`border border-dashed ${files.invitationLetter ? 'border-green-500 bg-green-500/5' : 'border-slate-700 bg-slate-900/50'} rounded-xl p-3 flex items-center gap-3 transition-colors`}>
                                  <div className={`shrink-0 ${files.invitationLetter ? 'text-green-500' : 'text-slate-500'}`}><FiUpload /></div>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {files.invitationLetter ? (files.invitationLetter as File).name : "Upload Invitation Letter"}
                                  </p>
                                  <input
                                    required={isVisa && formData.hasInvitation === 'Yes'}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange(e, 'invitationLetter')}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
                              <p className="text-[10px] text-yellow-400/80 leading-relaxed">
                                <strong>Note:</strong> Since you don't have an invitation letter, our team will process and provide a legal invitation letter for your visa application as part of our service.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isVisa && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nationality *</label>
                        <select
                          required
                          className="w-full text-sm py-2"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        >
                          <option value="">Select Country</option>
                          {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 opacity-0 pointer-events-none">
                        {/* Spacer for 2-col alignment */}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message</label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about your requirements..."
                        className="w-full text-sm py-2"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attach Documents (Optional)</label>
                      <div className="relative group">
                        <div className="border border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center transition-colors group-hover:border-yellow-400/50 bg-slate-900/50">
                          <FiUpload className="text-slate-500 mb-1 group-hover:text-yellow-400" size={20} />
                          <p className="text-[10px] text-slate-400">Drag or click to upload</p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if(e.target.files && e.target.files[0]) {
                                setFiles(prev => ({ ...prev, others: e.target.files![0] }));
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                      {files.others && (
                        <p className="text-[10px] text-green-500 mt-1">{(files.others as File).name} selected</p>
                      )}
                    </div>
                  </>
                )}

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full premium-btn btn-primary !py-4 text-sm font-black uppercase tracking-widest mt-4"
                >
                  {loading ? (
                    <><FiLoader className="animate-spin" /> Processing Application...</>
                  ) : (
                    isVisa ? "Submit Full Application" : "Submit Consultation Request"
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}