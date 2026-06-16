import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function adminAuth(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key");
  return !!process.env.ADMIN_KEY && key === process.env.ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!adminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    impressions,
    totalCampaignSpend,
    totalDeveloperEarnings,
    totalDevelopers,
    activeCampaigns,
    recentImpressions,
  ] = await Promise.all([
    prisma.impression.count(),
    prisma.campaign.aggregate({ _sum: { spentCents: true } }),
    prisma.developer.aggregate({ _sum: { earningsCents: true } }),
    prisma.developer.count(),
    prisma.campaign.count({ where: { active: true } }),
    // Last 30 days of impression volume by day
    prisma.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt")::text AS day, COUNT(*)::bigint AS count
      FROM "Impression"
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1
    `,
  ]);

  const totalSpentCents = totalCampaignSpend._sum.spentCents ?? 0;
  const totalPaidOutCents = totalDeveloperEarnings._sum.earningsCents ?? 0;
  // Platform revenue = what advertisers paid minus what developers earned
  const platformRevenueCents = totalSpentCents - totalPaidOutCents;

  return NextResponse.json({
    totalImpressions: impressions,
    totalDevelopers,
    activeCampaigns,
    totalSpentCents,
    totalPaidOutCents,
    platformRevenueCents,
    // Effective platform take rate
    takeRatePct: totalSpentCents > 0
      ? Math.round((platformRevenueCents / totalSpentCents) * 100)
      : 0,
    recentImpressions: recentImpressions.map((r: { day: string; count: bigint }) => ({
      day: r.day,
      count: Number(r.count),
    })),
  });
}
