import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateInvoicePdfBuffer, InvoicePdfData } from "@/lib/invoicePdf";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        application: {
          include: {
            client: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Role check: Clients can only download their own invoice
    if (session.role === "CLIENT") {
      const client = await prisma.clientProfile.findUnique({
        where: { userId: session.userId },
      });
      const isOwner =
        (client && invoice.application?.clientId === client.id) ||
        invoice.customerEmail === session.email;
      if (!isOwner) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const customerName =
      invoice.clientName ||
      invoice.application?.client?.user?.name ||
      "Valued Client";

    const pdfData: InvoicePdfData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate || invoice.createdAt,
      dueDate: invoice.dueDate,
      status: invoice.status,
      currency: invoice.currency || "PKR",
      customerName,
      customerCompany: invoice.companyName,
      customerEmail: invoice.customerEmail || invoice.application?.client?.user?.email,
      customerPhone: invoice.customerPhone || invoice.application?.client?.phone,
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
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
