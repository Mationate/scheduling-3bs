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
      }),
      status: "COMPLETED"
    };

    const servicesStats = await db.booking.groupBy({
      by: ['serviceId'],
      where: whereClause,
      _count: true,
      _sum: {
        paymentAmount: true
      }
    });

    const serviceDetails = await db.service.findMany({
      where: {
        id: {
          in: servicesStats.map(s => s.serviceId)
        }
      },
      select: {
        id: true,
        name: true,
        price: true
      }
    });

    const topServices = servicesStats.map(stat => {
      const service = serviceDetails.find(s => s.id === stat.serviceId);
      return {
        id: stat.serviceId,
        name: service?.name || 'Desconocido',
        totalSales: stat._count,
        totalRevenue: stat._sum.paymentAmount || 0,
        averagePrice: stat._count > 0 ? (stat._sum.paymentAmount || 0) / stat._count : 0
      };
    });

    // Ordenar por ingresos totales
    return NextResponse.json(
      topServices
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
    );
  } catch (error) {
    console.error("[TOP_SERVICES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 