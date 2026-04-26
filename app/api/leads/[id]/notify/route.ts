import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStatusUpdateNotification } from "@/utils/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: "Lead has no email address" }, { status: 400 });
    }

    const formData = await req.formData();
    const attachmentFile = formData.get("attachment") as File | null;

    let attachment = undefined;
    let attachmentUrl = undefined;
    
    if (attachmentFile) {
      const buffer = Buffer.from(await attachmentFile.arrayBuffer());
      
      // Save to public directory for direct download
      const fileName = `${id}_${Date.now()}_${attachmentFile.name}`;
      const publicPath = path.join(process.cwd(), "public/uploads/results", fileName);
      const fs = require('fs/promises');
      await fs.writeFile(publicPath, buffer);
      
      attachmentUrl = `https://syedservices.com.pk/uploads/results/${fileName}`;
      
      attachment = {
        buffer,
        filename: attachmentFile.name,
      };
    }

    await sendStatusUpdateNotification(lead, attachment, attachmentUrl);

    return NextResponse.json({ success: true, message: "Notification email sent successfully" });
  } catch (error) {
    console.error("NOTIFY_EMAIL_ERROR:", error);
    return NextResponse.json({ error: "Failed to send email notification" }, { status: 500 });
  }
}
