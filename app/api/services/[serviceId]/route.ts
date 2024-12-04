import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const service = await db.service.update({
      where: {
        id: params.serviceId,
      },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        duration: body.duration,
        image: body.image,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.log("[SERVICE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const service = await db.service.delete({
      where: {
        id: params.serviceId,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.log("[SERVICE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 