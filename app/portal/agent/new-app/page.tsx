"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FiArrowLeft, FiUser, FiFileText, FiGlobe, 
  FiBriefcase, FiLoader, FiCheckCircle, FiUpload, FiPlusCircle, FiX,
  FiBookOpen, FiCreditCard, FiImage, FiShield, FiCompass, FiPaperclip,
  FiAlertCircle, FiDollarSign, FiTag, FiCalendar, FiPhone, FiHome,
  FiHeart, FiUsers, FiLayers, FiInfo, FiCheck, FiRefreshCw
} from "react-icons/fi";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import CustomDatePicker from "@/components/CustomDatePicker";
import { ALL_WORLD_COUNTRIES, PRIORITY_COUNTRIES } from "@/lib/countries";
import { ALL_VISA_CATEGORIES } from "@/lib/visaCategories";

interface PackageItem {
  id: number;
  title: string;
  country: string;
  visaType: string;
  duration?: string | null;
  entryType?: string | null;
  priceUSD?: number | null;
  pricePKR?: number | null;
  processingTime?: string | null;
  featured?: boolean;
}

function AgentNewApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Loading & Submission states
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  // Active Tab/Section: 1 | 2 | 3 | 4 | 5
  const [activeStep, setActiveStep] = useState<number>(1);

  // Packages from website
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("custom");

  // Step 1: Package & Visa Selection
  const [country, setCountry] = useState("Pakistan");
  const [visaCategory, setVisaCategory] = useState("L Tourism");
  const [duration, setDuration] = useState("3 Months");
  const [entryType, setEntryType] = useState("Single");
  const [travelDate, setTravelDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [purpose, setPurpose] = useState("");

  // Step 2: Bargaining & Pricing (Superadmin & Agent)
  const [basePackagePrice, setBasePackagePrice] = useState<number>(250);
  const [bargainingPrice, setBargainingPrice] = useState<string>("");
  const [bargainingNotes, setBargainingNotes] = useState<string>("");

  // Step 3: Applicant Identity & Passport
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+93");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [nationality, setNationality] = useState("Afghanistan");
  const [birthPlace, setBirthPlace] = useState("");
  const [religion, setReligion] = useState("Islam");
  const [profession, setProfession] = useState("");
  const [qualification, setQualification] = useState("Bachelor Degree");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportIssueDate, setPassportIssueDate] = useState("");
  const [passportExpiryDate, setPassportExpiryDate] = useState("");
  const [passportIssuePlace, setPassportIssuePlace] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");

  // Step 4: Family & Official Dossier
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [spouseName, setSpouseName] = useState("");
  const [childrenCount, setChildrenCount] = useState("0");
  const [childrenDetails, setChildrenDetails] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Step 5: Document Scans & Uploads
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string>("");
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string>("");
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string>("");
  const [nonCriminalFile, setNonCriminalFile] = useState<File | null>(null);
  const [nonCriminalPreview, setNonCriminalPreview] = useState<string>("");
  const [prevVisaFile, setPrevVisaFile] = useState<File | null>(null);
  const [prevVisaPreview, setPrevVisaPreview] = useState<string>("");
  const [bankStatementFile, setBankStatementFile] = useState<File | null>(null);
  const [bankStatementPreview, setBankStatementPreview] = useState<string>("");
  const [humanitarianDocFile, setHumanitarianDocFile] = useState<File | null>(null);
  const [humanitarianDocPreview, setHumanitarianDocPreview] = useState<string>("");

  // Custom Extra Documents
  const [extraFiles, setExtraFiles] = useState<{ id: number; label: string; file: File | null; preview?: string }[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");
    if (emailParam) setClientEmail(emailParam);
    if (nameParam) setClientName(nameParam);
    
    checkProfileStatus();
    fetchPackages();
  }, [searchParams]);

  const checkProfileStatus = async () => {
    try {
      const res = await fetch("/api/agent/profile");
      const data = await res.json();
      if (res.ok && data.success) {
        const p = data.profile;
        const isComplete = p.agencyName && p.licenseNumber && p.whatsappNumber && p.officeAddress && p.licenseCertificate && p.image;
        setProfileComplete(!!isComplete);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages?all=true");
      const data = await res.json();
      if (res.ok && Array.isArray(data.packages)) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Failed to load packages:", err);
    } finally {
      setPackagesLoading(false);
    }
  };

  // When a package is picked from the website catalog
  const handlePackageSelect = (pkgIdStr: string) => {
    setSelectedPackageId(pkgIdStr);
    if (pkgIdStr === "custom") {
      setBasePackagePrice(250);
      return;
    }

    const pkg = packages.find(p => String(p.id) === pkgIdStr);
    if (pkg) {
      if (pkg.country) setCountry(pkg.country);
      if (pkg.visaType) {
        const matchedCat = ALL_VISA_CATEGORIES.find(c => c.value.toLowerCase().includes(pkg.visaType.toLowerCase()) || pkg.visaType.toLowerCase().includes(c.value.toLowerCase()));
        if (matchedCat) {
          setVisaCategory(matchedCat.value);
        } else {
          setVisaCategory(pkg.visaType);
        }
      }
      if (pkg.duration) setDuration(pkg.duration);
      if (pkg.entryType) setEntryType(pkg.entryType);
      if (pkg.priceUSD) setBasePackagePrice(pkg.priceUSD);
      setPurpose(`Package: ${pkg.title}`);
    }
  };

  const handleAddExtraFile = () => {
    setExtraFiles(prev => [...prev, { id: Date.now(), label: "Supporting Document", file: null, preview: "" }]);
  };

  const handleRemoveExtraFile = (id: number) => {
    setExtraFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateExtraFileLabel = (id: number, label: string) => {
    setExtraFiles(prev => prev.map(f => f.id === id ? { ...f, label } : f));
  };

  const handleUpdateExtraFile = (id: number, file: File | null) => {
    setExtraFiles(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          file,
          preview: file ? URL.createObjectURL(file) : ""
        };
      }
      return f;
    }));
  };

  // Helper for file to base64 conversion
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const uploadDocumentResilient = async (applicationId: number, documentType: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("file", file);

      const res = await fetch(`/api/applications/${applicationId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) return;

      console.warn(`FormData upload failed for ${documentType}, retrying with JSON Base64...`);
      const base64 = await fileToBase64(file);
      const jsonRes = await fetch(`/api/applications/${applicationId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          fileBase64: base64,
        }),
      });

      if (!jsonRes.ok) {
        const errData = await jsonRes.json();
        console.warn(`Non-fatal notice during ${documentType} upload:`, errData.error);
      }
    } catch (e: any) {
      console.warn(`Upload non-fatal fallback notice for ${documentType}:`, e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setUploadStatus("Validating dossier fields...");

    // Validate required fields
    if (!clientName || !clientEmail || !phone || !passportNumber) {
      setError("Please complete all mandatory applicant fields (Name, Email, Phone, Passport Number).");
      setLoading(false);
      setActiveStep(3);
      return;
    }

    if (!passportFile || !idCardFile || !pictureFile || !nonCriminalFile) {
      setError("Please attach all 4 mandatory document scans (Passport, ID Card, Photo, Non-Criminal Certificate).");
      setLoading(false);
      setActiveStep(5);
      return;
    }

    try {
      // 1. Submit Application Record
      setUploadStatus("Registering client and lodging visa application...");
      const payload: any = {
        clientName,
        clientEmail,
        phone: `${countryCode} ${phone}`.trim(),
        dob,
        gender,
        nationality,
        birthPlace,
        religion,
        profession,
        qualification,
        currentAddress,
        permanentAddress,
        passportNumber,
        passportIssueDate,
        passportExpiryDate,
        passportIssuePlace,
        fatherName,
        motherName,
        maritalStatus,
        spouseName,
        childrenCount,
        childrenDetails,
        emergencyContact,
        country,
        visaCategory,
        duration,
        entryType,
        travelDate,
        returnDate,
        purpose,
        packageId: selectedPackageId !== "custom" ? parseInt(selectedPackageId, 10) : null,
        packagePrice: basePackagePrice,
        bargainingPrice: bargainingPrice ? parseFloat(bargainingPrice) : null,
        bargainingNotes: bargainingNotes || null,
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit visa file");
      }

      const appId = data.application.id;

      // 2. Upload Passport
      setUploadStatus("Uploading Passport scan...");
      await uploadDocumentResilient(appId, "passport", passportFile);

      // 3. Upload ID Card
      setUploadStatus("Uploading Tazkira / National ID Card...");
      await uploadDocumentResilient(appId, "cnic", idCardFile);

      // 4. Upload Photo
      setUploadStatus("Uploading Passport Photograph...");
      await uploadDocumentResilient(appId, "photo", pictureFile);

      // 5. Upload Non-Criminal
      setUploadStatus("Uploading Police Non-Criminal Clearance...");
      await uploadDocumentResilient(appId, "non_criminal_certificate", nonCriminalFile);

      // 6. Optional & Specialized Documents
      if (prevVisaFile) {
        setUploadStatus("Uploading Previous Visa Proof...");
        await uploadDocumentResilient(appId, "previous_visa", prevVisaFile);
      }

      if (bankStatementFile) {
        setUploadStatus("Uploading Bank Statement / Financial Proof...");
        await uploadDocumentResilient(appId, "bank_statement", bankStatementFile);
      }

      if (humanitarianDocFile) {
        setUploadStatus("Uploading Humanitarian Justification Proof...");
        await uploadDocumentResilient(appId, "humanitarian_exit_permit_proof", humanitarianDocFile);
      }

      // 7. Extra Custom Documents
      for (const extra of extraFiles) {
        if (extra.file) {
          setUploadStatus(`Uploading ${extra.label}...`);
          await uploadDocumentResilient(
            appId,
            `other_${extra.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
            extra.file
          );
        }
      }

      setSuccess(true);
      setUploadStatus("Visa file successfully lodged! Redirecting to agency dashboard...");
      setTimeout(() => {
        router.push("/portal/agent/applications");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <FiLoader className="animate-spin text-yellow-400" size={36} />
        <p className="text-xs text-slate-400 font-medium">Verifying agency partner credentials...</p>
      </div>
    );
  }

  if (!profileComplete) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20 shadow-xl">
          <FiAlertCircle size={38} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white uppercase tracking-wider">Agency Verification Required</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Please complete your Travel Agency details (Name, License Number, WhatsApp Number, Office Address, Profile Image, and License Certificate) before lodging client visa applications.
          </p>
        </div>
        <Link
          href="/portal/agent/profile"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-xs shadow-xl shadow-yellow-400/10 cursor-pointer"
        >
          Complete Agency Profile
        </Link>
      </div>
    );
  }

  // Calculate price summary
  const effectiveFinalPrice = bargainingPrice && !isNaN(parseFloat(bargainingPrice)) && parseFloat(bargainingPrice) > 0
    ? parseFloat(bargainingPrice)
    : basePackagePrice;
  const isBargained = bargainingPrice && parseFloat(bargainingPrice) > 0 && parseFloat(bargainingPrice) !== basePackagePrice;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <Link
            href="/portal/agent"
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all shadow-lg"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Executive Visa File Dossier</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 uppercase tracking-wider">
                Direct Submission
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Lodge client visa files, attach official packages, negotiate custom agency rates, and upload verified dossiers
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-3 bg-[#0f172a] border border-slate-800 px-4 py-2.5 rounded-2xl shadow-xl">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Effective Dossier Fee</p>
            <div className="flex items-center justify-end gap-1.5">
              {isBargained && (
                <span className="text-xs text-slate-500 line-through">${basePackagePrice}</span>
              )}
              <span className="text-lg font-black text-yellow-400">${effectiveFinalPrice} USD</span>
            </div>
          </div>
          <div className="w-9 h-9 bg-yellow-400/10 text-yellow-400 rounded-xl flex items-center justify-center font-bold">
            <FiDollarSign size={18} />
          </div>
        </div>
      </div>

      {/* Interactive Step Navigation Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 bg-[#0b1120] p-2 rounded-2xl border border-slate-800 shadow-xl">
        {[
          { step: 1, title: "1. Package & Visa", icon: <FiGlobe size={14} /> },
          { step: 2, title: "2. Bargaining Desk", icon: <FiTag size={14} /> },
          { step: 3, title: "3. Applicant Info", icon: <FiUser size={14} /> },
          { step: 4, title: "4. Family Dossier", icon: <FiUsers size={14} /> },
          { step: 5, title: "5. Document Proofs", icon: <FiUpload size={14} /> },
        ].map((item) => {
          const isActive = activeStep === item.step;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveStep(item.step)}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-3 shadow-lg"
        >
          <FiAlertCircle className="shrink-0 text-base" />
          <span className="flex-1 font-semibold">{error}</span>
          <button type="button" onClick={() => setError("")} className="hover:text-white">
            <FiX size={16} />
          </button>
        </motion.div>
      )}

      {uploadStatus && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-400 text-xs flex items-center gap-3 shadow-lg"
        >
          <FiLoader className="animate-spin shrink-0 text-base" />
          <span className="font-semibold">{uploadStatus}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] text-emerald-400 text-sm flex items-center gap-4 shadow-2xl text-center justify-center"
        >
          <FiCheckCircle size={24} />
          <span className="font-bold">Visa application created and registered successfully!</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ========================================================================= */}
        {/* STEP 1: PACKAGE & VISA SELECTION */}
        {/* ========================================================================= */}
        <div className={activeStep === 1 ? "block space-y-6" : "hidden"}>
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-7 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center font-bold">
                  <FiGlobe size={20} />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">1. Select Visa Package & Country</h4>
                  <p className="text-xs text-slate-400">Choose an active package from our website or construct a custom visa file</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Step 1 of 5</span>
            </div>

            {/* Live Website Packages Selector */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FiLayers className="text-yellow-400" />
                Select from Active Website Packages (Recommended)
              </label>
              
              {packagesLoading ? (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 text-slate-400 text-xs">
                  <FiLoader className="animate-spin text-yellow-400" /> Loading official website packages...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    onClick={() => handlePackageSelect("custom")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedPackageId === "custom"
                        ? "bg-yellow-400/10 border-yellow-400 text-white shadow-lg"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black">🛠️ Custom Direct Visa File</span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-bold">Manual</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Freely customize destination country, visa category, and pricing.</p>
                    </div>
                    {selectedPackageId === "custom" && <FiCheck className="text-yellow-400 text-lg" />}
                  </div>

                  {packages.map((pkg) => {
                    const isSelected = selectedPackageId === String(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handlePackageSelect(String(pkg.id))}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-yellow-400/10 border-yellow-400 text-white shadow-lg shadow-yellow-400/5"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black">{pkg.title}</span>
                            {pkg.featured && (
                              <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.5 rounded-full font-black uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {pkg.country} • {pkg.visaType} {pkg.duration ? `(${pkg.duration})` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-yellow-400">${pkg.priceUSD || 250} USD</span>
                          {isSelected && <FiCheck className="text-yellow-400 text-base mt-1 ml-auto" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Destination Country & Visa Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Destination Country */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Destination Country *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <optgroup label="Popular Destinations">
                    {PRIORITY_COUNTRIES.map((c) => (
                      <option key={`dest-prio-${c.name}`} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="All World Countries">
                    {ALL_WORLD_COUNTRIES.map((c) => (
                      <option key={`dest-all-${c.name}`} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Visa Category (with Exit Permit & Humanitarian Exit Permit) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Visa Category *</label>
                <select
                  value={visaCategory}
                  onChange={(e) => setVisaCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400 font-medium"
                >
                  {ALL_VISA_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entry Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Entry Type</label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Single">Single Entry</option>
                  <option value="Double">Double Entry</option>
                  <option value="Multiple">Multiple Entry</option>
                  <option value="Exit Only">Exit Only (Permit)</option>
                </select>
              </div>

              {/* Stay Duration */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stay Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days / 3 Months">90 Days / 3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="Exit Permit (15 Days)">Exit Permit (15 Days)</option>
                  <option value="Exit Permit (30 Days)">Exit Permit (30 Days)</option>
                </select>
              </div>

              {/* Estimated Travel Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Anticipated Travel Date</label>
                <CustomDatePicker
                  value={travelDate}
                  onChange={setTravelDate}
                  placeholder="Select travel date"
                />
              </div>

              {/* Return Date / Departure */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Return / Departure Date</label>
                <CustomDatePicker
                  value={returnDate}
                  onChange={setReturnDate}
                  placeholder="Select return date (optional)"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-6 py-3 bg-yellow-400 text-black font-black text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg cursor-pointer"
              >
                Proceed to Bargaining & Pricing →
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 2: BARGAINING & SPECIAL AGENT PRICING */}
        {/* ========================================================================= */}
        <div className={activeStep === 2 ? "block space-y-6" : "hidden"}>
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-7 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center font-bold">
                  <FiTag size={20} />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">2. Agency Pricing & Bargaining Desk</h4>
                  <p className="text-xs text-slate-400">Establish agreed agent clearance rates and submit bargaining requests to Superadmin</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Step 2 of 5</span>
            </div>

            {/* Bargaining Information Alert */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3 text-blue-300 text-xs">
              <FiInfo className="shrink-0 mt-0.5 text-base text-blue-400" />
              <div>
                <span className="font-bold">Superadmin & Agent Bargaining Mechanism:</span> If you have agreed on a special volume discount or negotiated rate with Superadmin (Syed Saif Ur Rehman), enter your agreed clearance price below. This rate will automatically dictate the invoice amount and be recorded in the official dossier ledger.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base Package Price */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Standard Website Package Price</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white">${basePackagePrice} USD</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-bold">Catalog Rate</span>
                </div>
                <p className="text-[11px] text-slate-500">Official retail customer tariff for {country} ({visaCategory})</p>
              </div>

              {/* Agreed Bargaining Price Input */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-yellow-400/40 space-y-2 shadow-lg shadow-yellow-400/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <FiTag /> Agreed Bargaining Price ($ USD)
                </span>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-yellow-400 font-black">$</span>
                  <input
                    type="number"
                    step="any"
                    value={bargainingPrice}
                    onChange={(e) => setBargainingPrice(e.target.value)}
                    placeholder={String(basePackagePrice)}
                    className="w-full pl-8 pr-16 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-black text-yellow-400 focus:outline-none focus:border-yellow-400"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[11px] text-slate-500 font-bold">USD</span>
                </div>
                {isBargained && (
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <FiCheck /> Special Negotiated Rate Applied: ${bargainingPrice} USD (Difference: ${Math.abs(basePackagePrice - parseFloat(bargainingPrice))} USD)
                  </p>
                )}
              </div>
            </div>

            {/* Bargaining Remarks / Deal Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FiFileText className="text-yellow-400" />
                Bargaining Reference & Remarks (Between Superadmin & Agent)
              </label>
              <textarea
                rows={3}
                value={bargainingNotes}
                onChange={(e) => setBargainingNotes(e.target.value)}
                placeholder="e.g. Special clearance rate approved by Syed Saif Ur Rehman via WhatsApp. Urgent humanitarian exit permit file for family client."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400 placeholder:text-slate-600"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-5 py-3 bg-slate-900 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-6 py-3 bg-yellow-400 text-black font-black text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg cursor-pointer"
              >
                Proceed to Applicant Profile →
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 3: APPLICANT IDENTITY & PASSPORT */}
        {/* ========================================================================= */}
        <div className={activeStep === 3 ? "block space-y-6" : "hidden"}>
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-7 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center font-bold">
                  <FiUser size={20} />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">3. Applicant Identity & Passport</h4>
                  <p className="text-xs text-slate-400">Primary traveler credentials and biometric passport information</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Step 3 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Applicant Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Ahmad Shah"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Client Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Client Email Address *</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Phone & Country Code */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone / WhatsApp Number *</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-32 px-3 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                  >
                    <optgroup label="Regional Codes">
                      {PRIORITY_COUNTRIES.map((c) => (
                        <option key={`phone-prio-${c.name}`} value={c.phoneCode}>{c.flag} {c.phoneCode} ({c.name})</option>
                      ))}
                    </optgroup>
                    <optgroup label="All World Codes">
                      {ALL_WORLD_COUNTRIES.map((c) => (
                        <option key={`phone-all-${c.name}`} value={c.phoneCode}>{c.flag} {c.phoneCode} ({c.name})</option>
                      ))}
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="700123456"
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Nationality - ALL COUNTRIES */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nationality (All Countries) *</label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <optgroup label="Popular Nationalities">
                    {PRIORITY_COUNTRIES.map((c) => (
                      <option key={`nat-prio-${c.name}`} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="All World Nationalities">
                    {ALL_WORLD_COUNTRIES.map((c) => (
                      <option key={`nat-all-${c.name}`} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Date of Birth *</label>
                <CustomDatePicker
                  value={dob}
                  onChange={setDob}
                  placeholder="Select Date of Birth"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Passport Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passport Number *</label>
                <input
                  type="text"
                  required
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. P12345678"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white uppercase focus:outline-none focus:border-yellow-400 font-bold"
                />
              </div>

              {/* Passport Issue Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passport Issue Date</label>
                <CustomDatePicker
                  value={passportIssueDate}
                  onChange={setPassportIssueDate}
                  placeholder="Select Issue Date"
                />
              </div>

              {/* Passport Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passport Expiry Date</label>
                <CustomDatePicker
                  value={passportExpiryDate}
                  onChange={setPassportExpiryDate}
                  placeholder="Select Expiry Date"
                />
              </div>

              {/* Passport Issue Place */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Place of Issue / Authority</label>
                <input
                  type="text"
                  value={passportIssuePlace}
                  onChange={(e) => setPassportIssuePlace(e.target.value)}
                  placeholder="e.g. Kabul / Islamabad"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Place of Birth */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">City & Place of Birth</label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="e.g. Herat, Afghanistan"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Qualification / Profession */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Highest Qualification</label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="High School">High School</option>
                  <option value="Diploma / Associate">Diploma / Associate</option>
                  <option value="Bachelor Degree">Bachelor Degree</option>
                  <option value="Master Degree">Master Degree</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                  <option value="Other">Other / Vocational</option>
                </select>
              </div>
            </div>

            {/* Address fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Residential Address</label>
                <input
                  type="text"
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  placeholder="House #, Street, District, City"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Permanent Address (Origin Country)</label>
                <input
                  type="text"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="Permanent village, district, province"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-5 py-3 bg-slate-900 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-6 py-3 bg-yellow-400 text-black font-black text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg cursor-pointer"
              >
                Proceed to Family Dossier →
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 4: FAMILY & OFFICIAL DOSSIER */}
        {/* ========================================================================= */}
        <div className={activeStep === 4 ? "block space-y-6" : "hidden"}>
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-7 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center font-bold">
                  <FiUsers size={20} />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">4. Family Details & Official Dossier</h4>
                  <p className="text-xs text-slate-400">Parentage, marital status, dependent children, and emergency contacts</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Step 4 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Father Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Father's Full Name *</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father's full name"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Mother Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mother's Full Name *</label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Mother's full name"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Marital Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Marital Status</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              {/* If Married: Spouse Name */}
              {maritalStatus === "Married" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Spouse Full Name</label>
                  <input
                    type="text"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                    placeholder="Wife / Husband Name"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              )}

              {/* Children Count */}
              {maritalStatus === "Married" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Number of Children</label>
                  <input
                    type="number"
                    min="0"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              )}

              {/* Emergency Contact */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Emergency Contact (Name & Phone)</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Brother: +92 300 1234567"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Children Details if any */}
            {maritalStatus === "Married" && parseInt(childrenCount || "0", 10) > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Children Names, Ages & Passport Details</label>
                <textarea
                  rows={2}
                  value={childrenDetails}
                  onChange={(e) => setChildrenDetails(e.target.value)}
                  placeholder="e.g. 1. Ali Khan (Age 7, Passport: P987654), 2. Fatima Khan (Age 4)"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-5 py-3 bg-slate-900 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="px-6 py-3 bg-yellow-400 text-black font-black text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg cursor-pointer"
              >
                Proceed to Document Uploads →
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 5: DOCUMENT SCANS & UPLOADS */}
        {/* ========================================================================= */}
        <div className={activeStep === 5 ? "block space-y-6" : "hidden"}>
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-7 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center font-bold">
                  <FiUpload size={20} />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">5. Document Scans & Verified Proofs</h4>
                  <p className="text-xs text-slate-400">Attach mandatory biometric scans, certifications, and extra proofs (Max 5MB each)</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Step 5 of 5</span>
            </div>

            {/* Upload Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Passport Scan (Mandatory) */}
              <div className={`p-4 bg-slate-900/80 border rounded-2xl flex flex-col justify-between space-y-3 relative group transition-all ${
                passportFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-800 hover:border-yellow-400/50"
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white flex items-center gap-1.5">
                      <FiBookOpen className="text-yellow-400" /> Passport Bio-Page
                    </span>
                    <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold uppercase">Required</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Clear scan of the main biometric identification page.</p>
                </div>

                {passportPreview ? (
                  <div className="relative h-28 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img src={passportPreview} alt="Passport Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPassportFile(null); setPassportPreview(""); }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="h-28 w-full border-2 border-dashed border-slate-800 group-hover:border-yellow-400/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-850/50 transition-all p-2 text-center">
                    <FiUpload className="text-slate-500 group-hover:text-yellow-400 transition-colors mb-1" size={20} />
                    <span className="text-[10px] font-bold text-slate-300">Choose File</span>
                    <span className="text-[9px] text-slate-500">PDF, JPG, PNG</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPassportFile(file);
                          setPassportPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* 2. National ID / Tazkira (Mandatory) */}
              <div className={`p-4 bg-slate-900/80 border rounded-2xl flex flex-col justify-between space-y-3 relative group transition-all ${
                idCardFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-800 hover:border-yellow-400/50"
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white flex items-center gap-1.5">
                      <FiCreditCard className="text-yellow-400" /> ID Card / Tazkira
                    </span>
                    <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold uppercase">Required</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Front & Back scan of national identity card or electronic Tazkira.</p>
                </div>

                {idCardPreview ? (
                  <div className="relative h-28 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img src={idCardPreview} alt="ID Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setIdCardFile(null); setIdCardPreview(""); }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="h-28 w-full border-2 border-dashed border-slate-800 group-hover:border-yellow-400/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-850/50 transition-all p-2 text-center">
                    <FiUpload className="text-slate-500 group-hover:text-yellow-400 transition-colors mb-1" size={20} />
                    <span className="text-[10px] font-bold text-slate-300">Choose File</span>
                    <span className="text-[9px] text-slate-500">PDF, JPG, PNG</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIdCardFile(file);
                          setIdCardPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* 3. Passport Photo (Mandatory) */}
              <div className={`p-4 bg-slate-900/80 border rounded-2xl flex flex-col justify-between space-y-3 relative group transition-all ${
                pictureFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-800 hover:border-yellow-400/50"
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white flex items-center gap-1.5">
                      <FiImage className="text-yellow-400" /> Photo (White BG)
                    </span>
                    <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold uppercase">Required</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Recent high-resolution photograph with white background.</p>
                </div>

                {picturePreview ? (
                  <div className="relative h-28 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img src={picturePreview} alt="Photo Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPictureFile(null); setPicturePreview(""); }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="h-28 w-full border-2 border-dashed border-slate-800 group-hover:border-yellow-400/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-850/50 transition-all p-2 text-center">
                    <FiUpload className="text-slate-500 group-hover:text-yellow-400 transition-colors mb-1" size={20} />
                    <span className="text-[10px] font-bold text-slate-300">Choose File</span>
                    <span className="text-[9px] text-slate-500">JPG, PNG</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPictureFile(file);
                          setPicturePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* 4. Non-Criminal Certificate (Mandatory) */}
              <div className={`p-4 bg-slate-900/80 border rounded-2xl flex flex-col justify-between space-y-3 relative group transition-all ${
                nonCriminalFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-800 hover:border-yellow-400/50"
              }`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white flex items-center gap-1.5">
                      <FiShield className="text-yellow-400" /> Non-Criminal Cert
                    </span>
                    <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold uppercase">Required</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Police clearance or certificate of good standing.</p>
                </div>

                {nonCriminalPreview ? (
                  <div className="relative h-28 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img src={nonCriminalPreview} alt="Certificate Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setNonCriminalFile(null); setNonCriminalPreview(""); }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="h-28 w-full border-2 border-dashed border-slate-800 group-hover:border-yellow-400/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-850/50 transition-all p-2 text-center">
                    <FiUpload className="text-slate-500 group-hover:text-yellow-400 transition-colors mb-1" size={20} />
                    <span className="text-[10px] font-bold text-slate-300">Choose File</span>
                    <span className="text-[9px] text-slate-500">PDF, JPG, PNG</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNonCriminalFile(file);
                          setNonCriminalPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Specialized / Optional Documents Row */}
            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FiPaperclip className="text-yellow-400" /> Additional / Category-Specific Proofs
                </span>
                <button
                  type="button"
                  onClick={handleAddExtraFile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-yellow-400/40 rounded-xl text-[11px] font-bold text-yellow-400 transition-all cursor-pointer"
                >
                  <FiPlusCircle /> Add Custom Proof
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Previous Visa Stamp */}
                <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300">Previous Visa / Entry Stamp</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">Optional</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPrevVisaFile(e.target.files?.[0] || null)}
                    className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-yellow-400 file:text-black cursor-pointer"
                  />
                </div>

                {/* Bank Statement */}
                <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300">Bank Statement / Funds</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">Optional</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setBankStatementFile(e.target.files?.[0] || null)}
                    className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-yellow-400 file:text-black cursor-pointer"
                  />
                </div>

                {/* Humanitarian / Special Exit Permit Proof */}
                <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300">Humanitarian / Exit Permit Proof</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">Special</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setHumanitarianDocFile(e.target.files?.[0] || null)}
                    className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-yellow-400 file:text-black cursor-pointer"
                  />
                </div>
              </div>

              {/* Dynamic Extra Files */}
              {extraFiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {extraFiles.map((extra) => (
                    <div key={extra.id} className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraFile(extra.id)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <FiX size={16} />
                      </button>
                      <input
                        type="text"
                        value={extra.label}
                        onChange={(e) => handleUpdateExtraFileLabel(extra.id, e.target.value)}
                        placeholder="Document Label (e.g. Flight Booking, Sponsor Letter)"
                        className="w-4/5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-400 font-bold"
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleUpdateExtraFile(extra.id, e.target.files?.[0] || null)}
                        className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-yellow-400 file:text-black cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="w-full md:w-auto px-5 py-3 bg-slate-900 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    <span>Submitting File & Uploading Dossier...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle size={18} />
                    <span>Submit & Lodge Visa File (${effectiveFinalPrice} USD)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

export default function AgentNewApplicationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    }>
      <AgentNewApplicationContent />
    </Suspense>
  );
}
