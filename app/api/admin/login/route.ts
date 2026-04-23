import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return Response.json({ error: "Invalid email" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return Response.json({ token });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}