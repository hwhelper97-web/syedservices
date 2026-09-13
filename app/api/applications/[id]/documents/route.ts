import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export async function GET(
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

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (session.role === "CLIENT" && application.client?.userId !== session.userId) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      documents: application.documents,
    });
  } catch (error: any) {
    console.error("GET_DOCUMENTS_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error fetching documents" },
      { status: 500 }
    );
  }
}

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

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    // Verify application ownership (or admin/agent role)
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        agent: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Role check
    if (session.role === "CLIENT" && application.client?.userId !== session.userId) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    let documentType = "";
    let fileBuffer: Buffer | null = null;
    let fileName = "";
    let fileSize = 0;
    let mimeType = "application/octet-stream";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const jsonBody = await req.json();
      documentType = jsonBody.documentType || "";
      fileName = jsonBody.fileName || `document_${Date.now()}`;
      fileSize = jsonBody.fileSize || 0;
      mimeType = jsonBody.mimeType || "application/octet-stream";

      if (jsonBody.fileBase64) {
        const base64Clean = jsonBody.fileBase64.replace(/^data:.*?;base64,/, "");
        fileBuffer = Buffer.from(base64Clean, "base64");
        if (!fileSize) fileSize = fileBuffer.length;
      }
    } else {
      const formData = await req.formData();
      documentType = (formData.get("documentType") as string) || "";
      const file = formData.get("file") as File;

      if (file) {
        fileName = file.name;
        fileSize = file.size;
        mimeType = file.type || "application/octet-stream";
        const bytes = await file.arrayBuffer();
        fileBuffer = Buffer.from(bytes);
      }
    }

    if (!documentType || !fileBuffer) {
      return NextResponse.json(
        { error: "Document type and valid file data are required" },
        { status: 400 }
      );
    }

    const safeName = (fileName || "doc").replace(/[^a-zA-Z0-9._-]/g, "_");
    const extension = safeName.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `applications/${applicationId}/${Date.now()}_${safeName}`;

    let fileUrl = "";

    // 1. Try Supabase Storage
    try {
      if (supabase && supabase.storage) {
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(storagePath, fileBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabase.storage
            .from("documents")
            .getPublicUrl(storagePath);
          if (data?.publicUrl) {
            fileUrl = data.publicUrl;
          }
        }
      }
    } catch (storageErr) {
      console.warn("Supabase storage notice, falling back:", storageErr);
    }

    // 2. Fallback to local storage if Supabase upload was not successful
    if (!fileUrl) {
      try {
        const localDir = path.join(process.cwd(), "public", "uploads", "documents", appIdStr);
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
        const localFileName = `${Date.now()}_${safeName}`;
        const localFilePath = path.join(localDir, localFileName);
        fs.writeFileSync(localFilePath, fileBuffer);
        fileUrl = `/uploads/documents/${appIdStr}/${localFileName}`;
      } catch (localErr) {
        console.warn("Local storage fallback notice, using Base64 data URL:", localErr);
        fileUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      }
    }

    const fileType = extension;

    // Insert Document in DB
    const document = await prisma.document.create({
      data: {
        applicationId,
        documentType: documentType.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        fileUrl,
        fileName: fileName || "uploaded_document",
        fileSize,
        fileType,
      },
    });

    // If Admin/Staff uploaded an Approved Visa or Submission Confirmation:
    try {
      if (["approved_visa", "issued_visa"].includes(documentType)) {
        await prisma.application.update({
          where: { id: applicationId },
          data: { status: "APPROVED" },
        });

        if (application.client?.userId) {
          await prisma.notification.create({
            data: {
              userId: application.client.userId,
              title: "🎉 VISA APPROVED & ISSUED!",
              message: `Congratulations! Your visa for ${application.country} (${application.trackingId}) has been APPROVED and issued. You can view and download your official visa document now.`,
              actionUrl: `/portal/client/applications/${application.id}`,
              category: "PIPELINE",
              priority: "HIGH",
            },
          });
        }
      } else if (["submission_confirmation", "embassy_submission_proof"].includes(documentType)) {
        if (["DRAFT", "WAITING_CONFIRMATION", "DEAL_CONFIRMED", "SENT_FOR_INVITATION", "INVITATION_ARRIVED", "FILE_READY_EMBASSY"].includes(application.status)) {
          await prisma.application.update({
            where: { id: applicationId },
            data: { status: "APPLICATION_SUBMITTED" },
          });
        }

        if (application.client?.userId) {
          await prisma.notification.create({
            data: {
              userId: application.client.userId,
              title: "Embassy Submission Confirmation Available",
              message: `Your visa application (${application.trackingId}) for ${application.country} has been officially submitted. View and download your submission proof in the portal.`,
              actionUrl: `/portal/client/applications/${application.id}`,
              category: "PIPELINE",
              priority: "HIGH",
            },
          });
        }
      }
    } catch (notifErr) {
      console.warn("Non-fatal document notification notice:", notifErr);
    }

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "UPLOAD_DOCUMENT",
          details: `Document ${documentType} uploaded for application ${application.trackingId}`,
        },
      });
    } catch (auditErr) {
      console.warn("Non-fatal audit log notice:", auditErr);
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during document upload" },
      { status: 500 }
    );
  }
}

