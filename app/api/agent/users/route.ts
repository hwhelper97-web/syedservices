import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentProfile = await prisma.agentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!agentProfile) {
      return NextResponse.json({ error: "Agent profile not found" }, { status: 404 });
    }

    // Fetch clients created by this agent or who have applications with this agent
    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
        OR: [
          {
            clientProfile: {
              agentId: agentProfile.id,
            },
          },
          {
            clientProfile: {
              applications: {
                some: {
                  agentId: agentProfile.id,
                },
              },
            },
          },
        ],
      },
      include: {
        clientProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, clients });
  } catch (error: any) {
    console.error("Agent fetch clients error:", error);
    return NextResponse.json(
      { error: "Internal server error during clients fetch" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentProfile = await prisma.agentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!agentProfile) {
      return NextResponse.json({ error: "Agent profile not found" }, { status: 404 });
    }

    const { email, password, name, phone } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create CLIENT user and link clientProfile to the agent
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "CLIENT",
        status: "ACTIVE",
        clientProfile: {
          create: {
            phone,
            agentId: agentProfile.id,
          },
        },
      },
      include: {
        clientProfile: true,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_CLIENT_USER",
        details: `Agent ${session.email} created client user ${email}`,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Agent client user creation error:", error);
    return NextResponse.json(
      { error: "Internal server error during client creation" },
      { status: 500 }
    );
  }
}
