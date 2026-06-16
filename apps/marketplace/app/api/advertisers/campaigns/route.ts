import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  advertiserEmail: z.string().email(),
  advertiserName: z.string().min(1),
  headline: z.string().max(80),
  body: z.string().max(200),
  cta: z.string().max(40),
  clickUrl: z.string().url(),
  maxCpmCents: z.number().int().min(100),   // min $1 CPM
  budgetCents: z.number().int().min(1000),  // min $10 budget
  targetLanguages: z.string().nullable().optional(),
  targetFrameworks: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;

  let advertiser = await prisma.advertiser.findUnique({ where: { email: d.advertiserEmail } });
  if (!advertiser) {
    advertiser = await prisma.advertiser.create({
      data: { email: d.advertiserEmail, name: d.advertiserName, passwordHash: "" },
    });
  }

  const campaign = await prisma.campaign.create({
    data: {
      advertiserId: advertiser.id,
      headline: d.headline,
      body: d.body,
      cta: d.cta,
      clickUrl: d.clickUrl,
      maxCpmCents: d.maxCpmCents,
      budgetCents: d.budgetCents,
      targetLanguages: d.targetLanguages ?? null,
      targetFrameworks: d.targetFrameworks ?? null,
    },
  });

  return NextResponse.json({ campaignId: campaign.id });
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
