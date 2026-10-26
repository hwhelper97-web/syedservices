import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { formatCurrencyAmount } from "./currencies";
import { generateInvoicePdfBuffer, InvoicePdfData } from "./invoicePdf";

function getTransporter() {
  const host = process.env.EMAIL_HOST || "s17.hosterpk.com";
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const secure = process.env.EMAIL_SECURE === "true";
  const user = process.env.EMAIL_USER || "info@syedservices.com.pk";
  const pass = process.env.EMAIL_PASS || "";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export interface SendInvoiceEmailParams {
  invoiceId: number;
  recipientEmail?: string | null;
  customSubject?: string | null;
  customMessage?: string | null;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.invoiceId },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      application: {
        include: { client: { include: { user: true } } },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const recipient =
    params.recipientEmail ||
    invoice.customerEmail ||
    invoice.application?.client?.user?.email;

  if (!recipient) {
    throw new Error("No recipient email address found for this invoice.");
  }

  const clientName =
    invoice.clientName ||
    invoice.application?.client?.user?.name ||
    "Valued Client";

  const publicUrl = invoice.accessToken
    ? `https://syedservices.com.pk/invoices/view/${invoice.accessToken}`
    : `https://syedservices.com.pk/portal/login`;

  const subject =
    params.customSubject ||
    `Invoice ${invoice.invoiceNumber} from Syed Services & Consultant`;

  // Prepare PDF data
  const pdfData: InvoicePdfData = {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate || invoice.createdAt,
    dueDate: invoice.dueDate,
    status: invoice.status,
    currency: invoice.currency || "PKR",
    customerName: clientName,
    customerCompany: invoice.companyName,
    customerEmail: recipient,
    customerPhone: invoice.customerPhone,
    customerAddress: invoice.customerAddress,
    customerCity: invoice.customerCity,
    customerCountry: invoice.customerCountry,
    customerTaxId: invoice.taxNumber,
    subtotal: invoice.subtotalAmount || 0,
    discountTotal: invoice.discountAmount || 0,
    taxTotal: invoice.taxAmount || 0,
    shippingFee: invoice.shippingFee || 0,
    totalAmount: invoice.totalAmount,
    amountPaid: invoice.paidAmount || 0,
    balanceDue: invoice.balanceAmount || 0,
    items: (invoice.items || []).map((it) => ({
      serviceName: it.serviceName || it.description,
      description: it.serviceName ? it.description : null,
      quantity: it.quantity,
      unit: it.unit,
      unitPrice: it.unitPrice,
      discountValue: it.discount,
      discountType: it.discountType,
      taxRate: it.taxRate,
      lineTotal: it.amount,
    })),
    notes: invoice.notes,
    terms: invoice.termsConditions,
    accessToken: invoice.accessToken,
  };

  // Generate PDF buffer
  const pdfBuffer = await generateInvoicePdfBuffer(pdfData);

  const formattedTotal = formatCurrencyAmount(invoice.totalAmount, invoice.currency, { showCode: true });
  const formattedBalance = formatCurrencyAmount(invoice.balanceAmount, invoice.currency, { showCode: true });
  const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1329; color: #e2e8f0; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4); }
    .header { background: #020617; padding: 28px 32px; border-bottom: 2px solid #facc15; display: flex; align-items: center; }
    .logo-badge { display: inline-block; width: 44px; height: 44px; background: #facc15; color: #020617; font-size: 24px; font-weight: 800; text-align: center; line-height: 44px; border-radius: 8px; vertical-align: middle; margin-right: 14px; }
    .brand-title { display: inline-block; vertical-align: middle; }
    .brand-title h1 { margin: 0; font-size: 19px; color: #ffffff; letter-spacing: 0.5px; }
    .brand-title p { margin: 2px 0 0; font-size: 11px; color: #facc15; font-weight: 600; }
    .content { padding: 32px; line-height: 1.6; font-size: 14px; }
    .greeting { font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
    .meta-box { background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
    .meta-row:last-child { margin-bottom: 0; padding-top: 10px; border-top: 1px dashed #334155; }
    .meta-label { color: #94a3b8; }
    .meta-val { font-weight: 600; color: #ffffff; }
    .balance-val { color: #facc15; font-size: 16px; font-weight: 700; }
    .btn { display: block; text-align: center; background: #facc15; color: #020617 !important; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; margin: 28px 0; letter-spacing: 0.5px; }
    .footer { background: #020617; padding: 20px 32px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; }
    .custom-note { background: #1e293b; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #facc15; margin: 16px 0; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <img src="https://syedservices.com.pk/images/logo.png" width="46" height="46" style="border-radius: 8px; vertical-align: middle; margin-right: 14px; background: #ffffff; padding: 2px;" alt="Syed Services" />
      <div class="brand-title">
        <h1>SYED SERVICES &amp; CONSULTANT</h1>
        <p>TRAVEL &amp; VISA SERVICES • PESHAWAR &amp; JALALABAD</p>
      </div>
    </div>
    <div class="content">
      <div class="greeting">Dear ${clientName},</div>
      <p>Thank you for choosing <strong>Syed Services &amp; Consultant</strong>. Please find attached official Invoice <strong>${invoice.invoiceNumber}</strong> for the requested travel, visa, or consultancy services.</p>

      ${params.customMessage ? `<div class="custom-note">${params.customMessage}</div>` : ""}

      <div class="meta-box">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="color: #94a3b8; padding: 4px 0;">Invoice Number:</td>
            <td style="text-align: right; font-weight: 600; color: #ffffff;">${invoice.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 0;">Due Date:</td>
            <td style="text-align: right; font-weight: 600; color: #ffffff;">${formattedDueDate}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 0;">Total Amount:</td>
            <td style="text-align: right; font-weight: 600; color: #ffffff;">${formattedTotal}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 4px 0;">Amount Paid:</td>
            <td style="text-align: right; font-weight: 600; color: #4ade80;">${formatCurrencyAmount(invoice.paidAmount, invoice.currency, { showCode: true })}</td>
          </tr>
          <tr style="border-top: 1px dashed #334155;">
            <td style="color: #facc15; padding: 10px 0 0; font-weight: 700; font-size: 14px;">Balance Due:</td>
            <td style="text-align: right; font-weight: 800; color: #facc15; font-size: 16px; padding-top: 10px;">${formattedBalance}</td>
          </tr>
        </table>
      </div>

      <a href="${publicUrl}" class="btn" target="_blank">View &amp; Pay Electronic Invoice Online &rarr;</a>

      <p style="font-size: 12px; color: #94a3b8;">
        An official downloadable PDF copy has also been attached to this email for your accounting records.
      </p>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
        For payment confirmation or inquiries, please reach out to our team at <a href="mailto:info@syedservices.com.pk" style="color: #facc15;">info@syedservices.com.pk</a> or WhatsApp at <strong style="color: #ffffff;">+92 309 9797771</strong>.
      </p>
    </div>
    <div class="footer">
      Syed Services &amp; Consultant • Pakistan &amp; Afghanistan<br>
      Peshawar, Pakistan | Jalalabad, Afghanistan<br>
      &copy; ${new Date().getFullYear()} Syed Services. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  const transporter = getTransporter();

  try {
    const info = await transporter.sendMail({
      from: `"Syed Services & Consultant" <${process.env.EMAIL_USER || "info@syedservices.com.pk"}>`,
      to: recipient,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Syed-Services-Invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    // Update invoice status to SENT if it was ISSUED or DRAFT
    if (invoice.status === "DRAFT" || invoice.status === "ISSUED" || invoice.status === "UNPAID") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "SENT" },
      });
    }

    // Log to InvoiceEmailLog
    await prisma.invoiceEmailLog.create({
      data: {
        invoiceId: invoice.id,
        recipientEmail: recipient,
        subject,
        status: "SENT",
        messageId: info.messageId,
      },
    });

    return { success: true, messageId: info.messageId, recipient };
  } catch (error: any) {
    // Log failure
    await prisma.invoiceEmailLog.create({
      data: {
        invoiceId: invoice.id,
        recipientEmail: recipient,
        subject,
        status: "FAILED",
        errorMessage: error.message || "Unknown email transport error",
      },
    });

    throw error;
  }
}
