import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const shop = await db.shop.update({
      where: { id: params.shopId },
      data: body,
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error("[SHOP_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.shop.delete({
      where: { id: params.shopId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SHOP_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 