const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  console.log("Testing connection to database...");
  try {
    const userCount = await prisma.user.count();
    console.log("Connected successfully! User count:", userCount);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
