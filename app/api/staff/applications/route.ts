import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "STAFF") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        agent: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error("Staff applications fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error during applications fetch" },
      { status: 500 }
    );
  }
}
