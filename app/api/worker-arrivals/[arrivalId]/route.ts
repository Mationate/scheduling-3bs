import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { arrivalId: string } }
) {
  try {
    const { arrivalId } = params;
    const { isLate } = await req.json();

    const arrival = await db.workerArrival.update({
      where: { id: arrivalId },
      data: { isLate }
    });

    return NextResponse.json(arrival);
  } catch (error) {
    console.error("[WORKER_ARRIVAL_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 