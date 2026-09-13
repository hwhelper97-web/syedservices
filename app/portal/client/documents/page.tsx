"use client";

import { useState, useEffect } from "react";
import { 
  FiFileText, FiUploadCloud, FiCheckCircle, FiClock, 
  FiAlertCircle, FiDownload, FiLoader, FiSend, FiShield,
  FiCheck, FiInfo
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PortalToast, { ToastMessage } from "@/components/PortalToast";

const DOC_TYPES = [
  { key: "passport", name: "Passport Scan (Bio Page)", required: true },
  { key: "cnic", name: "CNIC / National ID Card", required: true },
  { key: "photo", name: "Passport Size Photograph", required: true },
  { key: "bank_statement", name: "Bank Statement (Last 3 Months)", required: true },
  { key: "invitation_letter", name: "Invitation Letter from Pakistan", required: false },
];

export default function ClientDocumentsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (res.ok && data.applications && data.applications.length > 0) {
        setApplications(data.applications);
        setSelectedAppId(data.applications[0].id);
        fetchUploadedDocs(data.applications[0].id);
      }
    } catch (e) {
      console.error("Failed to load applications", e);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedDocs = async (appId: number) => {
    try {
      const res = await fetch(`/api/applications/${appId}`);
      const data = await res.json();
      if (res.ok && data.application) {
        const docsMap: Record<string, any> = {};
        (data.application.documents || []).forEach((doc: any) => {
          docsMap[doc.documentType] = doc;
        });
        setUploadedDocs(docsMap);
        
        // Check if previously submitted via status or audit history
        const isPastSubmitted = ["WAITING_CONFIRMATION", "DEAL_CONFIRMED", "SENT_FOR_INVITATION", "INVITATION_ARRIVED", "FILE_READY_EMBASSY", "APPLICATION_SUBMITTED"].includes(data.application.status);
        const hasSubmitHistory = (data.application.statusHistory || []).some((h: any) => 
          (h.notes || "").toLowerCase().includes("submitted") || (h.notes || "").toLowerCase().includes("documents")
        );
        if (isPastSubmitted || hasSubmitHistory) {
          setSubmittedSuccess(true);
        } else {
          setSubmittedSuccess(false);
        }
      }
    } catch (e) {
      console.error("Failed to load documents", e);
    }
  };

  const handleAppChange = (appId: number) => {
    setSelectedAppId(appId);
    setUploadedDocs({});
    setSubmittedSuccess(false);
    fetchUploadedDocs(appId);
  };

  const handleFileUpload = async (key: string, file: File) => {
    if (!selectedAppId) return;
    setUploadingKey(key);

    try {
      const formData = new FormData();
      formData.append("documentType", key);
      formData.append("file", file);

      const res = await fetch(`/api/applications/${selectedAppId}/documents`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      // Success
      setUploadedDocs((prev) => ({ ...prev, [key]: data.document }));
      const docLabel = DOC_TYPES.find((d) => d.key === key)?.name || "Document";
      showToast(`${docLabel} uploaded successfully!`);
    } catch (err: any) {
      showToast(err.message || "Failed to upload file", "error");
    } finally {
      setUploadingKey(null);
    }
  };

  // Submit all documents to admin in 1 consolidated email
  const handleSubmitDocuments = async () => {
    if (!selectedAppId) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/applications/${selectedAppId}/documents/submit`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setSubmittedSuccess(true);
        showToast("All documents sent to admin successfully! Review email dispatched.", "success");
        fetchUploadedDocs(selectedAppId);
      } else {
        showToast(data.error || "Failed to submit documents", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error while submitting documents", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-[#0f172a] border border-slate-800 p-12 rounded-[2.5rem] text-center max-w-xl mx-auto space-y-4">
        <FiAlertCircle className="text-yellow-400 text-4xl mx-auto" />
        <h3 className="text-white font-bold text-lg">No Applications Found</h3>
        <p className="text-xs text-slate-400">
          You must create a visa application first before you can upload support files to the portal.
        </p>
      </div>
    );
  }

  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];
  const requiredDocs = DOC_TYPES.filter((d) => d.required);
  const uploadedRequiredCount = requiredDocs.filter((d) => uploadedDocs[d.key]).length;
  const totalRequiredCount = requiredDocs.length;
  const allRequiredUploaded = uploadedRequiredCount === totalRequiredCount;
  const progressPercent = Math.round((uploadedRequiredCount / totalRequiredCount) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Reusable Toast Notification */}
      <PortalToast toast={toast} onClose={() => setToast(null)} />

      {/* Selection Header */}
      <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 blur-[100px] pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
            <FiShield size={12} /> Verification Vault
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Support Documents Hub</h3>
          <p className="text-xs text-slate-400">
            Upload verified scans for case officer review. Files remain pending until you submit them as a complete dossier.
          </p>
        </div>
        <div className="relative z-10">
          <label className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Selected Dossier ID</label>
          <select
            value={selectedAppId || ""}
            onChange={(e) => handleAppChange(Number(e.target.value))}
            className="px-4 py-3 bg-slate-950 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-xs text-white focus:outline-none cursor-pointer"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.country} — {app.trackingId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-[#0f172a] border border-slate-800 p-6 md:p-7 rounded-[2rem] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Document Completion Status
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              {allRequiredUploaded 
                ? "All mandatory requirements satisfied. Ready to send to case officer."
                : `${totalRequiredCount - uploadedRequiredCount} more required file(s) needed before submission.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-black font-mono text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-xl border border-yellow-400/20">
              {uploadedRequiredCount} / {totalRequiredCount} Mandatory
            </span>
            <span className="text-xs font-bold text-slate-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress bar track */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              allRequiredUploaded 
                ? "bg-gradient-to-r from-emerald-500 to-green-400" 
                : "bg-gradient-to-r from-yellow-500 to-yellow-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist grid */}
      <div className="space-y-4">
        {DOC_TYPES.map((doc) => {
          const fileRecord = uploadedDocs[doc.key];
          const isUploading = uploadingKey === doc.key;

          return (
            <div 
              key={doc.key}
              className={`bg-[#0f172a] border p-6 rounded-[2.5rem] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                fileRecord 
                  ? "border-emerald-500/20 bg-[#0f172a]/90" 
                  : doc.required 
                  ? "border-slate-800 hover:border-yellow-400/30" 
                  : "border-slate-800/60 opacity-90"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                  fileRecord ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10" : "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                }`}>
                  {fileRecord ? <FiCheckCircle size={22} /> : <FiFileText size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base">
                      {doc.name}
                    </h4>
                    {doc.required ? (
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20 uppercase">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/60 uppercase">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {fileRecord 
                      ? `Uploaded: ${fileRecord.fileName}` 
                      : doc.required 
                      ? "Mandatory file upload for visa processing" 
                      : "Optional supporting document"}
                  </p>
                </div>
              </div>

              <div>
                {fileRecord ? (
                  <div className="flex items-center gap-3">
                    <a 
                      href={fileRecord.fileUrl} 
                      download 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <FiDownload size={18} />
                    </a>
                    <label className="px-5 py-3 border border-slate-800 text-xs font-semibold rounded-xl text-slate-400 hover:text-white cursor-pointer hover:bg-slate-900 transition-all">
                      {isUploading ? "Uploading..." : "Replace File"}
                      <input 
                        type="file" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] transition-all text-black font-black rounded-2xl cursor-pointer shadow-lg shadow-yellow-400/10 text-xs">
                    {isUploading ? (
                      <FiLoader className="animate-spin" size={18} />
                    ) : (
                      <>
                        <FiUploadCloud size={18} /> Upload Document
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      disabled={isUploading}
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBMISSION ACTION SECTION (Appears when all mandatory documents are uploaded) */}
      <AnimatePresence>
        {allRequiredUploaded ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="bg-gradient-to-r from-[#0f172a] via-[#13203f] to-[#0f172a] border-2 border-yellow-400/40 rounded-[2.5rem] p-8 shadow-2xl space-y-5 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <FiCheckCircle size={14} /> All Mandatory Documents Uploaded
                </div>
                <h4 className="text-xl font-black text-white">
                  {submittedSuccess ? "Documents Submitted & Sent to Case Officers" : "Ready to Send Dossier to Administration"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {submittedSuccess 
                    ? "Your verification files have been transmitted to the Syed Services case management team. If you replaced any document, you can re-submit at any time."
                    : "Click below to submit all your verification files in 1 click. A single consolidated notification with all documents will be dispatched directly to the visa admin desk."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmitDocuments}
                disabled={submitting}
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] transition-all text-black font-black rounded-2xl cursor-pointer shadow-xl shadow-yellow-400/20 text-sm flex items-center justify-center gap-3 shrink-0 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <FiLoader className="animate-spin" size={20} />
                    <span>Transmitting to Admin...</span>
                  </>
                ) : submittedSuccess ? (
                  <>
                    <FiCheck size={20} />
                    <span>Re-Submit Updated Files</span>
                  </>
                ) : (
                  <>
                    <FiSend size={20} />
                    <span>Submit Documents to Admin</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="bg-[#0f172a]/60 border border-slate-800 border-dashed rounded-[2.5rem] p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <FiClock size={22} />
            </div>
            <h4 className="text-sm font-bold text-slate-300">Submit Button Locked</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please upload all {totalRequiredCount} mandatory documents above. Once uploaded, the one-click submission button will appear here to send your entire dossier to Admin.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
