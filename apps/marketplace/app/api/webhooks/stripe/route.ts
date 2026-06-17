import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.bytes();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(Buffer.from(rawBody), sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const campaignId = session.metadata?.campaignId;
    if (campaignId) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { active: true },
      });
    }
  }

  return NextResponse.json({ received: true });
}
