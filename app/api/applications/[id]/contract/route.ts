import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendSystemNotificationToAdmins } from "@/utils/email";

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

    // Role verification: Only the client owner, the assigned agent, or admins can sign
    if (session.role === "CLIENT" && application.client?.userId !== session.userId) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    const signatureName = (body.signatureName || "").trim();

    if (!signatureName) {
      return NextResponse.json(
        { error: "Full legal name is required to digitally sign the contract." },
        { status: 400 }
      );
    }

    const signedAt = new Date();

    // Update Application with digital signature
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        contractAccepted: true,
        contractAcceptedAt: signedAt,
        contractSignatureName: signatureName,
        contractStatus: "ACCEPTED",
      },
    });

    // Add status history entry
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId,
        status: application.status,
        notes: `Service Agreement / Contract digitally signed by ${signatureName} (${session.role}) on ${signedAt.toUTCString()}.`,
        updatedById: session.userId,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "SIGN_CONTRACT",
        details: `Digital contract signed by ${signatureName} for application ${application.trackingId}`,
      },
    });

    // Send single consolidated alert to admins
    try {
      const adminAppUrl = `https://www.syedservices.com.pk/portal/admin/applications/${application.id}`;
      const clientUser = application.client?.user;
      const clientName = clientUser?.name || session.name || "Client";

      await sendSystemNotificationToAdmins({
        subject: `[CONTRACT SIGNED] Application ${application.trackingId} — ${clientName}`,
        htmlContent: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #1e293b; border-radius: 20px; padding: 25px; background: #0f172a; color: #f8fafc;">
            <div style="border-bottom: 1px solid #1e293b; padding-bottom: 15px; margin-bottom: 20px;">
              <div style="display: inline-block; padding: 4px 10px; background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 20px; color: #34d399; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">
                Legal Contract Accepted
              </div>
              <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">
                Service Agreement Digitally Signed
              </h2>
              <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px;">
                Application: <strong style="color: #fbbf24; font-family: monospace;">${application.trackingId}</strong>
              </p>
            </div>

            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px; font-size: 13px;">
              <p style="margin: 6px 0;"><strong>Signer Full Name:</strong> <span style="color: #fbbf24; font-weight: bold;">${signatureName}</span></p>
              <p style="margin: 6px 0;"><strong>Signer Account:</strong> ${session.name} (${session.role})</p>
              <p style="margin: 6px 0;"><strong>Signed Timestamp:</strong> ${signedAt.toUTCString()}</p>
              <p style="margin: 6px 0;"><strong>Destination:</strong> ${application.country} (${application.visaCategory})</p>
              <p style="margin: 6px 0;"><strong>Approved Days:</strong> ${application.contractApprovedDays || "N/A"}</p>
              <p style="margin: 6px 0;"><strong>Agreed Payment:</strong> ${application.contractPaymentAmount || "N/A"}</p>
            </div>

            <div style="text-align: center; margin: 25px 0 10px 0;">
              <a href="${adminAppUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background: #fbbf24; color: #000000; text-decoration: none; font-weight: 800; font-size: 12px; border-radius: 10px; text-transform: uppercase;">
                View Contract In Admin Console →
              </a>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Failed to send admin notification for contract signature:", mailErr);
    }

    // Create in-app live notifications for Admins & Staff
    try {
      const staffAndAdmins = await prisma.user.findMany({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN", "STAFF", "AGENCY_OWNER", "MANAGER", "VISA_OFFICER"] },
        },
        select: { id: true },
      });

      if (staffAndAdmins.length > 0) {
        await prisma.notification.createMany({
          data: staffAndAdmins.map((admin) => ({
            userId: admin.id,
            title: `Contract Signed: ${signatureName}`,
            message: `Service contract for ${application.country} visa (${application.trackingId}) was signed by ${signatureName}.`,
            actionUrl: `/portal/admin/applications`,
            category: "CONTRACT",
            priority: "HIGH",
          })),
        });
      }
    } catch (notifErr) {
      console.error("Failed to create contract signature notifications:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Contract digitally signed successfully!",
      application: updatedApplication,
    });
  } catch (error: any) {
    console.error("Contract digital signing error:", error);
    return NextResponse.json(
      { error: "Internal server error during contract digital signing" },
      { status: 500 }
    );
  }
}
