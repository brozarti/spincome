import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Weekly cron: auto-pay all developers with Stripe connected and balance > 0
// Vercel calls this with Authorization: Bearer CRON_SECRET
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const developers = await prisma.developer.findMany({
    where: {
      stripeAccountId: { not: null },
      earningsCents: { gt: 0 },
    },
  });

  const results: { email: string; paidCents: number; error?: string }[] = [];

  for (const dev of developers) {
    const amountCents = Math.floor(dev.earningsCents / 1000); // milli-cents → real cents
    if (amountCents < 50) {
      // Skip if less than $0.50 (Stripe minimum transfer)
      results.push({ email: dev.email, paidCents: 0, error: "below Stripe minimum" });
      continue;
    }

    try {
      await stripe.transfers.create({
        amount: amountCents,
        currency: "usd",
        destination: dev.stripeAccountId!,
        metadata: { developerId: dev.id, autopayout: "true" },
      });

      await prisma.developer.update({
        where: { id: dev.id },
        data: { earningsCents: 0 },
      });

      results.push({ email: dev.email, paidCents: amountCents });
    } catch (err) {
      results.push({ email: dev.email, paidCents: 0, error: String(err) });
    }
  }

  const totalPaid = results.reduce((s, r) => s + r.paidCents, 0);
  return NextResponse.json({ ok: true, totalPaidCents: totalPaid, count: results.length, results });
}
