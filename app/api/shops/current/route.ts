import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const shop = await db.shop.findFirst({
      where: {
        userId: user.id
      },
      select: {
        id: true
      }
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error("[CURRENT_SHOP_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 