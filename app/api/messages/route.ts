import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, messageText, content, applicationId } = body;

    const text = messageText || content;
    if (!text) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

    let targetReceiverId = receiverId ? parseInt(receiverId, 10) : null;

    if (!targetReceiverId) {
      // Auto-route to first Admin/Super Admin
      const adminUser = await prisma.user.findFirst({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN"] }
        }
      });
      if (!adminUser) {
        return NextResponse.json({ error: "No administrator found to receive message" }, { status: 404 });
      }
      targetReceiverId = adminUser.id;
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.userId,
        receiverId: targetReceiverId,
        applicationId: applicationId ? parseInt(applicationId, 10) : null,
        messageText: text,
      },
      include: {
        sender: true,
        receiver: true,
      }
    });

    // Map content for UI rendering compatibility
    const responseMessage = {
      ...message,
      content: message.messageText,
    };

    return NextResponse.json({ success: true, message: responseMessage });
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

    let partnerId = partnerIdStr ? parseInt(partnerIdStr, 10) : null;

    if (!partnerId && (session.role === "AGENT" || session.role === "CLIENT")) {
      // Automatically chat with first Admin/Super Admin
      const adminUser = await prisma.user.findFirst({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN"] }
        }
      });
      if (adminUser) {
        partnerId = adminUser.id;
      }
    }

    let messages = [];

    if (partnerId) {
      // Fetch direct conversation
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: session.userId },
          ],
        },
        include: {
          sender: true,
          receiver: true,
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
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Map content for older frontend implementations expecting message.content
    const mappedMessages = messages.map((m: any) => ({
      ...m,
      content: m.messageText,
    }));

    return NextResponse.json({ success: true, messages: mappedMessages });
  } catch (error: any) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { error: "Internal server error during messages fetch" },
      { status: 500 }
    );
  }
}
