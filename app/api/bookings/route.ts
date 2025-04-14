import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { startOfDay, addDays, endOfDay, parseISO, isWithinInterval, format } from "date-fns";
import { sendBookingConfirmationEmail } from "@/lib/mail";

interface PrismaError {
  code?: string;
  message?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workerId, serviceId, date, startTime, clientName, clientEmail, clientPhone } = body;

    // Validar datos requeridos
    if (!workerId || !serviceId || !date || !startTime || !clientName || !clientEmail) {
      return new NextResponse("Faltan datos requeridos", { status: 400 });
    }

    // Primero, buscar o crear el cliente
    const client = await db.client.upsert({
      where: { email: clientEmail },
      update: {
        name: clientName,
        phone: clientPhone || undefined,
      },
      create: {
        email: clientEmail,
        name: clientName,
        phone: clientPhone || undefined,
      },
    });

    // Obtener duración del servicio
    const service = await db.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return new NextResponse("Servicio no encontrado", { status: 404 });
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);

    // Verificar si hay bookings existentes que se solapan
    const existingBookings = await db.booking.findMany({
      where: {
        workerId,
        NOT: { status: "CANCELLED" },
        OR: [
          {
            AND: [
              { startTime: { lte: endDateTime.toISOString() } },
              { endTime: { gt: startDateTime.toISOString() } }
            ]
          }
        ]
      }
    });

    if (existingBookings.length > 0) {
      return new NextResponse(
        "El profesional ya tiene una reserva en este horario", 
        { status: 409 }
      );
    }

    // Verificar horario de trabajo del profesional
    const worker = await db.worker.findUnique({
      where: { id: workerId },
      include: { shop: true }
    });

    if (!worker || !worker.shop) {
      return new NextResponse("Profesional no encontrado", { status: 404 });
    }

    // Crear el booking
    const booking = await db.booking.create({
      data: {
        workerId,
        serviceId,
        clientId: client.id,
        shopId: worker.shop.id,
        date: new Date(date),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: "PENDING"
      },
      include: {
        client: true,
        worker: true,
        service: true
      }
    });


    // Enviar email de confirmación
    await sendBookingConfirmationEmail(client.email, {
      name: client.name || "Cliente",
      service: service.name || "Servicio",
      worker: worker.name || "Profesional",
      date: new Date(date),
      time: format(startDateTime, "HH:mm"),
      shop: worker.shop.name || "3BS Barbershop",
      address: worker.shop.address || "Dirección no especificada",
      duration: service.duration,
      price: service.price
    });

    return NextResponse.json(booking);

  } catch (error) {
    console.error("[BOOKINGS_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Error interno del servidor", 
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return new NextResponse("Start and end dates are required", { status: 400 });
    }

    const bookings = await db.booking.findMany({
      where: {
        date: {
          gte: new Date(start),
          lte: new Date(end)
        }
      },
      include: {
        client: true,
        service: true,
        worker: true
      }
    });
    console.log("[BOOKINGS_GET] Bookings fetched:", bookings);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[BOOKINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 