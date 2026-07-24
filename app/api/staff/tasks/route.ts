import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "STAFF") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { assignedToId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error("Staff tasks fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error during tasks fetch" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "STAFF") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, status } = await req.json();

    if (!taskId || !status) {
      return NextResponse.json(
        { error: "Task ID and status are required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId, 10) },
    });

    if (!task || task.assignedToId !== session.userId) {
      return NextResponse.json(
        { error: "Task not found or not assigned to you" },
        { status: 404 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId, 10) },
      data: { status },
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error("Staff task update error:", error);
    return NextResponse.json(
      { error: "Internal server error during task update" },
      { status: 500 }
    );
  }
}
