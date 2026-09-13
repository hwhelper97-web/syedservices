import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendSystemNotificationToAdmins } from "@/utils/email";

const MANDATORY_DOCS = [
  { key: "passport", label: "Passport Scan (Bio Page)" },
  { key: "cnic", label: "CNIC / National ID Card" },
  { key: "photo", label: "Passport Size Photograph" },
  { key: "bank_statement", label: "Bank Statement (Last 3 Months)" },
];

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
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Role verification
    if (session.role === "CLIENT" && application.client.userId !== session.userId) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // Verify all mandatory documents are uploaded
    const uploadedTypes = new Set(application.documents.map((d) => d.documentType));
    const missingDocs = MANDATORY_DOCS.filter((doc) => !uploadedTypes.has(doc.key));

    if (missingDocs.length > 0) {
      return NextResponse.json(
        {
          error: `Please upload all mandatory documents before submitting. Missing: ${missingDocs
            .map((d) => d.label)
            .join(", ")}`,
          missingDocs: missingDocs.map((d) => d.key),
        },
        { status: 400 }
      );
    }

    // If application was in DRAFT, move to WAITING_CONFIRMATION
    let newStatus = application.status;
    if (application.status === "DRAFT") {
      newStatus = "WAITING_CONFIRMATION";
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "WAITING_CONFIRMATION" },
      });
    }

    // Log status history
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId,
        status: newStatus,
        notes: `All required verification documents (${application.documents.length} files) submitted by ${session.name} (${session.role}).`,
        updatedById: session.userId,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "SUBMIT_DOCUMENTS",
        details: `Client ${session.name} submitted ${application.documents.length} documents for application ${application.trackingId}`,
      },
    });

    // Build single, luxury HTML email with all document links for Admin
    const clientUser = application.client?.user;
    const clientName = clientUser?.name || session.name || "Client";
    const clientEmail = clientUser?.email || "N/A";
    const clientPhone = application.client?.phone || "N/A";
    const adminAppUrl = `https://www.syedservices.com.pk/portal/admin/applications/${application.id}`;

    // Map doc types to readable names
    const docNameMap: Record<string, string> = {
      passport: "Passport Scan (Bio Page)",
      cnic: "CNIC / National ID Card",
      photo: "Passport Size Photograph",
      bank_statement: "Bank Statement (Last 3 Months)",
      invitation_letter: "Invitation Letter",
    };

    const docRows = application.documents
      .map((doc) => {
        const readableType = docNameMap[doc.documentType] || doc.documentType;
        const sizeFormatted = doc.fileSize
          ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB`
          : "N/A";
        return `
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 12px 10px; font-weight: bold; color: #f8fafc; font-size: 13px;">${readableType}</td>
            <td style="padding: 12px 10px; color: #94a3b8; font-size: 12px;">${doc.fileName} <span style="font-size: 10px; color: #64748b;">(${sizeFormatted})</span></td>
            <td style="padding: 12px 10px; text-align: right;">
              <a href="${doc.fileUrl}" target="_blank" style="display: inline-block; padding: 6px 14px; background: #fbbf24; color: #000000; text-decoration: none; font-weight: 800; font-size: 11px; border-radius: 8px; text-transform: uppercase;">
                View / Download
              </a>
            </td>
          </tr>
        `;
      })
      .join("");

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; border: 1px solid #1e293b; border-radius: 20px; padding: 25px; background: #0f172a; color: #f8fafc;">
        <div style="border-bottom: 1px solid #1e293b; padding-bottom: 18px; margin-bottom: 20px;">
          <div style="display: inline-block; padding: 4px 10px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 20px; color: #fbbf24; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">
            Complete Dossier Submission
          </div>
          <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
            All Support Documents Submitted
          </h2>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">
            Application Tracking ID: <strong style="color: #fbbf24; font-family: monospace;">${application.trackingId}</strong>
          </p>
        </div>

        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 14px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px 0; color: #fbbf24; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Applicant & Dossier Particulars
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
            <tr>
              <td style="padding: 4px 0; color: #64748b; width: 140px;">Applicant Name:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #f8fafc;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Applicant Email:</td>
              <td style="padding: 4px 0; color: #f8fafc;">${clientEmail}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Applicant Phone:</td>
              <td style="padding: 4px 0; color: #f8fafc;">${clientPhone}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Visa Destination:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #fbbf24;">${application.country} (${application.visaCategory})</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Total Files Attached:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #34d399;">${application.documents.length} verified files</td>
            </tr>
          </table>
        </div>

        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 12px 0; color: #fbbf24; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Attached Verification Documents
          </h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #334155; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px 10px;">Requirement</th>
                <th style="padding: 8px 10px;">File Details</th>
                <th style="padding: 8px 10px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${docRows}
            </tbody>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="${adminAppUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: #fbbf24; color: #000000; text-decoration: none; font-weight: 900; font-size: 13px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(251, 191, 36, 0.4);">
            Open Application In Admin Console →
          </a>
        </div>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 25px; text-align: center; color: #64748b; font-size: 11px;">
          Single consolidated notification triggered by client submission on Syed Services Portal.
        </div>
      </div>
    `;

    try {
      await sendSystemNotificationToAdmins({
        subject: `[DOCUMENTS SUBMITTED] Application ${application.trackingId} — ${clientName} (${application.country})`,
        htmlContent: emailHtml,
      });
    } catch (mailErr) {
      console.error("Failed to send admin email notification for documents submission:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: `All ${application.documents.length} documents submitted successfully! Admin has been notified in 1 consolidated email.`,
      documentCount: application.documents.length,
    });
  } catch (error: any) {
    console.error("Documents submission error:", error);
    return NextResponse.json(
      { error: "Internal server error during document submission" },
      { status: 500 }
    );
  }
}
