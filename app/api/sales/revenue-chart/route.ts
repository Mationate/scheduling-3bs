import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay, eachDayOfInterval } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const serviceId = searchParams.get("serviceId");
    const workerId = searchParams.get("workerId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return new NextResponse("Missing date range", { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const whereClause = {
      ...(shopId && { shopId }),
      ...(serviceId && { serviceId }),
      ...(workerId && { workerId }),
      paymentStatus: "PAID",
      date: {
        gte: startOfDay(fromDate),
        lte: endOfDay(toDate)
      }
    };

    const bookings = await db.booking.groupBy({
      by: ['date'],
      where: whereClause,
      _sum: {
        paymentAmount: true
      }
    });

    // Crear array con todos los días del rango
    const allDays = eachDayOfInterval({ start: fromDate, end: toDate });
    
    const chartData = allDays.map(date => {
      const dayBookings = bookings.find(
        b => startOfDay(b.date).getTime() === startOfDay(date).getTime()
      );
      
      return {
        date: date.toISOString(),
        revenue: dayBookings?._sum.paymentAmount || 0
      };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("[REVENUE_CHART_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 