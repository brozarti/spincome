import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY ?? "NOT SET";
  return NextResponse.json({
    keyPrefix: key.slice(0, 12),
    keyLength: key.length,
    keySet: !!process.env.STRIPE_SECRET_KEY,
  });
}
