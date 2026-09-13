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
      // Admins and staff receive their own direct notifications PLUS any broadcast admin alerts
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

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
      prisma.notification.count({
        where: {
          ...whereClause,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching notifications" },
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
    const { notificationId, markAll } = body;

    const isAdminOrStaff = [
      "SUPER_ADMIN",
      "ADMIN",
      "STAFF",
      "AGENCY_OWNER",
      "MANAGER",
      "VISA_OFFICER"
    ].includes(session.role);

    if (markAll) {
      let whereClause: any = { userId: session.userId, isRead: false };
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
          ],
          isRead: false,
        };
      }

      await prisma.notification.updateMany({
        where: whereClause,
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (notificationId) {
      const notifId = parseInt(notificationId, 10);
      if (isNaN(notifId)) {
        return NextResponse.json({ error: "Invalid notificationId" }, { status: 400 });
      }

      await prisma.notification.update({
        where: { id: notifId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "notificationId or markAll is required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
