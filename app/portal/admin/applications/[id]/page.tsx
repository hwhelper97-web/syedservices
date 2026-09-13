"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FiFileText, FiUser, FiGlobe, FiAlertCircle, 
  FiCpu, FiCopy, FiLoader, FiCheckCircle, FiDownload, 
  FiCornerDownRight, FiArrowLeft, FiEye, FiImage, FiArchive, FiPaperclip, FiPrinter, FiDollarSign
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
    <div className="space-y-8">
      {/* Toast Notification */}
      <PortalToast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/portal/admin" 
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <FiArrowLeft size={16} /> Back to Dashboard
        </Link>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
          TRACK: {app.trackingId}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Details & Document Logs */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Comprehensive Dossier */}
          <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block mb-1">
                  Official Client Review Dossier
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {app.client?.user?.name || "Applicant"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Email: {app.client?.user?.email || "N/A"} · Phone: {app.client?.phone || "N/A"}
                </p>
              </div>
              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Registration Date</span>
                <span className="text-xs font-mono text-slate-300 font-bold">
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Package & Pricing Block */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-400/10 via-slate-900 to-emerald-500/10 border border-yellow-400/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider">
                      {app.package ? "Landing Package Deal" : "Custom Application"}
                    </span>
                    <span className="text-xs font-bold text-slate-300">{app.country} · {app.visaCategory}</span>
                  </div>
                  <h4 className="text-base font-black text-white">
                    {app.package ? app.package.title : `${app.country} ${app.visaCategory}`}
                  </h4>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-left sm:text-right shrink-0">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Official Visa Fee</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    ${app.packagePrice || app.package?.priceUSD || 250} USD
                  </span>
                  {app.package?.pricePKR && (
                    <span className="text-[10px] text-slate-400 block font-mono">
                      (₨ {app.package.pricePKR.toLocaleString()} PKR)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Entry Type</span>
                  <strong className="text-white">{app.entryType || "Single"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Stay Duration</span>
                  <strong className="text-white">{app.duration || app.package?.duration || "30 Days"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Processing Time</span>
                  <strong className="text-white">{app.package?.processingTime || "3 - 5 Working Days"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Travel Planned</span>
                  <strong className="text-white">{app.travelDate || "Flexible"}</strong>
                </div>
              </div>

              {/* Package Required Documents */}
              {app.package?.documents && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <FiPaperclip className="text-yellow-400" /> Package Mandatory Documents Checklist:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {app.package.documents.split("\n").filter(Boolean).map((d: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                        {d.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Official Parents & Civil Family Details */}
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                <FiUser size={15} /> Official Parents & Civil Family Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Father Full Name</span>
                  <p className="font-bold text-white mt-0.5 text-sm">{app.client?.fatherName || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Mother Full Name</span>
                  <p className="font-bold text-white mt-0.5 text-sm">{app.client?.motherName || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Marital Status</span>
                  <p className="mt-0.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs ${
                      app.client?.maritalStatus === "Married"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-900 text-slate-300 border border-slate-800"
                    }`}>
                      {app.client?.maritalStatus || "Single"}
                    </span>
                  </p>
                </div>

                {/* If Married details */}
                {app.client?.maritalStatus === "Married" && (
                  <>
                    <div className="sm:col-span-1">
                      <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Wife / Spouse Name</span>
                      <p className="font-black text-yellow-400 mt-0.5 text-sm">{app.client?.spouseName || "Not provided"}</p>
                    </div>
                    <div className="sm:col-span-1">
                      <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Children Count</span>
                      <p className="font-bold text-white mt-0.5 font-mono text-sm">{app.client?.childrenCount ?? 0}</p>
                    </div>
                    <div className="sm:col-span-1">
                      <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Children Details</span>
                      <p className="font-medium text-slate-300 mt-0.5 text-xs">{app.client?.childrenDetails || "None provided"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Identity & Passport Information */}
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                <FiFileText size={15} /> Official Passport & Identification
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Passport Number</span>
                  <p className="font-mono font-black text-white mt-0.5 text-sm">{app.client?.passportNumber || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Passport Expiry</span>
                  <p className="font-bold text-white mt-0.5">{app.client?.passportExpiryDate || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Issue Date & Place</span>
                  <p className="font-semibold text-slate-300 mt-0.5">
                    {app.client?.passportIssueDate || "N/A"} ({app.client?.passportIssuePlace || "N/A"})
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Date of Birth & Gender</span>
                  <p className="font-semibold text-slate-300 mt-0.5">
                    {app.client?.dob || "N/A"} ({app.client?.gender || "N/A"})
                  </p>
                </div>
              </div>
            </div>

            {/* Official Addresses */}
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                <FiGlobe size={15} /> Official Residence & Origin Addresses
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-850">
                  <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block mb-1">
                    Current Residence Address (حالیه استوګنځی)
                  </span>
                  <p className="font-bold text-white text-sm leading-snug">
                    {app.client?.currentAddress || "Not provided"}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-850">
                  <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block mb-1">
                    Permanent Origin Address (اصلي استوګنځی)
                  </span>
                  <p className="font-bold text-slate-300 text-sm leading-snug">
                    {app.client?.permanentAddress || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Employment & Financials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs p-5 bg-slate-950/40 rounded-2xl border border-slate-850">
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Profession / Job</span>
                <p className="font-bold text-white mt-0.5">{app.client?.profession || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Company Name</span>
                <p className="font-bold text-white mt-0.5">{app.client?.companyName || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Monthly Income</span>
                <p className="font-bold text-emerald-400 font-mono mt-0.5">${app.client?.salary || "0"}/month</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px] block">Qualification</span>
                <p className="font-bold text-white mt-0.5">{app.client?.bachelor || app.client?.qualification || "N/A"}</p>
              </div>
            </div>

            {/* Associated Invoices & Strict Package Accounting */}
            {app.invoices && app.invoices.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FiDollarSign /> Associated Application Invoice(s)
                  </span>
                  <span className="text-[10px] text-slate-400">{app.invoices.length} Invoice(s) Generated</span>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {app.invoices.map((inv: any) => (
                    <div key={inv.id} className="pt-2.5 pb-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-white text-sm">{inv.invoiceNumber}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "7 Days"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          ${inv.totalAmount} USD
                        </span>
                        <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === "PAID" ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Documents */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/30">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400"><FiPaperclip size={16} /></span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Submitted Support Scans</h4>
                {app.documents.length > 0 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-full">
                    {app.documents.length} file{app.documents.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {/* Download All */}
              {app.documents.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={downloadingZip}
                  className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-black font-black text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer shadow-lg shadow-yellow-400/10 disabled:opacity-60"
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

            {/* Body */}
            <div className="p-2">
              {app.documents.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No documents uploaded by client yet.</p>
              ) : (
                <div className="divide-y divide-slate-800/40">
                  {app.documents.map((doc: any) => {
                    const ext = doc.fileName?.split(".").pop()?.toLowerCase() || doc.fileType || "";
                    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                    const sizeKB = doc.fileSize ? (doc.fileSize / 1024).toFixed(1) : null;

                    return (
                      <div key={doc.id} className="flex items-center gap-4 px-4 py-4 hover:bg-slate-900/20 transition-colors rounded-2xl group">
                        {/* File Icon */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isImage
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                        }`}>
                          {isImage ? <FiImage size={20} /> : <FiFileText size={20} />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white capitalize">
                            {doc.documentType.replace(/_/g, " ")}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{doc.fileName}</span>
                            {sizeKB && <span className="text-[10px] text-slate-600">· {sizeKB} KB</span>}
                            <span className="text-[9px] uppercase font-bold text-slate-600">.{ext}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <FiCheckCircle size={10} className="text-green-400" />
                            <span className="text-[9px] text-green-400 font-bold">Verified Upload</span>
                          </div>
                        </div>

                        {/* Image Thumbnail */}
                        {isImage && (
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0 hidden md:block">
                            <img
                              src={doc.fileUrl}
                              alt={doc.documentType}
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-blue-400/30 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded-xl transition-all text-xs font-semibold"
                            title="Open in browser"
                          >
                            <FiEye size={13} /> View
                          </a>
                          <button
                            type="button"
                            onClick={(e) => handleDownloadSingle(doc, e)}
                            disabled={downloadingDocId === doc.id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 hover:bg-yellow-400/5 text-slate-400 hover:text-yellow-400 rounded-xl transition-all text-xs font-semibold cursor-pointer disabled:opacity-60"
                            title={`Download direct file: ${getDocFileName(doc)}`}
                          >
                            {downloadingDocId === doc.id ? (
                              <>
                                <FiLoader className="animate-spin text-yellow-400" size={13} /> Saving...
                              </>
                            ) : (
                              <>
                                <FiDownload size={13} /> Download
                              </>
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

          {/* Status Update Portal */}
          <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Update File Status</h3>
            
            {app.status === "DEAL_CONFIRMED" && !app.contractAccepted && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-400">
                ⚠️ <strong>Awaiting Agent Signature:</strong> The visa contract terms have been sent to the agent. Further pipeline steps are disabled until the agent reviews and accepts the contract.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Application State</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-xs focus:outline-none"
                >
                {VISA_STATUS_OPTIONS.map(opt => {
                  const isLocked = app.status === "DEAL_CONFIRMED" && 
                                   !app.contractAccepted && 
                                   ["SENT_FOR_INVITATION", "INVITATION_ARRIVED", "FILE_READY_EMBASSY", "APPLICATION_SUBMITTED", "PASSPORT_TO_SUBMIT", "FINISHED"].includes(opt.value);
                  return (
                    <option key={opt.value} value={opt.value} disabled={isLocked}>
                      {opt.label} {isLocked ? "(Locked - Awaiting Signature)" : ""}
                    </option>
                  );
                })}
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Update Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verified passport validity"
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-yellow-400/50 rounded-2xl text-xs focus:outline-none placeholder-slate-650"
                />
              </div>
            </div>
            {status === "DEAL_CONFIRMED" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Timeline for Approval</label>
                  <input
                    type="text"
                    value={contractDays}
                    onChange={e => setContractDays(e.target.value)}
                    placeholder="e.g. 30 Days"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-400/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Fees After Visa Given</label>
                  <input
                    type="text"
                    value={contractAmount}
                    onChange={e => setContractAmount(e.target.value)}
                    placeholder="e.g. 1000 USD"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-400/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">First Party (Party A) Name</label>
                  <input
                    type="text"
                    value={contractFirstParty}
                    onChange={e => setContractFirstParty(e.target.value)}
                    placeholder="e.g. Eng Syed Saif Ur Rehman"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-400/40"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpdateStatus}
              disabled={updating || (status === app.status && status !== "DEAL_CONFIRMED")}
              className="px-6 py-3 bg-yellow-400 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
            >
              {updating ? "Updating..." : "Save Status Logs"}
            </button>
          </div>

          {/* Contract Status Card */}
          {app.contractStatus && app.contractStatus !== "PENDING" && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400"><FiFileText size={16} /></span>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">{app.country ? `${app.country} Visa Service Contract` : "Visa Service Contract"}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {app.contractAccepted && (
                    <button
                      onClick={handlePrintContract}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-yellow-400/30 hover:bg-yellow-400/5 text-slate-400 hover:text-yellow-400 rounded-xl transition-all text-[10px] font-semibold cursor-pointer"
                    >
                      <FiPrinter size={10} /> Print Contract
                    </button>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    app.contractAccepted 
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                      : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  }`}>
                    {app.contractAccepted ? "SIGNED & ACCEPTED" : "AWAITING SIGNATURE"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Timeline Days:</span>
                  <span className="font-semibold text-white">{app.contractApprovedDays || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Fees after Visa Issue:</span>
                  <span className="font-semibold text-white">{app.contractPaymentAmount || "Not specified"}</span>
                </div>
                {app.contractAccepted && (
                  <>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Signed By:</span>
                      <span className="font-mono text-yellow-400 font-bold">{app.contractSignatureName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Signed At:</span>
                      <span className="text-slate-300 font-semibold">
                        {app.contractAcceptedAt ? new Date(app.contractAcceptedAt).toLocaleString() : ""}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant Console */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FiCpu className="text-yellow-400" /> AI Assistant Console
          </h3>

          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/5 blur-[100px] pointer-events-none" />
            
            {/* Control buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => triggerAI("summarize")}
                className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-yellow-400/20 text-xs font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Summarize File
              </button>
              <button
                onClick={() => triggerAI("check_documents")}
                className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-yellow-400/20 text-xs font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Audit Uploads
              </button>
              <button
                onClick={() => triggerAI("generate_cover_letter")}
                className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-yellow-400/20 text-xs font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Embassy Letter
              </button>
              <button
                onClick={() => triggerAI("generate_email")}
                className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-yellow-400/20 text-xs font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Draft Client Email
              </button>
            </div>

            {/* Markdown output area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Response Output</span>
                {aiOutput && (
                  <button 
                    onClick={handleCopy} 
                    className="text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <FiCheckCircle /> : <FiCopy />} {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>

              <div className="w-full min-h-[16rem] p-5 bg-slate-950/80 border border-slate-850 rounded-2xl text-xs text-slate-300 font-medium leading-relaxed overflow-y-auto max-h-[22rem]">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                    <FiLoader className="animate-spin text-yellow-400" size={24} />
                    <span>Processing dossier files...</span>
                  </div>
                ) : aiOutput ? (
                  <div className="whitespace-pre-line space-y-3">
                    {aiOutput}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-600 text-center px-4">
                    <FiCpu size={32} className="mb-2" />
                    <span>Click any AI action above to analyze the client's folder details.</span>
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
