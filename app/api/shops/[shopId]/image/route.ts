import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
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

    const { imageUrl } = await req.json();
    console.log("imageUrl", imageUrl);

    const shop = await db.shop.update({
      where: {
        id: params.shopId,
      },
      data: {
        image: imageUrl,
      },
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.log("[SHOP_IMAGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 