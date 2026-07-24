const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "syedsaif@syedservices.com.pk";
  const password = "@Blackzerox22@";
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      email,
      password: hashedPassword,
    },
  });

  const portalUser = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
      name: "Saeed Arman",
      status: "ACTIVE",
    },
    create: {
      email,
      passwordHash: hashedPassword,
      name: "Saeed Arman",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Admin user seeded in legacy Admin table:", admin.email);
  console.log("Admin user seeded in Portal User table:", portalUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
