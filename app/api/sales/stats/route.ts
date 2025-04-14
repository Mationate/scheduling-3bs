import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const serviceId = searchParams.get("serviceId");
    const workerId = searchParams.get("workerId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const whereClause = {
      ...(shopId && { shopId }),
      ...(serviceId && { serviceId }),
      ...(workerId && { workerId }),
      ...(from && to && {
        date: {
          gte: new Date(from),
          lte: new Date(to)
        }
      })
    };

    const [totalBookings, completedBookings, totalRevenue] = await Promise.all([
      // Total reservas
      db.booking.count({ where: whereClause }),
      
      // Reservas completadas
      db.booking.count({
        where: {
          ...whereClause,
          status: "COMPLETED"
        }
      }),
      
      // Ingresos totales
      db.booking.aggregate({
        where: {
          ...whereClause,
          paymentStatus: "PAID"
        },
        _sum: {
          paymentAmount: true
        }
      })
    ]);

    const conversionRate = totalBookings > 0 
      ? Math.round((completedBookings / totalBookings) * 100)
      : 0;

    const averageTicket = completedBookings > 0
      ? Math.round((totalRevenue._sum.paymentAmount || 0) / completedBookings)
      : 0;

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.paymentAmount || 0,
      averageTicket,
      totalSales: completedBookings,
      conversionRate
    });
  } catch (error) {
    console.error("[SALES_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 