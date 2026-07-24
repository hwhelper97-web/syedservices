import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { agentProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: user.name,
        email: user.email,
        image: user.image || "",
        agencyName: user.agentProfile?.agencyName || "",
        licenseNumber: user.agentProfile?.licenseNumber || "",
        whatsappNumber: user.agentProfile?.whatsappNumber || "",
        officeAddress: user.agentProfile?.officeAddress || "",
        licenseCertificate: user.agentProfile?.licenseCertificate || "",
        agentCode: user.agentProfile?.agentCode || "",
      },
    });
  } catch (error: any) {
    console.error("Agent profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      image,
      agencyName,
      licenseNumber,
      whatsappNumber,
      officeAddress,
      licenseCertificate,
      currentPassword,
      newPassword,
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { agentProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userUpdateData: any = {};
    if (name) userUpdateData.name = name;
    if (image !== undefined) userUpdateData.image = image;

    // Handle password update if password fields are provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }
      const isMatch = await verifyPassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      userUpdateData.passwordHash = await hashPassword(newPassword);
    }

    // Update User
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: session.userId },
        data: userUpdateData,
      });
    }

    // Update Agent Profile
    const profileUpdate: any = {};
    if (agencyName !== undefined) profileUpdate.agencyName = agencyName;
    if (licenseNumber !== undefined) profileUpdate.licenseNumber = licenseNumber;
    if (whatsappNumber !== undefined) profileUpdate.whatsappNumber = whatsappNumber;
    if (officeAddress !== undefined) profileUpdate.officeAddress = officeAddress;
    if (licenseCertificate !== undefined) profileUpdate.licenseCertificate = licenseCertificate;

    if (user.agentProfile) {
      await prisma.agentProfile.update({
        where: { id: user.agentProfile.id },
        data: profileUpdate,
      });
    } else {
      // Create if it doesn't exist
      await prisma.agentProfile.create({
        data: {
          userId: session.userId,
          agentCode: "AGT-" + Math.floor(1000 + Math.random() * 9000),
          ...profileUpdate,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Agent profile PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
