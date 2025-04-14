import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return new NextResponse("Missing date parameters", { status: 400 });
    }

    const arrivals = await db.workerArrival.findMany({
      where: {
        shopId: params.shopId,
        date: {
          gte: new Date(start),
          lte: new Date(end)
        }
      }
    });

    return NextResponse.json(arrivals);
  } catch (error) {
    console.error("[SHOP_WORKER_ARRIVALS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 