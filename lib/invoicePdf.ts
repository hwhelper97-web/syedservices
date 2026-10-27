import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { formatCurrencyAmount, getCurrencyInfo } from "./currencies";

export interface InvoicePdfData {
  invoiceNumber: string;
  issueDate: Date | string;
  dueDate: Date | string;
  status: string;
  currency: string;
  currencySymbol?: string;

  // Customer
  customerName?: string | null;
  customerCompany?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  customerCity?: string | null;
  customerCountry?: string | null;
  customerTaxId?: string | null;

  // Financials
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingFee: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;

  // Items
  items: Array<{
    serviceName: string;
    description?: string | null;
    quantity: number;
    unit?: string | null;
    unitPrice: number;
    discountValue?: number | null;
    discountType?: string | null;
    taxRate?: number | null;
    lineTotal: number;
  }>;

  // Notes & terms
  notes?: string | null;
  terms?: string | null;
  accessToken?: string | null;
}

export function generateInvoicePdfBuffer(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 36, // 0.5 inch margins
        info: {
          Title: `Invoice ${data.invoiceNumber} - Syed Services`,
          Author: "Syed Services Pvt Ltd",
          Subject: `Official Invoice ${data.invoiceNumber}`,
          Keywords: "Invoice, Syed Services, Visa, Travel, Certified",
        },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err: Error) => reject(err));

      const primaryColor = "#0f172a"; // Slate 900
      const accentGold = "#d97706"; // Amber 600
      const brandGold = "#facc15"; // Yellow 400
      const lightBg = "#f8fafc"; // Slate 50
      const borderColor = "#e2e8f0"; // Slate 200
      const textMuted = "#64748b"; // Slate 500
      const textDark = "#1e293b"; // Slate 800

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      // ================= MIDDLE PAGE BRAND WATERMARK =================
      // Clean emblem crest only - NO floating text underneath to avoid collisions!
      const renderWatermark = () => {
        try {
          const watermarkPath = path.join(process.cwd(), "public", "images", "watermark-crest.png");
          const fallbackPath = path.join(process.cwd(), "public", "images", "logo-emblem-transparent.png");
          const activePath = fs.existsSync(watermarkPath) ? watermarkPath : fallbackPath;

          if (fs.existsSync(activePath)) {
            doc.save();
            doc.opacity(0.045); // Delicate, high-security luxury watermark
            const watermarkW = 280;
            const watermarkH = 180;
            const watermarkX = (pageWidth - watermarkW) / 2;
            const watermarkY = (pageHeight - watermarkH) / 2;
            doc.image(activePath, watermarkX, watermarkY, { width: watermarkW });
            doc.restore();
          }
        } catch (err) {
          console.warn("Could not render invoice watermark:", err);
        }
      };

      // Draw watermark on page 1
      renderWatermark();

      // Ensure additional pages also get watermark
      doc.on("pageAdded", () => {
        renderWatermark();
      });

      // ================= HEADER SECTION =================
      // Deep luxury navy header background
      doc.roundedRect(margin, margin, contentWidth, 80, 8).fill("#020617");

      // Company Official Brand Emblem in Header
      const emblemLogoPath = path.join(process.cwd(), "public", "images", "logo-emblem.png");
      const fullLogoPath = path.join(process.cwd(), "public", "images", "logo.png");
      const activeHeaderLogo = fs.existsSync(emblemLogoPath) ? emblemLogoPath : fullLogoPath;

      if (fs.existsSync(activeHeaderLogo)) {
        // Crisp white rounded container with subtle gold border
        doc.roundedRect(margin + 14, margin + 12, 56, 56, 8).fillAndStroke("#ffffff", "#d97706");
        doc.image(activeHeaderLogo, margin + 16, margin + 14, {
          width: 52,
          height: 52,
          fit: [52, 52],
          align: "center",
          valign: "center",
        });
      } else {
        doc.roundedRect(margin + 14, margin + 12, 56, 56, 8).fill(brandGold);
        doc.fillColor("#020617").font("Helvetica-Bold").fontSize(26).text("S", margin + 14, margin + 24, {
          width: 56,
          align: "center",
        });
      }

      // Business Name & Tagline
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(18).text("SYED SERVICES", margin + 80, margin + 17);
      doc.fillColor(brandGold).font("Helvetica-Bold").fontSize(8.5).text("& CONSULTANT  •  TRAVEL & VISA SERVICES", margin + 80, margin + 39);
      doc.fillColor("#94a3b8").font("Helvetica").fontSize(7.5).text("Peshawar, Pakistan  |  Jalalabad, Afghanistan  •  Official Billing Document", margin + 80, margin + 52);

      // Top Right: INVOICE label & Number
      doc.fillColor(brandGold).font("Helvetica-Bold").fontSize(20).text("INVOICE", pageWidth - margin - 200, margin + 16, {
        width: 184,
        align: "right",
      });
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11).text(data.invoiceNumber, pageWidth - margin - 200, margin + 39, {
        width: 184,
        align: "right",
      });

      // Executive Status Pill inside header
      const statusLabel = (data.status || "ISSUED").replace(/_/g, " ");
      const statusColor = data.status === "PAID" ? "#22c55e" : data.status === "PARTIALLY_PAID" ? "#f59e0b" : data.status === "OVERDUE" ? "#ef4444" : "#38bdf8";
      doc.fillColor(statusColor).font("Helvetica-Bold").fontSize(8).text(`STATUS: ${statusLabel}`, pageWidth - margin - 200, margin + 55, {
        width: 184,
        align: "right",
      });

      let currentY = margin + 92;

      // ================= METADATA & BILL TO SECTION =================
      const colWidth = (contentWidth - 16) / 2;

      // Bill To Box (Left)
      doc.roundedRect(margin, currentY, colWidth, 90, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(accentGold).font("Helvetica-Bold").fontSize(8.5).text("BILLED TO", margin + 14, currentY + 10);

      const customerName = data.customerName || "Valued Client";
      doc.fillColor(textDark).font("Helvetica-Bold").fontSize(11).text(customerName, margin + 14, currentY + 23, { width: colWidth - 28 });

      let custDetailsY = currentY + 39;
      doc.font("Helvetica").fontSize(8).fillColor(textMuted);
      if (data.customerCompany) {
        doc.text(data.customerCompany, margin + 14, custDetailsY, { width: colWidth - 28 });
        custDetailsY += 12;
      }
      if (data.customerPhone) {
        doc.text(`Phone: ${data.customerPhone}`, margin + 14, custDetailsY, { width: colWidth - 28 });
        custDetailsY += 12;
      } else if (data.customerEmail) {
        doc.text(`Email: ${data.customerEmail}`, margin + 14, custDetailsY, { width: colWidth - 28 });
        custDetailsY += 12;
      }
      if (data.customerAddress || data.customerCity || data.customerCountry) {
        const address = [data.customerAddress, data.customerCity, data.customerCountry].filter(Boolean).join(", ");
        doc.text(address, margin + 14, custDetailsY, { width: colWidth - 28 });
      }

      // Invoice Details Box (Right)
      const rightColX = margin + colWidth + 16;
      doc.roundedRect(rightColX, currentY, colWidth, 90, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(accentGold).font("Helvetica-Bold").fontSize(8.5).text("INVOICE DETAILS", rightColX + 14, currentY + 10);

      const formatDate = (val: Date | string) => {
        try {
          return new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch {
          return String(val);
        }
      };

      const metaY = currentY + 23;
      doc.font("Helvetica-Bold").fontSize(8).fillColor(textDark);
      doc.text("Issue Date:", rightColX + 14, metaY);
      doc.font("Helvetica").text(formatDate(data.issueDate), rightColX + 75, metaY);

      doc.font("Helvetica-Bold").text("Due Date:", rightColX + 14, metaY + 14);
      doc.font("Helvetica").text(formatDate(data.dueDate), rightColX + 75, metaY + 14);

      // Clean Currency (Never prints PKR ()!)
      const currInfo = getCurrencyInfo(data.currency);
      const symbol = data.currencySymbol || currInfo?.symbol;
      const currencyDisplay = symbol && symbol !== data.currency ? `${data.currency} (${symbol})` : data.currency;

      doc.font("Helvetica-Bold").text("Currency:", rightColX + 14, metaY + 28);
      doc.font("Helvetica").text(currencyDisplay, rightColX + 75, metaY + 28);

      doc.font("Helvetica-Bold").text("Status:", rightColX + 14, metaY + 42);
      doc.fillColor(statusColor).font("Helvetica-Bold").text(statusLabel, rightColX + 75, metaY + 42);

      currentY += 102;

      // ================= LINE ITEMS TABLE =================
      const tableX = margin;
      const colNo = 24;
      const colTotal = 85;
      const colTax = 38;
      const colDisc = 38;
      const colRate = 68;
      const colQty = 42;
      const colDesc = contentWidth - (colNo + colQty + colRate + colDisc + colTax + colTotal);

      // Table Header Bar
      doc.roundedRect(tableX, currentY, contentWidth, 22, 4).fill(primaryColor);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8);

      let headerX = tableX + 8;
      doc.text("#", headerX, currentY + 7, { width: colNo - 8 });
      headerX += colNo;
      doc.text("Service & Description", headerX, currentY + 7, { width: colDesc });
      headerX += colDesc;
      doc.text("Qty", headerX, currentY + 7, { width: colQty, align: "center" });
      headerX += colQty;
      doc.text("Unit Price", headerX, currentY + 7, { width: colRate, align: "right" });
      headerX += colRate;
      doc.text("Disc", headerX, currentY + 7, { width: colDisc, align: "right" });
      headerX += colDisc;
      doc.text("Tax", headerX, currentY + 7, { width: colTax, align: "right" });
      headerX += colTax;
      doc.text("Total", headerX, currentY + 7, { width: colTotal - 8, align: "right" });

      currentY += 25;

      // Render line items with dynamic row height to prevent collisions
      data.items.forEach((item, index) => {
        const hasDesc = Boolean(item.description && item.description.trim().length > 0 && item.description !== item.serviceName);
        const rowHeight = hasDesc ? 29 : 22;
        const itemY = currentY;
        const isEven = index % 2 === 0;

        // Row background
        if (isEven) {
          doc.rect(tableX, itemY - 2, contentWidth, rowHeight).fill("#f8fafc");
        }

        doc.fillColor(textDark).font("Helvetica").fontSize(8);

        let rowX = tableX + 8;
        // Index
        doc.text(String(index + 1), rowX, itemY + 2, { width: colNo - 8 });
        rowX += colNo;

        // Service & Description
        doc.font("Helvetica-Bold").text(item.serviceName, rowX, itemY + 2, { width: colDesc, lineBreak: false });
        if (hasDesc) {
          doc.font("Helvetica").fontSize(7).fillColor(textMuted).text(item.description!, rowX, itemY + 13, { width: colDesc, lineBreak: false });
        }
        rowX += colDesc;

        // Qty
        doc.font("Helvetica").fontSize(8).fillColor(textDark);
        const unitLabel = item.unit ? ` ${item.unit}` : "";
        doc.text(`${item.quantity}${unitLabel}`, rowX, itemY + 2, { width: colQty, align: "center" });
        rowX += colQty;

        // Unit Price
        doc.text(formatCurrencyAmount(item.unitPrice, data.currency, { showSymbol: false }), rowX, itemY + 2, { width: colRate, align: "right" });
        rowX += colRate;

        // Discount
        const discText = item.discountValue ? (item.discountType === "PERCENTAGE" ? `${item.discountValue}%` : formatCurrencyAmount(item.discountValue, data.currency, { showSymbol: false })) : "-";
        doc.text(discText, rowX, itemY + 2, { width: colDisc, align: "right" });
        rowX += colDisc;

        // Tax
        const taxText = item.taxRate ? `${item.taxRate}%` : "-";
        doc.text(taxText, rowX, itemY + 2, { width: colTax, align: "right" });
        rowX += colTax;

        // Total
        doc.font("Helvetica-Bold").text(formatCurrencyAmount(item.lineTotal, data.currency, { showSymbol: false }), rowX, itemY + 2, { width: colTotal - 8, align: "right" });

        currentY += rowHeight;
      });

      // Bottom border line for items
      doc.moveTo(tableX, currentY).lineTo(tableX + contentWidth, currentY).strokeColor(borderColor).stroke();
      currentY += 12;

      // ================= SUMMARY & PAYMENT DETAILS =================
      const summaryWidth = 230;
      const summaryX = tableX + contentWidth - summaryWidth;
      const notesWidth = contentWidth - summaryWidth - 16;
      const cardHeight = 118;

      // Left Box: Bank Payment Instructions & Notes
      doc.roundedRect(tableX, currentY, notesWidth, cardHeight, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(accentGold).font("Helvetica-Bold").fontSize(8.5).text("PAYMENT INSTRUCTIONS & BANK DETAILS", tableX + 12, currentY + 10);

      doc.fillColor(textDark).font("Helvetica").fontSize(7.5);
      const termsText = data.terms || [
        "Bank: Habib Bank Limited (HBL) / Meezan Bank Pakistan",
        "Account Title: Syed Services & Consultant ( Syed Saif )",
        "IBAN / SWIFT details available on request.",
        "Cash deposits & online transfers accepted. Keep payment receipt safe.",
      ].join("\n");
      doc.text(termsText, tableX + 12, currentY + 23, { width: notesWidth - 24, lineGap: 2.5 });

      if (data.notes) {
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(textDark).text("Client Notes:", tableX + 12, currentY + 74);
        doc.font("Helvetica-Oblique").fontSize(7).fillColor(textMuted).text(data.notes, tableX + 12, currentY + 85, { width: notesWidth - 24, lineGap: 1.5 });
      }

      // Right Box: Financial Totals Breakdown
      doc.roundedRect(summaryX, currentY, summaryWidth, cardHeight, 6).fillAndStroke(lightBg, borderColor);

      let sumRowY = currentY + 10;
      const drawSumRow = (label: string, value: string, isBold: boolean = false, isHighlight: boolean = false) => {
        if (isHighlight) {
          doc.roundedRect(summaryX + 6, sumRowY - 2, summaryWidth - 12, 17, 3).fill("#fef3c7"); // Amber 100
        }
        doc.font(isBold ? "Helvetica-Bold" : "Helvetica").fontSize(8).fillColor(isHighlight ? "#92400e" : textDark);
        doc.text(label, summaryX + 12, sumRowY);
        doc.text(value, summaryX + 12, sumRowY, { width: summaryWidth - 24, align: "right" });
        sumRowY += 15;
      };

      drawSumRow("Subtotal", formatCurrencyAmount(data.subtotal, data.currency, { showCode: true }));

      if (data.discountTotal > 0) {
        drawSumRow("Discount", `-${formatCurrencyAmount(data.discountTotal, data.currency, { showCode: true })}`);
      }
      if (data.taxTotal > 0) {
        drawSumRow("Tax", `+${formatCurrencyAmount(data.taxTotal, data.currency, { showCode: true })}`);
      }
      if (data.shippingFee > 0) {
        drawSumRow("Additional Charges", `+${formatCurrencyAmount(data.shippingFee, data.currency, { showCode: true })}`);
      }

      // Grand Total Highlight
      drawSumRow("Grand Total", formatCurrencyAmount(data.totalAmount, data.currency, { showCode: true }), true, true);

      // Amount Paid & Balance Due
      drawSumRow("Amount Paid", formatCurrencyAmount(data.amountPaid, data.currency, { showCode: true }));
      drawSumRow("Balance Due", formatCurrencyAmount(data.balanceDue, data.currency, { showCode: true }), true);

      currentY += cardHeight + 8;

      // ================= OFFICIAL AUTHENTICITY STAMP & SIGNATURE =================
      const sealSectionY = Math.min(Math.max(currentY, 615), 642);

      // Signature line & Authority details (Left side)
      const sigLineX = margin + 14;
      const sigLineY = sealSectionY + 66;
      const sigLineWidth = 180;

      doc.moveTo(sigLineX, sigLineY).lineTo(sigLineX + sigLineWidth, sigLineY).strokeColor("#cbd5e1").lineWidth(1).stroke();
      doc.font("Helvetica-Bold").fontSize(8).fillColor(textDark).text("Syed Services Pvt Ltd", sigLineX, sigLineY + 5);
      doc.font("Helvetica").fontSize(7).fillColor(textMuted).text("Authorized Signatory & Corporate Seal", sigLineX, sigLineY + 15);

      // Official Transparent Rubber Stamp
      const stampPath = path.join(process.cwd(), "public", "images", "stamp-transparent.png");
      if (fs.existsSync(stampPath)) {
        try {
          doc.save();
          doc.opacity(0.85); // Authentic wet ink rubber stamp opacity
          const stampSize = 98;
          const stampX = sigLineX + sigLineWidth - 46;
          const stampY = sealSectionY - 4;
          doc.rotate(-5, { origin: [stampX + stampSize / 2, stampY + stampSize / 2] });
          doc.image(stampPath, stampX, stampY, { width: stampSize, height: stampSize });
          doc.restore();
        } catch (err) {
          console.warn("Could not render authenticity stamp in PDF:", err);
        }
      }

      // Security Certification Tag (Right of stamp block)
      const certX = rightColX;
      doc.roundedRect(certX, sealSectionY + 25, colWidth, 48, 4).fillAndStroke("#f1f5f9", "#e2e8f0");
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(7.5).text("DIGITAL SECURITY & AUTHENTICITY", certX + 10, sealSectionY + 33);
      doc.font("Helvetica").fontSize(6.8).fillColor("#475569").text(
        `This certified document is cryptographically referenced to Invoice #${data.invoiceNumber}. Verify official integrity online via Syed Services portal.`,
        certX + 10,
        sealSectionY + 44,
        { width: colWidth - 20, lineGap: 1.5 }
      );

      // ================= FOOTER SECTION (NO TEXT OVERLAP!) =================
      const footerY = 770;
      doc.moveTo(margin, footerY).lineTo(margin + contentWidth, footerY).strokeColor("#e2e8f0").lineWidth(1).stroke();

      // Row 1: Brand Legal Title (Left) and Clickable Verification Link (Right)
      doc.fillColor("#475569").font("Helvetica-Bold").fontSize(7.5).text(
        "SYED SERVICES PVT LTD  •  GOVERNMENT LICENSED VISA & TRAVEL CONSULTANCY",
        margin,
        footerY + 8,
        { width: 340 }
      );

      if (data.accessToken) {
        const verifyUrl = `https://syedservices.com.pk/invoices/view/${data.accessToken}`;
        // Clean, clickable link with NO ugly 100-character URL text colliding!
        doc.fillColor("#b45309").font("Helvetica-Bold").fontSize(7.5).text(
          "Verify Authenticity Online »",
          margin + 340,
          footerY + 8,
          {
            width: contentWidth - 340,
            align: "right",
            link: verifyUrl,
            underline: true,
          }
        );
      }

      // Row 2: Clean Corporate Contact & Website
      doc.fillColor("#64748b").font("Helvetica").fontSize(7).text(
        "Head Office: GT Road, Peshawar, Pakistan  |  Helpline: +92 309 9797771  |  info@syedservices.com.pk  |  www.syedservices.com.pk",
        margin,
        footerY + 22,
        { width: contentWidth, align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
