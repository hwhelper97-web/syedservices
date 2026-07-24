import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const adminEmail = "syedsaif@syedservices.com.pk";
    const backupAdminEmail = "abidtanha1@gmail.com";
    const password = "@Blackzerox22@";
    
    // Hash password using our utility
    const hashedPassword = await hashPassword(password);
    
    // 1. Seed legacy Admin table for both
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: { password: hashedPassword },
      create: {
        email: adminEmail,
        password: hashedPassword,
      },
    });

    await prisma.admin.upsert({
      where: { email: backupAdminEmail },
      update: { password: hashedPassword },
      create: {
        email: backupAdminEmail,
        password: hashedPassword,
      },
    });
 
    // 2. Seed Portal User table with SUPER_ADMIN role
    const superAdmin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash: hashedPassword,
        role: "SUPER_ADMIN",
        name: "Saeed Arman",
        status: "ACTIVE",
      },
      create: {
        email: adminEmail,
        passwordHash: hashedPassword,
        name: "Saeed Arman",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    await prisma.user.upsert({
      where: { email: backupAdminEmail },
      update: {
        passwordHash: hashedPassword,
        role: "SUPER_ADMIN",
        name: "Abid Tanha",
        status: "ACTIVE",
      },
      create: {
        email: backupAdminEmail,
        passwordHash: hashedPassword,
        name: "Abid Tanha",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    // 3. Seed some dummy agents and staff
    const agentEmail = "agent@syedservices.com.pk";
    const agent = await prisma.user.upsert({
      where: { email: agentEmail },
      update: {},
      create: {
        email: agentEmail,
        name: "Local Agent",
        passwordHash: hashedPassword,
        role: "AGENT",
        status: "ACTIVE",
        agentProfile: {
          create: {
            agentCode: "AGT-001",
            agencyName: "Jalalabad Partner",
            phone: "+93 764260062",
          }
        }
      }
    });

    const staffEmail = "staff@syedservices.com.pk";
    await prisma.user.upsert({
      where: { email: staffEmail },
      update: {},
      create: {
        email: staffEmail,
        name: "Support Executive",
        passwordHash: hashedPassword,
        role: "STAFF",
        status: "ACTIVE",
      }
    });

    // 4. Seed initial Settings
    const defaultSettings = [
      { key: "max_upload_size_mb", value: "10" },
      { key: "company_name", value: "Syed Services" },
      { key: "company_address", value: "Jalalabad, Afghanistan" }
    ];

    for (const setting of defaultSettings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      seededUsers: {
        superAdmin: superAdmin.email,
        agent: agent.email,
      }
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ 
      error: "Seeding failed", 
      details: error.message 
    }, { status: 500 });
  }
}
