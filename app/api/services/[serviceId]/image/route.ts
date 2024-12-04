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

    const { imageUrl } = await req.json();
    console.log("imageUrl", imageUrl);

    const service = await db.service.update({
      where: {
        id: params.serviceId,
      },
      data: {
        image: imageUrl,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.log("[SERVICE_IMAGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 