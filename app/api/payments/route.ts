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

    const contentType = req.headers.get("content-type") || "";

    // Support creating invoice via JSON
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body.action === "CREATE_INVOICE" || body.totalAmount !== undefined) {
        if (!["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER", "MANAGER"].includes(session.role)) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        const { applicationId, totalAmount, dueDate, invoiceNumber, status } = body;
        const invNum = invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
        const newInvoice = await prisma.invoice.create({
          data: {
            invoiceNumber: invNum,
            applicationId: applicationId ? parseInt(String(applicationId), 10) : null,
            totalAmount: parseFloat(String(totalAmount)),
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000),
            status: status || "UNPAID",
          },
          include: {
            application: {
              include: {
                client: {
                  include: { user: true },
                },
              },
            },
            payments: true,
          },
        });

        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: "CREATE_INVOICE",
            details: `Invoice ${invNum} of amount $${totalAmount} created by ${session.name}`,
          },
        });

        return NextResponse.json({ success: true, invoice: newInvoice });
      }
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
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
        await mkdir(uploadDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const cleanFileName = `${invoiceId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = path.join(uploadDir, cleanFileName);

        await writeFile(filePath, buffer);
        receiptUrl = `/uploads/receipts/${cleanFileName}`;
      } catch (fsErr) {
        console.warn("Local receipt file write failed, trying Supabase / base64 fallback:", fsErr);
        try {
          const { supabase } = await import("@/lib/supabase");
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const cleanFileName = `receipts/${invoiceId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          const { error: upErr } = await supabase.storage.from("documents").upload(cleanFileName, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: true,
          });
          if (!upErr) {
            const { data } = supabase.storage.from("documents").getPublicUrl(cleanFileName);
            receiptUrl = data.publicUrl;
          } else {
            receiptUrl = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
          }
        } catch (fbErr) {
          const bytes = await file.arrayBuffer();
          receiptUrl = `data:${file.type || "image/jpeg"};base64,${Buffer.from(bytes).toString("base64")}`;
        }
      }
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

    if (["SUPER_ADMIN", "ADMIN", "STAFF", "AGENCY_OWNER", "MANAGER", "VISA_OFFICER"].includes(session.role)) {
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
              package: true,
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
            application: {
              include: {
                package: true,
              },
            },
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

    if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER", "MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { paymentId, invoiceId, status, totalAmount, dueDate } = body;

    // Case 1: Updating an invoice
    if (invoiceId) {
      const invId = parseInt(String(invoiceId), 10);
      const invoice = await prisma.invoice.findUnique({
        where: { id: invId },
      });

      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (totalAmount !== undefined) updateData.totalAmount = parseFloat(String(totalAmount));
      if (dueDate) updateData.dueDate = new Date(dueDate);

      const updatedInvoice = await prisma.invoice.update({
        where: { id: invId },
        data: updateData,
        include: {
          application: {
            include: {
              client: {
                include: { user: true },
              },
            },
          },
          payments: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "UPDATE_INVOICE",
          details: `Invoice ${invoice.invoiceNumber} updated by ${session.name}: Status=${status || invoice.status}, Amount=${totalAmount ?? invoice.totalAmount}`,
        },
      });

      return NextResponse.json({ success: true, invoice: updatedInvoice });
    }

    // Case 2: Updating payment verification
    if (paymentId && status) {
      const payment = await prisma.payment.findUnique({
        where: { id: parseInt(String(paymentId), 10) },
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
    }

    return NextResponse.json(
      { error: "paymentId or invoiceId with status is required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Payment PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error during update" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let invoiceIdStr = searchParams.get("invoiceId");
    let paymentIdStr = searchParams.get("paymentId");
    let batchInvoiceIds: number[] = [];

    try {
      const body = await req.json();
      if (body.invoiceIds && Array.isArray(body.invoiceIds)) {
        batchInvoiceIds = body.invoiceIds.map((id: any) => parseInt(String(id), 10)).filter((id: number) => !isNaN(id));
      } else if (body.ids && Array.isArray(body.ids)) {
        batchInvoiceIds = body.ids.map((id: any) => parseInt(String(id), 10)).filter((id: number) => !isNaN(id));
      }
      if (body.invoiceId) invoiceIdStr = String(body.invoiceId);
      if (body.paymentId) paymentIdStr = String(body.paymentId);
    } catch (e) {
      // empty body is fine
    }

    // Handle batch deletion of invoices
    if (batchInvoiceIds.length > 0) {
      // Delete any payment receipts / records linked to these invoices
      await prisma.payment.deleteMany({
        where: { invoiceId: { in: batchInvoiceIds } },
      });

      // Delete the invoices
      const deleteResult = await prisma.invoice.deleteMany({
        where: { id: { in: batchInvoiceIds } },
      });

      // Audit log
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: "BATCH_DELETE_INVOICES",
            details: `Batch deleted ${deleteResult.count} invoices (IDs: ${batchInvoiceIds.join(", ")}) by ${session.name}`,
          },
        });
      } catch (e) {
        // ignore
      }

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${deleteResult.count} invoices.`,
        count: deleteResult.count,
      });
    }

    if (invoiceIdStr) {
      const invoiceId = parseInt(invoiceIdStr, 10);
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      await prisma.payment.deleteMany({
        where: { invoiceId },
      });

      await prisma.invoice.delete({
        where: { id: invoiceId },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "DELETE_INVOICE",
          details: `Invoice ${invoice.invoiceNumber} ($${invoice.totalAmount}) deleted by ${session.name}`,
        },
      });

      return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
    }

    if (paymentIdStr) {
      const paymentId = parseInt(paymentIdStr, 10);
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      await prisma.payment.delete({
        where: { id: paymentId },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "DELETE_PAYMENT",
          details: `Payment transaction ${paymentId} deleted by ${session.name}`,
        },
      });

      return NextResponse.json({ success: true, message: "Payment deleted successfully" });
    }

    return NextResponse.json(
      { error: "invoiceId or paymentId parameter is required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Payment DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error during deletion" },
      { status: 500 }
    );
  }
}


