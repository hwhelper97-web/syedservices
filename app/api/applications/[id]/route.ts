import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        client: {
          include: {
            user: true
          }
        },
        agent: {
          include: {
            user: true
          }
        },
        documents: true,
        invoices: {
          include: {
            payments: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Auth check
    if (session.role === "CLIENT" && application.client.userId !== session.userId) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during application retrieval" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
        client: true
      }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Role check: Only ADMIN, SUPER_ADMIN, STAFF, or AGENT can modify application details
    if (session.role === "CLIENT") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
    const body = await req.json();
    const { 
      status, 
      notes,
      contractApprovedDays,
      contractPaymentAmount,
      contractFirstPartyName,
      contractStatus,
      contractAccepted,
      contractSignatureName
    } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      updateData.statusHistory = {
        create: {
          status,
          notes: notes || `Status updated to ${status.replace(/_/g, " ")} by ${session.name}`,
          updatedById: session.userId,
        }
      };
      
      // Auto-trigger contract status sent when admin confirms deal
      if (status === "DEAL_CONFIRMED") {
        updateData.contractStatus = "SENT";
        updateData.contractAccepted = false;
        updateData.contractAcceptedAt = null;
        updateData.contractSignatureName = null;
      }
    }

    if (contractApprovedDays !== undefined) updateData.contractApprovedDays = contractApprovedDays;
    if (contractPaymentAmount !== undefined) updateData.contractPaymentAmount = contractPaymentAmount;
    if (contractFirstPartyName !== undefined) updateData.contractFirstPartyName = contractFirstPartyName;
    if (contractStatus !== undefined) updateData.contractStatus = contractStatus;
    if (contractAccepted !== undefined) {
      updateData.contractAccepted = contractAccepted;
      if (contractAccepted) {
        updateData.contractAcceptedAt = new Date();
        updateData.contractStatus = "ACCEPTED";
      } else {
        updateData.contractAcceptedAt = null;
        updateData.contractStatus = "PENDING";
      }
    }
    if (contractSignatureName !== undefined) updateData.contractSignatureName = contractSignatureName;

    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: updateData
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_STATUS",
        details: `Application ${application.trackingId} status updated to ${status || 'MODIFIED'}`,
      }
    });

    // Trigger email notification if application details or status were changed
    try {
      const fullApp = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          client: {
            include: {
              user: true
            }
          },
          agent: {
            include: {
              user: true
            }
          }
        }
      });
      if (fullApp) {
        const hasChanges = status || contractStatus || contractAccepted || contractPaymentAmount || contractApprovedDays || notes;
        if (hasChanges) {
          const { sendApplicationStatusUpdateEmail } = await import("@/utils/email");
          const updateNotes = notes || `Application details were updated by ${session.name}.`;
          await sendApplicationStatusUpdateEmail(
            fullApp, 
            status || fullApp.status, 
            updateNotes
          );
        }
      }
    } catch (emailErr) {
      console.error("Failed to send status update email:", emailErr);
    }

    // Notify admins if changes are made by Client or Agent
    if (session.role === "CLIENT" || session.role === "AGENT") {
      try {
        const { sendSystemNotificationToAdmins } = await import("@/utils/email");
        await sendSystemNotificationToAdmins({
          subject: `Application ${application.trackingId} Updated by ${session.role}`,
          htmlContent: `
            <p>Application <strong>${application.trackingId}</strong> has been updated by <strong>${session.name}</strong> (${session.role}):</p>
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin: 15px 0;">
              <p style="margin: 5px 0; font-size: 13px;"><strong>Updated By:</strong> ${session.name} (${session.role})</p>
              ${contractAccepted ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Contract Status:</strong> Signed & Accepted by ${contractSignatureName}</p>` : ""}
              ${notes ? `<p style="margin: 5px 0; font-size: 13px;"><strong>Notes:</strong> ${notes}</p>` : ""}
            </div>
          `
        });
      } catch (err) {
        console.error("Failed to send admin notification for client/agent application update:", err);
      }
    }

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (error: any) {
    console.error("Application PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error during application modification" },
      { status: 500 }
    );
  }
}
