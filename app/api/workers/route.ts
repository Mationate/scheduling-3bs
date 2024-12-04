import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const worker = await db.worker.create({
      data: {
        name: body.name,
        phone: body.phone,
        mail: body.mail,
        avatar: body.avatar,
        status: body.status,
        shopId: body.shopId,
      },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.log("[WORKERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
) {
  try {
    const workers = await db.worker.findMany({
      where: {
        status: "ACTIVE"
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.log("[WORKERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
