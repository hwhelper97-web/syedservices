import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const featured = searchParams.get("featured");
    const all = searchParams.get("all");
    const search = searchParams.get("search");

    const where: any = {};

    if (all !== "true") {
      where.status = "ACTIVE";
    }

    if (country && country !== "ALL") {
      where.country = {
        contains: country,
        mode: "insensitive",
      };
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { visaType: { contains: search, mode: "insensitive" } },
      ];
    }

    const packages = await prisma.package.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      packages,
    });
  } catch (error: any) {
    console.error("GET_PACKAGES_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      country,
      visaType,
      agencyNumber,
      priceUSD,
      pricePKR,
      priceAFN,
      duration,
      processingTime,
      description,
      documents,
      image,
      featured,
      status,
    } = body;

    if (!title || !country || !agencyNumber || !description || !documents) {
      return NextResponse.json(
        { error: "Title, country, agency contact number, description, and documents requirement are required." },
        { status: 400 }
      );
    }

    // Generate safe slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPackage = await prisma.package.create({
      data: {
        title,
        slug,
        country,
        visaType: visaType || "Tourist Visa",
        agencyNumber: agencyNumber.trim(),
        priceUSD: priceUSD ? parseFloat(priceUSD) : null,
        pricePKR: pricePKR ? parseFloat(pricePKR) : null,
        priceAFN: priceAFN ? parseFloat(priceAFN) : null,
        duration: duration || null,
        processingTime: processingTime || null,
        description,
        documents,
        image: image || null,
        featured: featured === true || featured === "true",
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Package created successfully!",
      package: newPackage,
    });
  } catch (error: any) {
    console.error("CREATE_PACKAGE_ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error creating package" },
      { status: 500 }
    );
  }
}
