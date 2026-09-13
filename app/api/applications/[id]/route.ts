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

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

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
    if (session.role === "CLIENT" && application.client?.userId !== session.userId) {
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

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

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
      country,
      visaCategory,
      duration,
      entryType,
      travelDate,
      returnDate,
      purpose,
      sponsor,
      reference,
      assignedStaffId,
      contractApprovedDays,
      contractPaymentAmount,
      contractFirstPartyName,
      contractStatus,
      contractAccepted,
      contractSignatureName
    } = body;

    const updateData: any = {};

    if (country !== undefined) updateData.country = country;
    if (visaCategory !== undefined) updateData.visaCategory = visaCategory;
    if (duration !== undefined) updateData.duration = duration;
    if (entryType !== undefined) updateData.entryType = entryType;
    if (travelDate !== undefined) updateData.travelDate = travelDate;
    if (returnDate !== undefined) updateData.returnDate = returnDate;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (sponsor !== undefined) updateData.sponsor = sponsor;
    if (reference !== undefined) updateData.reference = reference;
    if (assignedStaffId !== undefined) {
      updateData.assignedStaffId = assignedStaffId ? parseInt(String(assignedStaffId), 10) : null;
    }

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

        // Create in-app notification for client and agent
        const statusLabel = status ? status.replace(/_/g, " ") : "Application Details Updated";
        const notifMsg = `Your application (${fullApp.trackingId || '#' + fullApp.id}) for ${fullApp.country} status is now: ${statusLabel}.${notes ? " Note: " + notes : ""}`;

        if (fullApp.client?.userId) {
          await prisma.notification.create({
            data: {
              userId: fullApp.client.userId,
              title: `Visa Status: ${statusLabel}`,
              message: notifMsg,
              actionUrl: "/portal/client",
              category: "PIPELINE",
              priority: "HIGH",
            },
          });
        }

        if (fullApp.agent?.userId) {
          await prisma.notification.create({
            data: {
              userId: fullApp.agent.userId,
              title: `Client Visa Status: ${statusLabel}`,
              message: `Application for client ${fullApp.client?.user?.name || "Client"} (${fullApp.trackingId || '#' + fullApp.id}) status is now: ${statusLabel}.`,
              actionUrl: "/portal/agent/applications",
              category: "PIPELINE",
              priority: "HIGH",
            },
          });
        }
      }
    } catch (emailErr) {
      console.error("Failed to send status update notification/email:", emailErr);
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER"].includes(session.role)) {
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
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Unlink any invoices tied to this application
    await prisma.invoice.updateMany({
      where: { applicationId },
      data: { applicationId: null },
    });

    // Delete messages linked to this application if any
    try {
      await prisma.message.deleteMany({
        where: { applicationId },
      });
    } catch (e) {
      // ignore if non-existent or error
    }

    // Delete the application (cascades documents and statusHistory)
    await prisma.application.delete({
      where: { id: applicationId },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_APPLICATION",
        details: `Application ${application.trackingId || applicationId} (${application.client?.user?.name || "Client"}) was deleted by ${session.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error: any) {
    console.error("Application DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error during application deletion" },
      { status: 500 }
    );
  }
}

