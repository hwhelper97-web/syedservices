import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name, phone, role = "CLIENT", agencyName } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
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

    let user;

    if (role === "AGENT") {
      const agentCode = `AGT-${Math.floor(1000 + Math.random() * 9000)}`;
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: "AGENT",
          status: "ACTIVE",
          agentProfile: {
            create: {
              agentCode,
              phone,
              agencyName: agencyName || `${name}'s Agency`,
            },
          },
        },
        include: {
          agentProfile: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: "CLIENT",
          status: "ACTIVE",
          clientProfile: {
            create: {
              phone,
            },
          },
        },
        include: {
          clientProfile: true,
        },
      });
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
