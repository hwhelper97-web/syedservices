import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, verification code, and new password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.resetToken !== code.trim()) {
      return NextResponse.json(
        { error: "Invalid verification code or email address" },
        { status: 400 }
      );
    }

    if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Sync to legacy Admin table if this user is also registered as admin
    const adminExists = await prisma.admin.findUnique({
      where: { email: user.email },
    });
    if (adminExists) {
      await prisma.admin.update({
        where: { email: user.email },
        data: { password: hashedPassword },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now sign in.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
