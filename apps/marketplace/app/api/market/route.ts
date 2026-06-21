import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Last 24 hours of impressions grouped by hour
  const recent = await prisma.impression.findMany({
    where: { createdAt: { gte: twentyFourHoursAgo } },
    select: { actualCpmCents: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by hour
  const hourly: Record<string, { total: number; count: number }> = {};
  for (const imp of recent) {
    const hour = imp.createdAt.toISOString().slice(0, 13) + ":00:00Z";
    if (!hourly[hour]) hourly[hour] = { total: 0, count: 0 };
    hourly[hour].total += imp.actualCpmCents;
    hourly[hour].count++;
  }

  const priceHistory = Object.entries(hourly)
    .map(([hour, { total, count }]) => ({
      hour,
      avgCpmCents: Math.round(total / count),
      impressions: count,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  // Current market stats
  const currentHourImpressions = recent.filter(
    (i) => i.createdAt.getTime() > now.getTime() - 60 * 60 * 1000
  ).length;

  const avgCpm24h = recent.length > 0
    ? Math.round(recent.reduce((s, i) => s + i.actualCpmCents, 0) / recent.length)
    : 0;

  // All-time stats
  const allTimeStats = await prisma.impression.aggregate({
    _avg: { actualCpmCents: true },
    _count: { id: true },
  });

  // 7-day trend for the chart
  const weekImpressions = await prisma.impression.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { actualCpmCents: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const daily: Record<string, { total: number; count: number }> = {};
  for (const imp of weekImpressions) {
    const day = imp.createdAt.toISOString().slice(0, 10);
    if (!daily[day]) daily[day] = { total: 0, count: 0 };
    daily[day].total += imp.actualCpmCents;
    daily[day].count++;
  }

  const dailyHistory = Object.entries(daily)
    .map(([day, { total, count }]) => ({
      day,
      avgCpmCents: Math.round(total / count),
      impressions: count,
    }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // Active campaigns count
  const activeCampaigns = await prisma.campaign.count({ where: { active: true } });

  return NextResponse.json({
    currentHourImpressions,
    avgCpm24h,
    allTimeAvgCpm: Math.round(allTimeStats._avg.actualCpmCents ?? 0),
    allTimeImpressions: allTimeStats._count.id,
    activeCampaigns,
    priceHistory,
    dailyHistory,
  });
}
