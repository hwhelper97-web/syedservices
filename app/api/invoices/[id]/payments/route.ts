import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { roundToCurrency } from "@/lib/invoiceMath";

export async function POST(
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
      amount,
      paymentMethod = "BANK_TRANSFER",
      transactionId,
      receiptUrl,
      notes,
      paymentDate,
    } = body;

    const paymentAmount = parseFloat(String(amount));
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ error: "Payment amount must be greater than zero." }, { status: 400 });
    }

    // Create payment entry
    const payment = await prisma.payment.create({
      data: {
        invoiceId: id,
        amount: roundToCurrency(paymentAmount, invoice.currency),
        paymentMethod: paymentMethod as any,
        transactionId: transactionId || null,
        receiptUrl: receiptUrl || null,
        notes: notes || null,
        status: "VERIFIED",
        verifiedById: session.userId,
        createdAt: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });

    // Recalculate total paid
    const updatedPayments = await prisma.payment.findMany({
      where: { invoiceId: id, status: "VERIFIED" },
    });

    const totalPaid = roundToCurrency(
      updatedPayments.reduce((sum, p) => sum + p.amount, 0),
      invoice.currency
    );

    const balanceDue = roundToCurrency(
      Math.max(0, invoice.totalAmount - totalPaid),
      invoice.currency
    );

    let newStatus = invoice.status;
    if (balanceDue <= 0.0001 && invoice.totalAmount > 0) {
      newStatus = "PAID";
    } else if (totalPaid > 0) {
      newStatus = "PARTIALLY_PAID";
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: totalPaid,
        balanceAmount: balanceDue,
        status: newStatus,
      },
      include: {
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "RECORD_PAYMENT",
        details: `Recorded payment of ${invoice.currency} ${paymentAmount} for invoice ${invoice.invoiceNumber} by ${session.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      payment,
      invoice: updatedInvoice,
    });
  } catch (error: any) {
    console.error("Record payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record payment" },
      { status: 500 }
    );
  }
}
