import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // ✅ VALIDATION
    if (!name || !email || !message) {
      return Response.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    // ✅ SAVE TO DATABASE
    const saved = await prisma.contact.create({
      data: {
        name,
        email,
        message,
      },
    });

    console.log("Saved:", saved);

    // ✅ SUCCESS RESPONSE
    return Response.json({ success: true });

  } catch (error) {
    console.error("CONTACT ERROR:", error);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}