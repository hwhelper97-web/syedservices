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

    // Notify admins of the document upload if uploaded by Client or Agent
    if (session.role === "CLIENT" || session.role === "AGENT") {
      try {
        const { sendSystemNotificationToAdmins } = await import("@/utils/email");
        await sendSystemNotificationToAdmins({
          subject: `New Document Uploaded: Application ${application.trackingId}`,
          htmlContent: `
            <p>A new document has been uploaded for Application <strong>${application.trackingId}</strong> by <strong>${session.name}</strong> (${session.role}):</p>
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin: 15px 0;">
              <p style="margin: 5px 0; font-size: 13px;"><strong>Uploaded By:</strong> ${session.name} (${session.role})</p>
              <p style="margin: 5px 0; font-size: 13px;"><strong>Document Type:</strong> ${documentType}</p>
              <p style="margin: 5px 0; font-size: 13px;"><strong>File Name:</strong> ${file.name}</p>
            </div>
            <p style="font-size: 13px; color: #94a3b8;">You can view the uploaded file in the documents tab of the application detail page.</p>
          `
        });
      } catch (err) {
        console.error("Failed to send admin notification for document upload:", err);
      }
    }

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
