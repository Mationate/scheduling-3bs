import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Worker, ShopSchedule, ShopBreak, Service } from "@prisma/client";

// Interfaces para tipar correctamente
interface WorkerWithRelations extends Worker {
  services: Service[];
  shop?: {
    schedules: ShopSchedule[];
    breaks: ShopBreak[];
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const workerId = searchParams.get("workerId");
    const startTime = searchParams.get("time");
    const shopId = searchParams.get("shopId");
    const serviceId = searchParams.get("serviceId");

    if (!date || !workerId) {
      return new NextResponse("Faltan parámetros: se requiere fecha y trabajador", { status: 400 });
    }

    console.log("[API_BOOKINGS_AVAILABLE] Verificando disponibilidad:", { 
      date, workerId, startTime, shopId, serviceId 
    });

    // Si no se especifica hora, no podemos verificar disponibilidad específica
    if (!startTime) {
      return new NextResponse("Falta parámetro: se requiere hora", { status: 400 });
    }

    // Si no se especifica servicio y se busca cualquier profesional, no podemos verificar compatibilidad
    if (workerId === "any" && !serviceId) {
      return new NextResponse("Falta parámetro: se requiere ID del servicio para buscar profesionales disponibles", { status: 400 });
    }

    // Si es "any", verificar disponibilidad de todos los trabajadores
    if (workerId === "any") {
      // Primero, obtenemos el servicio solicitado para verificar duración
      const service = await db.service.findUnique({
        where: { id: serviceId || "" }
      });
      
      if (!service) {
        return NextResponse.json({
          available: false,
          error: "El servicio solicitado no existe"
        });
      }
      
      console.log(`[API_BOOKINGS_AVAILABLE] Servicio encontrado: ${service.name}, duración: ${service.duration} minutos`);
      
      // Consulta de workers activos, con filtro de local si es necesario
      const workerQuery: any = {
        status: "ACTIVE"
      };
      
      if (shopId) {
        workerQuery.shopId = shopId;
      }
      
      // Buscar trabajadores que pueden realizar el servicio especificado
      console.log("[API_BOOKINGS_AVAILABLE] Buscando trabajadores que pueden realizar el servicio:", serviceId);
      
      const workers = await db.worker.findMany({
        where: {
          ...workerQuery,
          services: {
            some: {
              id: serviceId || ""
            }
          }
        },
        include: {
          services: true,
          shop: {
            include: {
              schedules: true,
              breaks: true
            }
          }
        }
      });

      console.log(`[API_BOOKINGS_AVAILABLE] Se encontraron ${workers.length} trabajadores activos que pueden realizar este servicio`);
      
      if (workers.length === 0) {
        return NextResponse.json({ 
          available: false,
          error: "No hay profesionales disponibles que puedan realizar este servicio" 
        });
      }

      // Obtener el día de la semana (0-6, donde 0 es domingo)
      const dayOfWeek = new Date(date).getDay();
      const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
      
      // Buscar trabajadores disponibles
      const availableWorkers = [];
      const unavailableReasons: Record<string, string> = {};
      
      for (const worker of workers as WorkerWithRelations[]) {
        try {
          console.log(`[API_BOOKINGS_AVAILABLE] Verificando disponibilidad para profesional: ${worker.name} (${worker.id})`);
          
          // 1. Verificar si el trabajador está activo
          if (worker.status !== "ACTIVE") {
            console.log(`[API_BOOKINGS_AVAILABLE] El trabajador ${worker.id} no está activo`);
            unavailableReasons[worker.id] = "Trabajador inactivo";
            continue;
          }
          
          // 2. Verificar si el local está abierto ese día/hora
          const shopSchedule = worker.shop?.schedules.find(s => s.dayOfWeek === dayOfWeek);
          
          if (!shopSchedule) {
            console.log(`[API_BOOKINGS_AVAILABLE] El local está cerrado el ${dayNames[dayOfWeek]}`);
            unavailableReasons[worker.id] = `Local cerrado el ${dayNames[dayOfWeek]}`;
            continue;
          }
          
          // Verificar si la hora está dentro del horario del local
          if (startTime < shopSchedule.startTime || startTime > shopSchedule.endTime) {
            console.log(`[API_BOOKINGS_AVAILABLE] El horario ${startTime} está fuera del horario del local (${shopSchedule.startTime}-${shopSchedule.endTime})`);
            unavailableReasons[worker.id] = `Horario fuera de atención (${shopSchedule.startTime}-${shopSchedule.endTime})`;
            continue;
          }
          
          // 3. Verificar si hay descansos programados
          // Nota: según el esquema, ShopBreak tiene dayOfWeek, no date
          const shopBreak = worker.shop?.breaks.find(b => {
            return b.dayOfWeek === dayOfWeek &&
                  b.startTime <= startTime && b.endTime >= startTime;
          });
          
          if (shopBreak) {
            console.log(`[API_BOOKINGS_AVAILABLE] Hay un descanso programado para el local en ese horario`);
            unavailableReasons[worker.id] = "Horario en descanso programado";
            continue;
          }
          
          // 4. Verificar si el trabajador ya tiene una reserva en ese horario exacto
          const existingBooking = await db.booking.findFirst({
            where: {
              workerId: worker.id,
              date: new Date(date),
              startTime,
              status: {
                not: "CANCELLED"
              }
            }
          });

          if (existingBooking) {
            console.log(`[API_BOOKINGS_AVAILABLE] El trabajador ${worker.id} ya tiene una reserva para ${date} a las ${startTime}`);
            unavailableReasons[worker.id] = `Ya tiene reserva a las ${startTime}`;
            continue;
          }
          
          // 5. Verificar servicios solapados - buscar todas las reservas del día para este trabajador
          const serviceEndTimeHour = calculateEndTime(startTime, service.duration);
          
          console.log(`[API_BOOKINGS_AVAILABLE] Verificando solapamientos: servicio ${service.id} (${startTime} - ${serviceEndTimeHour})`);
          
          const allDayBookings = await db.booking.findMany({
            where: {
              workerId: worker.id,
              date: new Date(date),
              status: {
                not: "CANCELLED"
              }
            },
            include: {
              service: true
            },
            orderBy: {
              startTime: 'asc'
            }
          });
          
          console.log(`[API_BOOKINGS_AVAILABLE] El trabajador ${worker.id} tiene ${allDayBookings.length} reservas el ${date}`);
          
          // Verificar manualmente si hay solapamientos con cualquier reserva existente
          let hasOverlap = false;
          let overlapInfo: { existingSlot: string; proposedSlot: string } | null = null;
          
          for (const booking of allDayBookings) {
            if (!booking.service) {
              console.log(`[API_BOOKINGS_AVAILABLE] Advertencia: Reserva ${booking.id} sin datos de servicio`);
              continue;
            }
            
            const bookingStartTime = booking.startTime;
            const bookingEndTime = calculateEndTime(bookingStartTime, booking.service.duration);
            
            console.log(`[API_BOOKINGS_AVAILABLE] Comparando con reserva existente: ${bookingStartTime} - ${bookingEndTime}`);
            
            // Convertir strings de tiempo a minutos para facilitar comparación
            const bookingStartMinutes = timeToMinutes(bookingStartTime);
            const bookingEndMinutes = timeToMinutes(bookingEndTime);
            const newStartMinutes = timeToMinutes(startTime);
            const newEndMinutes = timeToMinutes(serviceEndTimeHour);
            
            // Verificar si hay solapamiento
            if (!(newEndMinutes <= bookingStartMinutes || newStartMinutes >= bookingEndMinutes)) {
              hasOverlap = true;
              overlapInfo = {
                existingSlot: `${bookingStartTime} - ${bookingEndTime}`,
                proposedSlot: `${startTime} - ${serviceEndTimeHour}`
              };
              break;
            }
          }
          
          if (hasOverlap && overlapInfo) {
            console.log(`[API_BOOKINGS_AVAILABLE] El trabajador ${worker.id} tiene solapamiento: ${JSON.stringify(overlapInfo)}`);
            unavailableReasons[worker.id] = `Solapamiento con reserva existente (${overlapInfo.existingSlot})`;
            continue;
          }
          
          // ¡Este trabajador está disponible!
          console.log(`[API_BOOKINGS_AVAILABLE] ¡Trabajador ${worker.id} está disponible!`);
          availableWorkers.push({
            id: worker.id,
            name: worker.name,
            serviceIds: worker.services.map(s => s.id)
          });
        } catch (error) {
          console.error(`[API_BOOKINGS_AVAILABLE] Error verificando disponibilidad para trabajador ${worker.id}:`, error);
          unavailableReasons[worker.id] = `Error en verificación: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        }
      }
      
      console.log(`[API_BOOKINGS_AVAILABLE] Se encontraron ${availableWorkers.length} trabajadores disponibles para ${date} a las ${startTime}`);
      console.log(`[API_BOOKINGS_AVAILABLE] Razones de no disponibilidad:`, unavailableReasons);
      
      if (availableWorkers.length > 0) {
        // Devolver el primer trabajador disponible
        return NextResponse.json({ 
          available: true,
          suggestedWorker: availableWorkers[0]
        });
      } else {
        return NextResponse.json({ 
          available: false,
          error: "No hay profesionales disponibles para este horario que puedan realizar este servicio",
          unavailableReasons
        });
      }
    }

    // Verificar disponibilidad para un trabajador específico
    const worker = await db.worker.findUnique({
      where: { id: workerId },
      include: {
        services: true,
        shop: {
          include: {
            schedules: true,
            breaks: true
          }
        }
      }
    }) as WorkerWithRelations;
    
    if (!worker) {
      return NextResponse.json({
        available: false,
        error: "El profesional seleccionado no existe"
      });
    }
    
    // Verificar si el trabajador puede realizar el servicio
    let canPerformService = true;
    let service = null;
    
    if (serviceId) {
      service = await db.service.findFirst({
        where: {
          id: serviceId,
          workers: {
            some: {
              id: workerId
            }
          }
        }
      });
      
      canPerformService = !!service;
      
      if (!canPerformService) {
        return NextResponse.json({
          available: false,
          worker: {
            id: worker.id,
            name: worker.name
          },
          error: "Este profesional no puede realizar el servicio seleccionado"
        });
      }
    }
    
    // Verificar horario del local
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const shopSchedule = worker.shop?.schedules.find(s => s.dayOfWeek === dayOfWeek);
    
    if (!shopSchedule) {
      return NextResponse.json({
        available: false,
        worker: {
          id: worker.id,
          name: worker.name
        },
        error: `El local está cerrado los ${dayNames[dayOfWeek]}`
      });
    }
    
    if (startTime < shopSchedule.startTime || startTime > shopSchedule.endTime) {
      return NextResponse.json({
        available: false,
        worker: {
          id: worker.id,
          name: worker.name
        },
        error: `El horario seleccionado está fuera del horario de atención (${shopSchedule.startTime}-${shopSchedule.endTime})`
      });
    }
    
    // Verificar descansos
    const shopBreak = worker.shop?.breaks.find(b => {
      return b.dayOfWeek === dayOfWeek && 
            b.startTime <= startTime && b.endTime >= startTime;
    });
    
    if (shopBreak) {
      return NextResponse.json({
        available: false,
        worker: {
          id: worker.id,
          name: worker.name
        },
        error: "El local se encuentra en descanso durante el horario seleccionado"
      });
    }
    
    // Verificar reserva existente (mismo horario exacto)
    const existingBooking = await db.booking.findFirst({
      where: {
        workerId,
        date: new Date(date),
        startTime,
        status: {
          not: "CANCELLED"
        }
      }
    });
    
    if (existingBooking) {
      return NextResponse.json({
        available: false,
        worker: {
          id: worker.id,
          name: worker.name
        },
        error: "Este profesional no está disponible en el horario seleccionado"
      });
    }
    
    // Verificar solapamientos si tenemos información del servicio
    if (service) {
      const serviceEndTimeHour = calculateEndTime(startTime, service.duration);
      
      console.log(`[API_BOOKINGS_AVAILABLE] Verificando solapamientos para profesional específico: servicio ${service.id} (${startTime} - ${serviceEndTimeHour})`);
      
      // Obtener todas las reservas del día para este trabajador
      const allDayBookings = await db.booking.findMany({
        where: {
          workerId: workerId,
          date: new Date(date),
          status: {
            not: "CANCELLED"
          }
        },
        include: {
          service: true
        },
        orderBy: {
          startTime: 'asc'
        }
      });
      
      console.log(`[API_BOOKINGS_AVAILABLE] El trabajador ${workerId} tiene ${allDayBookings.length} reservas el ${date}`);
      
      // Verificar manualmente si hay solapamientos con cualquier reserva existente
      let hasOverlap = false;
      let overlapInfo: { existingSlot: string; proposedSlot: string } | null = null;
      
      for (const booking of allDayBookings) {
        if (!booking.service) {
          console.log(`[API_BOOKINGS_AVAILABLE] Advertencia: Reserva ${booking.id} sin datos de servicio`);
          continue;
        }
        
        const bookingStartTime = booking.startTime;
        const bookingEndTime = calculateEndTime(bookingStartTime, booking.service.duration);
        
        console.log(`[API_BOOKINGS_AVAILABLE] Comparando con reserva existente: ${bookingStartTime} - ${bookingEndTime}`);
        
        // Convertir strings de tiempo a minutos para facilitar comparación
        const bookingStartMinutes = timeToMinutes(bookingStartTime);
        const bookingEndMinutes = timeToMinutes(bookingEndTime);
        const newStartMinutes = timeToMinutes(startTime);
        const newEndMinutes = timeToMinutes(serviceEndTimeHour);
        
        // Verificar si hay solapamiento
        if (!(newEndMinutes <= bookingStartMinutes || newStartMinutes >= bookingEndMinutes)) {
          hasOverlap = true;
          overlapInfo = {
            existingSlot: `${bookingStartTime} - ${bookingEndTime}`,
            proposedSlot: `${startTime} - ${serviceEndTimeHour}`
          };
          break;
        }
      }
      
      if (hasOverlap && overlapInfo) {
        console.log(`[API_BOOKINGS_AVAILABLE] El trabajador ${workerId} tiene solapamiento: ${JSON.stringify(overlapInfo)}`);
        return NextResponse.json({
          available: false,
          worker: {
            id: worker.id,
            name: worker.name
          },
          error: `Este profesional tiene otra reserva que se solapa con el horario seleccionado (${overlapInfo.existingSlot})`
        });
      }
    }
    
    // Si llegamos hasta aquí, el profesional está disponible
    console.log(`[API_BOOKINGS_AVAILABLE] El profesional ${worker.name} está disponible para ${date} a las ${startTime}`);
    return NextResponse.json({ 
      available: true,
      worker: {
        id: worker.id,
        name: worker.name
      }
    });

  } catch (error) {
    console.error("[API_BOOKINGS_AVAILABLE] Error:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}

// Función para calcular la hora de finalización basada en la hora de inicio y duración en minutos
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
  
  return `${endHours}:${endMinutes}`;
}

// Función para convertir hora en formato "HH:MM" a minutos desde medianoche
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
} 