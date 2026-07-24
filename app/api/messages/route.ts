import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, messageText, applicationId } = await req.json();

    if (!receiverId || !messageText) {
      return NextResponse.json(
        { error: "Receiver ID and message text are required" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.userId,
        receiverId: parseInt(receiverId, 10),
        applicationId: applicationId ? parseInt(applicationId, 10) : null,
        messageText,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("Message create error:", error);
    return NextResponse.json(
      { error: "Internal server error during messaging" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const partnerIdStr = searchParams.get("partnerId");

    let messages = [];

    if (partnerIdStr) {
      const partnerId = parseInt(partnerIdStr, 10);
      // Fetch direct conversation
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: session.userId },
          ],
        },
        orderBy: { createdAt: "asc" },
      });
    } else {
      // Fetch all messages involving user
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.userId },
            { receiverId: session.userId },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during messages fetch" },
      { status: 500 }
    );
  }
}
