import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-service";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { sneakerName, customerEmail, price } = await req.json();

    if (!sneakerName || !customerEmail) {
      return NextResponse.json({ error: "Sneaker name and email are required" }, { status: 400 });
    }

    const trackingId = "TRK-" + Math.floor(100000 + Math.random() * 900000);

    const order = await prisma.order.create({
      data: {
        trackingId,
        sneakerName,
        customerEmail,
        price: parseFloat(price) || 0.0,
        status: "Pending Inspection",
      },
    });

    // Log the email notification
    await sendEmail(
      customerEmail,
      `Order Created: ${sneakerName} (${trackingId})`,
      `Hello,\n\nWe have successfully created your order for "${sneakerName}".\nTracking ID: ${trackingId}\nStatus: Pending Inspection\nPrice: $${price}\n\nWe will inspect the item shortly.\n\nBest regards,\nSneakerHub Team`
    );

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
