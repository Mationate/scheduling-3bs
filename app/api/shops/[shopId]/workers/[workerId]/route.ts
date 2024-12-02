import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { shopId: string; workerId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const worker = await db.worker.update({
      where: { 
        id: params.workerId,
        shopId: params.shopId,
      },
      data: {
        shopId: null,
        status: "UNASSIGNED",
      },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.error("[SHOP_WORKERS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 