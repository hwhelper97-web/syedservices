const { prisma } = require("../lib/prisma");

async function test() {
  const email = `test_agent_${Date.now()}@syedservices.com.pk`;
  const name = "Test Agent";
  const passwordHash = "mock_hash";
  const phone = "123456789";
  const agencyName = "Test Agency";

  const agentCode = `AGT-${Math.floor(1000 + Math.random() * 9000)}`;
  
  console.log("Creating user AGENT...");
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: "AGENT",
      status: "ACTIVE",
      agentProfile: {
        create: {
          agentCode,
          phone,
          agencyName: agencyName || `${name}'s Agency`,
        },
      },
    },
    include: {
      agentProfile: true,
    },
  });

  console.log("Created successfully:", user);
}

test().catch(console.error).finally(() => prisma.$disconnect());
