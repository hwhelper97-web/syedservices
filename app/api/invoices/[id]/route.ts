import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateInvoiceTotals } from "@/lib/invoiceMath";

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
        payments: { orderBy: { createdAt: "desc" } },
        emailLogs: { orderBy: { sentAt: "desc" } },
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

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during invoice retrieval" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      customerName,
      customerCompany,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerCountry,
      customerTaxId,
      currency = invoice.currency || "PKR",
      items,
      discountType = invoice.discountType || "FIXED",
      discountValue = invoice.discountValue || 0,
      taxRate = invoice.taxRate || 0,
      shippingFee = invoice.shippingFee || 0,
      dueDate = invoice.dueDate,
      issueDate = invoice.issueDate || invoice.createdAt,
      notes,
      terms,
      status,
      applicationId,
    } = body;

    // Sum total verified payments
    const totalPaid = invoice.payments
      .filter((p) => p.status !== "REJECTED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    let calcResult: any = null;

    if (Array.isArray(items) && items.length > 0) {
      calcResult = calculateInvoiceTotals({
        currency,
        items: items.map((it: any, index: number) => ({
          serviceName: it.serviceName || it.description || `Item #${index + 1}`,
          description: it.description || "",
          quantity: parseFloat(String(it.quantity || 1)),
          unit: it.unit || "service",
          unitPrice: parseFloat(String(it.unitPrice || 0)),
          discountType: it.discountType || "FIXED",
          discountValue: parseFloat(String(it.discountValue || 0)),
          taxRate: parseFloat(String(it.taxRate || 0)),
          sortOrder: index,
        })),
        discountType,
        discountValue: parseFloat(String(discountValue || 0)),
        taxRate: parseFloat(String(taxRate || 0)),
        shippingFee: parseFloat(String(shippingFee || 0)),
        amountPaid: totalPaid,
        dueDate,
        currentStatus: status || invoice.status,
      });

      // Replace items
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await prisma.invoiceItem.createMany({
        data: calcResult.items.map((item: any, idx: number) => ({
          invoiceId: id,
          serviceName: item.serviceName,
          description: item.description || item.serviceName,
          quantity: Math.round(item.quantity),
          unit: item.unit || "service",
          unitPrice: item.unitPrice,
          amount: item.lineTotal,
          discount: item.lineDiscountAmount,
          discountType: item.discountType || "PERCENTAGE",
          discountValue: item.discountValue || 0,
          tax: item.lineTaxAmount,
          taxRate: item.taxRate || 0,
          sortOrder: idx,
        })),
      });
    }

    const updateData: any = {
      currency,
      clientName: customerName !== undefined ? customerName : invoice.clientName,
      companyName: customerCompany !== undefined ? customerCompany : invoice.companyName,
      customerEmail: customerEmail !== undefined ? customerEmail : invoice.customerEmail,
      customerPhone: customerPhone !== undefined ? customerPhone : invoice.customerPhone,
      customerAddress: customerAddress !== undefined ? customerAddress : invoice.customerAddress,
      customerCity: customerCity !== undefined ? customerCity : invoice.customerCity,
      customerCountry: customerCountry !== undefined ? customerCountry : invoice.customerCountry,
      taxNumber: customerTaxId !== undefined ? customerTaxId : invoice.taxNumber,
      notes: notes !== undefined ? notes : invoice.notes,
      termsConditions: terms !== undefined ? terms : invoice.termsConditions,
      dueDate: dueDate ? new Date(dueDate) : invoice.dueDate,
      issueDate: issueDate ? new Date(issueDate) : invoice.issueDate,
      applicationId: applicationId !== undefined ? (applicationId ? parseInt(String(applicationId), 10) : null) : invoice.applicationId,
    };

    if (calcResult) {
      updateData.subtotalAmount = calcResult.subtotal;
      updateData.discountType = discountType;
      updateData.discountValue = parseFloat(String(discountValue || 0));
      updateData.discountAmount = calcResult.discountTotal;
      updateData.taxRate = parseFloat(String(taxRate || 0));
      updateData.taxAmount = calcResult.taxTotal;
      updateData.shippingFee = calcResult.shippingFee;
      updateData.totalAmount = calcResult.totalAmount;
      updateData.paidAmount = totalPaid;
      updateData.balanceAmount = calcResult.balanceDue;
      updateData.status = (status as any) || (calcResult.suggestedStatus as any);
    } else if (status) {
      updateData.status = status;
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        payments: true,
        emailLogs: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_INVOICE",
        details: `Invoice ${invoice.invoiceNumber} updated by ${session.name}`,
      },
    });

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error: any) {
    console.error("Update invoice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await prisma.payment.deleteMany({ where: { invoiceId: id } });
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await prisma.invoiceEmailLog.deleteMany({ where: { invoiceId: id } });
    await prisma.invoice.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_INVOICE",
        details: `Invoice ${invoice.invoiceNumber} deleted by ${session.name}`,
      },
    });

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during invoice deletion" },
      { status: 500 }
    );
  }
}
