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

let cachedServerPackages: any[] | null = null;
let lastServerFetch = 0;
const CACHE_LIFETIME_MS = 60 * 1000; // 60 seconds

export async function getActivePackages() {
  const now = Date.now();
  if (cachedServerPackages && (now - lastServerFetch < CACHE_LIFETIME_MS)) {
    return cachedServerPackages;
  }

  try {
    // 1.5s timeout promise race so initial SSR page load is never stalled
    const fetchPromise = prisma.package.findMany({
      where: { status: "ACTIVE" },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Package query timed out")), 1500)
    );

    const packages = await Promise.race([fetchPromise, timeoutPromise]);
    const formatted = JSON.parse(JSON.stringify(packages.map(formatPackageImage)));
    cachedServerPackages = formatted;
    lastServerFetch = now;
    return formatted;
  } catch (error) {
    console.warn("Notice: Fast fallback used for initial packages:", error);
    return cachedServerPackages || [];
  }
}
