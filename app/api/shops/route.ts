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