import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { sendAdminNotification, sendCustomerNotification } from "@/utils/email";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const service = formData.get("service") as string;
    const message = formData.get("message") as string;
    
    // Get all files
    const files = formData.getAll("files") as unknown as File[];

    if (!name || !phone || !service) {
      return NextResponse.json({ error: "Name, Phone, and Service are required" }, { status: 400 });
    }

    // Generate a unique tracking ID (88008 + 6 digits = 11 digits total)
    const trackingId = `88008${Math.floor(100000 + Math.random() * 900000)}`;

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        trackingId,
        name,
        email: email || "",
        phone,
        service,
        message: message || "",
        status: "New",
      },
    });

    // Save files if any
    const savedFiles = [];
    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads", lead.id.toString());
      await mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        if (!file || file.size === 0) continue;
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = path.join(uploadDir, safeFileName);
        
        await writeFile(filePath, buffer);
        
        const fileRecord = await prisma.file.create({
          data: {
            leadId: lead.id,
            fileName: file.name,
            fileUrl: `/uploads/${lead.id}/${safeFileName}`,
            fileType: file.type.includes("pdf") ? "pdf" : "image",
          },
        });
        savedFiles.push(fileRecord);
      }
    }

    // Send notifications (async)
    sendAdminNotification(lead, savedFiles);
    sendCustomerNotification(lead);

    return NextResponse.json({ 
      success: true, 
      message: "Application submitted successfully!",
      trackingId: lead.trackingId,
      leadId: lead.id 
    });

  } catch (error) {
    console.error("LEAD_SUBMISSION_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error during submission" },
      { status: 500 }
    );
  }
}
