import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { startOfDay, addDays } from "date-fns";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Verificar si ya existe una reserva para ese horario
    const existingBooking = await db.booking.findFirst({
      where: {
        workerId: body.workerId,
        date: new Date(body.date),
        startTime: body.startTime,
        status: {
          not: "CANCELLED"
        }
      }
    });

    if (existingBooking) {
      return new NextResponse("Este horario ya no está disponible", { status: 400 });
    }

    const booking = await db.booking.create({
      data: {
        userId: user.id,
        workerId: body.workerId,
        serviceId: body.serviceId,
        shopId: body.shopId,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        status: "PENDING",
        // Otros campos que necesites
      },
      include: {
        service: true,
        worker: true,
        shop: true,
      }
    });

    // TODO: Enviar email
    // await sendBookingConfirmationEmail({
    //   to: user.email,
    //   booking: {
    //     service: booking.service.name,
    //     worker: booking.worker.name,
    //     shop: booking.shop.name,
    //     date: format(booking.date, "PPP", { locale: es }),
    //     time: booking.startTime
    //   }
    // });

    return NextResponse.json(booking);
  } catch (error) {
    console.log("[BOOKINGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json([]);
    }

    // Normalizar la fecha para la comparación
    const date = startOfDay(new Date(dateStr));
    console.log('Searching bookings for date:', date);

    const bookings = await db.booking.findMany({
      where: {
        date: {
          gte: date,
          lt: addDays(date, 1),
        },
      },
      include: {
        service: true,
        worker: true,
        user: true,
      }
    });

    console.log('Found bookings:', bookings);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[BOOKINGS_GET]", error);
    return NextResponse.json([], { status: 500 });
  }
} 