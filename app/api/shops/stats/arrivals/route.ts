import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const monthStr = searchParams.get("month");

    if (!shopId || !monthStr) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const [year, month] = monthStr.split("-").map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const workers = await db.worker.findMany({
      where: { shopId },
      select: {
        id: true,
        name: true,
        arrivals: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            id: true,
            date: true,
            isLate: true
          }
        }
      }
    });

    const stats = workers.map(worker => {
      const totalDays = worker.arrivals.length;
      const late = worker.arrivals.filter(a => a.isLate).length;
      const onTime = totalDays - late;
      const latePercentage = totalDays > 0 ? Math.round((late / totalDays) * 100) : 0;

      return {
        workerName: worker.name,
        totalDays,
        onTime,
        late,
        latePercentage,
        arrivals: worker.arrivals
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[SHOP_ARRIVALS_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 