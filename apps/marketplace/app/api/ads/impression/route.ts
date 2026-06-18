import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeveloperFromRequest } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  adId: z.string(),
  actualCpmCents: z.number().int().min(1),
  toolName: z.string().optional(),
  fileExt: z.string().optional(),
});

// Revenue split: developer 50%, referrer 10% (of developer share), platform keeps the rest
const DEVELOPER_SHARE = 0.5;
const REFERRER_SHARE = 0.1; // 10% of what the developer earns, forever

export async function POST(req: NextRequest) {
  const developer = await getDeveloperFromRequest(req);
  if (!developer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { adId, actualCpmCents, toolName, fileExt } = parsed.data;

  const campaign = await prisma.campaign.findUnique({ where: { id: adId } });
  if (!campaign || !campaign.active) return NextResponse.json({ ok: true });

  // actualCpmCents = cents per 1000 impressions (e.g. 500 = $5 CPM)
  // Per impression cost = actualCpmCents / 1000 cents = 0.5 cents for $5 CPM
  // We store earnings in milli-cents (1 unit = 0.001 cents) to preserve precision.
  // Developer earns 50% of per-impression cost in milli-cents:
  //   e.g. $5 CPM → 500/1000 * 1000 * 0.5 = 250 milli-cents per impression
  //   After 1000 impressions: 250,000 milli-cents = 250 cents = $2.50 ✓
  // Display: divide DB value by 100,000 to get dollars
  // Payout: divide DB value by 1,000 to get cents for Stripe transfer
  const perImpressionMilliCents = actualCpmCents; // = cpmCents/1000 * 1000
  const developerEarningsCents = Math.round(perImpressionMilliCents * DEVELOPER_SHARE); // stored as milli-cents
  const referrerEarningsCents = Math.round(developerEarningsCents * REFERRER_SHARE);
  const impressionCostCents = Math.round(perImpressionMilliCents); // milli-cents charged to campaign

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ops: any[] = [
    prisma.impression.create({
      data: {
        campaignId: campaign.id,
        developerId: developer.id,
        actualCpmCents,
        toolName: toolName ?? null,
        fileExt: fileExt ?? null,
      },
    }),
    prisma.campaign.update({
      where: { id: campaign.id },
      data: { spentCents: { increment: impressionCostCents } },
    }),
    prisma.developer.update({
      where: { id: developer.id },
      data: { earningsCents: { increment: developerEarningsCents } },
    }),
  ];

  // Pay the referrer their 10% cut if this developer was referred
  if (developer.referredById && referrerEarningsCents > 0) {
    ops.push(
      prisma.developer.update({
        where: { id: developer.referredById },
        data: { earningsCents: { increment: referrerEarningsCents } },
      })
    );
  }

  await prisma.$transaction(ops);

  // Fetch updated lifetime total to return to the hook client
  const updated = await prisma.developer.findUnique({
    where: { id: developer.id },
    select: { earningsCents: true, referralCode: true },
  });

  return NextResponse.json({
    ok: true,
    earnedCents: developerEarningsCents,
    lifetimeCents: updated?.earningsCents ?? 0,
    referralCode: updated?.referralCode ?? "",
  });
}
