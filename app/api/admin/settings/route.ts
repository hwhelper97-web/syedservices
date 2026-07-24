import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany({
      orderBy: { key: "asc" },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during settings fetch" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { settings } = await req.json();

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: "Settings array is required" },
        { status: 400 }
      );
    }

    // Update each setting in a transaction
    await prisma.$transaction(
      settings.map((s: any) =>
        prisma.setting.update({
          where: { key: s.key },
          data: { value: s.value },
        })
      )
    );

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_SETTINGS",
        details: "System settings updated by admin",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error during settings update" },
      { status: 500 }
    );
  }
}
