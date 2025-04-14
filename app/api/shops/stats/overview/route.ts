import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, differenceInBusinessDays } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const monthStr = searchParams.get("month");

    if (!shopId || !monthStr) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const [year, month] = monthStr.split("-").map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const businessDays = differenceInBusinessDays(endDate, startDate) + 1;

    // Total de servicios
    const servicesCount = await db.booking.count({
      where: {
        shopId,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: "COMPLETED"
      }
    });

    // Total de trabajadores activos
    const workersCount = await db.worker.count({
      where: {
        shopId,
        bookings: {
          some: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    });

    // Porcentaje de atrasos
    const arrivals = await db.workerArrival.findMany({
      where: {
        shopId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalArrivals = arrivals.length;
    const lateArrivals = arrivals.filter(a => a.isLate).length;
    const latePercentage = totalArrivals > 0 
      ? Math.round((lateArrivals / totalArrivals) * 100) 
      : 0;

    return NextResponse.json({
      totalServices: servicesCount,
      totalWorkers: workersCount,
      avgServicesPerDay: Math.round(servicesCount / businessDays),
      latePercentage
    });
  } catch (error) {
    console.error("[SHOP_STATS_OVERVIEW_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 