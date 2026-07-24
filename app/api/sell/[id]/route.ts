import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, conditionScore, boxStatus } = await req.json();

    const appraisalId = parseInt(id);
    if (isNaN(appraisalId)) {
      return NextResponse.json({ error: "Invalid appraisal ID" }, { status: 400 });
    }

    const existingAppraisal = await prisma.appraisal.findUnique({
      where: { id: appraisalId },
    });

    if (!existingAppraisal) {
      return NextResponse.json({ error: "Appraisal not found" }, { status: 404 });
    }

    const updatedAppraisal = await prisma.appraisal.update({
      where: { id: appraisalId },
      data: {
        status: status !== undefined ? status : existingAppraisal.status,
        conditionScore: conditionScore !== undefined ? parseInt(conditionScore) : existingAppraisal.conditionScore,
        boxStatus: boxStatus !== undefined ? boxStatus : existingAppraisal.boxStatus,
      },
    });

    // Notify seller/agent
    await sendEmail(
      existingAppraisal.sellerEmail,
      `Sneaker Appraisal Update: ${existingAppraisal.sneakerName}`,
      `Hello,\n\nYour appraisal for "${existingAppraisal.sneakerName}" has been updated.\n\nPrevious Status: ${existingAppraisal.status}\nNew Status: ${status}\nCondition Score: ${updatedAppraisal.conditionScore}/10\nBox Status: ${updatedAppraisal.boxStatus}\n\nThank you,\nSneakerHub Team`
    );

    return NextResponse.json(updatedAppraisal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
