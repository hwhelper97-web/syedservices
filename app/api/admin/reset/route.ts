import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return Response.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    const newPassword = "Admin@12345";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Sync to Portal User table if the user exists there as well
    const portalUser = await prisma.user.findUnique({
      where: { email },
    });
    if (portalUser) {
      await prisma.user.update({
        where: { email },
        data: {
          passwordHash: hashedPassword,
        },
      });
    }

    return Response.json({
      success: true,
      email,
      password: newPassword,
      message: "Password has been reset successfully.",
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}