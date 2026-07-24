"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FiArrowLeft, FiUser, FiFileText, FiGlobe, 
  FiBriefcase, FiLoader, FiCheckCircle, FiUpload, FiPlusCircle, FiX,
  FiBookOpen, FiCreditCard, FiImage, FiShield, FiCompass, FiPaperclip,
  FiAlertCircle
} from "react-icons/fi";
import Link from "next/link";

function AgentNewApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");
    if (emailParam) setClientEmail(emailParam);
    if (nameParam) setClientName(nameParam);
    
    checkProfileStatus();
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

  const [passportNumber, setPassportNumber] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("Afghan");
  const [visaCategory, setVisaCategory] = useState("L Tourism");
  const [duration, setDuration] = useState("6 Months");
  const [entryType, setEntryType] = useState("Multiple");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [qualification, setQualification] = useState("");
  const [countryCode, setCountryCode] = useState("+93");
  const [phone, setPhone] = useState("");

  // Family details
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [spouseName, setSpouseName] = useState("");

  // File Upload states
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

  // Extra files
  const [extraFiles, setExtraFiles] = useState<{ id: number; label: string; file: File | null; preview?: string }[]>([]);

  const handleAddExtraFile = () => {
    setExtraFiles(prev => [...prev, { id: Date.now(), label: "Bank Statement", file: null, preview: "" }]);
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

  const uploadFile = async (applicationId: number, documentType: string, file: File) => {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);

    const res = await fetch(`/api/applications/${applicationId}/documents`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Failed to upload ${documentType}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setUploadStatus("");

    // Validation
    if (!passportFile || !idCardFile || !pictureFile || !nonCriminalFile) {
      setError("Please select all required documents (Passport, ID Card, Picture, Non-Criminal Certificate).");
      setLoading(false);
      return;
    }

    try {
      // 1. Create client & application records
      setUploadStatus("Saving application record...");
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          phone: `${countryCode}${phone}`,
          dob,
          nationality,
          visaCategory,
          duration,
          entryType,
          maritalStatus,
          qualification,
          fatherName,
          motherName,
          spouseName,
          passportNumber,
          country: "Pakistan", // Destination country defaults to Pakistan
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      const appId = data.application.id;

      // 2. Upload Passport
      setUploadStatus("Uploading Passport scan...");
      await uploadFile(appId, "passport", passportFile);

      // 3. Upload ID Card / Tazkira
      setUploadStatus("Uploading ID Card (Tazkira)...");
      await uploadFile(appId, "cnic", idCardFile);

      // 4. Upload Picture
      setUploadStatus("Uploading Passport Picture...");
      await uploadFile(appId, "photo", pictureFile);

      // 5. Upload Non-Criminal Certificate
      setUploadStatus("Uploading Non-Criminal Certificate...");
      await uploadFile(appId, "non_criminal_certificate", nonCriminalFile);

      // 6. Upload Previous Visa (Optional)
      if (prevVisaFile) {
        setUploadStatus("Uploading Previous Visa...");
        await uploadFile(appId, "previous_visa", prevVisaFile);
      }

      // 7. Upload any extra files
      for (const extra of extraFiles) {
        if (extra.file) {
          setUploadStatus(`Uploading ${extra.label}...`);
          await uploadFile(appId, `other_${extra.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}`, extra.file);
        }
      }

      setSuccess(true);
      setUploadStatus("All documents uploaded successfully!");
      setTimeout(() => {
        router.push("/portal/agent");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (profileLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <FiLoader className="animate-spin text-yellow-400" size={32} />
      </div>
    );
  }

  if (!profileComplete) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto">
          <FiAlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white uppercase tracking-wider">Profile Verification Required</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            You must complete your Travel Agency details (Name, License Number, WhatsApp, Office Address, Profile Image, and License Certificate) before starting a client visa application.
          </p>
        </div>
        <Link
          href="/portal/agent/profile"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-xs shadow-xl shadow-yellow-400/10 cursor-pointer"
        >
          Complete Profile Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/portal/agent"
          className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-850 text-slate-400 transition-colors"
        >
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Create Visa File</h3>
          <p className="text-xs text-slate-400 mt-1">Submit personal details and passport credentials for client files</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-2">
          <FiCheckCircle /> Application created and all documents uploaded! Redirecting...
        </div>
      )}

      {uploadStatus && (
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold flex items-center gap-2">
          <FiLoader className="animate-spin" /> {uploadStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Personal Information */}
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
            <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-xl">
              <FiUser size={18} />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Personal Information</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Client Email Address</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
                placeholder="client@gmail.com"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Passport Number</label>
              <input
                type="text"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                required
                placeholder="EG1234567"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Nationality</label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              >
                <option value="Afghan">Afghan</option>
                <option value="Pakistani">Pakistani</option>
                <option value="Iranian">Iranian</option>
                <option value="Turkish">Turkish</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Visa Category</label>
              <select
                value={visaCategory}
                onChange={(e) => setVisaCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              >
                <option value="L Tourism">L Tourism</option>
                <option value="M Commercial and trade activities">M Commercial and trade activities</option>
                <option value="F Exchanges, visits, study tours, or other relevant activities">F Exchanges, visits, study tours, or other relevant activities</option>
                <option value="Q1 Family member/relative of Chinese citizen or PR holder (more than 180 days)">Q1 Family member/relative of Chinese citizen or PR holder (more than 180 days)</option>
                <option value="Q2 Family member/relative of Chinese citizen or PR holder (no more than 180 days)">Q2 Family member/relative of Chinese citizen or PR holder (no more than 180 days)</option>
                <option value="S1 Family member of foreigner in China / personal matters (more than 180 days)">S1 Family member of foreigner in China / personal matters (more than 180 days)</option>
                <option value="S2 Family member of foreigner in China / personal matters (no more than 180 days)">S2 Family member of foreigner in China / personal matters (no more than 180 days)</option>
                <option value="Z Work">Z Work</option>
                <option value="X1 Long-term study (more than 180 days)">X1 Long-term study (more than 180 days)</option>
                <option value="X2 Short-term study (no more than 180 days)">X2 Short-term study (no more than 180 days)</option>
                <option value="J1 Resident foreign journalist">J1 Resident foreign journalist</option>
                <option value="J2 Short-term news coverage">J2 Short-term news coverage</option>
                <option value="C Crew member">C Crew member</option>
                <option value="G Transit">G Transit</option>
                <option value="D Permanent residence">D Permanent residence</option>
                <option value="R High talent or specialist">R High talent or specialist</option>
                <option value="K Young STEM talent or specialist">K Young STEM talent or specialist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Stay Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              >
                <option value="30 Days">30 Days</option>
                <option value="60 Days">60 Days</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="1 Year">1 Year</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Entry Type</label>
              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              >
                <option value="Single">Single</option>
                <option value="Multiple">Multiple</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Marital Status</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Qualifications</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="Bachelor, Diploma, High school"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Country Code</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              >
                <option value="+93">🇦🇫 Afghanistan (+93)</option>
                <option value="+92">🇵🇰 Pakistan (+92)</option>
                <option value="+98">🇮🇷 Iran (+98)</option>
                <option value="+90">🇹🇷 Turkey (+90)</option>
                <option value="+1">🇺🇸 USA (+1)</option>
                <option value="+44">🇬🇧 UK (+44)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Phone Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400">
                  {countryCode}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="3001234567"
                  className="flex-1 px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Family Details */}
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
            <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-xl">
              <FiFileText size={18} />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Family Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Father's Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                required
                placeholder="Father's Name"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Mother's Name</label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                required
                placeholder="Mother's Name"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Wife's Name (if married)</label>
              <input
                type="text"
                value={spouseName}
                onChange={(e) => setSpouseName(e.target.value)}
                placeholder="Wife's Name"
                disabled={maritalStatus === "Single"}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm focus:border-yellow-400/50 focus:outline-none text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Upload Documents */}
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
            <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-xl">
              <FiUpload size={18} />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Upload Documents (JPG / PNG, max 5 MB each)</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Passport */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center gap-4 hover:border-yellow-400/25 transition-all">
              <div className="flex flex-col items-center gap-2 w-full">
                {passportPreview ? (
                  <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-slate-850 bg-slate-950">
                    <img
                      src={passportPreview}
                      alt="Passport Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPassportFile(null);
                        setPassportPreview("");
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-950 text-slate-400 rounded-2xl">
                    <FiBookOpen size={28} />
                  </div>
                )}
                <span className="block text-xs font-bold text-white mt-1">Passport</span>
                <span className="block text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Required</span>
              </div>
              <input
                type="file"
                required={!passportFile}
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPassportFile(file);
                  setPassportPreview(file ? URL.createObjectURL(file) : "");
                }}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-slate-850 file:text-[10px] file:font-bold file:bg-slate-950 file:text-slate-300 hover:file:bg-slate-900 hover:file:text-white transition-colors cursor-pointer text-left"
              />
            </div>

            {/* ID Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center gap-4 hover:border-yellow-400/25 transition-all">
              <div className="flex flex-col items-center gap-2 w-full">
                {idCardPreview ? (
                  <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-slate-850 bg-slate-950">
                    <img
                      src={idCardPreview}
                      alt="ID Card Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIdCardFile(null);
                        setIdCardPreview("");
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-950 text-slate-400 rounded-2xl">
                    <FiCreditCard size={28} />
                  </div>
                )}
                <span className="block text-xs font-bold text-white mt-1">ID card</span>
                <span className="block text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Required</span>
              </div>
              <input
                type="file"
                required={!idCardFile}
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setIdCardFile(file);
                  setIdCardPreview(file ? URL.createObjectURL(file) : "");
                }}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-slate-850 file:text-[10px] file:font-bold file:bg-slate-950 file:text-slate-300 hover:file:bg-slate-900 hover:file:text-white transition-colors cursor-pointer text-left"
              />
            </div>

            {/* Picture */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center gap-4 hover:border-yellow-400/25 transition-all">
              <div className="flex flex-col items-center gap-2 w-full">
                {picturePreview ? (
                  <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-slate-850 bg-slate-950">
                    <img
                      src={picturePreview}
                      alt="Picture Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPictureFile(null);
                        setPicturePreview("");
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-950 text-slate-400 rounded-2xl">
                    <FiUser size={28} />
                  </div>
                )}
                <span className="block text-xs font-bold text-white mt-1">Picture</span>
                <span className="block text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Required</span>
              </div>
              <input
                type="file"
                required={!pictureFile}
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPictureFile(file);
                  setPicturePreview(file ? URL.createObjectURL(file) : "");
                }}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-slate-850 file:text-[10px] file:font-bold file:bg-slate-950 file:text-slate-300 hover:file:bg-slate-900 hover:file:text-white transition-colors cursor-pointer text-left"
              />
            </div>

            {/* Non-criminal certificate */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center gap-4 hover:border-yellow-400/25 transition-all">
              <div className="flex flex-col items-center gap-2 w-full">
                {nonCriminalPreview ? (
                  <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-slate-850 bg-slate-950">
                    <img
                      src={nonCriminalPreview}
                      alt="Non-criminal Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNonCriminalFile(null);
                        setNonCriminalPreview("");
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-950 text-slate-400 rounded-2xl">
                    <FiShield size={28} />
                  </div>
                )}
                <span className="block text-xs font-bold text-white mt-1">Non-criminal certificate</span>
                <span className="block text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Required</span>
              </div>
              <input
                type="file"
                required={!nonCriminalFile}
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setNonCriminalFile(file);
                  setNonCriminalPreview(file ? URL.createObjectURL(file) : "");
                }}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-slate-850 file:text-[10px] file:font-bold file:bg-slate-950 file:text-slate-300 hover:file:bg-slate-900 hover:file:text-white transition-colors cursor-pointer text-left"
              />
            </div>

            {/* Previous Visa */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center gap-4 hover:border-yellow-400/25 transition-all">
              <div className="flex flex-col items-center gap-2 w-full">
                {prevVisaPreview ? (
                  <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-slate-850 bg-slate-950">
                    <img
                      src={prevVisaPreview}
                      alt="Previous Visa Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPrevVisaFile(null);
                        setPrevVisaPreview("");
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-950 text-slate-400 rounded-2xl">
                    <FiCompass size={28} />
                  </div>
                )}
                <span className="block text-xs font-bold text-white mt-1">Previous visa</span>
                <span className="block text-[10px] text-blue-400 font-bold uppercase tracking-wider">Optional</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPrevVisaFile(file);
                  setPrevVisaPreview(file ? URL.createObjectURL(file) : "");
                }}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-slate-850 file:text-[10px] file:font-bold file:bg-slate-950 file:text-slate-300 hover:file:bg-slate-900 hover:file:text-white transition-colors cursor-pointer text-left"
              />
            </div>

            {/* Add more document card */}
            <div
              onClick={handleAddExtraFile}
              className="border border-dashed border-slate-800 bg-slate-950/20 hover:bg-slate-950/40 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:border-yellow-400/25 transition-all cursor-pointer h-full min-h-[170px]"
            >
              <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-lg font-bold">
                +
              </div>
              <div>
                <span className="block text-xs font-bold text-white">Add more document</span>
                <span className="block text-[10px] text-slate-500 mt-1">e.g. Bank statement, ticket</span>
              </div>
            </div>
          </div>

          {/* Extra Documents / Add More Section */}
          <div className="space-y-4 pt-4 border-t border-slate-850">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Other Documents (Bank statements, tickets, etc.)</h5>
              <button
                type="button"
                onClick={handleAddExtraFile}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-yellow-400 text-[10px] font-bold rounded-xl cursor-pointer"
              >
                <FiPlusCircle /> Add Document
              </button>
            </div>

            {extraFiles.map((extra) => (
              <div key={extra.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
                <div className="md:col-span-4">
                  <input
                    type="text"
                    value={extra.label}
                    onChange={(e) => handleUpdateExtraFileLabel(extra.id, e.target.value)}
                    required
                    placeholder="Document Label (e.g. Bank Statement)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none text-white font-bold"
                  />
                </div>
                <div className="md:col-span-5">
                  <input
                    type="file"
                    required={!extra.file}
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleUpdateExtraFile(extra.id, e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                  />
                </div>
                <div className="md:col-span-2 flex justify-center">
                  {extra.preview ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-850 bg-slate-950">
                      <img
                        src={extra.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600">
                      <FiPaperclip size={14} />
                    </div>
                  )}
                </div>
                <div className="md:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveExtraFile(extra.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-10 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-yellow-400/10 disabled:opacity-50"
          >
            {loading ? (
              <FiLoader className="animate-spin" size={20} />
            ) : (
              "Submit Application"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

export default function AgentNewApplicationPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    }>
      <AgentNewApplicationForm />
    </Suspense>
  );
}
