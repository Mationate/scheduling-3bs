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

    const workersStats = await db.booking.groupBy({
      by: ['workerId'],
      where: whereClause,
      _count: true,
      _sum: {
        paymentAmount: true
      }
    });

    const workerDetails = await db.worker.findMany({
      where: {
        id: {
          in: workersStats.map(w => w.workerId)
        }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bookings: {
          where: {
            ...whereClause,
            status: "COMPLETED"
          },
          select: {
            paymentAmount: true
          }
        }
      }
    });

    const topWorkers = workersStats.map(stat => {
      const worker = workerDetails.find(w => w.id === stat.workerId);
      const completedBookings = worker?.bookings.length || 0;
      const totalRevenue = stat._sum.paymentAmount || 0;

      // Calcular rating promedio (simulado por ahora)
      const averageRating = 4 + Math.random(); // Simulación entre 4.0 y 5.0

      return {
        id: stat.workerId,
        name: worker?.name || 'Desconocido',
        avatar: worker?.avatar || null,
        totalServices: stat._count,
        totalRevenue,
        averageRating: Math.min(5, averageRating)
      };
    });

    // Ordenar por ingresos totales
    return NextResponse.json(
      topWorkers
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
    );
  } catch (error) {
    console.error("[TOP_WORKERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 