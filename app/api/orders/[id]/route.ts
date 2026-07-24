import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Notify agent/customer on status transition
    await sendEmail(
      existingOrder.customerEmail,
      `Order Status Changed: ${existingOrder.sneakerName}`,
      `Hello,\n\nYour order for "${existingOrder.sneakerName}" (Tracking ID: ${existingOrder.trackingId}) status has changed:\n\nFrom: ${existingOrder.status}\nTo: ${status}\n\nThank you,\nSneakerHub Team`
    );

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
