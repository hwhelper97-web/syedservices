import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: appIdStr } = await params;
    const applicationId = parseInt(appIdStr, 10);

    // Verify application ownership (or admin/agent role)
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        client: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Role check
    if (session.role === "CLIENT" && application.client.userId !== session.userId) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const formData = await req.formData();
    const documentType = formData.get("documentType") as string; // passport, cnic, photo, bank_statement, invitation_letter
    const file = formData.get("file") as File;

    if (!documentType || !file) {
      return NextResponse.json(
        { error: "Document type and file are required" },
        { status: 400 }
      );
    }

    // Write file to disk
   const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

const extension =
  safeName.split(".").pop()?.toLowerCase() || "bin";

const storagePath =
  `applications/${applicationId}/${Date.now()}_${safeName}`;

const { error: uploadError } = await supabase.storage
  .from("documents")
  .upload(storagePath, buffer, {
    contentType: file.type,
    upsert: true,
  });

if (uploadError) {
  console.error(uploadError);

  return NextResponse.json(
    {
      error: uploadError.message,
    },
    {
      status: 500,
    }
  );
}

const { data } = supabase.storage
  .from("documents")
  .getPublicUrl(storagePath);

const fileUrl = data.publicUrl;
const fileType = extension;

    // Insert or update Document in DB
    const document = await prisma.document.create({
      data: {
        applicationId,
        documentType,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPLOAD_DOCUMENT",
        details: `Document ${documentType} uploaded for application ${application.trackingId}`,
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Internal server error during document upload" },
      { status: 500 }
    );
  }
}
