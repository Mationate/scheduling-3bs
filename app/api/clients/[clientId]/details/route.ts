import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    // Primero obtener el count total de bookings
    const bookingsCount = await db.booking.count({
      where: {
        clientId: params.clientId
      }
    });

    const client = await db.client.findUnique({
      where: { id: params.clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        notes: true,
        bookings: {
          select: {
            date: true,
            service: {
              select: { name: true }
            },
            worker: {
              select: { name: true }
            },
            shop: {
              select: { name: true }
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!client) {
      return new NextResponse("Cliente no encontrado", { status: 404 });
    }

    const processedClient = {
      ...client,
      totalVisits: bookingsCount, // Usar el count total
      lastVisit: client.bookings[0]?.date || null,
    };

    return NextResponse.json(processedClient);
  } catch (error) {
    console.error("[CLIENT_DETAILS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 