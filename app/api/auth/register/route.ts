import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { sendWelcomeEmail, sendSystemNotificationToAdmins } from "@/utils/email";

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

    // Send welcome greeting email asynchronously
    sendWelcomeEmail(user.email, user.name, user.role).catch((err) => {
      console.error("Welcome email async send error:", err);
    });

    // Notify all admins and staff of new user registration
    sendSystemNotificationToAdmins({
      subject: `New ${user.role} Registered: ${user.name}`,
      htmlContent: `
        <p>A new user has registered on the Syed Services Portal:</p>
        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin: 15px 0;">
          <p style="margin: 5px 0; font-size: 13px;"><strong>Name:</strong> ${user.name}</p>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Account Type:</strong> ${user.role}</p>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Phone:</strong> ${phone || "N/A"}</p>
          ${agencyName ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Agency:</strong> ${agencyName}</p>` : ""}
        </div>
        <p style="font-size: 13px; color: #94a3b8;">You can view their details in the client management section of the admin panel.</p>
      `
    }).catch((err) => {
      console.error("Admin registration alert async send error:", err);
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
    console.error("Registration error detailed:", error?.stack || error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
