import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const invoiceIdStr = formData.get("invoiceId") as string;
    const amountStr = formData.get("amount") as string;
    const paymentMethod = formData.get("paymentMethod") as string; // CASH, BANK_TRANSFER, ONLINE
    const transactionId = formData.get("transactionId") as string;
    const file = formData.get("file") as File | null;

    if (!invoiceIdStr || !amountStr || !paymentMethod) {
      return NextResponse.json(
        { error: "Invoice ID, amount, and payment method are required" },
        { status: 400 }
      );
    }

    const invoiceId = parseInt(invoiceIdStr, 10);
    const amount = parseFloat(amountStr);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    let receiptUrl = null;

    if (file) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
      await mkdir(uploadDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const cleanFileName = `${invoiceId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, cleanFileName);

      await writeFile(filePath, buffer);
      receiptUrl = `/uploads/receipts/${cleanFileName}`;
    }

    // Create payment entry
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        paymentMethod: paymentMethod as any,
        transactionId,
        receiptUrl,
        status: paymentMethod === "ONLINE" ? "VERIFIED" : "PENDING", // online is auto-verified, manual is pending
      },
    });

    // If online, immediately update invoice to paid
    if (paymentMethod === "ONLINE") {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" },
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "RECORD_PAYMENT",
        details: `Payment of ${amount} recorded for invoice ID ${invoiceId}. Method: ${paymentMethod}`,
      },
    });

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { error: "Internal server error during payment recording" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let invoices: any[] = [];

    if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
      invoices = await prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          application: {
            include: {
              client: {
                include: {
                  user: true,
                },
              },
            },
          },
          payments: true,
        },
      });
    } else {
      // Client
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.userId },
      });

      if (clientProfile) {
        invoices = await prisma.invoice.findMany({
          where: {
            application: {
              clientId: clientProfile.id,
            },
          },
          orderBy: { createdAt: "desc" },
          include: {
            application: true,
            payments: true,
          },
        });
      }
    }

    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during invoice retrieval" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, status } = await req.json();

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "Payment ID and status are required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId, 10) },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        verifiedById: session.userId,
      },
    });

    if (status === "VERIFIED") {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "PAID" },
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "VERIFY_PAYMENT",
        details: `Payment ID ${paymentId} status verified: ${status}`,
      },
    });

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (error: any) {
    console.error("Payment verify PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error during payment verification" },
      { status: 500 }
    );
  }
}

