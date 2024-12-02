import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.service.delete({
      where: { id: params.serviceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SERVICE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 