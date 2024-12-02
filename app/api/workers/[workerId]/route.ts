import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { workerId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.worker.delete({
      where: { id: params.workerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WORKER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 