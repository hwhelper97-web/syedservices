import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error during logout" },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    await clearSessionCookie();
    return NextResponse.redirect(new URL("/portal/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
