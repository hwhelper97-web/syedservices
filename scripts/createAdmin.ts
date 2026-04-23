import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  await prisma.admin.create({
    data: {
      email: "admin@syedservices.com",
      password: hash,
    },
  });

  console.log("Admin created");
}

main();