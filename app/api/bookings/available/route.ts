import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const workerId = searchParams.get("workerId");
    const startTime = searchParams.get("time");

    if (!date || !workerId || !startTime) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // Si es "any", verificar disponibilidad de todos los trabajadores
    if (workerId === "any") {
      const workers = await db.worker.findMany({
        where: {
          status: "ACTIVE",
        },
      });

      // Buscar el primer trabajador disponible
      for (const worker of workers) {
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

        if (!existingBooking) {
          return NextResponse.json({ 
            available: true,
            suggestedWorkerId: worker.id 
          });
        }
      }

      return NextResponse.json({ 
        available: false,
        error: "No hay profesionales disponibles para este horario" 
      });
    }

    // Verificar disponibilidad para un trabajador específico
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

    return NextResponse.json({ 
      available: !existingBooking,
      error: existingBooking ? "Este profesional no está disponible en el horario seleccionado" : null
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 