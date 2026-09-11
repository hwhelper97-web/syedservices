import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

    const invoice = await prisma.invoice.findUnique({
      where: { id },
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status, totalAmount, dueDate, applicationId } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (totalAmount !== undefined) updateData.totalAmount = parseFloat(String(totalAmount));
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (applicationId !== undefined) {
      updateData.applicationId = applicationId ? parseInt(String(applicationId), 10) : null;
    }

    const updated = await prisma.invoice.update({
      where: { id },
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
        details: `Invoice ${invoice.invoiceNumber} updated by ${session.name}`,
      },
    });

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during invoice update" },
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
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await prisma.payment.deleteMany({ where: { invoiceId: id } });
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
