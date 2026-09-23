import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const numId = parseInt(id, 10);

  let pkg = null;
  try {
    pkg = isNaN(numId)
      ? await prisma.package.findFirst({ where: { slug: id } })
      : await prisma.package.findUnique({ where: { id: numId } });
  } catch (e) {
    // ignore
  }

  if (!pkg) {
    return {
      title: "Travel & Visa Package Details",
      description: "Explore verified visa, flight, and tour packages from Syed Services.",
    };
  }

  const title = `${pkg.title} - ${pkg.country} Visa Package`;
  const description = `${pkg.description.slice(0, 150)}... Guaranteed visa processing in USD, PKR, and AFN with Syed Services.`;
  const url = `https://www.syedservices.com.pk/packages/${pkg.slug || pkg.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/packages/${pkg.slug || pkg.id}`,
    },
    openGraph: {
      title: `${title} | Syed Services`,
      description,
      url,
      images: pkg.image ? [{ url: pkg.image, alt: pkg.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Syed Services`,
      description,
      images: pkg.image ? [pkg.image] : [],
    },
  };
}

export default async function PackageDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.syedservices.com.pk" },
          { name: "Packages", url: "https://www.syedservices.com.pk/packages" },
          { name: "Package Details", url: `https://www.syedservices.com.pk/packages/${id}` }
        ]}
      />
      {children}
    </>
  );
}
