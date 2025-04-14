import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const monthStr = searchParams.get("month"); // formato: "2024-03"

    if (!shopId || !monthStr) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const [year, month] = monthStr.split("-").map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    // Obtener todos los servicios del local y sus bookings en un solo query
    const workers = await db.worker.findMany({
      where: { 
        shopId,
      },
      select: {
        id: true,
        name: true,
        bookings: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            },
            // status: "COMPLETED", PONER ESTO CUANDO LOS BOOKING FUNCIONEN 100%
            shopId, // Asegurarnos que son bookings del local correcto
          },
          include: {
            service: true // Incluir toda la información del servicio
          }
        }
      }
    });

    // Primero obtener todos los servicios del local
    const allServices = await db.service.findMany({
      where: {
        workers: {
          some: {
            shopId
          }
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Procesar los datos
    const stats = workers.map(worker => {
      const serviceCount = worker.bookings.reduce((acc, booking) => {
        const serviceName = booking.service.name;
        acc[serviceName] = (acc[serviceName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Asegurarnos que todos los servicios estén representados
      const services = {} as Record<string, number>;
      allServices.forEach(service => {
        services[service.name] = serviceCount[service.name] || 0;
      });

      return {
        workerName: worker.name,
        services,
        total: worker.bookings.length
      };
    });

    // Debug para ver qué está pasando
    console.log('Debug stats:', {
      month: monthStr,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      workersCount: workers.length,
      workersWithBookings: workers.filter(w => w.bookings.length > 0).length,
      totalBookings: workers.reduce((acc, w) => acc + w.bookings.length, 0),
      stats
    });

    return NextResponse.json({
      services: allServices.map(s => s.name),
      stats
    });
  } catch (error) {
    console.error("[SHOP_SERVICES_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 