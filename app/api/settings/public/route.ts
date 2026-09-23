import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/app/api/admin/settings/route";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    const dbSettings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    dbSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const publicSettings = {
      company_name: settingsMap.company_name || DEFAULT_SETTINGS.company_name,
      company_tagline: settingsMap.company_tagline || DEFAULT_SETTINGS.company_tagline,
      company_phone: settingsMap.company_phone || DEFAULT_SETTINGS.company_phone,
      whatsapp_helpline: settingsMap.whatsapp_helpline || DEFAULT_SETTINGS.whatsapp_helpline,
      company_email: settingsMap.company_email || DEFAULT_SETTINGS.company_email,
      company_address: settingsMap.company_address || DEFAULT_SETTINGS.company_address,
      secondary_address: settingsMap.secondary_address || DEFAULT_SETTINGS.secondary_address,
      social_instagram: settingsMap.social_instagram || DEFAULT_SETTINGS.social_instagram,
      social_facebook: settingsMap.social_facebook || DEFAULT_SETTINGS.social_facebook,
      social_twitter: settingsMap.social_twitter || DEFAULT_SETTINGS.social_twitter,
      social_linkedin: settingsMap.social_linkedin || DEFAULT_SETTINGS.social_linkedin,
      social_whatsapp: settingsMap.social_whatsapp || DEFAULT_SETTINGS.social_whatsapp,
      social_youtube: settingsMap.social_youtube || DEFAULT_SETTINGS.social_youtube,
    };

    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (error) {
    console.error("Public settings GET error:", error);
    return NextResponse.json({
      success: true,
      settings: {
        company_name: DEFAULT_SETTINGS.company_name,
        company_phone: DEFAULT_SETTINGS.company_phone,
        company_email: DEFAULT_SETTINGS.company_email,
        company_address: DEFAULT_SETTINGS.company_address,
        social_instagram: DEFAULT_SETTINGS.social_instagram,
        social_facebook: DEFAULT_SETTINGS.social_facebook,
        social_twitter: DEFAULT_SETTINGS.social_twitter,
        social_linkedin: DEFAULT_SETTINGS.social_linkedin,
        social_whatsapp: DEFAULT_SETTINGS.social_whatsapp,
        social_youtube: DEFAULT_SETTINGS.social_youtube,
      },
    });
  }
}
