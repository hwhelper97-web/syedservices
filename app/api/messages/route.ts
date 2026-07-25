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
      // Find the last message received by this client/agent to reply to the same support person
      const lastReceivedMessage = await prisma.message.findFirst({
        where: { receiverId: session.userId },
        orderBy: { createdAt: "desc" },
        include: { sender: true }
      });

      if (lastReceivedMessage && ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(lastReceivedMessage.sender.role)) {
        targetReceiverId = lastReceivedMessage.senderId;
      } else {
        // Fallback: auto-route to first Admin/Super Admin
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

    // Notify admins if this is a new message from a Client/Agent and no message was sent by them in the last 15 minutes
    if (session.role === "CLIENT" || session.role === "AGENT") {
      try {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const recentMessage = await prisma.message.findFirst({
          where: {
            senderId: session.userId,
            createdAt: { gte: fifteenMinutesAgo },
            NOT: {
              id: message.id // Exclude the current message we just created
            }
          }
        });

        if (!recentMessage) {
          const { sendSystemNotificationToAdmins } = await import("@/utils/email");
          await sendSystemNotificationToAdmins({
            subject: `New Chat Session Started by ${session.name}`,
            htmlContent: `
              <p>Client/Agent <strong>${session.name}</strong> (${session.role}) has sent a message on the support chat:</p>
              <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin: 15px 0;">
                <p style="margin: 0; font-size: 13px; font-style: italic; color: #cbd5e1;">"${text}"</p>
              </div>
              <p style="font-size: 13px; color: #94a3b8;">You can reply to this message directly in the messages tab of the admin or staff portal.</p>
            `
          });
        }
      } catch (err) {
        console.error("Failed to send admin notification for chat message:", err);
      }
    }

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

    let messages = [];

    // If session is CLIENT or AGENT, they see their own conversation thread
    if (session.role === "CLIENT" || session.role === "AGENT") {
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
        orderBy: { createdAt: "asc" },
      });
    } else {
      // If session is ADMIN, SUPER_ADMIN, or STAFF, they view the target partner's (client/agent) thread
      if (!partnerId) {
        return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
      }
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: partnerId },
            { receiverId: partnerId },
          ],
        },
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: { createdAt: "asc" },
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
