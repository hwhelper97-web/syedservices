import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({ success: true, package: pkg });
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

    const updated = await prisma.package.update({
      where: { id: pkgId },
      data: {
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
        image: image || null,
        ...(featured !== undefined && { featured: featured === true || featured === "true" }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Package updated successfully!",
      package: updated,
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
