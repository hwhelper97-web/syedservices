import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { formatCurrencyAmount } from "./currencies";

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
          Author: "Syed Services & Consultant",
          Subject: `Official Invoice ${data.invoiceNumber}`,
          Keywords: "Invoice, Syed Services, Visa, Travel",
        },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err: Error) => reject(err));

      const primaryColor = "#0f172a"; // Slate 900
      const accentGold = "#d97706"; // Amber 600
      const lightBg = "#f8fafc"; // Slate 50
      const borderColor = "#e2e8f0"; // Slate 200
      const textMuted = "#64748b"; // Slate 500
      const textDark = "#1e293b"; // Slate 800

      const pageWidth = 595.28;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      // ================= MIDDLE PAGE BRAND WATERMARK =================
      const renderWatermark = () => {
        try {
          const watermarkPath = path.join(process.cwd(), "public", "images", "logo-transparent.png");
          if (fs.existsSync(watermarkPath)) {
            doc.save();
            doc.opacity(0.065); // Subtle luxury watermark
            const watermarkSize = 300;
            const watermarkX = (pageWidth - watermarkSize) / 2;
            const watermarkY = (841.89 - watermarkSize) / 2 + 25;
            doc.image(watermarkPath, watermarkX, watermarkY, { width: watermarkSize });
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
      // Header background bar
      doc.rect(margin, margin, contentWidth, 80).fill("#020617");

      // Company Official Brand Logo
      const headerLogoPath = path.join(process.cwd(), "public", "images", "logo.png");
      if (fs.existsSync(headerLogoPath)) {
        doc.roundedRect(margin + 14, margin + 12, 56, 56, 8).fill("#ffffff");
        doc.image(headerLogoPath, margin + 16, margin + 14, {
          width: 52,
          height: 52,
          fit: [52, 52],
          align: "center",
          valign: "center",
        });
      } else {
        doc.roundedRect(margin + 16, margin + 14, 52, 52, 8).fill("#facc15");
        doc.fillColor("#020617").font("Helvetica-Bold").fontSize(26).text("S", margin + 16, margin + 26, {
          width: 52,
          align: "center",
        });
      }

      // Business Name & Tagline
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(18).text("SYED SERVICES", margin + 80, margin + 18);
      doc.fillColor("#facc15").font("Helvetica").fontSize(8.5).text("& CONSULTANT  •  TRAVEL & VISA SERVICES", margin + 80, margin + 40);
      doc.fillColor("#94a3b8").fontSize(7.5).text("Peshawar, Pakistan  |  Jalalabad, Afghanistan", margin + 80, margin + 53);

      // Top Right: INVOICE label & Number
      doc.fillColor("#facc15").font("Helvetica-Bold").fontSize(20).text("INVOICE", pageWidth - margin - 200, margin + 18, {
        width: 184,
        align: "right",
      });
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11).text(data.invoiceNumber, pageWidth - margin - 200, margin + 42, {
        width: 184,
        align: "right",
      });

      let currentY = margin + 95;

      // ================= METADATA & BILL TO SECTION =================
      // Two-column layout: Left = Bill To, Right = Invoice Details
      const colWidth = (contentWidth - 20) / 2;

      // Bill To Box
      doc.roundedRect(margin, currentY, colWidth, 90, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(accentGold).font("Helvetica-Bold").fontSize(8.5).text("BILLED TO", margin + 14, currentY + 10);

      const customerName = data.customerName || "Valued Client";
      doc.fillColor(textDark).font("Helvetica-Bold").fontSize(11).text(customerName, margin + 14, currentY + 24, { width: colWidth - 28 });

      let custDetailsY = currentY + 40;
      doc.font("Helvetica").fontSize(8).fillColor(textMuted);
      if (data.customerCompany) {
        doc.text(data.customerCompany, margin + 14, custDetailsY, { width: colWidth - 28 });
        custDetailsY += 11;
      }
      if (data.customerEmail) {
        doc.text(`Email: ${data.customerEmail}`, margin + 14, custDetailsY, { width: colWidth - 28 });
        custDetailsY += 11;
      }
      if (data.customerPhone) {
        doc.text(`Phone: ${data.customerPhone}`, margin + 14, custDetailsY, { width: colWidth - 28 });
        custDetailsY += 11;
      }
      if (data.customerAddress || data.customerCity) {
        const address = [data.customerAddress, data.customerCity, data.customerCountry].filter(Boolean).join(", ");
        doc.text(address, margin + 14, custDetailsY, { width: colWidth - 28 });
      }

      // Invoice Details Box (Right)
      const rightColX = margin + colWidth + 20;
      doc.roundedRect(rightColX, currentY, colWidth, 90, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(accentGold).font("Helvetica-Bold").fontSize(8.5).text("INVOICE DETAILS", rightColX + 14, currentY + 10);

      const formatDate = (val: Date | string) => {
        try {
          return new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch {
          return String(val);
        }
      };

      const metaY = currentY + 24;
      doc.font("Helvetica-Bold").fontSize(8).fillColor(textDark);
      doc.text("Issue Date:", rightColX + 14, metaY);
      doc.font("Helvetica").text(formatDate(data.issueDate), rightColX + 80, metaY);

      doc.font("Helvetica-Bold").text("Due Date:", rightColX + 14, metaY + 14);
      doc.font("Helvetica").text(formatDate(data.dueDate), rightColX + 80, metaY + 14);

      doc.font("Helvetica-Bold").text("Currency:", rightColX + 14, metaY + 28);
      doc.font("Helvetica").text(`${data.currency} (${data.currencySymbol || ""})`, rightColX + 80, metaY + 28);

      doc.font("Helvetica-Bold").text("Status:", rightColX + 14, metaY + 42);
      
      // Status pill color
      const statusColor = data.status === "PAID" ? "#16a34a" : data.status === "PARTIALLY_PAID" ? "#ca8a04" : data.status === "OVERDUE" ? "#dc2626" : "#2563eb";
      doc.fillColor(statusColor).font("Helvetica-Bold").text(data.status.replace("_", " "), rightColX + 80, metaY + 42);

      currentY += 105;

      // ================= LINE ITEMS TABLE =================
      const tableX = margin;
      const colNo = 26;
      const colTotal = 85;
      const colTax = 46;
      const colDisc = 46;
      const colRate = 65;
      const colQty = 42;
      const colDesc = contentWidth - (colNo + colQty + colRate + colDisc + colTax + colTotal);

      // Table Header Bar
      doc.roundedRect(tableX, currentY, contentWidth, 24, 4).fill(primaryColor);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8);

      let headerX = tableX + 8;
      doc.text("#", headerX, currentY + 8, { width: colNo - 8 });
      headerX += colNo;
      doc.text("Service & Description", headerX, currentY + 8, { width: colDesc });
      headerX += colDesc;
      doc.text("Qty", headerX, currentY + 8, { width: colQty, align: "center" });
      headerX += colQty;
      doc.text("Unit Price", headerX, currentY + 8, { width: colRate, align: "right" });
      headerX += colRate;
      doc.text("Disc", headerX, currentY + 8, { width: colDisc, align: "right" });
      headerX += colDisc;
      doc.text("Tax", headerX, currentY + 8, { width: colTax, align: "right" });
      headerX += colTax;
      doc.text("Total", headerX, currentY + 8, { width: colTotal - 8, align: "right" });

      currentY += 28;

      // Render line items
      data.items.forEach((item, index) => {
        const itemY = currentY;
        const isEven = index % 2 === 0;

        // Row background
        if (isEven) {
          doc.rect(tableX, itemY - 3, contentWidth, 26).fill("#f8fafc");
        }

        doc.fillColor(textDark).font("Helvetica").fontSize(8);

        let rowX = tableX + 8;
        // Index
        doc.text(String(index + 1), rowX, itemY + 3, { width: colNo - 8 });
        rowX += colNo;

        // Service & Description
        doc.font("Helvetica-Bold").text(item.serviceName, rowX, itemY + 3, { width: colDesc, lineBreak: false });
        if (item.description) {
          doc.font("Helvetica").fontSize(7).fillColor(textMuted).text(item.description, rowX, itemY + 13, { width: colDesc, lineBreak: false });
        }
        rowX += colDesc;

        // Qty
        doc.font("Helvetica").fontSize(8).fillColor(textDark);
        const unitLabel = item.unit ? ` ${item.unit}` : "";
        doc.text(`${item.quantity}${unitLabel}`, rowX, itemY + 3, { width: colQty, align: "center" });
        rowX += colQty;

        // Unit Price
        doc.text(formatCurrencyAmount(item.unitPrice, data.currency, { showSymbol: false }), rowX, itemY + 3, { width: colRate, align: "right" });
        rowX += colRate;

        // Discount
        const discText = item.discountValue ? (item.discountType === "PERCENTAGE" ? `${item.discountValue}%` : formatCurrencyAmount(item.discountValue, data.currency, { showSymbol: false })) : "-";
        doc.text(discText, rowX, itemY + 3, { width: colDisc, align: "right" });
        rowX += colDisc;

        // Tax
        const taxText = item.taxRate ? `${item.taxRate}%` : "-";
        doc.text(taxText, rowX, itemY + 3, { width: colTax, align: "right" });
        rowX += colTax;

        // Total
        doc.font("Helvetica-Bold").text(formatCurrencyAmount(item.lineTotal, data.currency, { showSymbol: false }), rowX, itemY + 3, { width: colTotal - 8, align: "right" });

        currentY += 26;
      });

      // Bottom border line for items
      doc.moveTo(tableX, currentY).lineTo(tableX + contentWidth, currentY).strokeColor(borderColor).stroke();
      currentY += 15;

      // ================= SUMMARY & PAYMENT DETAILS =================
      const summaryWidth = 230;
      const summaryX = tableX + contentWidth - summaryWidth;
      const notesWidth = contentWidth - summaryWidth - 25;

      // Left Box: Notes & Bank Payment Instructions
      doc.roundedRect(tableX, currentY, notesWidth, 120, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(accentGold).font("Helvetica-Bold").fontSize(8.5).text("PAYMENT INSTRUCTIONS & TERMS", tableX + 12, currentY + 10);

      doc.fillColor(textDark).font("Helvetica").fontSize(7.5);
      const termsText = data.terms || [
        "Bank: Habib Bank Limited (HBL) / Meezan Bank Pakistan",
        "Account Title: Syed Services & Consultant",
        "IBAN / SWIFT details available on request.",
        "Cash deposits & online transfers accepted. Keep payment receipt safe.",
      ].join("\n");
      doc.text(termsText, tableX + 12, currentY + 24, { width: notesWidth - 24, lineGap: 3 });

      if (data.notes) {
        doc.font("Helvetica-Bold").fontSize(8).fillColor(textDark).text("Client Notes:", tableX + 12, currentY + 75);
        doc.font("Helvetica").fontSize(7.5).fillColor(textMuted).text(data.notes, tableX + 12, currentY + 87, { width: notesWidth - 24, lineGap: 2 });
      }

      // Right Box: Financial Totals Breakdown
      doc.roundedRect(summaryX, currentY, summaryWidth, 120, 6).fillAndStroke(lightBg, borderColor);

      let sumRowY = currentY + 10;
      const drawSumRow = (label: string, value: string, isBold: boolean = false, isHighlight: boolean = false) => {
        if (isHighlight) {
          doc.rect(summaryX + 6, sumRowY - 2, summaryWidth - 12, 16).fill("#fef3c7"); // Amber 100
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

            currentY += 135;

      // ================= OFFICIAL AUTHENTICITY STAMP & SIGNATURE =================
      const sealSectionY = Math.min(Math.max(currentY - 15, 620), 645);
      
      // Signature line & Authority details
      const sigLineX = margin + 14;
      const sigLineY = sealSectionY + 68;
      const sigLineWidth = 175;

      doc.moveTo(sigLineX, sigLineY).lineTo(sigLineX + sigLineWidth, sigLineY).strokeColor("#cbd5e1").stroke();
      doc.font("Helvetica-Bold").fontSize(8).fillColor(textDark).text("Syed Services Pvt Ltd", sigLineX, sigLineY + 6);
      doc.font("Helvetica").fontSize(7).fillColor(textMuted).text("Authorized Signatory & Official Seal", sigLineX, sigLineY + 16);

      // Official Transparent Rubber Stamp
      const stampPath = path.join(process.cwd(), "public", "images", "stamp-transparent.png");
      if (fs.existsSync(stampPath)) {
        try {
          doc.save();
          doc.opacity(0.88); // Authentic wet ink rubber stamp opacity
          const stampSize = 100;
          const stampX = sigLineX + sigLineWidth - 50;
          const stampY = sealSectionY - 5;
          doc.rotate(-5, { origin: [stampX + stampSize / 2, stampY + stampSize / 2] });
          doc.image(stampPath, stampX, stampY, { width: stampSize, height: stampSize });
          doc.restore();
        } catch (err) {
          console.warn("Could not render authenticity stamp in PDF:", err);
        }
      }

      // ================= FOOTER & VERIFICATION LINK =================
      const footerY = 770;
      doc.moveTo(margin, footerY).lineTo(margin + contentWidth, footerY).strokeColor(borderColor).stroke();

      doc.fillColor(textMuted).font("Helvetica").fontSize(7.5);
      doc.text("Official electronic invoice issued by Syed Services & Consultant.", margin, footerY + 8);
      doc.text("Support: info@syedservices.com.pk  |  WhatsApp: +92 309 9797771  |  https://syedservices.com.pk", margin, footerY + 18);

      if (data.accessToken) {
        doc.fillColor(accentGold).font("Helvetica-Bold").fontSize(7.5).text(`Verify Online: https://syedservices.com.pk/invoices/view/${data.accessToken}`, margin, footerY + 8, {
          width: contentWidth,
          align: "right",
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
