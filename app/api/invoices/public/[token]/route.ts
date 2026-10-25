import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        payments: {
          where: { status: "VERIFIED" },
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            transactionId: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found or expired" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        companyName: invoice.companyName,
        customerEmail: invoice.customerEmail,
        customerPhone: invoice.customerPhone,
        customerAddress: invoice.customerAddress,
        customerCity: invoice.customerCity,
        customerCountry: invoice.customerCountry,
        taxNumber: invoice.taxNumber,
        currency: invoice.currency,
        subtotalAmount: invoice.subtotalAmount,
        discountAmount: invoice.discountAmount,
        discountType: invoice.discountType,
        discountValue: invoice.discountValue,
        taxAmount: invoice.taxAmount,
        taxRate: invoice.taxRate,
        shippingFee: invoice.shippingFee,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        balanceAmount: invoice.balanceAmount,
        status: invoice.status,
        issueDate: invoice.issueDate || invoice.createdAt,
        dueDate: invoice.dueDate,
        notes: invoice.notes,
        termsConditions: invoice.termsConditions,
        items: invoice.items,
        payments: invoice.payments,
      },
    });
  } catch (error: any) {
    console.error("Public invoice view error:", error);
    return NextResponse.json({ error: "Failed to load invoice" }, { status: 500 });
  }
}
