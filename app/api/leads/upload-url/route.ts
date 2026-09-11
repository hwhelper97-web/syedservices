import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType } = await req.json();

    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 }
      );
    }

    const safeFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const storagePath = `leads/${safeFileName}`;

    // Create signed upload URL from Supabase using Service Role
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("Supabase signed upload error:", error);
      return NextResponse.json(
        { error: "Failed to create upload authorization" },
        { status: 500 }
      );
    }

    // Determine public URL for download / viewing
    const { data: publicData } = supabase.storage
      .from("documents")
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      publicUrl: publicData.publicUrl,
      path: data.path,
      storagePath,
    });
  } catch (err: any) {
    console.error("UPLOAD_SIGN_ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error generating upload authorization" },
      { status: 500 }
    );
  }
}
