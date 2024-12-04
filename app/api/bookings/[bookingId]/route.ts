import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const body = await req.json();
    const booking = await db.booking.update({
      where: {
        id: params.bookingId,
      },
      data: {
        status: body.status,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKING_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 