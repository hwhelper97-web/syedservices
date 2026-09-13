import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN", "STAFF", "AGENCY_OWNER", "MANAGER", "VISA_OFFICER"].includes(session.role)) {
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

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin or Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    let targetIds: number[] = [];

    if (body.ids && Array.isArray(body.ids)) {
      targetIds = body.ids.map((i: any) => Number(i)).filter((i: number) => !isNaN(i));
    } else if (body.id) {
      targetIds = [Number(body.id)].filter((i: number) => !isNaN(i));
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ error: "User ID(s) required" }, { status: 400 });
    }

    // Filter out current logged in user to prevent self-deletion
    targetIds = targetIds.filter((id) => id !== session.userId);

    // Fetch target users to verify permissions
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: targetIds } },
      select: { id: true, email: true, role: true, name: true }
    });

    // Only SUPER_ADMIN can delete other SUPER_ADMIN accounts
    const safeUsersToDelete = usersToDelete.filter(
      (u) => u.role !== "SUPER_ADMIN" || session.role === "SUPER_ADMIN"
    );

    const safeIdsToDelete = safeUsersToDelete.map((u) => u.id);

    if (safeIdsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No eligible user accounts selected for deletion" },
        { status: 400 }
      );
    }

    const deleteResult = await prisma.user.deleteMany({
      where: { id: { in: safeIdsToDelete } },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_USERS",
        details: `Deleted ${deleteResult.count} user(s) (IDs: ${safeIdsToDelete.join(", ")}) by ${session.email}`,
      },
    });

    return NextResponse.json({ 
      success: true, 
      count: deleteResult.count, 
      deletedIds: safeIdsToDelete 
    });
  } catch (error: any) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during user deletion" },
      { status: 500 }
    );
  }
}
