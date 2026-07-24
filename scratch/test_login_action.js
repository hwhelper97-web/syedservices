const { prisma } = require("../lib/prisma");
const { verifyPassword, signToken } = require("../lib/auth");

async function test() {
  const email = "syedsaif@syedservices.com.pk";
  const password = "@Blackzerox22@";

  console.log("Finding user...");
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("User not found");
    return;
  }
  console.log("User found:", user.email);

  console.log("Verifying password...");
  const isMatch = await verifyPassword(password, user.passwordHash);
  console.log("Password match:", isMatch);

  console.log("Signing token...");
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  console.log("Token signed successfully:", token);
}

test().catch(console.error);
