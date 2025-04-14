import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import * as XLSX from 'xlsx';

interface ServiceStat {
  workerName: string;
  services: Record<string, number>;
  total: number;
}

interface ArrivalStat {
  workerName: string;
  totalDays: number;
  onTime: number;
  late: number;
  latePercentage: number;
}

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

    // Obtener datos directamente usando las mismas queries que los endpoints
    const workers = await db.worker.findMany({
      where: { shopId },
      select: {
        id: true,
        name: true,
        bookings: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            },
            shopId,
          },
          include: {
            service: true
          }
        }
      }
    });

    const allServices = await db.service.findMany({
      where: {
        workers: {
          some: { shopId }
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Procesar datos para el Excel
    const services = allServices.map(s => s.name);
    const stats = workers.map(worker => {
      const serviceCount = worker.bookings.reduce((acc, booking) => {
        const serviceName = booking.service.name;
        acc[serviceName] = (acc[serviceName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        workerName: worker.name,
        services: Object.fromEntries(
          services.map(service => [service, serviceCount[service] || 0])
        ),
        total: worker.bookings.length
      };
    });

    // Crear el Excel
    const wb = XLSX.utils.book_new();
    
    // Hoja de servicios
    const wsData = [
      ['Profesional', ...services, 'Total']
    ];

    stats.forEach(stat => {
      wsData.push([
        stat.workerName,
        ...services.map(service => stat.services[service].toString()),
        stat.total.toString()
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Servicios");

    // Generar archivo
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="estadisticas-${monthStr}.xlsx"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error("[SHOP_STATS_EXPORT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 