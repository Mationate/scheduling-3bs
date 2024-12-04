import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const workerId = searchParams.get("workerId");

    if (!date || !workerId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // Obtener todas las reservas para ese trabajador en esa fecha
    const bookings = await db.booking.findMany({
      where: {
        workerId,
        date: new Date(date),
        status: {
          not: "CANCELLED"
        }
      },
      select: {
        startTime: true,
        endTime: true,
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 