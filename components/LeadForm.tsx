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
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: services[0],
    visaCategory: visaCategories[0],
    country: "",
    message: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("service", formData.service);
    if (formData.service === "Visa Services") {
      data.append("visaCategory", formData.visaCategory);
    }
    data.append("message", formData.message);
    
    files.forEach((file) => {
      data.append("files", file);
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
        }, 10000); // 10 seconds so they can copy the ID
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
          className="relative w-full max-w-xl glass-card overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-yellow-400 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-black">Start Your Journey</h2>
              <p className="text-black/70 text-sm">Fill out the form to get a free consultation</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/10 rounded-full transition-colors text-black"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-8">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 text-green-500 rounded-full mb-6">
                  <FiCheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
                <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-xl mb-6">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Your Tracking ID</p>
                  <p className="text-2xl font-black text-yellow-400 font-mono">{(formData as any).trackingId || "88008XXXXXX"}</p>
                </div>
                <p className="text-slate-400 text-sm">Please save this ID to track your application status. You will also receive an email confirmation.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label>Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Email Address *</label>
                    <input
                      required
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label>Phone Number *</label>
                  <input
                    required
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label>Nationality / Country *</label>
                    <select
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label>Interested Service *</label>
                    <select
                      required
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    >
                      {services.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditional Visa Category Dropdown */}
                {formData.service === "Visa Services" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1 overflow-hidden"
                  >
                    <label>Visa Category *</label>
                    <select
                      required
                      value={formData.visaCategory}
                      onChange={(e) => setFormData({ ...formData, visaCategory: e.target.value })}
                    >
                      {visaCategories.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </motion.div>
                )}

                <div className="space-y-1">
                  <label>Message</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label>Attach Documents (PDF/JPG)</label>
                  <div className="relative group">
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center transition-colors group-hover:border-yellow-400/50">
                      <FiUpload className="text-slate-500 mb-2 group-hover:text-yellow-400" size={24} />
                      <p className="text-sm text-slate-400">
                        {files.length > 0 
                          ? `${files.length} file(s) selected` 
                          : "Drag and drop or click to upload"}
                      </p>
                      <input
                        multiple
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {files.map((file, i) => (
                        <span key={i} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full premium-btn btn-primary mt-4"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Application"
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