import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createSchema = z.object({
  advertiserEmail: z.string().email(),
  advertiserName: z.string().min(1),
  headline: z.string().max(80),
  body: z.string().max(200),
  cta: z.string().max(40),
  clickUrl: z.string().url(),
  maxCpmCents: z.number().int().min(100),
  budgetCents: z.number().int().min(1000),
  targetLanguages: z.string().nullable().optional(),
  targetFrameworks: z.string().nullable().optional(),
  deliverySpeed: z.enum(["slow", "medium", "fast"]).optional(),
  brandIconBase64: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  // Find or create advertiser
  let advertiser = await prisma.advertiser.findUnique({ where: { email: d.advertiserEmail } });
  if (!advertiser) {
    advertiser = await prisma.advertiser.create({
      data: { email: d.advertiserEmail, name: d.advertiserName, passwordHash: "" },
    });
  }

  // Create campaign as inactive -- activated by webhook on payment
  const campaign = await prisma.campaign.create({
    data: {
      advertiserId: advertiser.id,
      headline: d.headline,
      body: d.body,
      cta: d.cta,
      clickUrl: d.clickUrl,
      maxCpmCents: d.maxCpmCents,
      budgetCents: d.budgetCents * 1000, // convert real cents to milli-cents to match spentCents units
      targetLanguages: d.targetLanguages ?? null,
      targetFrameworks: d.targetFrameworks ?? null,
      deliverySpeed: d.deliverySpeed ?? "medium",
      brandIconBase64: d.brandIconBase64 ?? null,
      active: false,
    },
  });

  // Create Stripe Checkout session for the budget amount
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: d.advertiserEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: d.budgetCents,
          product_data: {
            name: `Spincome ad campaign: "${d.headline}"`,
            description: `Max CPM: $${(d.maxCpmCents / 100).toFixed(2)} | Budget: $${(d.budgetCents / 100).toFixed(2)}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { campaignId: campaign.id },
    success_url: `${baseUrl}/advertise/success?campaignId=${campaign.id}`,
    cancel_url: `${baseUrl}/advertise/cancel?campaignId=${campaign.id}`,
  });

  return NextResponse.json({ checkoutUrl: session.url });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const advertiser = await prisma.advertiser.findUnique({
    where: { email },
    include: {
      campaigns: {
        include: { _count: { select: { impressions: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!advertiser) return NextResponse.json({ campaigns: [] });
  return NextResponse.json({ campaigns: advertiser.campaigns });
}
