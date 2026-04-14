export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    console.log("Password reset requested for:", email);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Error" }, { status: 500 });
  }
}