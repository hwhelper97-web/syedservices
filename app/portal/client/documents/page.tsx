"use client";

import { useState, useEffect } from "react";
import { 
  FiFileText, FiUploadCloud, FiCheckCircle, FiClock, 
  FiAlertCircle, FiDownload, FiTrash2, FiLoader 
} from "react-icons/fi";

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
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (res.ok && data.applications.length > 0) {
        setApplications(data.applications);
        setSelectedAppId(data.applications[0].id);
        fetchUploadedDocs(data.applications[0].id);
      }
    } catch (e) {
      console.error("Failed to load applications", e);
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
        data.application.documents.forEach((doc: any) => {
          docsMap[doc.documentType] = doc;
        });
        setUploadedDocs(docsMap);
      }
    } catch (e) {
      console.error("Failed to load documents", e);
    }
  };

  const handleAppChange = (appId: number) => {
    setSelectedAppId(appId);
    setUploadedDocs({});
    fetchUploadedDocs(appId);
  };

  const handleFileUpload = async (key: string, file: File) => {
    if (!selectedAppId) return;
    setUploadingKey(key);
    setError("");

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingKey(null);
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

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Selection Header */}
      <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Support Documents Hub</h3>
          <p className="text-xs text-slate-400 mt-1">Upload verified scans of your visa application documents</p>
        </div>
        <div>
          <label className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Selected File ID</label>
          <select
            value={selectedAppId || ""}
            onChange={(e) => handleAppChange(Number(e.target.value))}
            className="px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-yellow-400/50 rounded-xl text-xs focus:outline-none"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.country} — {app.trackingId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Checklist grid */}
      <div className="space-y-4">
        {DOC_TYPES.map((doc) => {
          const fileRecord = uploadedDocs[doc.key];
          const isUploading = uploadingKey === doc.key;

          return (
            <div 
              key={doc.key}
              className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2.5rem] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-705 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                  fileRecord ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-slate-900 border-slate-850 text-slate-500"
                }`}>
                  {fileRecord ? <FiCheckCircle size={22} /> : <FiFileText size={22} />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    {doc.name} {doc.required && <span className="text-red-500">*</span>}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {fileRecord ? `Uploaded: ${fileRecord.fileName}` : `${doc.required ? "Mandatory file upload" : "Optional document"}`}
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
                      className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                      title="Download file"
                    >
                      <FiDownload size={18} />
                    </a>
                    <label className="px-5 py-3 border border-slate-800 text-xs font-semibold rounded-xl text-slate-400 hover:text-white cursor-pointer hover:bg-slate-900 transition-all">
                      Replace File
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] transition-transform text-black font-black rounded-2xl cursor-pointer shadow-lg shadow-yellow-400/5">
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
    </div>
  );
}
