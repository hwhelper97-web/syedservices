"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  FiArrowLeft, FiLoader, FiFileText, FiClock, 
  FiCheckCircle, FiAlertCircle, FiMapPin, FiCalendar, 
  FiPaperclip, FiDownload, FiMessageSquare, FiShield 
} from "react-icons/fi";
import { VISA_PIPELINE, VISA_STATUS_COLORS } from "@/lib/visaPipeline";

export default function ClientApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [app, setApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signSuccess, setSignSuccess] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/applications/${id}`);
      const data = await res.json();
      if (res.ok) {
        setApp(data.application);
      } else {
        setError(data.error || "Failed to load application details");
      }
    } catch (e) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async () => {
    if (!signatureName.trim()) {
      alert("Please enter your full legal name to digitally sign the contract.");
      return;
    }

    try {
      setSigning(true);
      const res = await fetch(`/api/applications/${id}/contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureName: signatureName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSignSuccess(true);
        fetchApplication();
      } else {
        alert(data.error || "Failed to sign contract");
      }
    } catch (e) {
      alert("Network error while signing contract");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <FiLoader className="animate-spin text-yellow-400" size={36} />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading Application...</p>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
          <FiAlertCircle size={28} />
        </div>
        <h3 className="text-xl font-black text-white">Application Error</h3>
        <p className="text-slate-400 text-sm">{error || "Unable to find application"}</p>
        <Link
          href="/portal/client"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
        >
          <FiArrowLeft /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentStepIndex = VISA_PIPELINE.findIndex((p) => p.key === app.status);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/portal/client"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-yellow-400 transition-colors"
        >
          <FiArrowLeft /> Back to Applications
        </Link>
        <Link
          href="/portal/client/messages"
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold rounded-xl hover:bg-yellow-400 hover:text-black transition-all self-start sm:self-auto"
        >
          <FiMessageSquare size={14} /> Message Advisor
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 blur-[120px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                {app.trackingId}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                Created on {new Date(app.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {app.visaCategory} — <span className="text-yellow-400">{app.country}</span>
            </h2>
            <p className="text-slate-400 text-xs">
              Applicant: <span className="text-slate-200 font-semibold">{app.client?.user?.name || "Client"}</span>
            </p>
          </div>

          <div>
            <span className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border ${
              app.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              app.status === "REJECTED" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
              "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
            }`}>
              {app.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Status Pipeline Progress */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Application Processing Stages</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {VISA_PIPELINE.map((stage, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={stage.key}
                className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${
                  isCurrent ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400 shadow-lg shadow-yellow-400/5" :
                  isCompleted ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" :
                  "bg-slate-900/40 border-slate-800/60 text-slate-600"
                }`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold border border-current">
                  {isCompleted ? <FiCheckCircle size={16} /> : idx + 1}
                </div>
                <p className="text-[11px] font-bold leading-tight line-clamp-2">{stage.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visa & Travel Details */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <FiFileText className="text-yellow-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Visa Information</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500 font-bold uppercase">Destination</p>
              <p className="text-white font-semibold mt-1">{app.country}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase">Category</p>
              <p className="text-white font-semibold mt-1">{app.visaCategory}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase">Duration</p>
              <p className="text-white font-semibold mt-1">{app.duration || "Standard"}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase">Entry Type</p>
              <p className="text-white font-semibold mt-1">{app.entryType || "Single Entry"}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase">Travel Date</p>
              <p className="text-white font-semibold mt-1">{app.travelDate || "Flexible"}</p>
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase">Sponsor</p>
              <p className="text-white font-semibold mt-1">{app.sponsor || "Self"}</p>
            </div>
          </div>
        </div>

        {/* Contract & Agreement */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <FiShield className="text-yellow-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Service Agreement / Contract</h4>
          </div>

          {app.contractStatus === "SENT" && !app.contractAccepted ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl">
                <p className="text-xs text-yellow-400 font-bold mb-1">Contract Awaiting Signature</p>
                <p className="text-xs text-slate-300">
                  Approved Days: <strong>{app.contractApprovedDays || "30"} days</strong> | Payment: <strong>${app.contractPaymentAmount || "0"}</strong>
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Type Full Legal Name to Sign
                </label>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-yellow-400 outline-none"
                />
              </div>

              <button
                onClick={handleSignContract}
                disabled={signing}
                className="w-full py-3 bg-yellow-400 text-black font-extrabold text-xs rounded-xl hover:bg-yellow-300 transition-all cursor-pointer"
              >
                {signing ? "Digitally Signing..." : "Sign Agreement"}
              </button>
            </div>
          ) : app.contractAccepted ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2 text-center">
              <FiCheckCircle className="text-emerald-400 mx-auto" size={24} />
              <p className="text-xs font-bold text-emerald-400">Agreement Digitally Signed</p>
              <p className="text-[11px] text-slate-400">
                Signed by: <strong>{app.contractSignatureName}</strong>
              </p>
              <p className="text-[10px] text-slate-500">
                {app.contractAcceptedAt ? new Date(app.contractAcceptedAt).toLocaleString() : ""}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4">
              Contract review will be issued once initial documentation is approved by case officers.
            </p>
          )}
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FiPaperclip className="text-yellow-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Uploaded Documents ({app.documents?.length || 0})</h4>
          </div>
          <Link
            href="/portal/client/documents"
            className="text-xs font-bold text-yellow-400 hover:underline"
          >
            Manage Documents →
          </Link>
        </div>

        {(!app.documents || app.documents.length === 0) ? (
          <p className="text-xs text-slate-500 italic text-center py-6">No documents attached to this file yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {app.documents.map((doc: any) => (
              <div key={doc.id} className="p-4 bg-[#020617] border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{doc.fileName || doc.documentType}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{doc.documentType}</p>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400 hover:text-black rounded-xl transition-all"
                  title="View / Download Document"
                >
                  <FiDownload size={16} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
