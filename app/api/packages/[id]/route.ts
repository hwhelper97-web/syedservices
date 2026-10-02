import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPackageImage } from "@/lib/packages";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isNum = !isNaN(Number(id));

    const pkg = await prisma.package.findFirst({
      where: isNum
        ? { OR: [{ id: parseInt(id) }, { slug: id }] }
        : { slug: id },
    });

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, package: formatPackageImage(pkg) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("GET_PACKAGE_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkgId = parseInt(id);

    if (isNaN(pkgId)) {
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
    }

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

    const dataToUpdate: any = {
      ...(title && { title }),
      ...(country && { country }),
      ...(visaType !== undefined && { visaType }),
      ...(agencyNumber && { agencyNumber }),
      priceUSD: priceUSD ? parseFloat(priceUSD) : null,
      pricePKR: pricePKR ? parseFloat(pricePKR) : null,
      priceAFN: priceAFN ? parseFloat(priceAFN) : null,
      duration: duration || null,
      processingTime: processingTime || null,
      ...(description && { description }),
      ...(documents && { documents }),
      ...(featured !== undefined && { featured: featured === true || featured === "true" }),
      ...(status && { status }),
    };

    // If an image was submitted, check if it's the virtual URL or a real change
    if (image !== undefined) {
      if (typeof image === "string" && image.startsWith("/api/packages/")) {
        // Retain existing image in database, do not overwrite with virtual route URL
      } else {
        dataToUpdate.image = image || null;
      }
    }

    const updated = await prisma.package.update({
      where: { id: pkgId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Package updated successfully!",
      package: formatPackageImage(updated),
    });
  } catch (error: any) {
    console.error("UPDATE_PACKAGE_ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update package" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkgId = parseInt(id);

    if (isNaN(pkgId)) {
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
    }

    await prisma.package.delete({
      where: { id: pkgId },
    });

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully!",
    });
  } catch (error: any) {
    console.error("DELETE_PACKAGE_ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete package" },
      { status: 500 }
    );
  }
}
