import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { workerId } = body;

    const worker = await db.worker.update({
      where: { id: workerId },
      data: {
        shopId: params.shopId,
      },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.error("[SHOP_WORKERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 