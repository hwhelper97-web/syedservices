import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rm } from "fs/promises";
import path from "path";
import { sendStatusUpdateNotification } from "@/utils/email";

// Update lead status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const leadId = parseInt(id);

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    // Send email notification to customer about status change
    if (updatedLead.email) {
      sendStatusUpdateNotification(updatedLead);
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("UPDATE_LEAD_ERROR:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

// Delete lead
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    // Delete files from filesystem
    const leadDir = path.join(process.cwd(), "public/uploads", id);
    try {
      await rm(leadDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("Could not delete lead directory:", e);
    }

    await prisma.lead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_LEAD_ERROR:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
