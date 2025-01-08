import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({
      where: { email }
    });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    return NextResponse.json({ error: "Error checking user" }, { status: 500 });
  }
} 