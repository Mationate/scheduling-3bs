import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');
    const workerId = searchParams.get('workerId');
    const serviceId = searchParams.get('serviceId');

    console.log("[CLIENTS_GET] Filtros:", { shopId, workerId, serviceId });

    const clients = await db.client.findMany({
      where: {
        AND: [
          shopId ? {
            bookings: { some: { shopId } }
          } : {},
          workerId ? {
            bookings: { some: { workerId } }
          } : {},
          serviceId ? {
            bookings: { some: { serviceId } }
          } : {},
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        notes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { bookings: true }
        },
        bookings: {
          select: {
            date: true,
          },
          orderBy: { date: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Procesar los datos para incluir lastVisit y totalVisits
    const processedClients = clients.map(client => ({
      ...client,
      lastVisit: client.bookings[0]?.date || null,
      totalVisits: client._count.bookings,
      bookings: undefined
    }));

    console.log("[CLIENTS_GET] Total clientes encontrados:", processedClients.length);
    return NextResponse.json(processedClients);
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await db.client.create({
      data: body
    });
    return NextResponse.json(client);
  } catch (error) {
    console.error("[CLIENTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 