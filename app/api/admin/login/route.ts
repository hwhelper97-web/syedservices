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

    // Single Sign-On: set portal_token cookie if portal user matches
    try {
      const { setSessionCookie } = await import("@/lib/auth");
      const portalUser = await prisma.user.findUnique({
        where: { email },
      });
      if (portalUser && ["SUPER_ADMIN", "ADMIN"].includes(portalUser.role)) {
        await setSessionCookie({
          userId: portalUser.id,
          email: portalUser.email,
          role: portalUser.role,
          name: portalUser.name,
        });
      }
    } catch (cookieErr) {
      console.error("SSO Cookie set error:", cookieErr);
    }

    return Response.json({ token });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}