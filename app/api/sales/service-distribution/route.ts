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

    const servicesData = await db.booking.groupBy({
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
          in: servicesData.map(s => s.serviceId)
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const totalBookings = servicesData.reduce((acc, curr) => acc + curr._count, 0);

    const distribution = servicesData.map(data => {
      const service = serviceDetails.find(s => s.id === data.serviceId);
      return {
        name: service?.name || 'Desconocido',
        value: data._count,
        revenue: data._sum.paymentAmount || 0,
        percentage: Math.round((data._count / totalBookings) * 100)
      };
    });

    // Ordenar por cantidad de servicios
    return NextResponse.json(distribution.sort((a, b) => b.value - a.value));
  } catch (error) {
    console.error("[SERVICE_DISTRIBUTION_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 