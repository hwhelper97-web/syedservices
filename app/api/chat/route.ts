import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const messages = await prisma.supportChat.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json(messages);
    } else {
      const messages = await prisma.supportChat.findMany({
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json(messages);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { sessionId, sender, message } = await req.json();

    if (!sessionId || !sender || !message) {
      return NextResponse.json({ error: "sessionId, sender, and message are required" }, { status: 400 });
    }

    const chatMessage = await prisma.supportChat.create({
      data: {
        sessionId,
        sender,
        message,
      },
    });

    return NextResponse.json(chatMessage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
