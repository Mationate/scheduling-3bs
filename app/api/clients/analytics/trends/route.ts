import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const [
      currentWeekClients,
      previousWeekClients,
      currentMonthClients,
      previousMonthClients,
      weeklyVisits,
      returningClients
    ] = await Promise.all([
      // Clientes esta semana
      db.client.count({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        }
      }),
      
      // Clientes semana anterior
      db.client.count({
        where: {
          createdAt: {
            gte: new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: oneWeekAgo
          }
        }
      }),

      // Clientes este mes
      db.client.count({
        where: {
          createdAt: {
            gte: oneMonthAgo
          }
        }
      }),

      // Clientes mes anterior
      db.client.count({
        where: {
          createdAt: {
            gte: new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth() - 1, oneMonthAgo.getDate()),
            lt: oneMonthAgo
          }
        }
      }),

      // Visitas por semana
      db.booking.count({
        where: {
          date: {
            gte: oneWeekAgo
          }
        }
      }),

      // Clientes que regresan
      db.client.count({
        where: {
          bookings: {
            some: {
              date: {
                gte: oneMonthAgo
              }
            }
          }
        }
      })
    ]);

    const weeklyGrowth = previousWeekClients === 0 ? 100 : 
      Math.round(((currentWeekClients - previousWeekClients) / previousWeekClients) * 100);

    const monthlyGrowth = previousMonthClients === 0 ? 100 :
      Math.round(((currentMonthClients - previousMonthClients) / previousMonthClients) * 100);

    const totalClients = await db.client.count();
    const retentionRate = Math.round((returningClients / totalClients) * 100);

    return NextResponse.json({
      weeklyGrowth,
      monthlyGrowth,
      averageVisitsPerWeek: Math.round(weeklyVisits / 7),
      retentionRate
    });
  } catch (error) {
    console.error("[CLIENTS_TRENDS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 