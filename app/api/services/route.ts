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
    const service = await db.service.create({
      data: {
        ...body,
        ownerId: user.id,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 

export async function GET() {
  try {
    const services = await db.service.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("[SERVICES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 