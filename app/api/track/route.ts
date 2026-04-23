import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingId = searchParams.get("id");

  if (!trackingId) {
    return NextResponse.json({ error: "Tracking ID is required" }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { trackingId },
      select: {
        name: true,
        service: true,
        status: true,
        createdAt: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: "Failed to track application" }, { status: 500 });
  }
}
