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

    let whereClause: any = { userId: session.userId };

    if (isAdminOrStaff) {
      whereClause = {
        OR: [
          { userId: session.userId },
          {
            user: {
              role: {
                in: [
                  "SUPER_ADMIN",
                  "ADMIN",
                  "STAFF",
                  "AGENCY_OWNER",
                  "MANAGER",
                  "VISA_OFFICER"
                ]
              }
            }
          }
        ]
      };
    }

    // Single-pass query: fetch recent notifications without holding parallel connections
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 20,
    }).catch((err) => {
      console.warn("Notification findMany handled gracefully:", err?.message || err);
      return [];
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.warn("Fetch notifications safe fallback:", error?.message || error);
    return NextResponse.json({
      success: true,
      notifications: [],
      unreadCount: 0,
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (id) {
      await prisma.notification.updateMany({
        where: { id: parseInt(id, 10) },
        data: { isRead: true, readAt: new Date() },
      }).catch(() => null);
    } else {
      await prisma.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      }).catch(() => null);
    }

    return NextResponse.json({ success: true, message: "Marked as read" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 });
  }
}
