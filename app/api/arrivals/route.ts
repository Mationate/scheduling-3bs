import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    const arrival = await db.workerArrival.create({
      data: {
        date: body.date,
        arrivalTime: body.arrivalTime,
        isLate: body.isLate,
        notes: body.notes,
        workerId: body.workerId,
        shopId: body.shopId,
      }
    });

    return NextResponse.json(arrival);
  } catch (error) {
    console.error("[ARRIVALS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const workerId = searchParams.get("workerId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const whereClause = {
      ...(shopId && { shopId }),
      ...(workerId && { workerId }),
      ...(from && to && {
        date: {
          gte: new Date(from),
          lte: new Date(to)
        }
      })
    };

    const arrivals = await db.workerArrival.findMany({
      where: whereClause,
      include: {
        worker: {
          select: {
            name: true
          }
        },
        shop: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(arrivals);
  } catch (error) {
    console.error("[ARRIVALS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 