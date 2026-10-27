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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Role-based filtering
    if (session.role === "CLIENT") {
      const client = await prisma.clientProfile.findUnique({
        where: { userId: session.userId },
      }).catch(() => null);
      if (!client) {
        return NextResponse.json({ invoices: [], total: 0, metrics: null });
      }
      where.OR = [
        { applicationId: { in: (await prisma.application.findMany({ where: { clientId: client.id }, select: { id: true } }).catch(() => [])).map(a => a.id) } },
        { customerEmail: session.email },
      ];
    } else if (session.role === "AGENT") {
      const agent = await prisma.agentProfile.findUnique({
        where: { userId: session.userId },
      }).catch(() => null);
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

    // 1. Fetch paginated invoices first (single connection)
    const invoices = await prisma.invoice.findMany({
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
    }).catch((err) => {
      console.error("Error fetching invoice rows:", err);
      return [];
    });

    // 2. Determine total count safely
    let total = invoices.length;
    if (page === 1 && invoices.length < limit) {
      total = invoices.length;
    } else {
      total = await prisma.invoice.count({ where }).catch(() => invoices.length);
    }

    // 3. Compute KPI metrics safely with resilient fallback
    let metrics = null;
    try {
      const scopeWhere: any = session.role === "CLIENT" || session.role === "AGENT" ? { ...where } : {};
      delete scopeWhere.currency;

      const allScopedRows = await prisma.invoice.findMany({
        where: scopeWhere,
        select: {
          currency: true,
          status: true,
          totalAmount: true,
          paidAmount: true,
          balanceAmount: true,
          dueDate: true,
        },
        take: 300,
      }).catch(() => []);

      const currencyBreakdown: Record<string, { count: number; totalInvoiced: number; totalReceived: number; totalOutstanding: number }> = {
        PKR: { count: 0, totalInvoiced: 0, totalReceived: 0, totalOutstanding: 0 },
        AFN: { count: 0, totalInvoiced: 0, totalReceived: 0, totalOutstanding: 0 },
        USD: { count: 0, totalInvoiced: 0, totalReceived: 0, totalOutstanding: 0 },
        CAD: { count: 0, totalInvoiced: 0, totalReceived: 0, totalOutstanding: 0 },
      };

      allScopedRows.forEach((row: any) => {
        const c = (row.currency || "PKR").toUpperCase();
        if (!currencyBreakdown[c]) {
          currencyBreakdown[c] = { count: 0, totalInvoiced: 0, totalReceived: 0, totalOutstanding: 0 };
        }
        currencyBreakdown[c].count += 1;
        currencyBreakdown[c].totalInvoiced += row.totalAmount || 0;
        currencyBreakdown[c].totalReceived += row.paidAmount || 0;
        currencyBreakdown[c].totalOutstanding += row.balanceAmount || 0;
      });

      const activeRows = (currency && currency !== "ALL")
        ? allScopedRows.filter((r: any) => (r.currency || "").toUpperCase() === currency.toUpperCase())
        : allScopedRows;

      const source = activeRows.length > 0 ? activeRows : invoices;
      let totalInvoiced = 0;
      let totalReceived = 0;
      let totalOutstanding = 0;
      let totalOverdue = 0;
      const now = new Date();

      source.forEach((inv: any) => {
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

      metrics = {
        activeCurrency: currency && currency !== "ALL" ? currency.toUpperCase() : "ALL",
        totalInvoices: activeRows.length || total,
        totalInvoiced,
        totalReceived,
        totalOutstanding,
        totalOverdue,
        paidCount: source.filter((i: any) => i.status === "PAID").length,
        pendingCount: source.filter((i: any) => i.status === "UNPAID" || i.status === "ISSUED" || i.status === "SENT").length,
        partiallyPaidCount: source.filter((i: any) => i.status === "PARTIALLY_PAID").length,
        overdueCount: source.filter((i: any) => i.status === "OVERDUE" || (new Date(i.dueDate) < now && (i.balanceAmount || 0) > 0 && i.status !== "PAID" && i.status !== "VOID")).length,
        currencyBreakdown,
      };
    } catch {
      // Fallback metrics from current page
      metrics = {
        activeCurrency: currency && currency !== "ALL" ? currency.toUpperCase() : "ALL",
        totalInvoices: total,
        totalInvoiced: invoices.reduce((s, i) => s + (i.totalAmount || 0), 0),
        totalReceived: invoices.reduce((s, i) => s + (i.paidAmount || 0), 0),
        totalOutstanding: invoices.reduce((s, i) => s + (i.balanceAmount || 0), 0),
        totalOverdue: 0,
        paidCount: invoices.filter((i) => i.status === "PAID").length,
        pendingCount: invoices.filter((i) => i.status === "UNPAID" || i.status === "ISSUED" || i.status === "SENT").length,
        partiallyPaidCount: invoices.filter((i) => i.status === "PARTIALLY_PAID").length,
        overdueCount: 0,
        currencyBreakdown: {},
      };
    }

    return NextResponse.json({
      success: true,
      invoices,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      metrics,
    });
  } catch (error: any) {
    console.error("Invoices list fatal error:", error);
    return NextResponse.json({
      success: true,
      invoices: [],
      total: 0,
      page: 1,
      limit: 15,
      totalPages: 1,
      metrics: null,
    });
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

    // Auto-generate unique invoice number if not provided
    let invoiceNumber = customInvoiceNumber?.trim();
    if (!invoiceNumber) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      invoiceNumber = `INV-${year}-${Date.now().toString().slice(-4)}${rand.toString().slice(-2)}`;
    }

    const accessToken = crypto.randomBytes(16).toString("hex");

    // Execute create with resilient retry for connection pool spikes
    let created: any = null;
    let attempts = 0;
    while (attempts < 3) {
      try {
        created = await prisma.invoice.create({
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
        break;
      } catch (err: any) {
        attempts++;
        if (attempts >= 3) throw err;
        await new Promise((resolve) => setTimeout(resolve, 600 * attempts));
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_INVOICE",
        details: `Invoice ${created.invoiceNumber} created by ${session.name} for ${customerName || "Customer"}`,
      },
    }).catch(() => null);

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
