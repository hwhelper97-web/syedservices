import { prisma } from "@/lib/prisma";

export function formatPackageImage<T extends { id: number; image?: string | null; updatedAt?: Date | string }>(pkg: T): T {
  if (!pkg) return pkg;
  if (pkg.image && (pkg.image.startsWith("data:") || pkg.image.length > 500)) {
    const v = pkg.updatedAt ? new Date(pkg.updatedAt).getTime() : Date.now();
    return {
      ...pkg,
      image: `/api/packages/${pkg.id}/image?v=${v}`,
    };
  }
  return pkg;
}

export async function getActivePackages() {
  try {
    const packages = await prisma.package.findMany({
      where: { status: "ACTIVE" },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });
    return JSON.parse(JSON.stringify(packages.map(formatPackageImage)));
  } catch (error) {
    console.error("Failed to prefetch active packages:", error);
    return [];
  }
}
