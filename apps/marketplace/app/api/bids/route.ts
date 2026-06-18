import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public -- no auth required. Returns sanitized campaign data for the live auction board.
export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    where: { active: true },
    include: {
      advertiser: { select: { name: true } },
      _count: { select: { impressions: true } },
    },
    orderBy: { maxCpmCents: "desc" },
  });

  // Also fetch recently completed (inactive, has impressions) for context
  const recent = await prisma.campaign.findMany({
    where: { active: false, spentCents: { gt: 0 } },
    include: {
      advertiser: { select: { name: true } },
      _count: { select: { impressions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const format = (c: typeof campaigns[0]) => ({
    advertiser: c.advertiser.name,
    headline: c.headline,
    body: c.body,
    cta: c.cta,
    maxCpmCents: c.maxCpmCents,
    budgetCents: c.budgetCents,
    spentCents: c.spentCents,
    impressions: c._count.impressions,
    active: c.active,
    targetLanguages: c.targetLanguages ?? null,
    targetFrameworks: c.targetFrameworks ?? null,
    createdAt: c.createdAt,
  });

  return NextResponse.json({
    live: campaigns.map(format),
    recent: recent.map(format),
  });
}
