import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateInvoiceTotals } from "@/lib/invoiceMath";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "ALL";
    const currency = searchParams.get("currency")?.trim() || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Role-based filtering
    if (session.role === "CLIENT") {
      // Find client profile
      const client = await prisma.clientProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!client) {
        return NextResponse.json({ invoices: [], total: 0, metrics: null });
      }
      where.OR = [
        { application: { clientId: client.id } },
        { customerEmail: session.email },
      ];
    } else if (session.role === "AGENT") {
      const agent = await prisma.agentProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!agent) {
        return NextResponse.json({ invoices: [], total: 0, metrics: null });
      }
      where.application = { agentId: agent.id };
    }

    // Search query
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { clientName: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Status filter
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Currency filter
    if (currency && currency !== "ALL") {
      where.currency = currency;
    }

    const [invoices, total, allInvoicesForMetrics] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          items: { orderBy: { sortOrder: "asc" } },
          payments: { orderBy: { createdAt: "desc" } },
          application: {
            select: {
              id: true,
              trackingId: true,
              country: true,
              visaCategory: true,
              client: {
                select: {
                  phone: true,
                  user: { select: { name: true, email: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
      // Aggregate KPI metrics
      prisma.invoice.findMany({
        where: session.role === "CLIENT" || session.role === "AGENT" ? where : {},
        select: {
          status: true,
          totalAmount: true,
          paidAmount: true,
          balanceAmount: true,
          currency: true,
          dueDate: true,
        },
      }),
    ]);

    // Financial KPI aggregations
    let totalInvoiced = 0;
    let totalReceived = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;
    const now = new Date();

    allInvoicesForMetrics.forEach((inv) => {
      totalInvoiced += inv.totalAmount || 0;
      totalReceived += inv.paidAmount || 0;
      totalOutstanding += inv.balanceAmount || 0;
      if (
        (inv.status === "UNPAID" || inv.status === "ISSUED" || inv.status === "SENT" || inv.status === "PARTIALLY_PAID" || inv.status === "OVERDUE") &&
        inv.dueDate &&
        new Date(inv.dueDate) < now &&
        (inv.balanceAmount || 0) > 0
      ) {
        totalOverdue += inv.balanceAmount || 0;
      }
    });

    const metrics = {
      totalInvoices: allInvoicesForMetrics.length,
      totalInvoiced,
      totalReceived,
      totalOutstanding,
      totalOverdue,
      paidCount: allInvoicesForMetrics.filter((i) => i.status === "PAID").length,
      pendingCount: allInvoicesForMetrics.filter((i) => i.status === "UNPAID" || i.status === "ISSUED" || i.status === "SENT").length,
      partiallyPaidCount: allInvoicesForMetrics.filter((i) => i.status === "PARTIALLY_PAID").length,
      overdueCount: allInvoicesForMetrics.filter((i) => i.status === "OVERDUE" || (new Date(i.dueDate) < now && (i.balanceAmount || 0) > 0 && i.status !== "PAID" && i.status !== "VOID")).length,
    };

    return NextResponse.json({
      success: true,
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      metrics,
    });
  } catch (error: any) {
    console.error("Invoices list error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      invoiceNumber: customInvoiceNumber,
      customerName,
      customerCompany,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerCountry,
      customerTaxId,
      currency = "PKR",
      currencySymbol = "Rs",
      items = [],
      discountType = "FIXED",
      discountValue = 0,
      taxRate = 0,
      shippingFee = 0,
      dueDate,
      issueDate,
      notes,
      terms,
      applicationId,
      status = "ISSUED",
    } = body;

    // Validate line items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one line item is required." }, { status: 400 });
    }

    // Calculate totals using precision math
    const calc = calculateInvoiceTotals({
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
      amountPaid: 0,
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000),
      currentStatus: status,
    });

    // Auto-generate invoice number if not provided
    let invoiceNumber = customInvoiceNumber?.trim();
    if (!invoiceNumber) {
      const year = new Date().getFullYear();
      const count = await prisma.invoice.count();
      const padded = String(count + 1).padStart(4, "0");
      invoiceNumber = `INV-${year}-${padded}`;
    }

    // Check for duplicate invoiceNumber
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber },
    });
    if (existing) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      invoiceNumber = `${invoiceNumber}-${randomSuffix}`;
    }

    const accessToken = crypto.randomBytes(16).toString("hex");

    const created = await prisma.invoice.create({
      data: {
        invoiceNumber,
        currency,
        clientName: customerName || null,
        companyName: customerCompany || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        customerAddress: customerAddress || null,
        customerCity: customerCity || null,
        customerCountry: customerCountry || null,
        taxNumber: customerTaxId || null,
        subtotalAmount: calc.subtotal,
        discountType: discountType || "FLAT",
        discountValue: parseFloat(String(discountValue || 0)),
        discountAmount: calc.discountTotal,
        taxRate: parseFloat(String(taxRate || 0)),
        taxAmount: calc.taxTotal,
        shippingFee: calc.shippingFee,
        totalAmount: calc.totalAmount,
        paidAmount: 0,
        balanceAmount: calc.balanceDue,
        status: (calc.suggestedStatus as any) || "ISSUED",
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 86400000),
        notes: notes || null,
        termsConditions: terms || null,
        accessToken,
        applicationId: applicationId ? parseInt(String(applicationId), 10) : null,
        items: {
          create: calc.items.map((item, idx) => ({
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
        },
      },
      include: {
        items: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_INVOICE",
        details: `Invoice ${created.invoiceNumber} created by ${session.name} for ${customerName || "Customer"}`,
      },
    });

    return NextResponse.json({
      success: true,
      invoice: created,
    });
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
