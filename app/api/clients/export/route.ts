import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [clients, stats] = await Promise.all([
      // Obtener todos los clientes con sus datos
      db.client.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          status: true,
          notes: true,
          _count: {
            select: {
              bookings: true
            }
          },
          bookings: {
            take: 1,
            orderBy: {
              date: 'desc'
            },
            select: {
              date: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // Obtener estadísticas generales
      Promise.all([
        db.client.count(),
        db.client.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        db.booking.count(),
        db.booking.groupBy({
          by: ['clientId'],
          _count: true
        }).then(results => 
          results.reduce((acc, curr) => acc + curr._count, 0) / results.length
        ),
        db.client.count({
          where: {
            bookings: {
              some: {
                date: {
                  gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                }
              }
            }
          }
        }).then(async returningClients => {
          const totalClients = await db.client.count();
          return Math.round((returningClients / totalClients) * 100);
        })
      ])
    ]);

    const [
      totalClients,
      newClientsThisMonth,
      totalVisits,
      averageVisitsPerClient,
      retentionRate
    ] = stats;

    // Formatear datos de clientes
    const formattedClients = clients.map(client => ({
      ...client,
      totalVisits: client._count.bookings,
      lastVisit: client.bookings[0]?.date || null,
      // Eliminar datos que no queremos exportar
      _count: undefined,
      bookings: undefined
    }));

    return NextResponse.json({
      clients: formattedClients,
      stats: {
        totalClients,
        newClientsThisMonth,
        totalVisits,
        averageVisitsPerClient: Math.round(averageVisitsPerClient * 10) / 10,
        retentionRate
      }
    });
  } catch (error) {
    console.error("[CLIENTS_EXPORT_GET]", error);
    return new NextResponse("Error al exportar datos", { status: 500 });
  }
} 