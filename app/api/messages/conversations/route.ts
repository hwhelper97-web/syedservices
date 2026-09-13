import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminOrStaff = [
      "SUPER_ADMIN",
      "ADMIN",
      "STAFF",
      "AGENCY_OWNER",
      "MANAGER",
      "VISA_OFFICER"
    ].includes(session.role);

    if (!isAdminOrStaff) {
      // For CLIENT or AGENT: get their conversation status with Support/Admin
      const unreadCount = await prisma.message.count({
        where: {
          receiverId: session.userId,
          isRead: false,
        },
      });

      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: session.userId },
            { receiverId: session.userId },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } },
        },
      });

      return NextResponse.json({
        success: true,
        unreadCount,
        lastMessage,
      });
    }

    // For Admin / Staff: Return all conversation partners (Clients and Agents)
    // 1. Get all clients and agents
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["CLIENT", "AGENT"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        clientProfile: {
          select: { phone: true, nationality: true },
        },
        agentProfile: {
          select: { phone: true, agencyName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch all messages in the system to calculate threads, last messages and unread counts
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        messageText: true,
        isRead: true,
        createdAt: true,
      },
    });

    // Group messages by client/agent ID
    const userMessageMap: Record<
      number,
      { lastMessage: any; unreadCount: number; messageCount: number }
    > = {};

    let totalUnread = 0;

    for (const msg of messages) {
      // Identify which partner (client/agent) is involved in this message
      const partnerId = users.find((u) => u.id === msg.senderId)
        ? msg.senderId
        : users.find((u) => u.id === msg.receiverId)
        ? msg.receiverId
        : null;

      if (!partnerId) continue;

      if (!userMessageMap[partnerId]) {
        userMessageMap[partnerId] = {
          lastMessage: msg,
          unreadCount: 0,
          messageCount: 0,
        };
      }

      userMessageMap[partnerId].messageCount += 1;

      // If message is from this client/agent to staff/admin and unread
      if (msg.senderId === partnerId && !msg.isRead) {
        userMessageMap[partnerId].unreadCount += 1;
        totalUnread += 1;
      }
    }

    // 3. Assemble conversations array
    const conversations = users.map((user) => {
      const thread = userMessageMap[user.id];
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.clientProfile?.phone || user.agentProfile?.phone || null,
          details: user.agentProfile?.agencyName || user.clientProfile?.nationality || null,
        },
        lastMessage: thread?.lastMessage || null,
        unreadCount: thread?.unreadCount || 0,
        messageCount: thread?.messageCount || 0,
        lastActivity: thread?.lastMessage?.createdAt || user.createdAt,
      };
    });

    // 4. Sort: Conversations with unread messages first, then by latest message date, then new users
    conversations.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;

      const timeA = new Date(a.lastActivity).getTime();
      const timeB = new Date(b.lastActivity).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      conversations,
      totalUnread,
    });
  } catch (error: any) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error during conversations fetch" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { partnerId } = body;

    if (!partnerId) {
      return NextResponse.json(
        { error: "partnerId is required" },
        { status: 400 }
      );
    }

    const targetPartnerId = parseInt(partnerId, 10);

    const isAdminOrStaff = [
      "SUPER_ADMIN",
      "ADMIN",
      "STAFF",
      "AGENCY_OWNER",
      "MANAGER",
      "VISA_OFFICER"
    ].includes(session.role);

    if (isAdminOrStaff) {
      // Mark all messages sent by this client/agent to staff/admins as read
      await prisma.message.updateMany({
        where: {
          senderId: targetPartnerId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      // Mark any chat notifications regarding this user as read
      await prisma.notification.updateMany({
        where: {
          category: "MESSAGE",
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } else {
      // For client: mark all messages sent by admin to this client as read
      await prisma.message.updateMany({
        where: {
          receiverId: session.userId,
          senderId: targetPartnerId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      await prisma.notification.updateMany({
        where: {
          userId: session.userId,
          category: "MESSAGE",
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Mark conversation read error:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
