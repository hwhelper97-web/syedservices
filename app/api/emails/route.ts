import { NextResponse } from "next/server";
import { emailQueue } from "@/lib/email-service";

export async function GET() {
  return NextResponse.json(emailQueue);
}
