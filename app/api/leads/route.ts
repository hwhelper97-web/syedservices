import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { sendAdminNotification, sendCustomerNotification, sendSystemNotificationToAdmins } from "@/utils/email";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const service = formData.get("service") as string;
    const message = formData.get("message") as string;
    
    // Visa specific fields
    const dob = formData.get("dob") as string;
    const fatherName = formData.get("fatherName") as string;
    const motherName = formData.get("motherName") as string;
    const maritalStatus = formData.get("maritalStatus") as string;
    const spouseName = formData.get("spouseName") as string;
    const passportNumber = formData.get("passportNumber") as string;
    const passportExpiry = formData.get("passportExpiry") as string;
    const country = formData.get("country") as string;
    
    // Get all files from all keys
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        files.push(value);
      }
    }

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
        dob,
        fatherName,
        motherName,
        maritalStatus,
        spouseName,
        passportNumber,
        passportExpiry,
        country,
      },
    });

    // Save files if any using Supabase storage
    const savedFiles: Array<{ id: number; fileName: string; fileUrl: string; fileType: string }> = [];
    if (files && files.length > 0) {
      for (const file of files) {
        if (!file || file.size === 0) continue;

        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          const storagePath = `leads/${lead.id}/${safeFileName}`;

          const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(storagePath, buffer, {
              contentType: file.type || "application/octet-stream",
              upsert: true,
            });

          let fileUrl = "";
          if (!uploadError) {
            const { data } = supabase.storage
              .from("documents")
              .getPublicUrl(storagePath);
            fileUrl = data.publicUrl;
          } else {
            console.error("Supabase upload error for lead file:", uploadError);
            fileUrl = storagePath;
          }

          const fileRecord = await prisma.file.create({
            data: {
              leadId: lead.id,
              fileName: file.name,
              fileUrl: fileUrl,
              fileType: file.type.includes("pdf") ? "pdf" : "image",
            },
          });
          savedFiles.push(fileRecord);
        } catch (fileErr) {
          console.error(`Error uploading lead file ${file.name}:`, fileErr);
        }
      }
    }

    // Send notifications safely (non-blocking)
    try {
      sendAdminNotification(lead, savedFiles).catch(e => console.error("Admin mail error:", e));
      sendCustomerNotification(lead).catch(e => console.error("Customer mail error:", e));
      sendSystemNotificationToAdmins({
        subject: `New Application Received: ${lead.service} from ${lead.name}`,
        htmlContent: `
          <p>A new application has been submitted on the Syed Services website.</p>
          <div style="background: #1e293b; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <p style="margin: 4px 0;"><strong>Tracking ID:</strong> <span style="color: #fbbf24; font-family: monospace; font-size: 16px;">${lead.trackingId}</span></p>
            <p style="margin: 4px 0;"><strong>Applicant Name:</strong> ${lead.name}</p>
            <p style="margin: 4px 0;"><strong>Service:</strong> ${lead.service}</p>
            <p style="margin: 4px 0;"><strong>Phone / Mobile:</strong> ${lead.phone}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${lead.email || "N/A"}</p>
            <p style="margin: 4px 0;"><strong>Country / Nationality:</strong> ${lead.country || "N/A"}</p>
            ${lead.passportNumber ? `<p style="margin: 4px 0;"><strong>Passport Number:</strong> ${lead.passportNumber}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Message:</strong> ${lead.message || "None"}</p>
          </div>
          ${savedFiles.length > 0 ? `
            <p><strong>Uploaded Files (${savedFiles.length}):</strong></p>
            <ul>
              ${savedFiles.map(f => `<li><a href="${f.fileUrl}" target="_blank" style="color: #fbbf24;">${f.fileName}</a></li>`).join("")}
            </ul>
          ` : ''}
          <div style="margin-top: 15px;">
            <a href="https://www.syedservices.com.pk/portal/admin" style="background: #fbbf24; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View in Admin Portal</a>
          </div>
        `
      }).catch(e => console.error("System admin alert error:", e));
    } catch (notifErr) {
      console.error("Notification dispatch error:", notifErr);
    }

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
