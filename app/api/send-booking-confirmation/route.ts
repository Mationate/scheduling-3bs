import { NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, data } = await req.json();
    
    await sendBookingConfirmationEmail(email, data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BOOKING_CONFIRMATION] Error:", error);
    return NextResponse.json(
      { error: "Error sending confirmation email" },
      { status: 500 }
    );
  }
} 