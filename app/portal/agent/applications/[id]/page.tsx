"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FiArrowLeft, FiLoader, FiUser, FiFileText, FiClock,
  FiCheckCircle, FiAlertCircle, FiMapPin, FiCalendar,
  FiPhone, FiBook, FiBriefcase, FiUsers, FiPaperclip,
  FiCircle, FiChevronRight, FiDownload, FiEye, FiImage, FiArchive, FiPrinter,
  FiShield, FiGlobe, FiDollarSign, FiChevronDown, FiChevronUp, FiAward,
  FiMail, FiSend, FiCopy, FiLayers, FiCheck, FiExternalLink
} from "react-icons/fi";

import { VISA_PIPELINE as STATUS_PIPELINE, VISA_STATUS_COLORS as STATUS_COLORS } from "@/lib/visaPipeline";
import PortalToast, { ToastMessage } from "@/components/PortalToast";

function DetailBox({ 
  icon, 
  label, 
  value, 
  mono = false, 
  copyable = false,
  highlight = false,
  badge = false,
  badgeColor = "yellow",
  isLink = false,
  href = ""
}: { 
  icon?: React.ReactNode; 
  label: string; 
  value?: string | number | null;
  mono?: boolean;
  copyable?: boolean;
  highlight?: boolean;
  badge?: boolean;
  badgeColor?: "yellow" | "emerald" | "blue" | "slate";
  isLink?: boolean;
  href?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeStyles = {
    yellow: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    slate: "bg-slate-900 text-slate-300 border-slate-800"
  };

  return (
    <div className="p-3.5 bg-slate-950/60 hover:bg-slate-900/60 border border-slate-850/80 hover:border-slate-750 rounded-2xl transition-all flex flex-col justify-between group shadow-sm">
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 truncate">
          {icon && <span className="text-yellow-400/80 shrink-0">{icon}</span>}
          <span className="truncate">{label}</span>
        </span>
        {copyable && value && (
          <button 
            type="button" 
            onClick={handleCopy}
            className="text-slate-500 hover:text-yellow-400 transition-colors p-0.5 rounded cursor-pointer shrink-0"
            title="Copy Value"
          >
            {copied ? <FiCheck size={11} className="text-emerald-400" /> : <FiCopy size={11} />}
          </button>
        )}
      </div>

      <div className="min-w-0">
        {value ? (
          isLink ? (
            <a 
              href={href || String(value)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1 truncate"
            >
              <span className="truncate">{value}</span>
              <FiExternalLink size={10} className="shrink-0" />
            </a>
          ) : badge ? (
            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${badgeStyles[badgeColor]} ${mono ? "font-mono" : ""} truncate max-w-full`}>
              {value}
            </span>
          ) : (
            <p className={`text-xs md:text-[13px] font-bold ${highlight ? "text-yellow-400" : "text-slate-100"} ${mono ? "font-mono" : ""} truncate`}>
              {value}
            </p>
          )
        ) : (
          <p className="text-xs text-slate-600 italic font-normal">Not provided</p>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, icon, badge, children }: { title: string; icon: React.ReactNode; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0f172a] border border-slate-800/80 hover:border-slate-750 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <span className="text-yellow-400 p-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">{icon}</span>
          <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">{title}</h4>
        </div>
        {badge && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 uppercase font-mono">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [app, setApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isContractExpanded, setIsContractExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "embassy" | "personal" | "visa" | "family" | "career" | "passport" | "documents">("overview");

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

      // Fetch all documents in parallel
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
        setError(data.error || "Failed to load application");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async () => {
    if (!signatureName.trim()) {
      showToast("Please type your full name to sign the contract.", "error");
      return;
    }
    setSigning(true);
    try {
      const res = await fetch(`/api/applications/${id}/contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureName: signatureName.trim(),
        }),
      });
      if (res.ok) {
        showToast("Contract successfully signed and registered!", "success");
        await fetchApplication();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to submit contract signature.", "error");
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Connection error.", "error");
    } finally {
      setSigning(false);
    }
  };

  const handlePrintContract = () => {
    if (!app) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Please allow popups in your browser to print the contract.", "error");
      return;
    }
    
    const contractDate = app.contractAcceptedAt 
      ? new Date(app.contractAcceptedAt).toLocaleDateString()
      : new Date().toLocaleDateString();

    const clientUser = app.client?.user;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Visa Service Contract - Syed Services</title>
          <meta charset="utf-8">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap');
            
            @page {
              size: A4;
              margin: 0;
            }
            
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              line-height: 1.5;
              margin: 0;
              padding: 40px 20px;
              background-color: #f1f5f9;
              font-size: 13px;
              display: flex;
              justify-content: center;
            }
            
            .container {
              width: 100%;
              max-width: 800px;
              background: #ffffff;
              padding: 50px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            
            .no-print {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 25px;
            }
            
            .no-print button {
              padding: 10px 24px;
              background: #0f172a;
              border: none;
              color: #ffffff;
              font-weight: 700;
              font-size: 12px;
              border-radius: 6px;
              cursor: pointer;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              transition: all 0.2s ease;
            }
            
            .no-print button:hover {
              background: #1e293b;
            }
            
            .letterhead {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            
            .logo-area {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .logo-icon {
              width: 44px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .company-name {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
              line-height: 1.1;
            }
            
            .company-subtitle {
              font-size: 9.5px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 2px;
            }
            
            .meta-info {
              text-align: right;
              font-size: 11px;
              color: #475569;
              line-height: 1.4;
            }
            
            .meta-info strong {
              color: #0f172a;
            }
            
            .badge {
              display: inline-block;
              padding: 2px 6px;
              background: #dcfce7;
              border: 1px solid #bbf7d0;
              color: #166534;
              font-size: 9px;
              font-weight: 700;
              border-radius: 4px;
              text-transform: uppercase;
            }

            .contract-title {
              text-align: center;
              margin-bottom: 25px;
            }
            
            .contract-title h1 {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .contract-title h2 {
              font-family: 'Noto Naskh Arabic', serif;
              font-size: 16px;
              font-weight: 700;
              color: #475569;
              margin: 6px 0 0 0;
              direction: rtl;
            }
            
            .parties-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              overflow: hidden;
            }
            
            .parties-table th {
              background: #f8fafc;
              padding: 8px 12px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #475569;
              border-bottom: 1px solid #cbd5e1;
              font-weight: 800;
              text-align: left;
            }
            
            .parties-table td {
              padding: 12px;
              vertical-align: top;
              font-size: 12px;
              border-bottom: 1px solid #cbd5e1;
              width: 50%;
            }
            
            .parties-table tr:last-child td {
              border-bottom: none;
            }

            .contract-section {
              margin-bottom: 30px;
            }
            
            .section-heading {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 4px;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .clause {
              margin-bottom: 14px;
              padding-bottom: 10px;
              border-bottom: 1px solid #f1f5f9;
              page-break-inside: avoid;
            }
            
            .clause:last-child {
              border-bottom: none;
            }
            
            .clause-title {
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 3px;
              font-size: 12.5px;
            }
            
            .clause-text {
              color: #334155;
              margin: 0;
              text-align: justify;
            }

            .arabic-section {
              font-family: 'Noto Naskh Arabic', serif;
              direction: rtl;
              text-align: right;
              font-size: 13px;
            }
            
            .arabic-section .section-heading {
              font-family: 'Noto Naskh Arabic', serif;
              font-size: 14px;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 4px;
              margin-bottom: 15px;
              text-align: right;
            }
            
            .arabic-section .clause {
              text-align: right;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 10px;
            }
            
            .arabic-section .clause:last-child {
              border-bottom: none;
            }
            
            .arabic-section .clause-title {
              font-weight: 700;
              margin-bottom: 3px;
            }

            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              gap: 40px;
              page-break-inside: avoid;
            }
            
            .sig-block {
              flex: 1;
              border-top: 1.5px solid #0f172a;
              padding-top: 10px;
              text-align: center;
              font-size: 11px;
            }
            
            .sig-title {
              font-weight: 800;
              text-transform: uppercase;
              color: #475569;
              font-size: 9.5px;
              letter-spacing: 0.5px;
              margin-bottom: 15px;
            }
            
            .sig-name {
              font-family: monospace;
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 4px;
            }
            
            .sig-date {
              font-size: 9.5px;
              color: #64748b;
            }
            
            .stamp-container {
              display: flex;
              justify-content: center;
              margin-top: 25px;
              page-break-inside: avoid;
            }
            
            .stamp-wrapper {
              display: inline-block;
            }

            .footer-note {
              margin-top: 35px;
              font-size: 8.5px;
              color: #94a3b8;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
            }
            
            @media print {
              body {
                padding: 15mm 20mm !important;
                margin: 0 !important;
                background-color: #ffffff !important;
                color: #000000 !important;
                display: block !important;
              }
              
              .container {
                max-width: 100% !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                background: transparent !important;
                border-radius: 0 !important;
              }
              
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="no-print">
              <button onclick="window.print()">Print / Save as PDF</button>
            </div>
            
            <div class="letterhead">
              <div class="logo-area">
                <div class="logo-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                    <path d="M12 2L2 6.5V11c0 5.25 3.5 10.16 10 11.5 6.5-1.34 10-6.25 10-11.5V6.5L12 2z" fill="#eab308"/>
                    <path d="M12 3.5L3.5 7.3V11c0 4.5 2.8 8.7 8.5 9.8 5.7-1.1 8.5-5.3 8.5-9.8V7.3L12 3.5z" fill="#0f172a"/>
                    <text x="12" y="15" fill="#eab308" font-size="11" font-weight="900" text-anchor="middle" font-family="'Inter', sans-serif">S</text>
                  </svg>
                </div>
                <div>
                  <div class="company-name">SYED SERVICES</div>
                  <div class="company-subtitle">Official Visa & Invitation Services</div>
                </div>
              </div>
              <div class="meta-info">
                <div>Ref No: <strong>${app.trackingId}</strong></div>
                <div>Date: <strong>${contractDate}</strong></div>
                <div>Status: <span class="badge">SIGNED & ACTIVE</span></div>
              </div>
            </div>
            
            <div class="contract-title">
              <h1>Mutual Service Contract</h1>
              <h2>د خدماتو دوه اړخیز رسمي تړون لیک</h2>
            </div>
            
            <table class="parties-table">
              <thead>
                <tr>
                  <th>Parties of Agreement</th>
                  <th style="text-align: right;" dir="rtl">د تړون لوري</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>First Party (Party A):</strong><br>
                    Syed Services Ltd.<br>
                    <span style="color: #64748b; font-size: 11px;">Authorized Representative Visa Processing Office</span>
                  </td>
                  <td style="text-align: right;" dir="rtl">
                    <strong>لومړی لوری (الف لوری):</strong><br>
                    د سید خدماتو شرکت (شرکت)<br>
                    <span style="color: #64748b; font-size: 11px;">د ویزې د پروسس رسمي او باصلاحیته اداره</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Second Party (Party B):</strong><br>
                    ${app.agent?.agencyName || "Partner Agency"}<br>
                    <span style="color: #64748b; font-size: 11px;">Registered Partner Agent / Representative</span>
                  </td>
                  <td style="text-align: right;" dir="rtl">
                    <strong>دوهم لوری (ب لوری):</strong><br>
                    ${app.agent?.agencyName || "همکار استازی"}<br>
                    <span style="color: #64748b; font-size: 11px;">ثبت شوی همکار دفتر / استازی</span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="contract-section">
              <div class="section-heading">Section 1: English Agreement</div>
              
              <div class="clause">
                <div class="clause-title">1. Subject of Agreement</div>
                <p class="clause-text">
                  This binding legal agreement is entered into for the facilitation and processing of a <strong>${app.country ? `${app.country} Visa` : "Visa"}</strong> for the applicant <strong>${clientUser?.name || "the Client"}</strong>. Syed Services (Party A) agrees to secure the official invitation letter and prepare the complete visa file dossier.
                </p>
              </div>
              
              <div class="clause">
                <div class="clause-title">2. Processing Timeline</div>
                <p class="clause-text">
                  Party A guarantees that the visa process will be fully executed, submitted, and decided within <strong>${app.contractApprovedDays || "30"} Days</strong> starting from the date of final complete document submission to the embassy/consulate.
                </p>
              </div>
              
              <div class="clause">
                <div class="clause-title">3. Service Fees & Payment Terms</div>
                <p class="clause-text">
                  Party B agrees to pay a fixed visa service fee of <strong>${app.contractPaymentAmount || "1000 USD"}</strong> to Party A. This payment shall be made strictly <strong>after</strong> the visa has been successfully issued by the embassy and the passport is ready for collection. No advance or deposit payments are required for the service fee.
                </p>
              </div>
              
              <div class="clause">
                <div class="clause-title">4. Embassy Official Fees</div>
                <p class="clause-text">
                  <strong>Embassy Fee Responsibility:</strong> The official visa application fee and stamping fees charged directly by the Embassy or Consulate are the sole responsibility of the Applicant. These fees must be paid directly to the embassy by the Applicant and are not included in the Party A service fee mentioned in Clause 3.
                </p>
              </div>
              
              <div class="clause">
                <div class="clause-title">5. Default & Cancellation</div>
                <p class="clause-text">
                  If Party A fails to deliver the visa decision within the stipulated timeline of ${app.contractApprovedDays || "30"} Days, the agreement will be deemed cancelled without any penalty. Party B will not be charged any service fee. Both parties agree that this electronic signature constitutes a legally binding document presentable in a court of law.
                </p>
              </div>
            </div>
            
            <div class="contract-section arabic-section">
              <div class="section-heading">دوهمه برخه: پښتو رسمي هوکړه لیک</div>
              
              <div class="clause">
                <div class="clause-title">۱. د تړون موضوع</div>
                <p class="clause-text">
                  دا رسمي او قانوني هوکړه لیک د غوښتونکي <strong>${clientUser?.name || "مشتري"}</strong> لپاره د <strong>د ویزې (${app.country || "Visa"})</strong> د پروسس او ترلاسه کولو په موخه لاسلیک کیږي. لومړی لوری (سید خدمات) ژمن دی چې د رسمي بلنې لیک او ټولو اړوندو اسنادو د چمتو کولو چارې په سمه توګه پر مخ یوسي.
                </p>
              </div>
              
              <div class="clause">
                <div class="clause-title">۲. کاري موده او وخت</div>
                <p class="clause-text">
                  لومړی لوری تضمین کوي چې د ویزې دغه پروسه به سفارت یا کنسولګرۍ ته د ټولو اسنادو د سپارلو له نیټې څخه په دقیق ډول د <strong>${app.contractApprovedDays || "۳۰"}</strong> ورځو دننه بشپړه او نهایي کیږي.
                </p>
              </div>
              
              <div class="clause">
                <div class="clause-title">۳. مالي ژمنه او کاري فیس</div>
                <p class="clause-text">
                  دوهم لوری موافقه کوي چې لومړي لوري ته د ویزې د خدماتو په بدل کې <strong>${app.contractPaymentAmount || "۱۰۰۰ ډالر"}</strong> تادیه کړي. دغه فیس به په بشپړ ډول د سفارت څخه د ویزې د بریالۍ صدور او د پاسپورټ د تسلیمۍ څخه وروسته په سمدستي توګه تادیه کیږي. د کار له پیل وړاندې هیڅ ډول پیشکي فیس نه اخیستل کیږي.
                </p>
              </div>
              
              <div class="clause">
                <div class="clause-title">۴. د سفارت رسمي فیسونه</div>
                <p class="clause-text">
                  <strong>د سفارت فیس مسؤلیت:</strong> په سفارت یا کنسولګرۍ کې د ویزې د ثبت او سټیمپ کولو رسمي دولتي فیسونه په مستقیمه توګه په خپله د غوښتونکي (Applicant) په غاړه دي او هغه به یې تادیه کوي. دغه فیسونه په دریمه ماده کې د ذکر شوي خدماتو په فیس کې شامل نه دي.
                </p>
              </div>
              
              <div class="clause">
                <div class="clause-title">۵. فسخ او قانوني اعتبار</div>
                <p class="clause-text">
                  که چیرې لومړی لوری ونه توانیږي چې په ټاکل شوي وخت (${app.contractApprovedDays || "۳۰"} ورځو) کې د غوښتونکي ویزه پروسس کړي، تړون لغوه کیږي او په دوهم لوري هیڅ لګښت نه راځي. دواړه لوري موافقه کوي چې بریښنایي لاسلیکونه بشپړ قانوني اعتبار لري او په محکمه کې د وړاندې کولو وړ دي.
                </p>
              </div>
            </div>
            
            <div class="signature-section">
              <div class="sig-block">
                <div class="sig-title">First Party (Party A) / لومړی لوری</div>
                <div class="sig-name">Eng Syed Saif Ur Rehman</div>
                <div class="sig-date">Managing Director, Syed Services Ltd.</div>
              </div>
              
              <div class="sig-block">
                <div class="sig-title">Second Party (Party B) / دوهم لوری</div>
                <div class="sig-name">${app.contractSignatureName || "_______________________"}</div>
                <div class="sig-date">
                  Authorized Digital Signature<br>
                  ${app.contractAcceptedAt ? new Date(app.contractAcceptedAt).toLocaleString() : "Date: _______________________"}
                </div>
              </div>
            </div>
            
            <div class="stamp-container">
              <div class="stamp-wrapper">
                <svg width="120" height="120" viewBox="0 0 100 100" style="display: block;">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#166534" stroke-width="2" stroke-dasharray="3 2"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#166534" stroke-width="1"/>
                  <path id="stampPath" d="M 18,50 A 32,32 0 1,1 82,50" fill="none"/>
                  <path id="stampPathBottom" d="M 82,50 A 32,32 0 0,1 18,50" fill="none"/>
                  <text fill="#166534" font-size="6.5" font-weight="800" font-family="monospace">
                    <textPath href="#stampPath" startOffset="50%" text-anchor="middle">
                      ★ SYED SERVICES ★
                    </textPath>
                  </text>
                  <text fill="#166534" font-size="6" font-weight="800" font-family="monospace">
                    <textPath href="#stampPathBottom" startOffset="50%" text-anchor="middle">
                      OFFICIAL CONTRACT SEAL
                    </textPath>
                  </text>
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#166534" stroke-width="1.5"/>
                  <text x="50" y="47" fill="#166534" font-size="6.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">VERIFIED</text>
                  <text x="50" y="55" fill="#166534" font-size="5" font-weight="bold" text-anchor="middle" font-family="monospace">${contractDate}</text>
                  <text x="50" y="62" fill="#166534" font-size="5.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">APPROVED</text>
                </svg>
              </div>
            </div>
            
            <div class="footer-note">
              This document is officially generated by Syed Services System under transaction ID ${app.trackingId}. Original copy verified and archived.
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
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="text-center py-16 space-y-3">
        <FiAlertCircle className="text-red-400 text-4xl mx-auto" />
        <p className="text-white font-bold">{error || "Application not found"}</p>
        <Link href="/portal/agent/applications" className="text-yellow-400 text-sm hover:underline">
          ← Back to Applications
        </Link>
      </div>
    );
  }

  const client = app.client;
  const clientUser = client?.user;
  const statusHistory: any[] = app.statusHistory || [];

  const currentStatusIdx = STATUS_PIPELINE.findIndex(s => s.key === app.status);
  const isTerminal = ["APPROVED", "REJECTED", "COMPLETED", "ARCHIVED"].includes(app.status);

  // Separate official embassy issuances (approved visa & submission slips) from normal applicant documents
  const officialVisaDocs = app.documents?.filter((d: any) => ["approved_visa", "issued_visa"].includes(d.documentType)) || [];
  const submissionSlipDocs = app.documents?.filter((d: any) => ["submission_confirmation", "embassy_submission_proof"].includes(d.documentType)) || [];
  const officialIssuanceDocs = [...officialVisaDocs, ...submissionSlipDocs];
  const normalDocs = app.documents?.filter((d: any) => !["approved_visa", "issued_visa", "submission_confirmation", "embassy_submission_proof"].includes(d.documentType)) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      <PortalToast toast={toast} onClose={() => setToast(null)} />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/portal/agent/applications"
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white tracking-tight">
                {clientUser?.name || "Unknown Applicant"}
              </h2>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_COLORS[app.status] || STATUS_COLORS.DRAFT}`}>
                {app.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {app.trackingId} · {app.visaCategory} · {app.country}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Updated {new Date(app.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* ── Body: Main + Sidebar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* ── Left: Application Details ── */}
        <div className="xl:col-span-8 space-y-6">

          {/* 1. Pakistan Visa Service Contract Card */}
          {app.contractStatus && app.contractStatus !== "PENDING" && (
            <div>
              {app.contractAccepted && !isContractExpanded ? (
                /* MINIMIZED LUXURY COMPACT CONTRACT CARD */
                <div className="bg-gradient-to-r from-emerald-950/40 via-[#0f172a] to-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <FiCheckCircle size={14} className="text-emerald-400" />
                          <span>Pakistan Visa Service Contract — Executed & Legally Binding</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {app.trackingId}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                          <span className="text-slate-500 text-[9px] uppercase font-bold block">Party A (Consultancy)</span>
                          <strong className="text-white text-xs truncate block mt-0.5">Eng Syed Saif Ur Rehman</strong>
                        </div>
                        <div className="p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                          <span className="text-slate-500 text-[9px] uppercase font-bold block">Party B (Partner)</span>
                          <strong className="text-white text-xs truncate block mt-0.5">{app.contractSignatureName || app.agent?.agencyName || clientUser?.name}</strong>
                        </div>
                        <div className="p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                          <span className="text-slate-500 text-[9px] uppercase font-bold block">Agreed Service Fee</span>
                          <strong className="text-emerald-400 font-mono text-xs block mt-0.5">${app.contractPaymentAmount || "1000 USD"}</strong>
                        </div>
                        <div className="p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl">
                          <span className="text-slate-500 text-[9px] uppercase font-bold block">Guaranteed Timeline</span>
                          <strong className="text-yellow-400 font-mono text-xs block mt-0.5">{app.contractApprovedDays || "30 Days"}</strong>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-emerald-300 font-medium">✍️ Digitally Signed by <strong>{app.contractSignatureName}</strong></span>
                        <span className="text-slate-600 hidden sm:inline">·</span>
                        <span className="text-slate-500 text-[10px] font-mono">{app.contractAcceptedAt ? new Date(app.contractAcceptedAt).toLocaleString() : ""}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsContractExpanded(true)}
                        className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <FiEye size={13} className="text-yellow-400" />
                        <span>View Contract</span>
                        <FiChevronDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintContract}
                        className="px-4 py-2 bg-emerald-500 text-black font-black text-xs rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                        title="Print Official Contract Letterhead / PDF"
                      >
                        <FiPrinter size={13} />
                        <span>Print PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* EXPANDED FULL BILINGUAL CONTRACT CARD */
                <div className="bg-[#0f172a] border border-yellow-400/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden transition-all">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -z-10" />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 p-2 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl">
                        <FiFileText size={22} />
                      </span>
                      <div>
                        <h3 className="text-base md:text-lg font-black text-white tracking-tight uppercase">
                          {app.country ? `${app.country} Visa Service Contract` : "Visa Service Contract"}
                        </h3>
                        <h4 className="text-xs text-slate-500 font-bold tracking-wider uppercase font-mono mt-0.5">
                          د ویزې خدماتو رسمي تړون پاڼه
                        </h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {app.contractAccepted && (
                        <button
                          type="button"
                          onClick={() => setIsContractExpanded(false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all text-xs font-bold cursor-pointer"
                        >
                          <FiChevronUp size={13} />
                          <span>Minimize</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handlePrintContract}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 text-black hover:bg-yellow-300 rounded-xl transition-all text-xs font-black cursor-pointer shadow-md shadow-yellow-400/10"
                        title="Print Official Letterhead / PDF"
                      >
                        <FiPrinter size={13} /> Print / Save PDF
                      </button>
                    </div>
                  </div>

                  {/* Bilingual Agreement Details */}
                  <div className="space-y-6 text-sm text-slate-300 leading-relaxed border-b border-slate-800/60 pb-6">
                    
                    {/* Intro */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">English Version</p>
                        <p className="text-slate-400 text-xs">
                          This contract is made and executed on <span className="text-slate-200">{new Date(app.updatedAt).toLocaleDateString()}</span> between <strong>Syed Services (Party A)</strong> and <strong>{app.agent?.agencyName || "Agent Partner"} (Party B)</strong> regarding the visa application processing of <strong>{clientUser?.name}</strong> for <strong>{app.country ? `${app.country} Visa` : "Visa"}</strong>.
                        </p>
                      </div>
                      <div className="space-y-1 text-right" dir="rtl">
                        <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider font-mono">پښتو نسخه</p>
                        <p className="text-slate-400 text-xs leading-6">
                          دا تړون د لومړي لوري <strong>سید ویزې خدمات (Syed Services)</strong> او دوهم لوري <strong>{app.agent?.agencyName || "شریک استازی"}</strong> ترمنځ د کاندید <strong>{clientUser?.name}</strong> لپاره <strong>د ویزې (${app.country || "Visa"})</strong> پروسس په هکله لاسلیک شو.
                        </p>
                      </div>
                    </div>

                    {/* Timing clause */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          1. Visa Process Timeline
                        </h5>
                        <p className="text-slate-400 text-xs pl-3">
                          Party A guarantees that the visa process will be fully processed and decided within <strong className="text-yellow-400">{app.contractApprovedDays || "30 Days"}</strong> from the date of final document submission to the embassy/consulate.
                        </p>
                      </div>
                      <div className="space-y-1 text-right pl-3 pr-3" dir="rtl">
                        <h5 className="text-xs font-black text-yellow-400 uppercase flex items-center justify-end gap-1.5">
                          ۱. د ویزې د پروسس کاري موده
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        </h5>
                        <p className="text-slate-400 text-xs leading-6">
                          لومړی لوری تضمین کوي چې دغه پروسه به د سفارت یا کنسولګرۍ د اسنادو بشپړیدو څخه وروسته په دقیق ډول د <strong className="text-yellow-400">{app.contractApprovedDays || "۳۰"}</strong> ورځو دننه نهایي کیږي.
                        </p>
                      </div>
                    </div>

                    {/* Fees/Payment clause */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          2. Payment Terms (Upon Visa Grant)
                        </h5>
                        <p className="text-slate-400 text-xs pl-3">
                          Party B agrees to pay the final service amount of <strong className="text-yellow-400">{app.contractPaymentAmount || "1000 USD"}</strong> to Party A strictly *after* the visa has been successfully issued and the passport has been handed over. No prepayment of visa service fee is required before approval.
                        </p>
                      </div>
                      <div className="space-y-1 text-right pl-3 pr-3" dir="rtl">
                        <h5 className="text-xs font-black text-yellow-400 uppercase flex items-center justify-end gap-1.5">
                          ۲. د ویزې څخه وروسته د ورکړې شرایط
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        </h5>
                        <p className="text-slate-400 text-xs leading-6">
                          دوهم لوری موافقه کوي چې د ویزې د بریا څخه وروسته به په سمدستي توګه د تړون شوي قیمت <strong className="text-yellow-400">{app.contractPaymentAmount || "۱۰۰۰ ډالر"}</strong> لومړي لوري ته تادیه کوي. د کار څخه مخکې هیڅ فیس نشته.
                        </p>
                      </div>
                    </div>

                    {/* Embassy Official Fee clause */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-500/5 p-4 border border-red-500/10 rounded-2xl">
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          3. Official Embassy Fee Responsibility
                        </h5>
                        <p className="text-slate-400 text-xs pl-3">
                          <strong>Important Notice:</strong> The official visa application fee charged by the Embassy/Consulate shall be paid directly by the Applicant himself and is not included in the service fee outlined above.
                        </p>
                      </div>
                      <div className="space-y-1 text-right pl-3 pr-3" dir="rtl">
                        <h5 className="text-xs font-black text-yellow-400 uppercase flex items-center justify-end gap-1.5">
                          ۳. د سفارت رسمي فیس د تادیې مسؤلیت
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        </h5>
                        <p className="text-slate-400 text-xs leading-6">
                          <strong>مهم یادونه:</strong> په سفارت کې د ویزې رسمي فیس به په خپله د غوښتونکي (Applicant) لخوا تادیه کیږي او د پورته ذکر شوي خدمت فیس کې شامل نه دی.
                        </p>
                      </div>
                    </div>

                    {/* Terms and compliance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-white uppercase">4. Default & Compliance</h5>
                        <p className="text-slate-400 text-xs">
                          If Party A fails to secure the visa within the stated timeframe, the application will be withdrawn and no fee will be charged to Party B. Both parties agree that electronic signatures hold full binding legal authority and can be presented in a court of law.
                        </p>
                      </div>
                      <div className="space-y-1 text-right" dir="rtl">
                        <h5 className="text-xs font-black text-yellow-400 uppercase">۴. مکلفیتونه او پریکړه</h5>
                        <p className="text-slate-400 text-xs leading-6">
                          که لومړی لوری په تړون شوي وخت کې کار ترسره نه کړي، نو پروسه لغوه کیږي او په دوهم لوري هیڅ لګښت نه راځي. دواړه لوري موافقه کوي چې بریښنایي لاسلیک قانوني حیثیت لري او په محکمه کې وړاندې کیدای شي.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Signature Section */}
                  {!app.contractAccepted ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">
                            Type Your Full Name to Sign / د بریښنایي لاسلیک لپاره خپل نوم ولیکئ
                          </label>
                          <input
                            type="text"
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            placeholder="e.g. Agency Director Name"
                            className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs focus:border-yellow-400/50 focus:outline-none text-white placeholder-slate-600"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={handleSignContract}
                            disabled={signing || !signatureName.trim()}
                            className="w-full py-3 bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
                          >
                            {signing ? "Signing..." : "Accept & Sign Contract / تړون لاسلیک کړئ"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FiCheckCircle size={14} /> Contract Digitally Signed & Active
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Signed electronically by {app.contractSignatureName} on {app.contractAcceptedAt ? new Date(app.contractAcceptedAt).toLocaleString() : ""}
                        </p>
                      </div>
                      <div className="px-4 py-2 border border-dashed border-emerald-500/30 rounded-xl font-mono text-emerald-400 font-bold text-xs uppercase select-none">
                        {app.contractSignatureName} // SIGNED
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* 2. Interactive Dossier Section Navigator / Tab Switcher */}
          <div className="bg-[#0f172a] border border-slate-800/80 p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-thin shadow-lg">
            {[
              { id: "overview", label: "Complete Dossier", icon: <FiLayers size={13} /> },
              { id: "embassy", label: `Embassy & Visa (${officialIssuanceDocs.length})`, icon: <FiAward size={13} />, highlight: officialIssuanceDocs.length > 0 },
              { id: "personal", label: "Personal & Contact", icon: <FiUser size={13} /> },
              { id: "visa", label: "Visa & Journey", icon: <FiGlobe size={13} /> },
              { id: "family", label: "Family Records", icon: <FiUsers size={13} /> },
              { id: "career", label: "Education & Career", icon: <FiBriefcase size={13} /> },
              { id: "passport", label: "Passport & Travel", icon: <FiBook size={13} /> },
              { id: "documents", label: `Applicant Documents (${normalDocs.length})`, icon: <FiPaperclip size={13} /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/15"
                      : tab.highlight
                      ? "text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Redesigned Premium Application Layout Content */}
          <div className="space-y-6">

            {/* SPECIAL DEDICATED SECTION: OFFICIAL EMBASSY CONFIRMATION & APPROVED VISA GRANTS */}
            {(activeTab === "overview" || activeTab === "embassy") && (officialIssuanceDocs.length > 0 || activeTab === "embassy") && (
              <div className="space-y-4">
                {/* 1. Official Approved Visa Card */}
                {officialVisaDocs.length > 0 && (
                  <div className="bg-gradient-to-r from-emerald-950/60 via-[#0f172a] to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 blur-[100px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                          <FiAward size={24} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <FiCheckCircle size={12} /> OFFICIAL VISA ISSUED & APPROVED
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">Consular Grant</span>
                          </div>
                          <h4 className="text-base font-black text-white">
                            Official Approved Visa / eVisa Grant
                          </h4>
                          <p className="text-xs text-slate-300">
                            The visa has been officially approved and issued by the consular authority. Download your official visa grant below.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0 self-start sm:self-auto">
                        {officialVisaDocs.map((visaDoc: any) => (
                          <div key={visaDoc.id} className="flex gap-2">
                            <a
                              href={visaDoc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-slate-900 border border-emerald-500/40 text-emerald-400 font-black text-xs rounded-xl hover:bg-slate-850 transition-all flex items-center gap-1.5"
                            >
                              <FiEye size={14} /> View eVisa
                            </a>
                            <button
                              type="button"
                              onClick={(e) => handleDownloadSingle(visaDoc, e)}
                              disabled={downloadingDocId === visaDoc.id}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-xs rounded-xl hover:scale-105 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-60"
                            >
                              {downloadingDocId === visaDoc.id ? (
                                <FiLoader className="animate-spin" size={13} />
                              ) : (
                                <FiDownload size={13} />
                              )}
                              <span>Download Visa</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Official Embassy Submission Confirmation Slip Card */}
                {submissionSlipDocs.length > 0 && (
                  <div className="bg-gradient-to-r from-cyan-950/60 via-[#0f172a] to-slate-900 border border-cyan-500/40 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                          <FiSend size={20} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">
                              Embassy / Consular Confirmation
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[9px] font-bold">
                              Registered
                            </span>
                          </div>
                          <h4 className="text-sm md:text-base font-black text-white">
                            Embassy Submission Slip & Email Confirmation
                          </h4>
                          <p className="text-xs text-slate-400">
                            Official proof that your dossier was submitted to the embassy desk for review.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0 self-start sm:self-auto">
                        {submissionSlipDocs.map((subDoc: any) => (
                          <div key={subDoc.id} className="flex gap-2">
                            <a
                              href={subDoc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-slate-900 border border-cyan-500/30 text-cyan-400 font-bold text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5"
                            >
                              <FiEye size={13} /> View Slip
                            </a>
                            <button
                              type="button"
                              onClick={(e) => handleDownloadSingle(subDoc, e)}
                              disabled={downloadingDocId === subDoc.id}
                              className="px-4 py-2 bg-cyan-500 text-black font-black text-xs rounded-xl hover:bg-cyan-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/10 disabled:opacity-60"
                            >
                              {downloadingDocId === subDoc.id ? (
                                <FiLoader className="animate-spin" size={13} />
                              ) : (
                                <FiDownload size={13} />
                              )}
                              <span>Download Slip</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state if in embassy tab and nothing uploaded yet */}
                {activeTab === "embassy" && officialIssuanceDocs.length === 0 && (
                  <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 flex items-center justify-center mx-auto">
                      <FiAward size={24} />
                    </div>
                    <h4 className="text-sm font-black text-white">Embassy Outputs In Progress</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Official embassy submission confirmations and approved visa certificates will be published in this dedicated section as the processing advances.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: OVERVIEW (ALL CATEGORIES GROUPED IN SLEEK BENTO GRIDS) */}
            {(activeTab === "overview" || activeTab === "personal") && (
              <SectionCard title="Applicant & Personal Details" icon={<FiUser size={16} />} badge="Profile">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailBox icon={<FiUser />} label="Full Legal Name" value={clientUser?.name} highlight />
                  <DetailBox icon={<FiBook />} label="Passport No" value={client?.passportNumber} mono copyable />
                  <DetailBox icon={<FiCalendar />} label="Date of Birth" value={client?.dob} />
                  <DetailBox icon={<FiGlobe />} label="Nationality" value={client?.nationality || "Afghanistan"} badge badgeColor="blue" />
                  <DetailBox icon={<FiUser />} label="Gender" value={client?.gender} />
                  <DetailBox icon={<FiMapPin />} label="Birth Place" value={client?.birthPlace} />
                  <DetailBox icon={<FiShield />} label="Religion" value={client?.religion} />
                  <DetailBox icon={<FiBriefcase />} label="Profession" value={client?.profession} />
                  <DetailBox icon={<FiMail />} label="Email Address" value={clientUser?.email} isLink href={`mailto:${clientUser?.email}`} />
                  <DetailBox icon={<FiPhone />} label="Phone / WhatsApp" value={client?.phone} isLink href={client?.phone ? `https://wa.me/${client.phone.replace(/[^0-9]/g, "")}` : undefined} />
                  <DetailBox icon={<FiPhone />} label="Emergency Contact" value={client?.emergencyContact} />
                  <DetailBox icon={<FiAward />} label="Qualification" value={client?.qualification} />
                </div>
                {client?.currentAddress && (
                  <div className="pt-2">
                    <DetailBox icon={<FiMapPin />} label="Current Residential Address" value={client.currentAddress} />
                  </div>
                )}
              </SectionCard>
            )}

            {(activeTab === "overview" || activeTab === "visa") && (
              <SectionCard title="Visa & Journey Specifications" icon={<FiGlobe size={16} />} badge="Specifications">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailBox icon={<FiGlobe />} label="Destination" value={app.country} badge badgeColor="yellow" />
                  <DetailBox icon={<FiFileText />} label="Visa Category" value={app.visaCategory} highlight />
                  <DetailBox icon={<FiClock />} label="Stay Duration" value={app.duration ? `${app.duration} Days` : "30 Days"} />
                  <DetailBox icon={<FiShield />} label="Entry Type" value={app.entryType || "Single Entry"} />
                  <DetailBox icon={<FiCalendar />} label="Planned Travel" value={app.travelDate || "Flexible"} />
                  <DetailBox icon={<FiCalendar />} label="Return Date" value={app.returnDate || "Open"} />
                  <DetailBox icon={<FiDollarSign />} label="Official Fee" value={`$${app.packagePrice || app.package?.priceUSD || 250} USD`} mono highlight />
                  <DetailBox icon={<FiLayers />} label="Package Tier" value={app.package?.title || "Standard Service"} />
                </div>
                {(app.purpose || app.sponsor || app.reference) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {app.purpose && <DetailBox icon={<FiFileText />} label="Purpose of Visit" value={app.purpose} />}
                    {app.sponsor && <DetailBox icon={<FiUser />} label="Sponsor Details" value={app.sponsor} />}
                    {app.reference && <DetailBox icon={<FiLayers />} label="Reference / Notes" value={app.reference} />}
                  </div>
                )}
              </SectionCard>
            )}

            {(activeTab === "overview" || activeTab === "family") && (
              <SectionCard title="Official Family & Civil Records" icon={<FiUsers size={16} />} badge="Family">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailBox icon={<FiUser />} label="Father's Full Name" value={client?.fatherName} />
                  <DetailBox icon={<FiUser />} label="Mother's Full Name" value={client?.motherName} />
                  <DetailBox icon={<FiUsers />} label="Marital Status" value={client?.maritalStatus || "Single"} badge badgeColor={client?.maritalStatus === "Married" ? "emerald" : "slate"} />
                  <DetailBox icon={<FiUsers />} label="Children Count" value={client?.childrenCount !== undefined ? `${client.childrenCount} Children` : "0"} mono />
                  {client?.maritalStatus === "Married" && (
                    <>
                      <DetailBox icon={<FiUser />} label="Spouse / Wife Name" value={client?.spouseName} highlight />
                      <div className="col-span-2 sm:col-span-3">
                        <DetailBox icon={<FiUsers />} label="Children Details" value={client?.childrenDetails || "None specified"} />
                      </div>
                    </>
                  )}
                </div>
              </SectionCard>
            )}

            {(activeTab === "overview" || activeTab === "career") && (
              <SectionCard title="Education & Professional Background" icon={<FiBriefcase size={16} />} badge="Career">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailBox icon={<FiBriefcase />} label="Company / Employer" value={client?.companyName} />
                  <DetailBox icon={<FiAward />} label="Position / Role" value={client?.position} />
                  <DetailBox icon={<FiDollarSign />} label="Monthly Salary" value={client?.salary} mono />
                  <DetailBox icon={<FiClock />} label="Work Experience" value={client?.experienceYears ? `${client.experienceYears} Years` : null} />
                  <DetailBox icon={<FiBook />} label="Bachelor Degree" value={client?.bachelor} />
                  <DetailBox icon={<FiBook />} label="Master Degree" value={client?.master} />
                  <DetailBox icon={<FiCalendar />} label="Graduation Year" value={client?.graduationYear} mono />
                  <DetailBox icon={<FiAward />} label="CGPA / Grade" value={client?.cgpa} mono />
                </div>
                {client?.employerAddress && (
                  <div className="pt-2">
                    <DetailBox icon={<FiMapPin />} label="Employer Office Address" value={client.employerAddress} />
                  </div>
                )}
              </SectionCard>
            )}

            {(activeTab === "overview" || activeTab === "passport") && (
              <SectionCard title="Passport & Travel History" icon={<FiBook size={16} />} badge="Passport">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailBox icon={<FiBook />} label="Passport Number" value={client?.passportNumber} mono copyable highlight />
                  <DetailBox icon={<FiCalendar />} label="Issue Date" value={client?.passportIssueDate} />
                  <DetailBox icon={<FiCalendar />} label="Expiry Date" value={client?.passportExpiryDate} />
                  <DetailBox icon={<FiMapPin />} label="Issue Place" value={client?.passportIssuePlace} />
                  <DetailBox icon={<FiBook />} label="Previous Passport" value={app.previousPassportNumber} mono />
                  <DetailBox icon={<FiGlobe />} label="Visited Countries" value={app.visitedCountries} />
                  <DetailBox icon={<FiFileText />} label="Previous Visas" value={app.previousVisas} />
                  <DetailBox icon={<FiAlertCircle />} label="Visa Refusals" value={app.visaRefusals} />
                </div>
              </SectionCard>
            )}

            {/* Applicant Uploaded Documents Section (Excludes Embassy Confirmations & Approved Visas) */}
            {(activeTab === "overview" || activeTab === "documents") && (
              <div className="bg-[#0f172a] border border-slate-800/80 rounded-3xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800/60 bg-slate-900/40">
                  <div className="flex items-center gap-2.5">
                    <span className="text-yellow-400 p-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                      <FiPaperclip size={16} />
                    </span>
                    <div>
                      <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">
                        Applicant Submitted Dossier Documents
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {normalDocs.length} applicant uploaded files
                      </p>
                    </div>
                  </div>

                  {normalDocs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadAllZip}
                      disabled={downloadingZip}
                      className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-black font-black text-xs rounded-xl hover:bg-yellow-300 transition-all cursor-pointer shadow-md shadow-yellow-400/10 disabled:opacity-60"
                      title="Download all files in a single ZIP named with Applicant Name and Tracking ID"
                    >
                      {downloadingZip ? (
                        <>
                          <FiLoader className="animate-spin" size={13} /> Packaging ZIP...
                        </>
                      ) : (
                        <>
                          <FiArchive size={13} /> Download All (ZIP)
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Documents List */}
                {normalDocs.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    No applicant dossier documents uploaded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/40">
                    {normalDocs.map((doc: any) => {
                      const ext = doc.fileName?.split(".").pop()?.toLowerCase() || doc.fileType || "";
                      const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                      const sizeKB = doc.fileSize ? (doc.fileSize / 1024).toFixed(1) : null;

                      return (
                        <div key={doc.id} className="flex items-center gap-3.5 p-4 hover:bg-slate-900/40 transition-colors group">
                          {/* Icon */}
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isImage
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              : "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                          }`}>
                            {isImage ? <FiImage size={18} /> : <FiFileText size={18} />}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs md:text-sm font-bold text-white capitalize truncate">
                                {doc.documentType.replace(/_/g, " ")}
                              </p>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 uppercase font-mono">
                                .{ext}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{doc.fileName}</span>
                              {sizeKB && <span className="text-[10px] text-slate-600">· {sizeKB} KB</span>}
                              <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                                <FiCheck size={10} /> Verified
                              </span>
                            </div>
                          </div>

                          {/* Image Thumbnail */}
                          {isImage && (
                            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0 hidden sm:block">
                              <img
                                src={doc.fileUrl}
                                alt={doc.documentType}
                                className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-slate-900 border border-slate-800 hover:border-blue-400/40 text-slate-400 hover:text-blue-400 rounded-xl transition-all"
                              title="View Document in new tab"
                            >
                              <FiEye size={13} />
                            </a>
                            <button
                              type="button"
                              onClick={(e) => handleDownloadSingle(doc, e)}
                              disabled={downloadingDocId === doc.id}
                              className="p-2 bg-slate-900 border border-slate-800 hover:border-yellow-400/40 text-slate-400 hover:text-yellow-400 rounded-xl transition-all cursor-pointer disabled:opacity-60"
                              title={`Download ${getDocFileName(doc)}`}
                            >
                              {downloadingDocId === doc.id ? (
                                <FiLoader className="animate-spin text-yellow-400" size={13} />
                              ) : (
                                <FiDownload size={13} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-6">

          {/* Application Status Pipeline */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Application Status</h4>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                {app.trackingId}
              </span>
            </div>

            <div className="space-y-1">
              {STATUS_PIPELINE.map((stage, idx) => {
                const isCompleted = currentStatusIdx > idx;
                const isCurrent = currentStatusIdx === idx;
                const isPending = currentStatusIdx < idx;

                return (
                  <div key={stage.key} className="flex items-start gap-3">
                    {/* Icon + Line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        isCurrent
                          ? "bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                          : isCompleted
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : "bg-slate-900 border-slate-700 text-slate-600"
                      }`}>
                        {isCurrent ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
                        ) : isCompleted ? (
                          <FiCheckCircle size={13} />
                        ) : (
                          <FiCircle size={11} />
                        )}
                      </div>
                      {idx < STATUS_PIPELINE.length - 1 && (
                        <div className={`w-0.5 h-5 mt-1 rounded-full ${
                          isCompleted ? "bg-green-500/40" : "bg-slate-800"
                        }`} />
                      )}
                    </div>

                    {/* Label */}
                    <div className={`pt-0.5 pb-4 ${isPending ? "opacity-40" : ""}`}>
                      <p className={`text-xs font-bold ${isCurrent ? "text-yellow-400" : isCompleted ? "text-green-400" : "text-slate-400"}`}>
                        {stage.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}

              {/* Terminal states not in pipeline */}
              {(app.status === "REJECTED" || app.status === "ARCHIVED") && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 bg-red-500/10 border-red-500 text-red-400">
                    <FiAlertCircle size={13} />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs font-bold text-red-400">
                      {app.status === "REJECTED" ? "Rejected" : "Archived"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {app.status === "REJECTED" ? "Application was not approved" : "File has been archived"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Status History */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-6 shadow-xl">
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <FiClock size={14} className="text-yellow-400" /> Recent Updates
            </h4>

            {statusHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-600">
                No status updates yet
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {[...statusHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((entry: any, i: number) => (
                  <div key={entry.id || i} className="flex gap-3">
                    <div className="mt-1 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[entry.status]?.includes("green") ? "bg-green-400" : STATUS_COLORS[entry.status]?.includes("yellow") ? "bg-yellow-400" : STATUS_COLORS[entry.status]?.includes("red") ? "bg-red-400" : "bg-blue-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[entry.status] || STATUS_COLORS.DRAFT}`}>
                          {entry.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-[9px] text-slate-600 font-mono shrink-0">
                          {new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          {" "}
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiCalendar size={14} className="text-yellow-400" /> File Details
            </h4>
            <div className="space-y-3">
              {[
                { label: "Submitted", value: new Date(app.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
                { label: "Last Updated", value: new Date(app.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
                { label: "Agent Code", value: app.agent?.agentCode || "—" },
                { label: "Agency", value: app.agent?.agencyName || "—" },
                { label: "Sponsor", value: app.sponsor || "—" },
                { label: "Reference", value: app.reference || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</span>
                  <span className="text-xs text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
