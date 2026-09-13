import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

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
    const cleanFileName = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    // 1. Try to save locally to public/uploads/packages so it's a real URL
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "packages");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, cleanFileName);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        fileUrl: `/uploads/packages/${cleanFileName}`,
        fileName: file.name,
      });
    } catch (fsErr) {
      console.warn("Local storage write failed, falling back to base64 data URL:", fsErr);
    }

    // 2. Fallback to base64 Data URL if filesystem write is restricted
    const base64Content = buffer.toString("base64");
    const fileUrl = `data:${mimeType};base64,${base64Content}`;

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
