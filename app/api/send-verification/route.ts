import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { generateSixDigitToken } from "@/lib/tokens";
import { sendTwoFactorTokenEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const verificationToken = await generateSixDigitToken(email);
    await sendTwoFactorTokenEmail(
      verificationToken.email,
      verificationToken.token
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error sending verification" }, 
      { status: 500 }
    );
  }
} 