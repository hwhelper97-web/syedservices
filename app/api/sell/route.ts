import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-service";

export async function GET() {
  try {
    const appraisals = await prisma.appraisal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(appraisals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { sneakerName, conditionScore, boxStatus, sellerEmail } = await req.json();

    if (!sneakerName || !sellerEmail) {
      return NextResponse.json({ error: "Sneaker name and email are required" }, { status: 400 });
    }

    const appraisal = await prisma.appraisal.create({
      data: {
        sneakerName,
        conditionScore: parseInt(conditionScore) || 10,
        boxStatus: boxStatus || "Good",
        sellerEmail,
        status: "Pending Appraisal",
      },
    });

    // Notify seller/agent
    await sendEmail(
      sellerEmail,
      `Appraisal Request Received: ${sneakerName}`,
      `Hello,\n\nWe have received your appraisal request for "${sneakerName}".\nCondition: ${conditionScore}/10\nBox Status: ${boxStatus}\nStatus: Pending Appraisal\n\nAn expert will evaluate your submission shortly.\n\nBest regards,\nSneakerHub Team`
    );

    return NextResponse.json(appraisal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
