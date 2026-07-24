import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Only ADMIN, SUPER_ADMIN, STAFF, or AGENT can use AI assistant
    if (session.role === "CLIENT") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const { action, applicationId, context } = await req.json();

    if (!action || !applicationId) {
      return NextResponse.json(
        { error: "Action and Application ID are required" },
        { status: 400 }
      );
    }

    const app = await prisma.application.findUnique({
      where: { id: parseInt(applicationId, 10) },
      include: {
        client: {
          include: {
            user: true
          }
        },
        documents: true,
      }
    });

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is configured
    if (!apiKey) {
      // Return a premium mock response explaining how to configure the API key
      return NextResponse.json({
        success: true,
        text: `🤖 **AI Assistant Preview Mode**\n\nTo activate full AI capabilities, please set the \`GEMINI_API_KEY\` in your \`.env\` file.\n\nHere is what I generated based on ${app.client.user.name}'s file:\n\n*   **Summary**: Client is applying for a **${app.visaCategory}** to **${app.country}**. Passport number is **${app.client.passportNumber || "N/A"}** (expires ${app.client.passportExpiryDate || "N/A"}). Current status is **${app.status}**.\n*   **Recommended Action**: Verify that the uploaded passport scan matches the passport expiry date.`,
      });
    }

    // Construct prompt based on action
    let prompt = "";
    if (action === "summarize") {
      prompt = `Summarize this client visa application file concisely. Personal details: Name ${app.client.user.name}, DOB ${app.client.dob || "N/A"}, Profession ${app.client.profession || "N/A"}. Passport: ${app.client.passportNumber || "N/A"}, Expiry ${app.client.passportExpiryDate || "N/A"}. Visa detail: ${app.visaCategory} to ${app.country}, duration ${app.duration || "N/A"}. Visited countries: ${app.visitedCountries || "None"}.`;
    } else if (action === "check_documents") {
      const docsList = app.documents.map(d => `${d.documentType} (${d.fileName})`).join(", ");
      prompt = `Verify support documents for a ${app.visaCategory} to ${app.country}. The client has uploaded: ${docsList || "No documents uploaded yet"}. Tell me if there are missing documents, and list what else should be requested.`;
    } else if (action === "generate_email") {
      prompt = `Write a professional email from Syed Services to the client ${app.client.user.name} regarding their visa application (${app.trackingId}) to ${app.country}. Context of email: ${context || "Requesting remaining documents"}. Keep it polite, clear, and professional.`;
    } else if (action === "generate_cover_letter") {
      prompt = `Generate a formal visa cover letter addressed to the Visa Officer of the Embassy of ${app.country} in Kabul on behalf of client ${app.client.user.name}. Details: Passport ${app.client.passportNumber || "N/A"}, Purpose: ${app.purpose || "Tourism"}, Travel Date: ${app.travelDate || "N/A"}, Return Date: ${app.returnDate || "N/A"}.`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Hit Gemini REST API endpoint
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || "Gemini API request failed");
    }

    const resData = await res.json();
    const generatedText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "No response text generated.";

    return NextResponse.json({
      success: true,
      text: generatedText,
    });
  } catch (error: any) {
    console.error("AI Assistant API error:", error);
    return NextResponse.json(
      { error: "Internal server error inside AI Assistant", details: error.message },
      { status: 500 }
    );
  }
}
