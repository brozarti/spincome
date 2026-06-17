import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getDeveloperFromRequest } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
  const developer = await getDeveloperFromRequest(req);
  if (!developer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Create a Stripe Express account if they don't have one yet
  let accountId = developer.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: developer.email,
      capabilities: { transfers: { requested: true } },
    });
    accountId = account.id;
    await prisma.developer.update({
      where: { id: developer.id },
      data: { stripeAccountId: accountId },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/dev?connect=refresh`,
    return_url: `${baseUrl}/dev?connect=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    console.error("Connect route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
