import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(req: Request) {
  try {
    const { workerId, shopId, date, isLate } = await req.json();

    // Verificar si ya existe un registro para este trabajador en este día
    const existingArrival = await db.workerArrival.findFirst({
      where: {
        workerId,
        date: {
          gte: startOfDay(new Date(date)),
          lte: endOfDay(new Date(date))
        }
      }
    });

    if (existingArrival) {
      return new NextResponse(
        "Ya existe un registro de llegada para este trabajador en esta fecha", 
        { status: 400 }
      );
    }

    const arrival = await db.workerArrival.create({
      data: {
        workerId,
        shopId,
        date: new Date(date).toISOString(),
        isLate,
        arrivalTime: new Date(date).toISOString()
      }
    });

    return NextResponse.json(arrival);
  } catch (error) {
    console.error("[WORKER_ARRIVAL_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 