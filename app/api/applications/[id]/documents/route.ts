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

    const formData = await req.formData();
    const documentType = formData.get("documentType") as string;
    const file = formData.get("file") as File;

    if (!documentType || !file) {
      return NextResponse.json(
        { error: "Document type and file are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const extension = safeName.split(".").pop()?.toLowerCase() || "bin";
    const storagePath = `applications/${applicationId}/${Date.now()}_${safeName}`;

    let fileUrl = "";

    // 1. Try Supabase Storage
    try {
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (!uploadError) {
        const { data } = supabase.storage
          .from("documents")
          .getPublicUrl(storagePath);
        fileUrl = data.publicUrl;
      }
    } catch (storageErr) {
      console.warn("Supabase storage error, attempting local storage fallback:", storageErr);
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
        fs.writeFileSync(localFilePath, buffer);
        fileUrl = `/uploads/documents/${appIdStr}/${localFileName}`;
      } catch (localErr) {
        console.warn("Local storage fallback failed, using Base64 data URL:", localErr);
        const mime = file.type || "application/pdf";
        fileUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      }
    }

    const fileType = extension;

    // Insert Document in DB
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

    // If Admin/Staff uploaded an Approved Visa or Submission Confirmation:
    if (["approved_visa", "issued_visa"].includes(documentType)) {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
        },
      });

      // Notify Client
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
          data: {
            status: "APPLICATION_SUBMITTED",
          },
        });
      }

      // Notify Client
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

    // Audit log
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

