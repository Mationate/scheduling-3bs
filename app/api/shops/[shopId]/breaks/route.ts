import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const breakItem = await db.shopBreak.create({
      data: {
        ...body,
        shopId: params.shopId,
      },
    });

    return NextResponse.json(breakItem);
  } catch (error) {
    console.error("[BREAKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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
    const breakItem = await db.shopBreak.update({
      where: { id: body.id },
      data: body,
    });

    return NextResponse.json(breakItem);
  } catch (error) {
    console.error("[BREAKS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 