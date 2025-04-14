import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [
      totalClients,
      newClientsThisMonth,
      totalVisits,
      averageVisitsPerClient,
      topClients,
      recentBookings,
      monthlyStats,
      visitsDistribution
    ] = await Promise.all([
      // Total de clientes
      db.client.count(),
      
      // Nuevos clientes este mes
      db.client.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Total de visitas
      db.booking.count(),
      
      // Promedio de visitas por cliente
      db.booking.groupBy({
        by: ['clientId'],
        _count: true
      }).then(results => 
        results.reduce((acc, curr) => acc + curr._count, 0) / results.length
      ),
      
      // Top clientes por visitas
      db.client.findMany({
        take: 5,
        include: {
          _count: {
            select: { bookings: true }
          },
          bookings: {
            take: 1,
            orderBy: { date: 'desc' },
            select: { date: true }
          }
        },
        orderBy: {
          bookings: {
            _count: 'desc'
          }
        }
      }),
      
      // Actividad reciente
      db.booking.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          client: true,
          service: true
        }
      }),
      
      // Estadísticas mensuales
      db.client.groupBy({
        by: ['createdAt'],
        _count: true,
        having: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)
          }
        }
      }),
      
      // Distribución de visitas
      db.client.findMany({
        select: {
          id: true,
          _count: {
            select: {
              bookings: true
            }
          }
        }
      }).then(results => {
        const distribution = {
          oneVisit: 0,
          twoToFive: 0,
          sixToTen: 0,
          moreThanTen: 0
        };

        results.forEach(result => {
          const visits = result._count.bookings;
          if (visits === 1) distribution.oneVisit++;
          else if (visits >= 2 && visits <= 5) distribution.twoToFive++;
          else if (visits >= 6 && visits <= 10) distribution.sixToTen++;
          else if (visits > 10) distribution.moreThanTen++;
        });

        return [
          { name: '1 visita', value: distribution.oneVisit },
          { name: '2-5 visitas', value: distribution.twoToFive },
          { name: '6-10 visitas', value: distribution.sixToTen },
          { name: '10+ visitas', value: distribution.moreThanTen }
        ];
      })
    ]);

    return NextResponse.json({
      overview: {
        totalClients,
        newClientsThisMonth,
        totalVisits,
        averageVisitsPerClient: Math.round(averageVisitsPerClient * 10) / 10
      },
      topClients: topClients.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        totalVisits: client._count.bookings,
        lastVisit: client.bookings[0]?.date
      })),
      recentActivity: recentBookings.map(booking => ({
        id: booking.id,
        clientName: booking.client!.name,
        serviceName: booking.service.name,
        date: booking.date
      })),
      monthlyStats: monthlyStats.map(stat => ({
        month: stat.createdAt.getMonth(),
        year: stat.createdAt.getFullYear(),
        count: stat._count
      })),
      visitsDistribution
    });
  } catch (error) {
    console.error("[CLIENTS_ANALYTICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 