import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "portal_token";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyHS256(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [header, payload, signature] = parts;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(`${header}.${payload}`);
    
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const signatureBytes = base64UrlDecode(signature);
    
    return crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as any,
      data
    );
  } catch (e) {
    return false;
  }
}

function decodePayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Protect Portal Routes
  if (pathname.startsWith("/portal")) {
    // Exclude Auth routes
    if (
      pathname.startsWith("/portal/login") ||
      pathname.startsWith("/portal/register")
    ) {
      if (token && (await verifyHS256(token, JWT_SECRET))) {
        // Redirect to dashboard if already authenticated
        return NextResponse.redirect(new URL("/portal", request.url));
      }
      return NextResponse.next();
    }

    // Require token for all other portal routes
    if (!token || !(await verifyHS256(token, JWT_SECRET))) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }

    const payload = decodePayload(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }

    const role = payload.role;

    // Check path-specific roles
    if (pathname.startsWith("/portal/admin") && !["SUPER_ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }

    if (pathname.startsWith("/portal/agent") && !["SUPER_ADMIN", "ADMIN", "AGENT"].includes(role)) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }

    if (pathname.startsWith("/portal/staff") && !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role)) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }

    if (pathname.startsWith("/portal/client") && role !== "CLIENT") {
      // If an admin/agent logs in, redirect them to dashboard directly instead of client view
      if (["SUPER_ADMIN", "ADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/portal/admin", request.url));
      }
      if (role === "AGENT") {
        return NextResponse.redirect(new URL("/portal/agent", request.url));
      }
      if (role === "STAFF") {
        return NextResponse.redirect(new URL("/portal/staff", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};
