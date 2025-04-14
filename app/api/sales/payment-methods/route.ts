import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const serviceId = searchParams.get("serviceId");
    const workerId = searchParams.get("workerId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const whereClause = {
      ...(shopId && { shopId }),
      ...(serviceId && { serviceId }),
      ...(workerId && { workerId }),
      ...(from && to && {
        date: {
          gte: new Date(from),
          lte: new Date(to)
        }
      }),
      status: "COMPLETED"
    };

    const paymentStats = await db.booking.groupBy({
      by: ['paymentOption'],
      where: whereClause,
      _count: true,
      _sum: {
        paymentAmount: true
      }
    });

    const totalTransactions = paymentStats.reduce((acc, curr) => acc + curr._count, 0);

    const methods = paymentStats.map(stat => ({
      method: stat.paymentOption || 'later',
      count: stat._count,
      total: stat._sum.paymentAmount || 0,
      percentage: Math.round((stat._count / totalTransactions) * 100)
    }));

    // Asegurar que siempre tengamos los tres métodos
    const defaultMethods = ['card', 'cash', 'later'];
    const finalMethods = defaultMethods.map(method => {
      const stats = methods.find(m => m.method === method);
      return stats || {
        method,
        count: 0,
        total: 0,
        percentage: 0
      };
    });

    return NextResponse.json(finalMethods);
  } catch (error) {
    console.error("[PAYMENT_METHODS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 