"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  FiArrowLeft, FiLoader, FiFileText, FiClock, 
  FiCheckCircle, FiAlertCircle, FiMapPin, FiCalendar, 
  FiPaperclip, FiDownload, FiMessageSquare, FiShield, FiArchive,
  FiAward, FiSend, FiPrinter, FiEye, FiUser, FiGlobe, FiX
} from "react-icons/fi";
import { VISA_PIPELINE, VISA_STATUS_COLORS } from "@/lib/visaPipeline";
import PortalToast, { ToastMessage } from "@/components/PortalToast";

export default function ClientApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [app, setApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signSuccess, setSignSuccess] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);

  // Download states
  const [downloadingDocId, setDownloadingDocId] = useState<number | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Helper to format safe sanitized filenames with Applicant Name and Visa Tracking Number
  const getDocFileName = (doc: any) => {
    const applicantName = (app?.client?.user?.name || "Applicant").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const trackingId = (app?.trackingId || `APP-${app?.id}`).trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const docType = (doc.documentType || "Document").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext = doc.fileName?.includes(".") 
      ? doc.fileName.split(".").pop() 
      : (doc.fileType || "pdf");
    return `${applicantName}_${trackingId}_${docType}.${ext}`;
  };

  const handleDownloadSingle = async (doc: any, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setDownloadingDocId(doc.id);

    const filename = getDocFileName(doc);

    try {
      const res = await fetch(doc.fileUrl);
      if (!res.ok) throw new Error("Failed to retrieve file from storage");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      showToast(`Downloaded ${filename}`, "success");
    } catch (err: any) {
      console.error("Direct download failed, falling back to external link:", err);
      const a = document.createElement("a");
      a.href = doc.fileUrl;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleDownloadAllZip = async () => {
    if (!app?.documents || app.documents.length === 0) return;
    setDownloadingZip(true);

    const applicantName = (app?.client?.user?.name || "Applicant").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const trackingId = (app?.trackingId || `APP-${app?.id}`).trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const zipFilename = `${applicantName}_${trackingId}_Documents.zip`;

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      await Promise.all(
        app.documents.map(async (doc: any) => {
          try {
            const res = await fetch(doc.fileUrl);
            if (!res.ok) throw new Error(`Failed to fetch ${doc.documentType}`);
            const blob = await res.blob();
            const itemFilename = getDocFileName(doc);
            zip.file(itemFilename, blob);
          } catch (fileErr) {
            console.error(`Error adding document ${doc.id} to zip:`, fileErr);
          }
        })
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const blobUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = zipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      showToast(`Successfully downloaded ${zipFilename}!`, "success");
    } catch (err: any) {
      console.error("Failed to generate zip file:", err);
      showToast(err.message || "Failed to package documents into zip", "error");
    } finally {
      setDownloadingZip(false);
    }
  };

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
      showToast("Please enter your full legal name to digitally sign the contract.", "error");
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
        showToast("Contract successfully signed and registered!", "success");
        fetchApplication();
      } else {
        showToast(data.error || "Failed to sign contract", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Network error while signing contract", "error");
    } finally {
      setSigning(false);
    }
  };

  const handlePrintContract = () => {
    if (!app) return;
    const clientUser = app.client?.user;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Please allow popups in your browser to print the contract.", "error");
      return;
    }
    
    const contractDate = app.contractAcceptedAt 
      ? new Date(app.contractAcceptedAt).toLocaleDateString()
      : new Date().toLocaleDateString();

    const clientName = clientUser?.name || "Client";
    const fatherName = app.client?.fatherName || "N/A";
    const passportNo = app.client?.passportNumber || "N/A";
    const address = app.client?.currentAddress || "N/A";
    const phone = app.client?.phone || "N/A";
    const email = clientUser?.email || "N/A";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Legal Visa Service Contract - Syed Services</title>
          <meta charset="utf-8">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4; margin: 15mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: 'Inter', sans-serif; color: #0f172a; line-height: 1.5; margin: 0; padding: 20px; font-size: 12px; background: #fff; }
            .container { width: 100%; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
            .company-name { font-size: 20px; font-weight: 900; color: #0f172a; }
            .meta { text-align: right; font-size: 11px; }
            .title { text-align: center; margin: 20px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            .title h1 { margin: 0; font-size: 16px; font-weight: 900; }
            .table-parties { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
            .table-parties th, .table-parties td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; vertical-align: top; }
            .table-parties th { background-color: #f8fafc; font-weight: bold; }
            .clauses { margin-bottom: 25px; font-size: 11px; line-height: 1.6; color: #334155; }
            .clauses h4 { margin: 12px 0 4px 0; font-size: 12px; color: #0f172a; font-weight: bold; }
            .signatures { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
            .sig-box { width: 45%; border: 1px dashed #94a3b8; padding: 15px; border-radius: 6px; }
            .stamp { text-align: center; margin-top: 20px; }
            .no-print { display: flex; justify-content: flex-end; margin-bottom: 20px; }
            @media print { .no-print { display: none !important; } body { padding: 0; } .container { border: none; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="no-print">
              <button onclick="window.print()" style="padding: 10px 20px; background: #eab308; border: none; font-weight: bold; border-radius: 6px; cursor: pointer;">
                Print / Save Legal Agreement (PDF)
              </button>
            </div>

            <div class="header">
              <div>
                <div class="company-name">SYED SERVICES</div>
                <div style="font-size: 10px; color: #64748b;">Visa Consultancy, Invitation & Travel Services</div>
                <div style="font-size: 10px; color: #64748b;">Peshawar · Islamabad · Kabul</div>
              </div>
              <div class="meta">
                <div>Contract Ref: <strong>${app.trackingId}</strong></div>
                <div>Date Executed: <strong>${contractDate}</strong></div>
                <div>Status: <strong>LEGALLY BINDING / EXECUTED</strong></div>
              </div>
            </div>

            <div class="title">
              <h1>LEGAL VISA CONSULTANCY & SERVICE AGREEMENT</h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Executed under applicable contract and electronic transaction regulations</p>
            </div>

            <table class="table-parties">
              <thead>
                <tr>
                  <th width="50%">First Party (Service Provider / Party A)</th>
                  <th width="50%">Second Party (Client & Applicant / Party B)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Syed Services Ltd. / Travel Consultancy</strong><br>
                    <strong>Authorized Representative:</strong> ${app.contractFirstPartyName || "Eng Syed Saif Ur Rehman"}<br>
                    <strong>Head Office:</strong> University Road / Saddar, Peshawar, Pakistan<br>
                    <strong>Phone / WhatsApp:</strong> +92 310 9797771<br>
                    <strong>Email:</strong> info@syedservices.com.pk
                  </td>
                  <td>
                    <strong>Legal Name:</strong> ${clientName}<br>
                    <strong>Father's Name:</strong> ${fatherName}<br>
                    <strong>Passport Number:</strong> ${passportNo}<br>
                    <strong>Residential Address:</strong> ${address}<br>
                    <strong>Phone:</strong> ${phone} | <strong>Email:</strong> ${email}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="clauses">
              <h4>1. SCOPE OF SERVICES</h4>
              <p>Party A agrees to provide professional consultancy, documentation preparation, submission processing, and embassy liaison for the Second Party's visa application for <strong>${app.country} (${app.visaCategory})</strong>.</p>

              <h4>2. AGREED TIMELINE & PROCESSING TERMS</h4>
              <p>Estimated processing duration is designated at approximately <strong>${app.contractApprovedDays || "30"} days</strong>. Party B acknowledges that embassy processing schedules are subject to sovereign consular authorities and diplomatic discretion.</p>

              <h4>3. FINANCIAL TERMS & FEE STRUCTURE</h4>
              <p>The total service fee agreed upon between both parties is <strong>$${app.contractPaymentAmount || app.packagePrice || "0"} USD</strong>. Official invoices issued under transaction reference <strong>${app.trackingId}</strong> constitute the definitive accounting ledger.</p>

              <h4>4. APPLICANT UNDERTAKING & DOCUMENTARY AUTHENTICITY</h4>
              <p>Party B explicitly warrants that all identity documents, passports, photos, certificates, and family information submitted are 100% genuine, authentic, and correct under penalty of legal disqualification.</p>

              <h4>5. DISPUTE RESOLUTION & JURISDICTION</h4>
              <p>This agreement is entered into electronically and is legally binding. Any dispute arising under or in connection with this agreement shall be subject to the exclusive jurisdiction of the competent courts of law.</p>
            </div>

            <div class="signatures">
              <div class="sig-box">
                <p style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase; color: #64748b;">Signed on Behalf of Party A:</p>
                <p style="margin: 0; font-weight: bold; color: #0f172a;">${app.contractFirstPartyName || "Eng Syed Saif Ur Rehman"}</p>
                <p style="margin: 3px 0 0 0; font-size: 10px; color: #166534; font-weight: bold;">Verified Corporate Seal Applied</p>
              </div>

              <div class="sig-box">
                <p style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase; color: #64748b;">Digitally Signed by Party B (Client):</p>
                <p style="margin: 0; font-weight: bold; color: #0f172a;">${app.contractSignatureName || clientName}</p>
                <p style="margin: 3px 0 0 0; font-size: 10px; color: #166534; font-weight: bold;">
                  ${app.contractAcceptedAt ? new Date(app.contractAcceptedAt).toLocaleString() : "Signed & Executed"}
                </p>
              </div>
            </div>

            <div class="stamp">
              <p style="font-size: 9px; color: #94a3b8; margin-top: 25px;">
                Official Digital Contract ID: ${app.trackingId} · Verified and Enforceable under Electronic Transactions Ordinance
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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

  // Check for specialized documents
  const approvedVisaDoc = app.documents?.find((d: any) => ["approved_visa", "issued_visa"].includes(d.documentType));
  const submissionProofDoc = app.documents?.find((d: any) => ["submission_confirmation", "embassy_submission_proof"].includes(d.documentType));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Reusable Toast Notification */}
      <PortalToast toast={toast} onClose={() => setToast(null)} />

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 px-5 py-3 rounded-2xl shadow-lg">
        <Link
          href="/portal/client"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto"
        >
          <FiArrowLeft size={14} /> Back to Applications
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrintContract}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-yellow-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <FiPrinter size={13} /> Print Service Agreement
          </button>
          <Link
            href="/portal/client/messages"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 text-black text-xs font-black rounded-xl hover:bg-yellow-300 transition-all shadow-md shadow-yellow-400/10"
          >
            <FiMessageSquare size={13} /> Message Advisor
          </Link>
        </div>
      </div>

      {/* 1. CELEBRATORY APPROVED VISA BANNER (IF APPROVED OR VISA DOCUMENT AVAILABLE) */}
      {(app.status === "APPROVED" || approvedVisaDoc) && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900/60 border-2 border-emerald-500/50 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 blur-[100px] pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-500/20">
                  <FiAward size={13} /> OFFICIAL VISA ISSUED & APPROVED
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold">Grant Verified</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                🎉 Congratulations, {app.client?.user?.name || "Client"}!
              </h2>
              <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
                Your official visa application for <strong>{app.country} ({app.visaCategory})</strong> has been successfully APPROVED. You can view or download your official visa document below.
              </p>
            </div>

            {approvedVisaDoc ? (
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <a
                  href={approvedVisaDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-slate-900 border border-emerald-500/40 text-emerald-400 font-black text-xs rounded-xl hover:bg-slate-850 transition-all flex items-center gap-1.5"
                >
                  <FiEye size={14} /> View eVisa
                </a>
                <button
                  type="button"
                  onClick={(e) => handleDownloadSingle(approvedVisaDoc, e)}
                  disabled={downloadingDocId === approvedVisaDoc.id}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-xs rounded-xl hover:scale-105 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  {downloadingDocId === approvedVisaDoc.id ? (
                    <>
                      <FiLoader className="animate-spin" size={13} /> Downloading...
                    </>
                  ) : (
                    <>
                      <FiDownload size={13} /> Download Approved Visa
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-center">
                <span className="text-xs font-bold text-emerald-400">Status: Approved</span>
                <p className="text-[10px] text-slate-400">Official visa file is being synced by desk officers.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. OFFICIAL EMBASSY SUBMISSION CONFIRMATION CARD (IF AVAILABLE) */}
      {submissionProofDoc && (
        <div className="bg-gradient-to-r from-cyan-950/60 via-[#0f172a] to-slate-900 border border-cyan-500/40 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <FiSend size={18} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">
                  Embassy / Consular Confirmation
                </span>
                <h4 className="text-sm font-black text-white">
                  Official Visa Submission Email & Acknowledgment Slip
                </h4>
                <p className="text-xs text-slate-400">
                  Your visa file has been officially registered with the embassy. Review your submission slip here.
                </p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0 self-start sm:self-auto">
              <a
                href={submissionProofDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-900 border border-cyan-500/30 text-cyan-400 font-bold text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <FiEye size={13} /> View Slip
              </a>
              <button
                type="button"
                onClick={(e) => handleDownloadSingle(submissionProofDoc, e)}
                disabled={downloadingDocId === submissionProofDoc.id}
                className="px-4 py-2 bg-cyan-500 text-black font-black text-xs rounded-xl hover:bg-cyan-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
              >
                <FiDownload size={13} /> Download Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded-lg border border-yellow-400/20">
                {app.trackingId}
              </span>
              <span className="text-[11px] text-slate-500 font-bold">
                Created: {new Date(app.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {app.visaCategory} — <span className="text-yellow-400">{app.country}</span>
            </h2>
            <p className="text-slate-400 text-xs">
              Applicant: <span className="text-slate-200 font-semibold">{app.client?.user?.name || "Client"}</span>
            </p>
          </div>

          <div>
            <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
              app.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
              app.status === "REJECTED" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" :
              "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
            }`}>
              {app.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Status Pipeline Progress */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Application Processing Stages</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {VISA_PIPELINE.map((stage, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={stage.key}
                className={`p-3 rounded-xl border transition-all text-center space-y-1.5 ${
                  isCurrent ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400 shadow-md shadow-yellow-400/5" :
                  isCompleted ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" :
                  "bg-slate-900/40 border-slate-800/60 text-slate-600"
                }`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[11px] font-bold border border-current">
                  {isCompleted ? <FiCheckCircle size={14} /> : idx + 1}
                </div>
                <p className="text-[10px] font-bold leading-tight line-clamp-2">{stage.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visa & Travel Details */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <FiFileText className="text-yellow-400" size={15} />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Visa Information</h4>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
              <p className="text-slate-500 text-[9px] font-bold uppercase">Destination</p>
              <p className="text-white font-bold mt-0.5">{app.country}</p>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
              <p className="text-slate-500 text-[9px] font-bold uppercase">Category</p>
              <p className="text-white font-bold mt-0.5">{app.visaCategory}</p>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
              <p className="text-slate-500 text-[9px] font-bold uppercase">Duration</p>
              <p className="text-white font-bold mt-0.5">{app.duration || "Standard"}</p>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
              <p className="text-slate-500 text-[9px] font-bold uppercase">Entry Type</p>
              <p className="text-white font-bold mt-0.5">{app.entryType || "Single Entry"}</p>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
              <p className="text-slate-500 text-[9px] font-bold uppercase">Travel Date</p>
              <p className="text-white font-bold mt-0.5">{app.travelDate || "Flexible"}</p>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
              <p className="text-slate-500 text-[9px] font-bold uppercase">Sponsor</p>
              <p className="text-white font-bold mt-0.5">{app.sponsor || "Self"}</p>
            </div>
          </div>
        </div>

        {/* Contract & Agreement */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FiShield className="text-yellow-400" size={15} />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Service Agreement / Contract</h4>
            </div>
            <button
              type="button"
              onClick={handlePrintContract}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-yellow-400 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              title="Print official legal contract PDF"
            >
              <FiPrinter size={11} /> Print PDF
            </button>
          </div>

          {/* Legal summary box */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 text-xs space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">First Party (Provider):</span>
              <strong className="text-white text-right">{app.contractFirstPartyName || "Eng Syed Saif Ur Rehman"}</strong>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Second Party (Client):</span>
              <strong className="text-white text-right">{app.client?.user?.name || "Client"}</strong>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Approved Timeline:</span>
              <strong className="text-yellow-400 font-mono">{app.contractApprovedDays || "30"} Days</strong>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Agreed Service Fee:</span>
              <strong className="text-emerald-400 font-mono">${app.contractPaymentAmount || app.packagePrice || "0"} USD</strong>
            </div>
          </div>

          {app.contractStatus === "SENT" && !app.contractAccepted ? (
            <div className="space-y-3">
              <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                <p className="text-xs text-yellow-400 font-bold mb-0.5">Contract Awaiting Signature</p>
                <p className="text-[11px] text-slate-300">
                  Approved Days: <strong>{app.contractApprovedDays || "30"} days</strong> | Payment: <strong>${app.contractPaymentAmount || "0"}</strong>
                </p>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Type Full Legal Name to Sign
                </label>
                <input
                  type="text"
                  placeholder="Your Full Legal Name"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-yellow-400 outline-none"
                />
              </div>

              <button
                onClick={handleSignContract}
                disabled={signing}
                className="w-full py-2.5 bg-yellow-400 text-black font-extrabold text-xs rounded-xl hover:bg-yellow-300 transition-all cursor-pointer shadow-md shadow-yellow-400/10"
              >
                {signing ? "Digitally Signing Legal Contract..." : "Sign Legal Agreement"}
              </button>
            </div>
          ) : app.contractAccepted ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5 text-center">
              <FiCheckCircle className="text-emerald-400 mx-auto" size={20} />
              <p className="text-xs font-bold text-emerald-400">Agreement Digitally Signed & Legally Enforceable</p>
              <p className="text-[11px] text-slate-300">
                Signed by: <strong>{app.contractSignatureName}</strong>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {app.contractAcceptedAt ? new Date(app.contractAcceptedAt).toLocaleString() : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                Official bilateral service contract details and legal clauses are registered under file <strong>{app.trackingId}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FiPaperclip className="text-yellow-400" size={15} />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Uploaded Documents ({app.documents?.length || 0})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {app.documents && app.documents.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={downloadingZip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-black font-black text-xs rounded-xl hover:bg-yellow-300 transition-all cursor-pointer shadow-md shadow-yellow-400/10 disabled:opacity-60"
              >
                {downloadingZip ? <FiLoader className="animate-spin" size={13} /> : <FiArchive size={13} />}
                <span>Download All (ZIP)</span>
              </button>
            )}
            <Link
              href="/portal/client/documents"
              className="text-xs font-bold text-yellow-400 hover:underline"
            >
              Manage →
            </Link>
          </div>
        </div>

        {(!app.documents || app.documents.length === 0) ? (
          <p className="text-xs text-slate-500 italic text-center py-6">No documents attached to this file yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {app.documents.map((doc: any) => (
              <div key={doc.id} className="p-3 bg-[#020617] border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{doc.fileName || doc.documentType}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{doc.documentType.replace(/_/g, " ")}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-900 border border-slate-800 hover:border-blue-400/30 text-slate-400 hover:text-blue-400 rounded-lg transition-all"
                    title="View Document"
                  >
                    <FiEye size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={(e) => handleDownloadSingle(doc, e)}
                    disabled={downloadingDocId === doc.id}
                    className="p-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 hover:bg-yellow-400 hover:text-black rounded-lg transition-all cursor-pointer disabled:opacity-60"
                    title={`Download file: ${getDocFileName(doc)}`}
                  >
                    {downloadingDocId === doc.id ? (
                      <FiLoader className="animate-spin text-yellow-400" size={13} />
                    ) : (
                      <FiDownload size={13} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

