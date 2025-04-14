import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/mail";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[PUBLIC_BOOKINGS_POST] Datos recibidos:", JSON.stringify(body));
    
    // Extraer y validar datos
    const { service, staff, date, time, userData } = body;

    if (!service || !staff || !date || !time || !userData) {
      console.error("[PUBLIC_BOOKINGS_POST] Faltan campos requeridos:", { 
        hasService: !!service, 
        hasStaff: !!staff, 
        hasDate: !!date, 
        hasTime: !!time, 
        hasUserData: !!userData 
      });
      return new NextResponse("Faltan campos requeridos", { status: 400 });
    }

    console.log("[PUBLIC_BOOKINGS_POST] Datos extraídos:", {
      service: JSON.stringify(service),
      staff: JSON.stringify(staff),
      date,
      time,
      userData: JSON.stringify(userData)
    });

    // Verificar que el teléfono existe (ahora es obligatorio)
    if (!userData.phone) {
      console.error("[PUBLIC_BOOKINGS_POST] Falta número de teléfono");
      return new NextResponse("El número de teléfono es obligatorio", { status: 400 });
    }
    
    // Limpiamos el teléfono para evitar caracteres problemáticos
    const cleanPhone = userData.phone.replace(/[^\d+]/g, '').substring(0, 15);
    userData.phone = cleanPhone;
    
    // Crear o actualizar cliente
    console.log("[PUBLIC_BOOKINGS_POST] Creando/actualizando cliente con teléfono limpiado:", cleanPhone);
    
    let client;
    try {
      // Primero intentamos buscar si existe algún cliente con este teléfono
      console.log("[PUBLIC_BOOKINGS_POST] Buscando cliente por teléfono:", cleanPhone);
      const existingClientByPhone = await db.client.findFirst({
        where: {
          phone: cleanPhone
        }
      });
      console.log("[PUBLIC_BOOKINGS_POST] Cliente encontrado por teléfono:", existingClientByPhone);

      if (existingClientByPhone) {
        // Si existe un cliente con este teléfono, lo actualizamos
        console.log("[PUBLIC_BOOKINGS_POST] Actualizando cliente existente con ID:", existingClientByPhone.id);
        client = await db.client.update({
          where: { id: existingClientByPhone.id },
          data: {
            name: userData.name,
            email: userData.email || existingClientByPhone.email,
            notes: userData.notes
          }
        });
        console.log("[PUBLIC_BOOKINGS_POST] Cliente actualizado:", client);
      } else if (userData.email && userData.email.trim() !== '') {
        // Si no hay cliente con este teléfono pero hay email, buscamos o creamos por email
        console.log("[PUBLIC_BOOKINGS_POST] Buscando o creando cliente por email:", userData.email);
        client = await db.client.upsert({
          where: { email: userData.email },
          update: {
            name: userData.name || "Cliente",
            phone: cleanPhone,
            notes: userData.notes || ""
          },
          create: {
            email: userData.email,
            name: userData.name || "Cliente",
            phone: cleanPhone,
            notes: userData.notes || ""
          }
        });
        console.log("[PUBLIC_BOOKINGS_POST] Cliente creado/actualizado por email:", client);
      } else {
        // Si no hay email ni existe cliente con este teléfono, creamos uno con un email generado
        const timestamp = new Date().getTime();
        // Limpiar el teléfono para asegurar que solo contiene números y caracteres válidos para email
        const cleanPhone = userData.phone.replace(/[^\d+]/g, '').substring(0, 15);
        // Generar un email único que no cause conflictos
        const tempEmail = `temp_${cleanPhone}_${timestamp}@placeholder.demo`;
        console.log("[PUBLIC_BOOKINGS_POST] Creando cliente con email temporal:", tempEmail);
        
        client = await db.client.create({
          data: {
            email: tempEmail,
            name: userData.name || "Cliente",  // Asegurar que siempre hay un nombre
            phone: cleanPhone,  // Usar el teléfono limpio
            notes: userData.notes || ""
          }
        });
        console.log("[PUBLIC_BOOKINGS_POST] Cliente creado con email temporal:", client);
      }
    } catch (error) {
      console.error("[PUBLIC_BOOKINGS_POST] Error creando/actualizando cliente:", error);
      // Mostrar detalles completos del error para diagnóstico
      if (error instanceof Error) {
        console.error("[PUBLIC_BOOKINGS_POST] Detalles del error:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      return new NextResponse(`Error al procesar datos del cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`, { status: 500 });
    }
    
    console.log("[PUBLIC_BOOKINGS_POST] Cliente creado/actualizado:", client);

    // Formatear fecha y hora para el booking
    try {
      console.log("[PUBLIC_BOOKINGS_POST] Formateando fecha y hora:", { date, time });
      
      // Asegurarse de que date es una cadena en formato YYYY-MM-DD
      let dateStr;
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          throw new Error(`Fecha inválida: ${date}`);
        }
        dateStr = format(dateObj, 'yyyy-MM-dd');
      } catch (e) {
        console.error("[PUBLIC_BOOKINGS_POST] Error al parsear fecha:", e);
        throw new Error(`Formato de fecha inválido: ${date}`);
      }
      console.log("[PUBLIC_BOOKINGS_POST] Fecha formateada:", dateStr);
      
      // Asegurarse de que time tiene el formato correcto (HH:mm)
      let timeStr;
      try {
        // Validar que time sea una cadena con formato HH:mm
        if (typeof time !== 'string' || !time.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)) {
          // Intentar parsear o formatear
          timeStr = time.includes(':') ? time : `${time}:00`;
          // Validar el resultado
          if (!timeStr.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)) {
            throw new Error(`Formato de hora inválido: ${time}`);
          }
        } else {
          timeStr = time;
        }
      } catch (e) {
        console.error("[PUBLIC_BOOKINGS_POST] Error al parsear hora:", e);
        throw new Error(`Formato de hora inválido: ${time}`);
      }
      console.log("[PUBLIC_BOOKINGS_POST] Hora formateada:", timeStr);
      
      // Construir la fecha y hora completa
      const startDateTime = new Date(`${dateStr}T${timeStr}:00`);
      console.log("[PUBLIC_BOOKINGS_POST] startDateTime:", startDateTime);
      
      // Verificar que la fecha y hora son válidas
      if (isNaN(startDateTime.getTime())) {
        throw new Error(`Fecha u hora inválida: ${dateStr} ${timeStr}`);
      }
      
      // Calcular la hora de finalización basada en la duración del servicio
      const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);
      console.log("[PUBLIC_BOOKINGS_POST] endDateTime:", endDateTime);
      
      // Formatear las horas de inicio y fin como HH:mm
      const startTimeStr = format(startDateTime, 'HH:mm');
      const endTimeStr = format(endDateTime, 'HH:mm');
      
      // Preparar los datos para el booking
      const bookingData = {
        workerId: staff.id,
        serviceId: service.id,
        clientId: client.id,
        shopId: staff.shopId,
        date: new Date(dateStr), // Fecha sin componente de tiempo
        startTime: startTimeStr, // Guardando la hora en formato HH:mm
        endTime: endTimeStr,     // Guardando la hora en formato HH:mm
        status: "PENDING"
      };
      
      console.log("[PUBLIC_BOOKINGS_POST] Creando booking con datos:", bookingData);
      console.log("[PUBLIC_BOOKINGS_POST] Formato de horas guardadas:", {
        startTime: startTimeStr, // formato HH:mm
        endTime: endTimeStr      // formato HH:mm
      });

      // Crear la reserva
      const booking = await db.booking.create({
        data: bookingData,
        include: {
          client: true,
          worker: true,
          service: true,
          shop: true
        }
      });

      // Enviar email de confirmación solo si hay un email real (no generado)
      if (client.email && !client.email.includes("@placeholder.com")) {
        try {
          await sendBookingConfirmationEmail(client.email, {
            name: client.name || "Cliente",
            service: booking.service.name || "Servicio",
            worker: booking.worker.name || "Profesional",
            date: booking.date,
            time: startTimeStr,
            shop: booking.shop.name || "3BS Barbershop",
            address: booking.shop.address || "Dirección no especificada",
            duration: booking.service.duration,
            price: booking.service.price
          });
        } catch (emailError) {
          console.error("[PUBLIC_BOOKINGS_POST] Error enviando email:", emailError);
          // No fallamos la operación completa si el email falla
        }
      }

      console.log("[PUBLIC_BOOKINGS_POST] Booking creado exitosamente:", booking);
      return NextResponse.json({ success: true, booking });
    } catch (error) {
      console.error("[PUBLIC_BOOKINGS_POST] Error creando booking:", error);
      return new NextResponse(
        error instanceof Error ? error.message : "Error al crear la reserva",
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[PUBLIC_BOOKINGS_POST] Error detallado:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return new NextResponse(
      error instanceof Error ? error.message : "Error al crear la reserva",
      { status: 500 }
    );
  }
} 