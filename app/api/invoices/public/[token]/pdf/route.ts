import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdfBuffer, InvoicePdfData } from "@/lib/invoicePdf";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.length < 8) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { accessToken: token },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found or expired" }, { status: 404 });
    }

    const customerName = invoice.clientName || "Valued Client";

    const pdfData: InvoicePdfData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate || invoice.createdAt,
      dueDate: invoice.dueDate,
      status: invoice.status,
      currency: invoice.currency || "PKR",
      customerName,
      customerCompany: invoice.companyName,
      customerEmail: invoice.customerEmail,
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

    const pdfBuffer = await generateInvoicePdfBuffer(pdfData);
    const filename = `Syed-Services-Invoice-${invoice.invoiceNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=120",
      },
    });
  } catch (error: any) {
    console.error("Public PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
