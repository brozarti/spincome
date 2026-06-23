import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getDeveloperFromRequest } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MIN_PAYOUT_MILLI_CENTS = 1000000; // $10 = 1,000,000 milli-cents

export async function POST(req: NextRequest) {
  const developer = await getDeveloperFromRequest(req);
  if (!developer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!developer.stripeAccountId) {
    return NextResponse.json({ error: "Connect a Stripe account first" }, { status: 400 });
  }

  if (developer.earningsCents < MIN_PAYOUT_MILLI_CENTS) {
    return NextResponse.json(
      { error: `Minimum payout is $10` },
      { status: 400 }
    );
  }

  const amountCents = Math.floor(developer.earningsCents / 1000);

  try {
    await stripe.transfers.create({
      amount: amountCents,
      currency: "usd",
      destination: developer.stripeAccountId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("balance") || msg.includes("insufficient")) {
      return NextResponse.json(
        { error: "Payout temporarily unavailable. Funds are pending from advertisers." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Payout failed: " + msg }, { status: 500 });
  }

  await prisma.developer.update({
    where: { id: developer.id },
    data: { earningsCents: 0 },
  });

  return NextResponse.json({ ok: true, paidOutCents: amountCents });
}
