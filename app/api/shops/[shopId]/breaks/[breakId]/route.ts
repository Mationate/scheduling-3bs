import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { shopId: string; breakId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const breakItem = await db.shopBreak.findFirst({
      where: {
        AND: [
          { id: params.breakId },
          { shopId: params.shopId }
        ]
      }
    });

    if (!breakItem) {
      return new NextResponse("Break not found", { status: 404 });
    }

    await db.shopBreak.delete({
      where: {
        id: params.breakId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BREAK_DELETE]", error);
    return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
  }
} 