const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testQueries() {
  console.log("=== Testing Client Dashboard Query ===");
  try {
    const clientUser = await prisma.user.findFirst({
      where: { role: "CLIENT" }
    });
    console.log("Found client user:", clientUser?.id, clientUser?.email);
    
    if (clientUser) {
      const user = await prisma.user.findUnique({
        where: { id: clientUser.id },
        include: {
          clientProfile: {
            include: {
              applications: {
                orderBy: { createdAt: "desc" },
                include: {
                  documents: true,
                  invoices: true,
                }
              },
              appointments: {
                orderBy: { date: "desc" },
                take: 3,
              }
            }
          }
        }
      });
      console.log("Client dashboard query success! Profile id:", user?.clientProfile?.id);
    }
  } catch (err) {
    console.error("Client dashboard query FAILED:", err);
  }

  console.log("\n=== Testing Admin Dashboard Query ===");
  try {
    const totalApplications = await prisma.application.count();
    const pendingVerification = await prisma.application.count({
      where: { status: "WAITING_CONFIRMATION" }
    });
    const pendingInvoices = await prisma.invoice.count({
      where: { status: "UNPAID" }
    });
    const totalUsers = await prisma.user.count();

    const recentApps = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          include: {
            user: true
          }
        }
      },
      take: 6
    });

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true
      },
      take: 6
    });

    console.log("Admin queries success! totalApps:", totalApplications, "recentApps:", recentApps.length, "logs:", logs.length);
  } catch (err) {
    console.error("Admin dashboard query FAILED:", err);
  }

  await prisma.$disconnect();
}

testQueries();
