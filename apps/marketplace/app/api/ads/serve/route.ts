import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeveloperFromRequest } from "@/lib/auth";
import { z } from "zod";

const contextSchema = z.object({
  toolName: z.string().optional(),
  fileExt: z.string().optional(),
});

type Campaign = {
  id: string;
  headline: string;
  body: string;
  cta: string;
  clickUrl: string;
  maxCpmCents: number;
  budgetCents: number;
  spentCents: number;
  deliverySpeed: string;
  targetLanguages: string | null;
  targetFrameworks: string | null;
  advertiser: { name: string };
  createdAt: Date;
};

// Delivery pacing: limit impressions per hour based on speed
function getHourlyLimit(campaign: Campaign): number {
  const totalBudgetImpressions = Math.floor(campaign.budgetCents / campaign.maxCpmCents);
  switch (campaign.deliverySpeed) {
    case "fast":
      return totalBudgetImpressions; // no limit
    case "slow":
      return Math.max(1, Math.ceil(totalBudgetImpressions / 48)); // spread over ~2 days
    case "medium":
    default:
      return Math.max(1, Math.ceil(totalBudgetImpressions / 6)); // spread over ~6 hours
  }
}

// Real-time second-price auction with pacing and frequency awareness
async function runAuction(
  campaigns: Campaign[],
  developerId: string,
  devLanguages: string[],
  devFrameworks: string[]
): Promise<{ winner: Campaign; actualCpmCents: number } | null> {

  // Get recent impression counts for pacing + frequency capping
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentImpressions = await prisma.impression.groupBy({
    by: ["campaignId"],
    where: { createdAt: { gte: oneHourAgo } },
    _count: { id: true },
  });
  const hourlyCount: Record<string, number> = {};
  for (const r of recentImpressions) {
    hourlyCount[r.campaignId] = r._count.id;
  }

  // Get how many times this developer has seen each campaign (last 24h) for frequency capping
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const devImpressions = await prisma.impression.groupBy({
    by: ["campaignId"],
    where: { developerId, createdAt: { gte: oneDayAgo } },
    _count: { id: true },
  });
  const devFrequency: Record<string, number> = {};
  for (const r of devImpressions) {
    devFrequency[r.campaignId] = r._count.id;
  }

  const eligible = campaigns.filter((c) => {
    if (c.spentCents >= c.budgetCents) return false;

    // Delivery pacing: skip if this campaign hit its hourly limit
    const limit = getHourlyLimit(c);
    if ((hourlyCount[c.id] ?? 0) >= limit) return false;

    // Targeting match
    if (c.targetLanguages) {
      const targets = c.targetLanguages.split(",").map((s) => s.trim().toLowerCase());
      if (!devLanguages.some((l) => targets.includes(l))) return false;
    }
    if (c.targetFrameworks) {
      const targets = c.targetFrameworks.split(",").map((s) => s.trim().toLowerCase());
      if (!devFrameworks.some((f) => targets.includes(f))) return false;
    }
    return true;
  });

  // Fall back to untargeted campaigns if no targeted ones match
  const pool = eligible.length > 0 ? eligible : campaigns.filter((c) => {
    if (c.spentCents >= c.budgetCents) return false;
    if ((hourlyCount[c.id] ?? 0) >= getHourlyLimit(c)) return false;
    return !c.targetLanguages && !c.targetFrameworks;
  });

  if (pool.length === 0) return null;

  // Sort by effective bid: campaigns the developer has seen less get a boost
  // This naturally distributes impressions across campaigns
  pool.sort((a, b) => {
    const freqA = devFrequency[a.id] ?? 0;
    const freqB = devFrequency[b.id] ?? 0;
    // Penalize CPM by frequency (diminishing returns for repeated views)
    const effectiveA = a.maxCpmCents / (1 + freqA * 0.1);
    const effectiveB = b.maxCpmCents / (1 + freqB * 0.1);
    return effectiveB - effectiveA;
  });

  const winner = pool[0];
  // Second-price: winner pays second bid + 1 cent (Vickrey auction)
  const actualCpmCents = pool.length > 1 ? pool[1].maxCpmCents + 1 : winner.maxCpmCents;

  return { winner, actualCpmCents };
}

export async function POST(req: NextRequest) {
  const developer = await getDeveloperFromRequest(req);
  if (!developer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ctx = contextSchema.safeParse(body).data ?? {};

  const devLanguages = (developer.languages ?? "").split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean);
  const devFrameworks = (developer.frameworks ?? "").split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean);

  const campaigns = await prisma.campaign.findMany({
    where: { active: true },
    include: { advertiser: { select: { name: true } } },
  }) as Campaign[];

  const result = await runAuction(campaigns, developer.id, devLanguages, devFrameworks);
  if (!result) return NextResponse.json({ error: "No ads available" }, { status: 404 });

  const { winner, actualCpmCents } = result;
  const base = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  return NextResponse.json({
    id: winner.id,
    headline: winner.headline,
    body: winner.body,
    cta: winner.cta,
    clickUrl: `${base}/api/ads/click?cid=${winner.id}&did=${developer.id}&tool=${ctx.toolName ?? ""}&ext=${ctx.fileExt ?? ""}`,
    advertiser: winner.advertiser.name,
    actualCpmCents,
    toolName: ctx.toolName,
    fileExt: ctx.fileExt,
  });
}
