import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const DEFAULT_SETTINGS: Record<string, string> = {
  // Agency Details
  company_name: "Syed Services Pvt Ltd",
  company_tagline: "Premier Global Immigration & Visa Consultancy",
  company_address: "Gt Road, Peshawar, Khyber Pakhtunkhwa, Pakistan",
  secondary_address: "Jalalabad Main Commercial Center, Nangarhar, Afghanistan",
  company_phone: "+92 300 1234567",
  whatsapp_helpline: "+92 300 7654321",
  company_email: "info@syedservices.com",
  registration_number: "SEC-KP-2024-9981",

  // Visa & Processing Policies
  default_visa_fee: "1000",
  default_currency: "USD",
  deposit_percentage: "25",
  max_upload_size_mb: "10",
  allowed_extensions: "pdf, jpg, jpeg, png",
  application_expiry_days: "60",

  // Email & Alerts
  admin_alert_email: "notifications@syedservices.com",
  smtp_host: "smtp.gmail.com",
  smtp_port: "465",
  email_sender_name: "Syed Services Operations",
  email_sender_address: "noreply@syedservices.com",
  email_welcome_enabled: "true",
  email_status_updates_enabled: "true",

  // Security & System Controls
  maintenance_mode: "false",
  allow_registration: "true",
  require_email_verification: "false",
  announcement_text: "Welcome to Syed Services Portal. Direct visa processing & agency deals are operational.",
  announcement_active: "true",
  session_timeout_minutes: "120",
};

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER", "MANAGER", "VISA_OFFICER"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbSettings = await prisma.setting.findMany({
      orderBy: { key: "asc" },
    });

    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    
    // Override with DB values
    dbSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Format as list
    const settingsList = Object.entries(settingsMap).map(([key, value]) => ({
      key,
      value,
    }));

    return NextResponse.json({ 
      success: true, 
      settings: settingsList,
      settingsMap 
    });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error during settings fetch" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN", "AGENCY_OWNER", "MANAGER", "VISA_OFFICER"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let entries: [string, string][] = [];

    if (Array.isArray(body.settings)) {
      entries = body.settings.map((s: any) => [s.key, String(s.value ?? "")]);
    } else if (typeof body.settings === "object" && body.settings !== null) {
      entries = Object.entries(body.settings).map(([k, v]) => [k, String(v ?? "")]);
    } else {
      return NextResponse.json(
        { error: "Settings array or dictionary is required" },
        { status: 400 }
      );
    }

    // Upsert each setting in a transaction
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_SETTINGS",
        details: `System settings updated (${entries.length} items) by ${session.name}`,
      },
    });

    return NextResponse.json({ success: true, count: entries.length });
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error during settings update" },
      { status: 500 }
    );
  }
}
