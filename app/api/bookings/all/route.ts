import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { format } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const workerId = searchParams.get("workerId");
    const shopId = searchParams.get("shopId"); // Añadir soporte para filtrar por local

    if (!date) {
      return new NextResponse("Fecha requerida", { status: 400 });
    }

    console.log("[API_BOOKINGS_ALL] Parámetros recibidos:", { 
      date, 
      workerId: workerId || "no especificado", 
      shopId: shopId || "no especificado" 
    });

    // Parsear la fecha a un objeto Date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error("[API_BOOKINGS_ALL] Fecha inválida:", date);
      return new NextResponse("Formato de fecha inválido", { status: 400 });
    }
    
    // Construir la consulta base
    const where: any = {
      date: dateObj,
      status: {
        not: "CANCELLED"
      }
    };

    // Añadir filtro por worker si se proporciona
    if (workerId && workerId !== "any") {
      where.workerId = workerId;
      console.log("[API_BOOKINGS_ALL] Filtrando por trabajador:", workerId);
    }

    // Añadir filtro por tienda si se proporciona
    if (shopId) {
      where.shopId = shopId;
      console.log("[API_BOOKINGS_ALL] Filtrando por local:", shopId);
    }

    // Buscar todas las reservas que cumplen los criterios
    const bookings = await db.booking.findMany({
      where,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        workerId: true,
        shopId: true,
        service: {
          select: {
            name: true,
            duration: true
          }
        },
        worker: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`[API_BOOKINGS_ALL] Encontradas ${bookings.length} reservas para la fecha ${date}`);
    
    // Mostrar detalles de cada reserva para debugging
    bookings.forEach((booking, index) => {
      console.log(`[API_BOOKINGS_ALL] Reserva #${index + 1}:`, {
        id: booking.id,
        date: booking.date.toISOString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        worker: booking.worker.name,
        workerId: booking.workerId,
        shopId: booking.shopId,
        service: booking.service.name,
        duration: booking.service.duration
      });
    });

    // Para el caso de "any", necesitamos información adicional sobre los trabajadores disponibles
    let workers: { id: string; name: string }[] = [];
    if (workerId === "any" && shopId) {
      workers = await db.worker.findMany({
        where: {
          shopId,
          status: "ACTIVE"
        },
        select: {
          id: true,
          name: true
        }
      });
      console.log(`[API_BOOKINGS_ALL] Encontrados ${workers.length} trabajadores activos en el local`);
    }

    // Devolver solo los datos necesarios para comprobar disponibilidad
    const simplifiedBookings = bookings.map(booking => ({
      startTime: booking.startTime,
      endTime: booking.endTime,
      workerId: booking.workerId,
    }));

    return NextResponse.json({ 
      bookings: simplifiedBookings,
      workers: workerId === "any" ? workers : [],
      date: format(dateObj, 'yyyy-MM-dd'),
      totalBookings: bookings.length,
      requestedDate: date
    });

  } catch (error) {
    console.error("[API_BOOKINGS_ALL] Error:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
} 