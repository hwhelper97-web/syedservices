"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, FiFileText, FiBookOpen, FiGlobe, 
  FiArrowRight, FiArrowLeft, FiCheckCircle, FiLoader,
  FiClock, FiCheck, FiPackage, FiHeart, FiUsers, FiInfo, FiTag
} from "react-icons/fi";
import CustomDatePicker from "@/components/CustomDatePicker";

interface PackageItem {
  id: number;
  title: string;
  country: string;
  visaType: string | null;
  agencyNumber: string;
  priceUSD: number | null;
  pricePKR: number | null;
  priceAFN: number | null;
  duration: string | null;
  processingTime: string | null;
  description: string;
  documents: string;
  featured: boolean;
  status: string;
}

const STEPS = [
  { id: 1, name: "Personal & Family", icon: <FiUser size={18} /> },
  { id: 2, name: "Package & Visa", icon: <FiGlobe size={18} /> },
  { id: 3, name: "Education & Job", icon: <FiBookOpen size={18} /> },
  { id: 4, name: "Review & Invoice", icon: <FiFileText size={18} /> },
];

function VisaApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPackageId = searchParams.get("packageId");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);

  // Available packages from landing system
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    // Package fields
    packageId: "" as string | number,
    packagePrice: 250,

    // Step 1: Personal Info
    name: "", gender: "Male", dob: "", nationality: "Afghan", birthPlace: "", religion: "Islam",
    profession: "", qualification: "", phone: "", currentAddress: "", permanentAddress: "",
    // Passport Info
    passportNumber: "", passportIssueDate: "", passportExpiryDate: "", passportIssuePlace: "",
    
    // Official Family Info
    fatherName: "", motherName: "", maritalStatus: "Single", spouseName: "", childrenCount: "0",
    childrenDetails: "", emergencyContact: "",
    
    // Step 2: Visa & Travel Info
    country: "Pakistan", visaCategory: "Tourist Visa", duration: "30 Days", entryType: "Single",
    processingTime: "3 - 5 Working Days", travelDate: "", returnDate: "", purpose: "Tourism", sponsor: "", reference: "",

    // Step 3: Education & Employment
    highSchool: "", college: "", bachelor: "", master: "", graduationYear: "", cgpa: "",
    companyName: "", position: "", salary: "", experienceYears: "", employerAddress: "",

    // Step 4: Travel History
    visitedCountries: "", previousVisas: "", visaRefusals: "", previousPassportNumber: "",
  });

  // Fetch active packages on mount
  useEffect(() => {
    async function loadPackages() {
      try {
        setPackagesLoading(true);
        const res = await fetch("/api/packages");
        const data = await res.json();
        if (res.ok && data.packages) {
          setPackages(data.packages);

          // If query param specifies a package, auto-select it
          if (initialPackageId) {
            const found = data.packages.find((p: PackageItem) => p.id === parseInt(initialPackageId, 10));
            if (found) {
              applyPackage(found);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch packages:", err);
      } finally {
        setPackagesLoading(false);
      }
    }
    loadPackages();
  }, [initialPackageId]);

  const applyPackage = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    const entryGuess = pkg.duration?.toLowerCase().includes("multiple") || pkg.visaType?.toLowerCase().includes("multiple") 
      ? "Multiple" 
      : "Single";

    setFormData((prev) => ({
      ...prev,
      packageId: pkg.id,
      packagePrice: pkg.priceUSD || 250,
      country: pkg.country,
      visaCategory: pkg.visaType || "Tourist Visa",
      duration: pkg.duration || "30 Days",
      entryType: entryGuess,
      processingTime: pkg.processingTime || "3 - 5 Working Days",
    }));
  };

  const clearPackageSelection = () => {
    setSelectedPackage(null);
    setFormData((prev) => ({
      ...prev,
      packageId: "",
      packagePrice: 250,
    }));
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.passportNumber.trim()) {
        setError("Passport number is required.");
        return;
      }
      if (!formData.dob) {
        setError("Date of Birth is required.");
        return;
      }
      if (!formData.phone.trim()) {
        setError("Contact phone number is required.");
        return;
      }
      if (!formData.fatherName.trim()) {
        setError("Father's full official name is required.");
        return;
      }
      if (!formData.motherName.trim()) {
        setError("Mother's full official name is required.");
        return;
      }
      if (!formData.currentAddress.trim()) {
        setError("Current residence address is required.");
        return;
      }
      if (formData.maritalStatus === "Married" && !formData.spouseName.trim()) {
        setError("Please provide your Wife / Spouse full name since marital status is Married.");
        return;
      }
    } else if (step === 2) {
      if (!formData.country.trim() || !formData.visaCategory.trim()) {
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
      setInvoiceDetails(data.invoice);
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
          <h2 className="text-3xl font-black text-white">Application Logged Successfully!</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Your official application file and required documents have been registered. The Superadmin and travel operations team have been notified.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-3xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Your Tracking ID</p>
            <p className="text-xl font-mono font-black text-yellow-400">{trackingId}</p>
          </div>
          <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-3xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Official Invoice Amount</p>
            <p className="text-xl font-mono font-black text-emerald-400">
              ${invoiceDetails?.totalAmount || formData.packagePrice} USD
            </p>
            <span className="text-[10px] text-slate-400">{invoiceDetails?.invoiceNumber || "Invoice Generated"}</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => router.push("/portal/client")}
            className="px-8 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-yellow-400/10 cursor-pointer"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push("/portal/client/billing")}
            className="px-8 py-4 bg-slate-900 border border-slate-800 text-white font-bold rounded-2xl hover:bg-slate-850 active:scale-[0.98] transition-transform cursor-pointer"
          >
            View Generated Invoice
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
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Official Personal & Family Dossier</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Please provide authentic civil and family details for official visa processing.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                  Step 1 of 4
                </span>
              </div>
              
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Date of Birth *</label>
                  <CustomDatePicker
                    value={formData.dob}
                    onChange={(val) => updateField("dob", val)}
                    placeholder="Select Date of Birth"
                    minYear={1930}
                    maxYear={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Contact Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+93 764260062"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                  />
                </div>
              </div>

              {/* Passport Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Passport Number *</label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => updateField("passportNumber", e.target.value)}
                    placeholder="P0000000"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Passport Expiry Date *</label>
                  <CustomDatePicker
                    value={formData.passportExpiryDate}
                    onChange={(val) => updateField("passportExpiryDate", val)}
                    placeholder="Select Expiry Date"
                    minYear={new Date().getFullYear() - 1}
                    maxYear={new Date().getFullYear() + 25}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Passport Issue Place</label>
                  <input
                    type="text"
                    value={formData.passportIssuePlace}
                    onChange={(e) => updateField("passportIssuePlace", e.target.value)}
                    placeholder="e.g. Kabul / Islamabad"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                  />
                </div>
              </div>

              {/* Official Parents Information */}
              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  <FiUsers size={14} /> Official Parents Information (Required by Consulates)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Father Full Name *</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => updateField("fatherName", e.target.value)}
                      placeholder="Father's full name as per passport/Tazkira"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Mother Full Name *</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => updateField("motherName", e.target.value)}
                      placeholder="Mother's full official name"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Official Marital & Spouse Information */}
              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  <FiHeart size={14} /> Marital Status & Family Dependents
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Marital Status *</label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => updateField("maritalStatus", e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                    >
                      <option value="Single">Single (مجرد)</option>
                      <option value="Married">Married (متاهل / واده شوی)</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  {formData.maritalStatus === "Married" && (
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Wife / Spouse Full Name *</label>
                      <input
                        type="text"
                        value={formData.spouseName}
                        onChange={(e) => updateField("spouseName", e.target.value)}
                        placeholder="Official Name of Wife / Husband"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Conditional Children Section */}
                {formData.maritalStatus === "Married" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-800/60">
                    <div>
                      <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Number of Children</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.childrenCount}
                        onChange={(e) => updateField("childrenCount", e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white font-mono"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Children Details (Names & Ages)</label>
                      <input
                        type="text"
                        value={formData.childrenDetails}
                        onChange={(e) => updateField("childrenDetails", e.target.value)}
                        placeholder="e.g. Son: Ahmad (5), Daughter: Fatima (2)"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Current Residence Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">
                    Current Residence Address *
                  </label>
                  <input
                    type="text"
                    value={formData.currentAddress}
                    onChange={(e) => updateField("currentAddress", e.target.value)}
                    placeholder="House/Street, City, District, Province/State"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">
                    Permanent Origin Address
                  </label>
                  <input
                    type="text"
                    value={formData.permanentAddress}
                    onChange={(e) => updateField("permanentAddress", e.target.value)}
                    placeholder="Province/Origin as registered on Tazkira"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Education & Job */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Education & Employment Background</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Helps consulates verify ties to country of residence.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                  Step 3 of 4
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Highest Qualification</label>
                  <input
                    type="text"
                    value={formData.bachelor || formData.qualification || ""}
                    onChange={(e) => {
                      updateField("bachelor", e.target.value);
                      updateField("qualification", e.target.value);
                    }}
                    placeholder="Bachelor of Science, High School, etc."
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Graduation Year</label>
                  <input
                    type="text"
                    value={formData.graduationYear}
                    onChange={(e) => updateField("graduationYear", e.target.value)}
                    placeholder="e.g. 2022"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Company / Business Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="Employer or Business Name"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Position / Title</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => {
                      updateField("position", e.target.value);
                      updateField("profession", e.target.value);
                    }}
                    placeholder="e.g. Manager, Engineer, Businessman"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">Monthly Income (USD)</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => updateField("salary", e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 text-white font-mono"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Review Dossier & Strict Invoice Notice */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Review File & Strict Invoice Preview</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Please verify your official information before final submission.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                  Step 4 of 4
                </span>
              </div>

              {/* Strict Package & Invoice Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-yellow-400/10 border border-emerald-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                      Official Package Pricing
                    </span>
                    <h4 className="text-lg font-black text-white">
                      {selectedPackage ? selectedPackage.title : `${formData.country} - ${formData.visaCategory}`}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Destination: <strong className="text-white">{formData.country}</strong> · Category: <strong className="text-white">{formData.visaCategory}</strong> · Entry: <strong className="text-white">{formData.entryType}</strong>
                    </p>
                  </div>
                  <div className="text-left sm:text-right bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Generated Invoice Total</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      ${formData.packagePrice} USD
                    </span>
                    <span className="block text-[9px] text-slate-500 mt-0.5">Strict rate based on official package</span>
                  </div>
                </div>
              </div>

              {/* Official Family & Civil Details Review */}
              <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FiUser /> Official Applicant & Civil Dossier
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Passport Number</span>
                    <strong className="text-white font-mono">{formData.passportNumber || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Contact Phone</span>
                    <strong className="text-white">{formData.phone || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Date of Birth</span>
                    <strong className="text-white">{formData.dob || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Father Name</span>
                    <strong className="text-white">{formData.fatherName || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Mother Name</span>
                    <strong className="text-white">{formData.motherName || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Marital Status</span>
                    <strong className="text-white">{formData.maritalStatus || "Single"}</strong>
                  </div>
                  {formData.maritalStatus === "Married" && (
                    <>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Wife / Spouse Name</span>
                        <strong className="text-yellow-400">{formData.spouseName || "N/A"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Children Count</span>
                        <strong className="text-white font-mono">{formData.childrenCount}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Children Details</span>
                        <strong className="text-slate-300 truncate block">{formData.childrenDetails || "None specified"}</strong>
                      </div>
                    </>
                  )}
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Residence Address</span>
                    <strong className="text-white">{formData.currentAddress || "N/A"}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/10 text-yellow-400/90 text-xs leading-relaxed">
                📢 <strong>Documents Center:</strong> Once your application is logged, you can upload all supporting documents (Passport Scans, Tazkira, Photos) on the Documents Center inside your portal dashboard.
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
                className="flex items-center gap-2 px-5 py-3 border border-slate-800 text-xs font-bold rounded-2xl hover:bg-slate-900 transition-all cursor-pointer text-slate-300"
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
                className="flex items-center gap-2 px-8 py-3.5 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50 shadow-xl shadow-yellow-400/20"
              >
                {loading ? (
                  <FiLoader className="animate-spin" size={16} />
                ) : (
                  <>
                    Final Submit & Issue Invoice <FiCheckCircle size={16} />
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

export default function VisaApplyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="animate-spin text-yellow-400" size={32} />
      </div>
    }>
      <VisaApplyForm />
    </Suspense>
  );
}
