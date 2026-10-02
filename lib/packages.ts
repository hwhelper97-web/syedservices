import { prisma } from "@/lib/prisma";

export async function getActivePackages() {
  try {
    const packages = await prisma.package.findMany({
      where: { status: "ACTIVE" },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });
    return JSON.parse(JSON.stringify(packages));
  } catch (error) {
    console.error("Failed to prefetch active packages:", error);
    return [];
  }
}
