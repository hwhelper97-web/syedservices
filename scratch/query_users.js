const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users.map(u => ({ id: u.id, email: u.email, role: u.role, status: u.status })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
