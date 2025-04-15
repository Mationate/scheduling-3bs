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
    const { 
      workerId, 
      serviceId, 
      date, 
      startTime, 
      endTime, 
      clientName, 
      clientEmail, 
      clientPhone,
      status,
      isAllDay,
      notes,
      shopId
    } = body;

    // Comprobar si es un bloqueo de día
    const isBlockDay = status === "BLOCK" && isAllDay;

    // Validar datos requeridos
    if (!workerId || !date) {
      return new NextResponse("Faltan datos requeridos (trabajador y fecha)", { status: 400 });
    }

    // Para reservas normales, validar datos adicionales
    if (!isBlockDay && (!serviceId || !startTime || !clientName || !clientEmail)) {
      return new NextResponse("Faltan datos requeridos para la reserva", { status: 400 });
    }

    // Validar que el shopId haya sido proporcionado
    if (!shopId) {
      return new NextResponse("Se requiere especificar la tienda (shopId)", { status: 400 });
    }

    // Obtener el trabajador para verificar que pertenece a la tienda
    const worker = await db.worker.findUnique({
      where: { id: workerId },
      include: { shop: true }
    });

    if (!worker) {
      return new NextResponse("Profesional no encontrado", { status: 404 });
    }

    // Verificar que el trabajador esté asignado a la tienda especificada
    if (worker.shopId !== shopId) {
      console.log(`⚠️ Advertencia: El trabajador (${workerId}) tiene asignada la tienda ${worker.shopId} pero se está intentando usar con la tienda ${shopId}`);
      
      // Actualizar el trabajador para asignarlo a esta tienda si no tiene tienda
      if (!worker.shopId) {
        await db.worker.update({
          where: { id: workerId },
          data: { shopId }
        });
        console.log(`✅ Trabajador asignado a la tienda ${shopId}`);
      } else {
        // Si el trabajador ya tiene asignada otra tienda, continuamos pero registramos la discrepancia
        console.log(`🔄 Continuando con la operación usando la tienda ${shopId} especificada en la solicitud`);
      }
    }

    let client;
    let service;
    let booking;

    // Lógica diferente según sea bloqueo o reserva normal
    if (isBlockDay) {
      // Para bloqueos, no necesitamos cliente real
      client = await db.client.findFirst({
        where: { email: "block@system.local" }
      });

      // Si no existe el cliente de sistema para bloqueos, lo creamos
      if (!client) {
        client = await db.client.create({
          data: {
            email: "block@system.local",
            name: "SISTEMA",
            status: "SYSTEM"
          }
        });
      }

      // Para bloqueos, verificamos que el servicio exista
      service = await db.service.findUnique({
        where: { id: serviceId }
      });

      if (!service) {
        return new NextResponse("Servicio para bloqueo no encontrado", { status: 404 });
      }

      // Crear el bloqueo como un booking especial
      const bookingDate = new Date(date);
      
      // Asegurarnos de que la fecha no tenga componente de hora y se preserve correctamente
      // Esto evita problemas con zonas horarias al crear la fecha
      const year = bookingDate.getFullYear();
      const month = bookingDate.getMonth();
      const day = bookingDate.getDate();
      
      // Creamos la fecha usando la fecha proporcionada, asegurando que sea en la zona horaria local
      const dateOnly = new Date(Date.UTC(year, month, day));
      
      console.log("DEBUG - Bloqueo creado para fecha:", {
        fechaOriginal: date,
        fechaParsed: bookingDate.toISOString(),
        fechaUTC: dateOnly.toISOString(),
        fechaLocal: new Date(dateOnly).toLocaleDateString()
      });

      // Formatear horas para almacenamiento - solo la parte de hora sin la fecha
      const formattedStartTime = "00:00";
      const formattedEndTime = "23:59";

      console.log("Datos para bloqueo de día:", {
        date: dateOnly.toISOString().split('T')[0],
        startTime: formattedStartTime,
        endTime: formattedEndTime
      });

      // Verificar si ya existe un bloqueo para este trabajador en esta fecha
      const existingBlock = await db.booking.findFirst({
        where: {
          workerId,
          date: dateOnly,
          status: "BLOCK"
        }
      });

      if (existingBlock) {
        return new NextResponse(
          "Ya existe un bloqueo para este profesional en esta fecha", 
          { status: 409 }
        );
      }

      // Verificar si hay bookings existentes para este trabajador en esta fecha
      const existingBookings = await db.booking.findMany({
        where: {
          workerId,
          date: dateOnly,
          NOT: { status: "CANCELLED" }
        }
      });

      if (existingBookings.length > 0) {
        return new NextResponse(
          "El profesional ya tiene reservas en esta fecha", 
          { status: 409 }
        );
      }

      try {
        booking = await db.booking.create({
          data: {
            workerId,
            serviceId,
            clientId: client.id,
            shopId: shopId,
            date: dateOnly,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            status: "BLOCK",
            notes: notes || "Día bloqueado"
          },
          include: {
            client: true,
            worker: true,
            service: true,
            shop: true
          }
        });
      } catch (error) {
        console.error("Error creating block booking:", error);
        return new NextResponse(
          "Error al crear el bloqueo", 
          { status: 500 }
        );
      }
    } else {
      // Lógica para reservas normales (existente)
      client = await db.client.upsert({
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

      // Obtener detalles del servicio
      service = await db.service.findUnique({
        where: { id: serviceId }
      });

      if (!service) {
        return new NextResponse("Servicio no encontrado", { status: 404 });
      }

      // Crear fecha sin componente de hora
      const bookingDate = new Date(date);
      const dateOnly = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate()
      );

      // Calcular hora de fin basada en la duración del servicio
      const [startHour, startMinute] = startTime.split(':').map(Number);
      
      // Calcular minutos totales del inicio
      const startTotalMinutes = startHour * 60 + startMinute;
      // Sumar la duración del servicio
      const endTotalMinutes = startTotalMinutes + service.duration;
      // Convertir de nuevo a formato hora:minuto
      const endHour = Math.floor(endTotalMinutes / 60);
      const endMinute = endTotalMinutes % 60;
      
      // Formatear la hora de fin
      const calculatedEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      console.log("Datos para reserva normal:", {
        date: dateOnly.toISOString().split('T')[0],
        startTime,
        endTime: calculatedEndTime,
        duration: service.duration
      });

      // Verificar si hay bookings existentes que se solapan
      const existingBookings = await db.booking.findMany({
        where: {
          workerId,
          date: dateOnly,
          NOT: { status: "CANCELLED" },
          OR: [
            {
              AND: [
                { startTime: { lte: calculatedEndTime } },
                { endTime: { gt: startTime } }
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

      // Crear el booking normal
      booking = await db.booking.create({
        data: {
          workerId,
          serviceId,
          clientId: client.id,
          shopId: shopId,
          date: dateOnly,
          startTime,
          endTime: calculatedEndTime,
          status: status || "PENDING",
          notes: notes
        },
        include: {
          client: true,
          worker: true,
          service: true,
          shop: true
        }
      });

      // Enviar email de confirmación solo para reservas normales
      try {
        await sendBookingConfirmationEmail(client.email, {
          name: client.name || "Cliente",
          service: service.name || "Servicio",
          worker: worker.name || "Profesional",
          date: new Date(date),
          time: format(new Date(`${date}T${startTime}`), "HH:mm"),
          shop: booking.shop.name || "3BS Barbershop",
          address: booking.shop.address || "Dirección no especificada",
          duration: service.duration,
          price: service.price
        });
      } catch (emailError) {
        console.error("Error enviando email de confirmación:", emailError);
        // Continuamos a pesar del error con el email
      }
    }

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
    const shopId = searchParams.get('shopId');

    if (!start || !end) {
      return new NextResponse("Se requieren fechas de inicio y fin", { status: 400 });
    }

    console.log(`[BOOKINGS_GET] Buscando bookings entre ${start} y ${end}${shopId ? ` para la tienda ${shopId}` : ''}`);
    
    // Construir query dinámicamente
    const whereClause: any = {
      date: {
        gte: new Date(start),
        lte: new Date(end)
      }
    };
    
    // Añadir filtro por tienda si se proporciona
    if (shopId) {
      whereClause.shopId = shopId;
    }

    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        service: true,
        worker: true,
        shop: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    console.log(`[BOOKINGS_GET] Encontrados ${bookings.length} bookings`);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[BOOKINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 