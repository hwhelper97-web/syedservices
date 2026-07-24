import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        clientProfile: true,
        agentProfile: true,
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during users fetch" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, password, name, role, agencyName, phone } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Email, password, name, and role are required fields" },
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

    const data: any = {
      email,
      passwordHash,
      name,
      role,
      status: "ACTIVE",
    };

    // If agent, create agent profile
    if (role === "AGENT") {
      const agentCode = `AGT-${Math.floor(1000 + Math.random() * 9000)}`;
      data.agentProfile = {
        create: {
          agentCode,
          agencyName,
          phone,
        },
      };
    }

    const user = await prisma.user.create({
      data,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_USER",
        details: `User ${email} created with role ${role}`,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Internal server error during user creation" },
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

    const { id, name, email, role, status, password } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    let hashedPassword = "";
    if (password) {
      hashedPassword = await hashPassword(password);
      updateData.passwordHash = hashedPassword;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Sync to legacy Admin table if updated user is also in the Admin table
    if (hashedPassword) {
      const emailToCheck = email || user.email;
      const adminExists = await prisma.admin.findUnique({
        where: { email: emailToCheck },
      });
      if (adminExists) {
        await prisma.admin.update({
          where: { email: emailToCheck },
          data: { password: hashedPassword },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_USER",
        details: `User ID ${id} updated by ${session.email}`,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Internal server error during user update" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only Super Admin can delete users" },
        { status: 403 }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === session.userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_USER",
        details: `User ID ${id} deleted by ${session.email}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error during user deletion" },
      { status: 500 }
    );
  }
}
