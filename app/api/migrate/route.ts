import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Fix permissions for Prisma binary if needed
    try {
      await execAsync("chmod +x node_modules/.bin/prisma");
    } catch (e) {
      console.log("Chmod failed or not needed", e);
    }

    // Run prisma db push from the server environment
    const { stdout, stderr } = await execAsync("npx prisma db push --accept-data-loss");
    
    return Response.json({ 
      message: "Migration attempted", 
      stdout, 
      stderr 
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return Response.json({ 
      error: "Migration failed", 
      details: error.message 
    }, { status: 500 });
  }
}
