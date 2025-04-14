import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { incomeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      workerId, 
      serviceId, 
      amount, 
      paymentMethod, 
      ticketNumber, 
      observation,
      cardAmount,
      cashAmount 
    } = body;

    const income = await db.income.update({
      where: {
        id: params.incomeId
      },
      data: {
        amount,
        paymentMethod,
        ticketNumber,
        observation,
        cardAmount,
        cashAmount,
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
    console.error("[INCOME_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { incomeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.income.delete({
      where: {
        id: params.incomeId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INCOME_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 