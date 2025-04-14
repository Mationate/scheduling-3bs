import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!shopId) {
      return new NextResponse("Shop ID is required", { status: 400 });
    }

    const dateFilter = date
      ? {
          gte: new Date(date),
          lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
        }
      : from && to
      ? {
          gte: new Date(from),
          lte: new Date(to),
        }
      : undefined;

    const incomes = await db.income.findMany({
      where: {
        shopId,
        ...(dateFilter && { date: dateFilter }),
      },
      include: {
        worker: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log("Datos crudos de la base de datos:", incomes);

    const formattedIncomes = incomes.map(income => ({
      id: income.id,
      date: income.date,
      ticketNumber: income.ticketNumber,
      workerId: income.workerId,
      workerName: income.worker.name,
      serviceId: income.serviceId,
      serviceName: income.service.name,
      amount: income.amount,
      paymentMethod: income.paymentMethod,
      cardAmount: income.cardAmount,
      cashAmount: income.cashAmount,
      observation: income.observation
    }));

    console.log("Datos formateados para el cliente:", formattedIncomes);

    return NextResponse.json(formattedIncomes);
  } catch (error) {
    console.error("[INCOME_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  req: Request
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      shopId, 
      workerId, 
      serviceId, 
      amount, 
      paymentMethod, 
      ticketNumber, 
      observation,
      cardAmount,
      cashAmount 
    } = body;

    const income = await db.income.create({
      data: {
        date: new Date(),
        amount,
        paymentMethod,
        ticketNumber,
        observation,
        cardAmount,
        cashAmount,
        shop: {
          connect: {
            id: shopId
          }
        },
        worker: {
          connect: {
            id: workerId
          }
        },
        service: {
          connect: {
            id: serviceId
          }
        }
      }
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error("[INCOME_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 