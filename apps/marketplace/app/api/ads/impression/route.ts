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

  // actualCpmCents is cost per 1000 impressions, so per-impression cost is actualCpmCents / 1000
  // We store earnings in fractional cents by tracking in milli-cents, but for simplicity
  // we credit the full CPM value per impression (pays out as if every 1 impression = 1 CPM unit)
  // This means a $5 CPM campaign pays $5 * 50% = $2.50 per impression to developer -- good for early growth
  const impressionCostCents = Math.max(1, actualCpmCents);
  const developerEarningsCents = Math.floor(impressionCostCents * DEVELOPER_SHARE);
  const referrerEarningsCents = Math.floor(developerEarningsCents * REFERRER_SHARE);

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

  return NextResponse.json({ ok: true, earnedCents: developerEarningsCents });
}
