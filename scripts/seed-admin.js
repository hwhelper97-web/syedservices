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

  // Seed sample orders
  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    await prisma.order.createMany({
      data: [
        {
          trackingId: "TRK-849204",
          sneakerName: "Air Jordan 1 High Travis Scott 'Mocha'",
          status: "Pending Inspection",
          customerEmail: "buyer@example.com",
          price: 1200.0,
        },
        {
          trackingId: "TRK-104928",
          sneakerName: "Nike Kobe 6 Protro 'Grumble'",
          status: "Authenticated",
          customerEmail: "collector@example.com",
          price: 650.0,
        }
      ]
    });
    console.log("Sample orders seeded.");
  }

  // Seed sample appraisals
  const appraisalCount = await prisma.appraisal.count();
  if (appraisalCount === 0) {
    await prisma.appraisal.createMany({
      data: [
        {
          sneakerName: "Adidas Yeezy Boost 350 V2 'Zebra'",
          conditionScore: 9,
          boxStatus: "Good",
          status: "Pending Appraisal",
          sellerEmail: "sneakerhead@example.com",
        }
      ]
    });
    console.log("Sample appraisals seeded.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
