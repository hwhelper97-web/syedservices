import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingId = (
    searchParams.get("id") ||
    searchParams.get("trackingId") ||
    searchParams.get("trackingNumber") ||
    searchParams.get("code") ||
    ""
  ).trim();

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
      const app = await prisma.application.findUnique({
        where: { trackingId },
        include: {
          client: {
            include: {
              user: true,
            },
          },
        },
      });

      if (app) {
        return NextResponse.json({
          name: app.client?.user?.name || "Applicant",
          service: `${app.country} - ${app.visaCategory}`,
          status: app.status.replace(/_/g, " "),
          createdAt: app.createdAt,
        });
      }

      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: "Failed to track application" }, { status: 500 });
  }
}
