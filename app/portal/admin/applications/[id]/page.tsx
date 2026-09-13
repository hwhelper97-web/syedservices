"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FiFileText, FiUser, FiGlobe, FiAlertCircle, 
  FiCpu, FiCopy, FiLoader, FiCheckCircle, FiDownload, 
  FiCornerDownRight, FiArrowLeft, FiEye, FiImage, FiArchive, FiPaperclip, FiPrinter, FiDollarSign,
  FiUploadCloud, FiAward, FiSend, FiShield, FiMessageSquare, FiSliders
} from "react-icons/fi";
import Link from "next/link";
import { VISA_STATUS_OPTIONS } from "@/lib/visaPipeline";
import PortalToast, { ToastMessage } from "@/components/PortalToast";

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appIdStr = params.id as string;
  
  const [app, setApp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [contractDays, setContractDays] = useState("30 Days");
  const [contractAmount, setContractAmount] = useState("1000 USD");
  const [contractFirstParty, setContractFirstParty] = useState("Eng Syed Saif Ur Rehman");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Download states
  const [downloadingDocId, setDownloadingDocId] = useState<number | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Admin upload states for Submission Confirmation and Approved Visa
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [uploadingSubmission, setUploadingSubmission] = useState(false);
  const [submissionRemarks, setSubmissionRemarks] = useState("");

  const [approvedVisaFile, setApprovedVisaFile] = useState<File | null>(null);
  const [uploadingVisa, setUploadingVisa] = useState(false);
  const [visaGrantNumber, setVisaGrantNumber] = useState("");
  const [visaExpiryDate, setVisaExpiryDate] = useState("");

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handleUploadSubmissionProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionFile) {
      showToast("Please choose a submission confirmation document or screenshot to upload.", "error");
      return;
    }

    setUploadingSubmission(true);
    try {
      const formData = new FormData();
      formData.append("documentType", "submission_confirmation");
      formData.append("file", submissionFile);

      const res = await fetch(`/api/applications/${appIdStr}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to upload submission confirmation");
      }

      showToast("Embassy submission confirmation uploaded and dispatched to client!", "success");
      setSubmissionFile(null);
      setSubmissionRemarks("");
      fetchApplicationDetails();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploadingSubmission(false);
    }
  };

  const handleUploadApprovedVisa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvedVisaFile) {
      showToast("Please select the official approved visa file to upload.", "error");
      return;
    }

    setUploadingVisa(true);
    try {
      const formData = new FormData();
      formData.append("documentType", "approved_visa");
      formData.append("file", approvedVisaFile);

      const res = await fetch(`/api/applications/${appIdStr}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to upload approved visa");
      }

      showToast("🎉 Approved Visa uploaded! Application status marked as APPROVED.", "success");
      setApprovedVisaFile(null);
      setVisaGrantNumber("");
      setVisaExpiryDate("");
      fetchApplicationDetails();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploadingVisa(false);
    }
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
      // Fallback: trigger link click
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

  // AI Assistant states
  const [aiAction, setAiAction] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [appIdStr]);

  const fetchApplicationDetails = async () => {
    try {
      const res = await fetch(`/api/applications/${appIdStr}`);
      const data = await res.json();
      if (res.ok) {
        setApp(data.application);
        setStatus(data.application.status);
        setContractDays(data.application.contractApprovedDays || "30 Days");
        setContractAmount(data.application.contractPaymentAmount || "1000 USD");
        setContractFirstParty(data.application.contractFirstPartyName || "Eng Syed Saif Ur Rehman");
      }
    } catch (e) {
      console.error("Failed to load application", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    const payload: any = { status, notes };
    if (status === "DEAL_CONFIRMED") {
      payload.contractApprovedDays = contractDays;
      payload.contractPaymentAmount = contractAmount;
      payload.contractFirstPartyName = contractFirstParty;
    }

    try {
      const res = await fetch(`/api/applications/${appIdStr}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast("Application status updated successfully!", "success");
        setNotes("");
        fetchApplicationDetails();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || "Failed to update status", "error");
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Network error while updating status", "error");
    } finally {
      setUpdating(false);
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
                    ${app.contractFirstPartyName || "Eng Syed Saif Ur Rehman"}<br>
                    <span style="color: #64748b; font-size: 11px;">Syed Services Ltd. - Authorized Representative Visa Processing Office</span>
                  </td>
                  <td style="text-align: right;" dir="rtl">
                    <strong>لومړی لوری (الف لوری):</strong><br>
                    ${app.contractFirstPartyName || "Eng Syed Saif Ur Rehman"}<br>
                    <span style="color: #64748b; font-size: 11px;">د سید خدماتو رسمي او باصلاحیته اداره</span>
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
                  که چیرې لومړی لوری ونه توانیږي چې په ټاکل شوي وخت (${app.contractApprovedDays || "۳۰"} ورځو) کې د غوښتونکي ویزه پروسس کړي, تړون لغوه کیږي او په دوهم لوري هیڅ لګښت نه راځي. دواړه لوري موافقه کوي چې بریښنایي لاسلیکونه بشپړ قانوني اعتبار لري او په محکمه کې د وړاندې کولو وړ دي.
                </p>
              </div>
            </div>
            
            <div class="signature-section">
              <div class="sig-block">
                <div class="sig-title">First Party (Party A) / لومړی لوری</div>
                <div class="sig-name">${app.contractFirstPartyName || "Eng Syed Saif Ur Rehman"}</div>
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

  const triggerAI = async (action: string) => {
    setAiAction(action);
    setAiLoading(true);
    setAiOutput("");
    
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          applicationId: appIdStr,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiOutput(data.text);
      } else {
        setAiOutput(`❌ Error: ${data.error || "Failed to trigger AI"}`);
      }
    } catch (e: any) {
      setAiOutput(`❌ Error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-yellow-400">
        <FiLoader className="animate-spin" size={32} />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12 space-y-4">
        <FiAlertCircle className="text-red-500 text-4xl mx-auto" />
        <h4 className="text-white font-bold">Application Not Found</h4>
        <Link href="/portal/admin" className="text-xs text-yellow-400 hover:underline">
          Back to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <PortalToast toast={toast} onClose={() => setToast(null)} />

      {/* Top Breadcrumb & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 px-5 py-3.5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Link 
            href="/portal/admin/applications" 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl"
          >
            <FiArrowLeft size={14} /> Back to Applications
          </Link>
          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">File:</span>
            <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded-lg border border-yellow-400/20 flex items-center gap-1.5">
              {app.trackingId || `APP-${app.id}`}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(app.trackingId || `APP-${app.id}`);
                  showToast("Tracking code copied to clipboard", "info");
                }}
                className="hover:text-white cursor-pointer"
                title="Copy Tracking ID"
              >
                <FiCopy size={11} />
              </button>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {app.client?.phone && (
            <a
              href={`https://wa.me/${app.client.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-xl text-xs font-bold transition-all"
            >
              <FiMessageSquare size={13} /> WhatsApp
            </a>
          )}
          <button
            onClick={handlePrintContract}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-slate-300 hover:text-yellow-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FiPrinter size={13} /> Print Contract
          </button>
          {app.documents?.length > 0 && (
            <button
              onClick={handleDownloadAllZip}
              disabled={downloadingZip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 text-black rounded-xl text-xs font-black hover:bg-yellow-300 transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-yellow-400/10"
            >
              {downloadingZip ? <FiLoader className="animate-spin" size={13} /> : <FiArchive size={13} />}
              <span>Download Files (ZIP)</span>
            </button>
          )}
        </div>
      </div>

      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#131e3a] to-[#0f172a] border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-xl font-black text-yellow-400 shrink-0 shadow-inner">
              {(app.client?.user?.name || "A")[0]?.toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black uppercase tracking-wider">
                  {app.country} · {app.visaCategory}
                </span>
                {app.package && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                    Tier: {app.package.title}
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {app.client?.user?.name || "Applicant"}
              </h2>
              <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Email: <strong className="text-slate-200">{app.client?.user?.email || "N/A"}</strong></span>
                <span>Phone: <strong className="text-slate-200">{app.client?.phone || "N/A"}</strong></span>
                <span>Applied: <strong className="text-slate-300 font-mono">{new Date(app.createdAt).toLocaleDateString()}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Current Dossier Status</span>
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
                app.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                app.status === "REJECTED" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" :
                "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {app.status?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="text-left md:text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Official Visa Pricing</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                ${app.packagePrice || app.package?.priceUSD || 250} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balanced 2-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Full Comprehensive Dossier & Verified Documents */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Visa Parameters & Package Breakdown Card */}
          <div className="bg-[#0f172a] border border-slate-800 p-5 md:p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiGlobe className="text-yellow-400" size={15} /> Visa & Journey Specifications
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {app.entryType || "Single Entry"} · {app.duration || "30 Days"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Destination</span>
                <strong className="text-white font-bold">{app.country}</strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Visa Category</span>
                <strong className="text-white font-bold">{app.visaCategory}</strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Duration</span>
                <strong className="text-white font-bold">{app.duration || app.package?.duration || "30 Days"}</strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Planned Travel</span>
                <strong className="text-white font-bold">{app.travelDate || "Flexible"}</strong>
              </div>
            </div>

            {/* Package Checklist if available */}
            {app.package?.documents && (
              <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-850 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FiPaperclip className="text-yellow-400" /> Package Mandatory Checklist:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {app.package.documents.split("\n").filter(Boolean).map((d: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      {d.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Official Parents & Family Civil Records */}
          <div className="bg-[#0f172a] border border-slate-800 p-5 md:p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiUser className="text-yellow-400" size={15} /> Official Parents & Family Details
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                app.client?.maritalStatus === "Married"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-900 text-slate-400 border-slate-800"
              }`}>
                {app.client?.maritalStatus || "Single"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Father's Full Name</span>
                <strong className="text-white text-xs block mt-0.5">{app.client?.fatherName || "Not provided"}</strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Mother's Full Name</span>
                <strong className="text-white text-xs block mt-0.5">{app.client?.motherName || "Not provided"}</strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Marital Status</span>
                <strong className="text-white text-xs block mt-0.5">{app.client?.maritalStatus || "Single"}</strong>
              </div>

              {app.client?.maritalStatus === "Married" && (
                <>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Spouse / Wife Name</span>
                    <strong className="text-yellow-400 text-xs block mt-0.5">{app.client?.spouseName || "Not provided"}</strong>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Children Count</span>
                    <strong className="text-white text-xs font-mono block mt-0.5">{app.client?.childrenCount ?? 0} Children</strong>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Children Details</span>
                    <span className="text-slate-300 text-[11px] block mt-0.5">{app.client?.childrenDetails || "None specified"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. Official Passport & Identification */}
          <div className="bg-[#0f172a] border border-slate-800 p-5 md:p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiFileText className="text-yellow-400" size={15} /> Official Passport & Identification
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {app.client?.nationality || "Afghan / Pakistani"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Passport Number</span>
                <strong className="text-white font-mono text-xs block mt-0.5">{app.client?.passportNumber || "N/A"}</strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Passport Expiry</span>
                <strong className="text-white font-mono text-xs block mt-0.5">{app.client?.passportExpiryDate || "N/A"}</strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Issue Date / Place</span>
                <span className="text-slate-300 text-xs block mt-0.5">
                  {app.client?.passportIssueDate || "N/A"} ({app.client?.passportIssuePlace || "N/A"})
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">DOB & Gender</span>
                <span className="text-slate-300 text-xs block mt-0.5">
                  {app.client?.dob || "N/A"} ({app.client?.gender || "N/A"})
                </span>
              </div>
            </div>
          </div>

          {/* 4. Official Addresses & Employment */}
          <div className="bg-[#0f172a] border border-slate-800 p-5 md:p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiGlobe className="text-yellow-400" size={15} /> Residential Addresses & Professional Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block mb-1">
                  Current Residence Address (حالیه استوګنځی)
                </span>
                <p className="font-bold text-white text-xs leading-snug">
                  {app.client?.currentAddress || "Not provided"}
                </p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block mb-1">
                  Permanent Origin Address (اصلي استوګنځی)
                </span>
                <p className="font-bold text-slate-300 text-xs leading-snug">
                  {app.client?.permanentAddress || "Not provided"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Profession</span>
                <strong className="text-white text-xs block mt-0.5">{app.client?.profession || "N/A"}</strong>
              </div>
              <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Company</span>
                <strong className="text-white text-xs block mt-0.5">{app.client?.companyName || "N/A"}</strong>
              </div>
              <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Monthly Salary</span>
                <strong className="text-emerald-400 font-mono text-xs block mt-0.5">${app.client?.salary || "0"}/mo</strong>
              </div>
              <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Qualification</span>
                <strong className="text-white text-xs block mt-0.5">{app.client?.bachelor || app.client?.qualification || "N/A"}</strong>
              </div>
            </div>
          </div>

          {/* 5. Documents Vault */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <FiPaperclip className="text-yellow-400" size={16} />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Client Support Documents ({app.documents?.length || 0})
                </h4>
              </div>
              {app.documents?.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={downloadingZip}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-black font-black text-xs rounded-xl hover:bg-yellow-300 transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-yellow-400/10"
                >
                  {downloadingZip ? <FiLoader className="animate-spin" size={13} /> : <FiArchive size={13} />}
                  <span>Download ZIP</span>
                </button>
              )}
            </div>

            <div className="p-3">
              {(!app.documents || app.documents.length === 0) ? (
                <p className="text-xs text-slate-500 text-center py-6">No documents uploaded by client yet.</p>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {app.documents.map((doc: any) => {
                    const ext = doc.fileName?.split(".").pop()?.toLowerCase() || doc.fileType || "";
                    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                    const sizeKB = doc.fileSize ? (doc.fileSize / 1024).toFixed(1) : null;

                    return (
                      <div key={doc.id} className="flex items-center gap-3 p-3 hover:bg-slate-900/40 transition-colors rounded-xl group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isImage ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                        }`}>
                          {isImage ? <FiImage size={18} /> : <FiFileText size={18} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white capitalize truncate">
                            {doc.documentType.replace(/_/g, " ")}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {doc.fileName} {sizeKB && `· ${sizeKB} KB`} · <span className="uppercase text-slate-500">.{ext}</span>
                          </p>
                        </div>

                        {isImage && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0 hidden sm:block">
                            <img
                              src={doc.fileUrl}
                              alt={doc.documentType}
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-900 border border-slate-800 hover:border-blue-400/30 text-slate-400 hover:text-blue-400 rounded-xl text-xs transition-all"
                            title="View in Tab"
                          >
                            <FiEye size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => handleDownloadSingle(doc, e)}
                            disabled={downloadingDocId === doc.id}
                            className="p-2 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-slate-400 hover:text-yellow-400 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-60"
                            title="Download File"
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
          </div>
        </div>

        {/* Right Column (5 cols): Pipeline Control, Embassy/Visa Dispatch, Billing & AI Assistant */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Status & Pipeline Lifecycle Stepper */}
          <div className="bg-[#0f172a] border border-slate-800 p-5 md:p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiSliders className="text-yellow-400" size={15} /> Application Status Controller
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Advance Processing Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-yellow-400 rounded-xl text-xs text-white focus:outline-none"
                >
                  {VISA_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Update Log Note / Internal Remarks
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. File verified with embassy desk"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-yellow-400 rounded-xl text-xs text-white focus:outline-none placeholder-slate-600"
                />
              </div>

              {status === "DEAL_CONFIRMED" && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Approval Days</label>
                    <input
                      type="text"
                      value={contractDays}
                      onChange={e => setContractDays(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Fee after Visa</label>
                    <input
                      type="text"
                      value={contractAmount}
                      onChange={e => setContractAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleUpdateStatus}
                disabled={updating || (status === app.status && status !== "DEAL_CONFIRMED")}
                className="w-full py-2.5 bg-yellow-400 text-black font-black text-xs rounded-xl hover:bg-yellow-300 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-yellow-400/10 flex items-center justify-center gap-1.5"
              >
                {updating ? <FiLoader className="animate-spin" /> : <FiCheckCircle />}
                <span>{updating ? "Saving Update..." : "Update Pipeline Status"}</span>
              </button>
            </div>
          </div>

          {/* 2. Official Embassy Submission Confirmation Dispatcher */}
          <div className="bg-[#0f172a] border border-cyan-500/30 p-5 md:p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FiSend className="text-cyan-400" size={15} />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Embassy Submission Slip Dispatcher
                </h4>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                Client View
              </span>
            </div>

            {/* Check if already uploaded */}
            {app.documents?.some((d: any) => d.documentType === "submission_confirmation") && (
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                    <FiCheckCircle size={12} /> Active Submission Proof Attached
                  </span>
                </div>
                {app.documents.filter((d: any) => d.documentType === "submission_confirmation").map((subDoc: any) => (
                  <div key={subDoc.id} className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-200 font-mono text-[11px] truncate max-w-[150px]">{subDoc.fileName}</span>
                    <div className="flex gap-1.5">
                      <a
                        href={subDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-slate-900 text-cyan-400 rounded-lg text-[11px] font-bold"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadSingle(subDoc, e)}
                        className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleUploadSubmissionProof} className="space-y-3">
              <label className="w-full py-4 border border-dashed border-slate-800 hover:border-cyan-400/40 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-slate-950/60">
                <FiUploadCloud className="text-cyan-400" size={20} />
                <span className="text-xs font-semibold text-slate-300 truncate max-w-[220px]">
                  {submissionFile ? submissionFile.name : "Choose Embassy Email / Slip"}
                </span>
                <span className="text-[9px] text-slate-500">PDF, JPG, PNG up to 15MB</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setSubmissionFile(e.target.files[0])}
                />
              </label>

              <button
                type="submit"
                disabled={uploadingSubmission || !submissionFile}
                className="w-full py-2.5 bg-cyan-500 text-black font-black text-xs rounded-xl hover:bg-cyan-400 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-500/10 flex items-center justify-center gap-1.5"
              >
                {uploadingSubmission ? <FiLoader className="animate-spin" /> : <FiSend />}
                <span>{uploadingSubmission ? "Dispatching..." : "Upload & Send Proof to Client"}</span>
              </button>
            </form>
          </div>

          {/* 3. Official Approved Visa / eVisa Grant Dispatcher */}
          <div className="bg-[#0f172a] border border-emerald-500/40 p-5 md:p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FiAward className="text-emerald-400" size={16} />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Approved Visa / eVisa Dispatcher
                </h4>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                Final Issuance
              </span>
            </div>

            {/* Check if approved visa is attached */}
            {app.documents?.some((d: any) => ["approved_visa", "issued_visa"].includes(d.documentType)) && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <FiCheckCircle size={12} /> Official Visa Document Attached
                </span>
                {app.documents.filter((d: any) => ["approved_visa", "issued_visa"].includes(d.documentType)).map((visaDoc: any) => (
                  <div key={visaDoc.id} className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-200 font-mono text-[11px] truncate max-w-[150px]">{visaDoc.fileName}</span>
                    <div className="flex gap-1.5">
                      <a
                        href={visaDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-bold"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadSingle(visaDoc, e)}
                        className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleUploadApprovedVisa} className="space-y-3">
              <label className="w-full py-4 border border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-slate-950/60">
                <FiAward className="text-emerald-400" size={22} />
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[220px]">
                  {approvedVisaFile ? approvedVisaFile.name : "Choose Official Approved Visa File"}
                </span>
                <span className="text-[9px] text-slate-500">eVisa PDF or High-Res Sticker Scan</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setApprovedVisaFile(e.target.files[0])}
                />
              </label>

              <button
                type="submit"
                disabled={uploadingVisa || !approvedVisaFile}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs rounded-xl hover:from-emerald-400 hover:to-teal-300 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                {uploadingVisa ? <FiLoader className="animate-spin" /> : <FiAward />}
                <span>{uploadingVisa ? "Uploading & Delivering..." : "Issue Approved Visa to Client"}</span>
              </button>
            </form>
          </div>

          {/* 4. Billing Ledger & Invoices */}
          <div className="bg-[#0f172a] border border-slate-800 p-5 md:p-6 rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiDollarSign className="text-yellow-400" size={15} /> Billing & Invoices
              </h3>
              <Link href="/portal/admin/payments" className="text-[10px] text-yellow-400 font-bold hover:underline">
                View Ledger →
              </Link>
            </div>

            {(!app.invoices || app.invoices.length === 0) ? (
              <p className="text-xs text-slate-500 py-3 text-center">No invoices linked to this file.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {app.invoices.map((inv: any) => (
                  <div key={inv.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-white text-xs">{inv.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "7 Days"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-400 text-xs">${inv.totalAmount} USD</span>
                      <span className={`block text-[9px] font-bold uppercase ${inv.status === "PAID" ? "text-emerald-400" : "text-amber-400"}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. AI Assistant & File Audit Console */}
          <div className="bg-[#0f172a] border border-slate-800 p-5 md:p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiCpu className="text-yellow-400" size={15} /> AI Dossier Analyst
              </h3>
              <span className="text-[10px] text-yellow-400 font-bold">Automated</span>
            </div>

            {/* Fast Trigger Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerAI("summarize")}
                className="py-2 px-3 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-[11px] font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer text-center"
              >
                Summarize Dossier
              </button>
              <button
                onClick={() => triggerAI("check_documents")}
                className="py-2 px-3 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-[11px] font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer text-center"
              >
                Audit Uploads
              </button>
              <button
                onClick={() => triggerAI("generate_cover_letter")}
                className="py-2 px-3 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-[11px] font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer text-center"
              >
                Embassy Letter
              </button>
              <button
                onClick={() => triggerAI("generate_email")}
                className="py-2 px-3 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 text-[11px] font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer text-center"
              >
                Draft Email
              </button>
            </div>

            {/* AI Console Output */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Output Console</span>
                {aiOutput && (
                  <button 
                    onClick={handleCopy} 
                    className="text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <FiCheckCircle /> : <FiCopy />} {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>

              <div className="w-full min-h-[10rem] p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 font-medium leading-relaxed overflow-y-auto max-h-[15rem]">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
                    <FiLoader className="animate-spin text-yellow-400" size={20} />
                    <span className="text-[11px]">Analyzing file records...</span>
                  </div>
                ) : aiOutput ? (
                  <div className="whitespace-pre-line text-[11px] space-y-2">
                    {aiOutput}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-center px-2">
                    <FiCpu size={24} className="mb-1 text-slate-700" />
                    <span className="text-[10px]">Click any trigger button above to generate letters or dossier summary.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
