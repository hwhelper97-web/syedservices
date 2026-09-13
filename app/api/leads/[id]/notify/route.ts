import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStatusUpdateNotification } from "@/utils/email";
import path from "path";
import fs from "fs/promises";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    }

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
      
      try {
        const uploadDir = path.join(process.cwd(), "public/uploads/results");
        await fs.mkdir(uploadDir, { recursive: true });
        const fileName = `${id}_${Date.now()}_${attachmentFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const publicPath = path.join(uploadDir, fileName);
        await fs.writeFile(publicPath, buffer);
        attachmentUrl = `https://syedservices.com.pk/uploads/results/${fileName}`;
      } catch (fsErr) {
        console.warn("Could not write result file locally:", fsErr);
        try {
          const { supabase } = await import("@/lib/supabase");
          const safeName = `results/${id}_${Date.now()}_${attachmentFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          const { error: upErr } = await supabase.storage.from("documents").upload(safeName, buffer, {
            contentType: attachmentFile.type || "application/octet-stream",
            upsert: true,
          });
          if (!upErr) {
            const { data } = supabase.storage.from("documents").getPublicUrl(safeName);
            attachmentUrl = data.publicUrl;
          }
        } catch (sbErr) {
          // ignore
        }
      }
      
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
