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
        user: true,
        service: true,
        worker: true
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[BOOKINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 