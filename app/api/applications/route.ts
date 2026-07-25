import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendSystemNotificationToAdmins } from "@/utils/email";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let clientProfileId: number;
    let agentProfileId: number | null = null;
    if (session.role === "AGENT") {
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { userId: session.userId },
        include: { user: true }
      });
      if (!agentProfile) {
        return NextResponse.json({ error: "Agent profile not found" }, { status: 404 });
      }

      if (
        !agentProfile.agencyName ||
        !agentProfile.licenseNumber ||
        !agentProfile.whatsappNumber ||
        !agentProfile.officeAddress ||
        !agentProfile.licenseCertificate ||
        !agentProfile.user.image
      ) {
        return NextResponse.json(
          { error: "PROFILE_INCOMPLETE: Please complete your profile details (including Travel Agency Name, License Number, Whatsapp Number, Office Address, License Certificate, and Profile Image) before starting a visa application." },
          { status: 400 }
        );
      }

      agentProfileId = agentProfile.id;

      const { clientName, clientEmail } = body;
      if (!clientEmail || !clientName) {
        return NextResponse.json({ error: "Client name and email are required" }, { status: 400 });
      }

      let clientUser = await prisma.user.findUnique({
        where: { email: clientEmail },
      });

      if (!clientUser) {
        clientUser = await prisma.user.create({
          data: {
            email: clientEmail,
            name: clientName,
            role: "CLIENT",
            passwordHash: "$2a$12$Z0Yn2H/67G2z0zYm0Xw2Xe0u2eQx3yD4r5w6G7a8b9c0d1e2f3g4h",
          },
        });
      }

      let cProfile = await prisma.clientProfile.findUnique({
        where: { userId: clientUser.id },
      });

      if (!cProfile) {
        cProfile = await prisma.clientProfile.create({
          data: { userId: clientUser.id },
        });
      }
      clientProfileId = cProfile.id;
    } else {
      // Client
      let cProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.userId },
      });

      if (!cProfile) {
        cProfile = await prisma.clientProfile.create({
          data: { userId: session.userId },
        });
      }
      clientProfileId = cProfile.id;
    }

    const {
      // Step 1: Personal Info
      gender, dob, nationality, birthPlace, religion, profession, qualification, phone,
      currentAddress, permanentAddress,
      // Passport Info
      passportNumber, passportIssueDate, passportExpiryDate, passportIssuePlace,
      // Step 2: Family Info
      fatherName, motherName, spouseName, childrenCount, emergencyContact,
      // Visa Info
      country, visaCategory, duration, entryType, travelDate, returnDate, purpose, sponsor, reference,
      // Step 3: Education & Employment
      highSchool, college, bachelor, master, graduationYear, cgpa,
      companyName, position, salary, experienceYears, employerAddress,
      // Step 4: Travel History
      visitedCountries, previousVisas, visaRefusals, previousPassportNumber,
      
      // Auto-submit flag
      isDraft = false
    } = body;

    if (!country || !visaCategory) {
      return NextResponse.json(
        { error: "Country and Visa Category are required fields" },
        { status: 400 }
      );
    }

    // Generate unique tracking ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `SYED-VISA-${randomNum}`;

    // Update Client Profile info on the fly
    await prisma.clientProfile.update({
      where: { id: clientProfileId },
      data: {
        phone,
        dob,
        gender,
        nationality,
        birthPlace,
        religion,
        profession,
        qualification,
        currentAddress,
        permanentAddress,
        passportNumber,
        passportIssueDate,
        passportExpiryDate,
        passportIssuePlace,
        fatherName,
        motherName,
        spouseName,
        childrenCount: parseInt(childrenCount || "0", 10),
        emergencyContact,
        highSchool,
        college,
        bachelor,
        master,
        graduationYear,
        cgpa,
        companyName,
        position,
        salary,
        experienceYears,
        employerAddress,
      },
    });

    const status = isDraft ? "DRAFT" : "WAITING_CONFIRMATION";

    const application = await prisma.application.create({
      data: {
        trackingId,
        clientId: clientProfileId,
        agentId: agentProfileId,
        country,
        visaCategory,
        duration,
        entryType,
        travelDate,
        returnDate,
        purpose,
        sponsor,
        reference,
        visitedCountries,
        previousVisas,
        visaRefusals,
        previousPassportNumber,
        status,
        statusHistory: {
          create: {
            status,
            notes: isDraft ? "Application saved as draft." : "Application submitted successfully.",
            updatedById: session.userId,
          },
        },
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: isDraft ? "SAVE_DRAFT" : "SUBMIT_APPLICATION",
        details: `Application ${trackingId} created. Status: ${status}`,
      },
    });

    // Create a mock invoice for visa fees
    const invoiceNumber = `INV-${randomNum}`;
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        applicationId: application.id,
        totalAmount: 250.0, // Default fee
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "UNPAID",
      }
    });

    if (!isDraft) {
      sendSystemNotificationToAdmins({
        subject: `New Application Received: ${trackingId}`,
        htmlContent: `
          <p>A new visa/ticket application has been submitted by <strong>${session.name}</strong> (${session.role}):</p>
          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin: 15px 0;">
            <p style="margin: 5px 0; font-size: 13px;"><strong>Tracking ID:</strong> ${trackingId}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Country:</strong> ${country}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Visa Category:</strong> ${visaCategory}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Travel Date:</strong> ${travelDate || "N/A"}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Entry Type:</strong> ${entryType}</p>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">You can manage this application file in the applications section of the portal.</p>
        `
      }).catch((err) => {
        console.error("Admin application alert async send error:", err);
      });
    }

    return NextResponse.json({
      success: true,
      application,
      invoice,
    });
  } catch (error: any) {
    console.error("Application creation error:", error);
    return NextResponse.json(
      { error: "Internal server error during application creation" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let applications: any[] = [];

    if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
      applications = await prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      });
    } else if (session.role === "AGENT") {
      applications = await prisma.application.findMany({
        where: { agent: { userId: session.userId } },
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      });
    } else {
      // Client
      const profile = await prisma.clientProfile.findUnique({
        where: { userId: session.userId },
      });

      if (profile) {
        applications = await prisma.application.findMany({
          where: { clientId: profile.id },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error during applications retrieval" },
      { status: 500 }
    );
  }
}
