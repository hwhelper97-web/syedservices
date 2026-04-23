import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "abidtanha1@gmail.com";
    const password = "@Blackzerox22@"; // User mentioned this password
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.admin.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
      },
    });
    
    return Response.json({ 
      message: "Admin seeded successfully in MySQL", 
      email: admin.email 
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return Response.json({ 
      error: "Seeding failed", 
      details: error.message 
    }, { status: 500 });
  }
}
