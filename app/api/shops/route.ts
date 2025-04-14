import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const shop = await db.shop.create({
      data: {
        ...body,
        userId: user.id,
      },
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error("[SHOPS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeSchedules = searchParams.get('includeSchedules') === 'true';

    const shops = await db.shop.findMany({
      select: {
        id: true,
        name: true,
        ...(includeSchedules && {
          schedules: {
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
              isEnabled: true
            }
          }
        })
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(shops);
  } catch (error) {
    console.error("[SHOPS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 