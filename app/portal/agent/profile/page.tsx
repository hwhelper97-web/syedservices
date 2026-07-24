"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FiUser, FiLock, FiFileText, FiPhone, FiMapPin, 
  FiLoader, FiCheckCircle, FiUpload, FiBriefcase, FiAlertCircle 
} from "react-icons/fi";

export default function AgentProfilePage() {
  const router = useRouter();
  
  // Loading & state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agentCode, setAgentCode] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [licenseCertificate, setLicenseCertificate] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Upload previews and files
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/agent/profile");
      const data = await res.json();
      if (res.ok && data.success) {
        const { profile } = data;
        setName(profile.name || "");
        setEmail(profile.email || "");
        setAgentCode(profile.agentCode || "");
        setAgencyName(profile.agencyName || "");
        setLicenseNumber(profile.licenseNumber || "");
        setWhatsappNumber(profile.whatsappNumber || "");
        setOfficeAddress(profile.officeAddress || "");
        setLicenseCertificate(profile.licenseCertificate || "");
        setImageUrl(profile.image || "");
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (e) {
      setError("Failed to fetch profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: "profile" | "certificate"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "File upload failed");
    }

    const data = await res.json();
    return data.fileUrl;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let uploadedImageUrl = imageUrl;
      let uploadedCertificateUrl = licenseCertificate;

      if (imageFile) {
        uploadedImageUrl = await handleFileUpload(imageFile, "profile");
      }
      if (certificateFile) {
        uploadedCertificateUrl = await handleFileUpload(certificateFile, "certificate");
      }

      const res = await fetch("/api/agent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image: uploadedImageUrl,
          agencyName,
          licenseNumber,
          whatsappNumber,
          officeAddress,
          licenseCertificate: uploadedCertificateUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Profile details saved successfully!");
        setImageUrl(uploadedImageUrl);
        setLicenseCertificate(uploadedCertificateUrl);
        setImageFile(null);
        setCertificateFile(null);
        router.refresh();
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save profile changes");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordSubmitting(true);

    try {
      const res = await fetch("/api/agent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.error || "Failed to update password");
      }
    } catch {
      setPasswordError("Failed to update password");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <FiLoader className="animate-spin text-yellow-400" size={32} />
      </div>
    );
  }

  const isProfileComplete = agencyName && licenseNumber && whatsappNumber && officeAddress && licenseCertificate && imageUrl;

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#0f172a] border border-slate-800 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl font-black text-white tracking-tight">
            My Profile Settings
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Update your Travel Agency details, license files, and manage login credentials.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Agent Code: {agentCode}
            </span>
            <span className="text-slate-700">•</span>
            {isProfileComplete ? (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Profile Complete
              </span>
            ) : (
              <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <FiAlertCircle size={10} /> Profile Incomplete
              </span>
            )}
          </div>
        </div>
      </div>

      {!isProfileComplete && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-6 flex items-start gap-4">
          <span className="text-rose-400 mt-1"><FiAlertCircle size={20} /></span>
          <div>
            <h4 className="text-rose-400 font-black text-sm uppercase tracking-wider">Verification Action Required</h4>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Your profile is currently incomplete. Syed Services requires all partner agencies to declare their **Travel Agency Name, License Number, Office Address, WhatsApp Number**, and upload their **Agency Profile Image** and **License Certificate** to initiate visa files. You cannot start a new application until these are uploaded and completed.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile details form */}
        <div className="lg:col-span-8 bg-[#0f172a] border border-slate-800 rounded-[2rem] p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiBriefcase className="text-yellow-400" /> Agency & Contact Details
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            {/* Profile Image upload section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
              <div className="relative w-20 h-20 rounded-full border-2 border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                {imageFile ? (
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : imageUrl ? (
                  <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="text-slate-650" size={32} />
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <label className="block text-xs font-bold text-white">Agency Profile Image</label>
                <p className="text-[10px] text-slate-500">Square layout PNG/JPG. Recommended dimensions 400x400.</p>
                <div className="relative inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-xs font-semibold text-slate-400 rounded-xl cursor-pointer transition-all">
                    <FiUpload size={12} /> Upload Image
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Agent Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs text-slate-500 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Travel Agency Detail Name</label>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                  placeholder="e.g. Silk Road Travel"
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">License Number</label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  placeholder="e.g. TA-897362"
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Whatsapp Number</label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. +93 79 123 4567"
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Address of Office</label>
                <input
                  type="text"
                  required
                  value={officeAddress}
                  onChange={e => setOfficeAddress(e.target.value)}
                  placeholder="e.g. Office 12, Floor 2, Kabul Business Center"
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* License certificate file upload field */}
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-white">License Certificate Document</label>
              <p className="text-[10px] text-slate-500">Upload PDF scan or high-resolution photo of your travel agency license.</p>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setCertificateFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-xs font-semibold text-slate-400 rounded-xl cursor-pointer transition-all">
                    <FiUpload size={12} /> Choose File
                  </span>
                </div>
                
                <span className="text-xs text-slate-500">
                  {certificateFile ? certificateFile.name : licenseCertificate ? "✓ License certificate uploaded" : "No file chosen"}
                </span>
              </div>
              {licenseCertificate && (
                <div className="pt-2">
                  <a 
                    href={licenseCertificate} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-yellow-400 hover:underline font-bold"
                  >
                    View Current Uploaded Certificate
                  </a>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin" size={16} /> Saving Changes...
                </>
              ) : (
                <>
                  <FiCheckCircle size={16} /> Save Profile Settings
                </>
              )}
            </button>
          </form>
        </div>

        {/* Update password form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiLock className="text-yellow-400" /> Update Password
              </h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] px-3 py-2 rounded-xl">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-3 py-2 rounded-xl">
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="w-full py-3 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-xs font-bold text-white rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {passwordSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" size={12} /> Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
