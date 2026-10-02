import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isNum = !isNaN(Number(id));

    const pkg = await prisma.package.findFirst({
      where: isNum
        ? { OR: [{ id: parseInt(id, 10) }, { slug: id }] }
        : { slug: id },
      select: { image: true },
    });

    if (!pkg || !pkg.image) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
    }

    const img = pkg.image.trim();

    if (img.startsWith("data:")) {
      const match = img.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const contentType = match[1] || "image/jpeg";
        const buffer = Buffer.from(match[2], "base64");
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    if (img.startsWith("http://") || img.startsWith("https://")) {
      return NextResponse.redirect(img);
    }

    if (img.startsWith("/")) {
      return NextResponse.redirect(new URL(img, req.url));
    }

    return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
  } catch (error) {
    console.error("GET_PACKAGE_IMAGE_ERROR:", error);
    return NextResponse.redirect(new URL(FALLBACK_IMAGE, req.url));
  }
}
