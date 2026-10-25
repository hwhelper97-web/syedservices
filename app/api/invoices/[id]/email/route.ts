import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendInvoiceEmail } from "@/lib/invoiceEmail";
import { prisma } from "@/lib/prisma";

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

    const body = await req.json().catch(() => ({}));
    const { recipientEmail, customSubject, customMessage } = body;

    const result = await sendInvoiceEmail({
      invoiceId: id,
      recipientEmail,
      customSubject,
      customMessage,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "SEND_INVOICE_EMAIL",
        details: `Invoice #${id} emailed to ${result.recipient} by ${session.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Invoice email successfully sent to ${result.recipient}`,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("Send invoice email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send invoice email" },
      { status: 500 }
    );
  }
}
