import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Only clients can schedule appointments" },
        { status: 403 }
      );
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Client profile not found. Please submit your info first." },
        { status: 400 }
      );
    }

    const { date, timeSlot, notes } = await req.json();

    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: "Date and time slot are required" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: clientProfile.id,
        date: new Date(date),
        timeSlot,
        notes,
        status: "SCHEDULED",
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "BOOK_APPOINTMENT",
        details: `Appointment booked for ${date} at ${timeSlot}`,
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error("Appointment create error:", error);
    return NextResponse.json(
      { error: "Internal server error during appointment booking" },
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

    let appointments: any[] = [];

    if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
      appointments = await prisma.appointment.findMany({
        orderBy: { date: "asc" },
        include: {
          client: {
            include: {
              user: true,
            },
          },
        },
      });
    } else {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.userId },
      });

      if (clientProfile) {
        appointments = await prisma.appointment.findMany({
          where: { clientId: clientProfile.id },
          orderBy: { date: "asc" },
        });
      }
    }

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during appointments retrieval" },
      { status: 500 }
    );
  }
}
