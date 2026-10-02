import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const extension = file.name.split(".").pop() || "jpg";

    let processedBuffer: Buffer = buffer;
    let finalMimeType = mimeType;
    let finalExtension = extension;

    // Compress images with sharp (WebP max 1200px width, 80% quality)
    try {
      if (mimeType.startsWith("image/")) {
        const compressed = await sharp(buffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        processedBuffer = Buffer.from(compressed);
        finalMimeType = "image/webp";
        finalExtension = "webp";
      }
    } catch (sharpErr) {
      console.warn("Sharp image compression skipped:", sharpErr);
    }

    const cleanFileName = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${finalExtension}`;

    // 1. Try to save locally to public/uploads/packages
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "packages");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, cleanFileName);
      fs.writeFileSync(filePath, processedBuffer);

      return NextResponse.json({
        success: true,
        fileUrl: `/uploads/packages/${cleanFileName}`,
        fileName: file.name,
      });
    } catch (fsErr) {
      console.warn("Local storage write failed, falling back to compressed base64 data URL:", fsErr);
    }

    // 2. Fallback to lightweight compressed WebP Data URL if filesystem write is restricted
    const base64Content = processedBuffer.toString("base64");
    const fileUrl = `data:${finalMimeType};base64,${base64Content}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 }
    );
  }
}
