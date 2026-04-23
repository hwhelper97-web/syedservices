import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@syedservices.com.pk";
  const password = "SyedAdmin2026!"; // You can change this later
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
      },
    });
    console.log("✅ Admin created successfully:", admin.email);
    console.log("🔑 Your password is:", password);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
