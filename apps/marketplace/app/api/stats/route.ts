import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public aggregate stats -- no auth required, shown on /stats page
export async function GET() {
  const [
    totalImpressions,
    totalDevelopers,
    totalEarningsResult,
    topTools,
    topExts,
    leaderboard,
  ] = await Promise.all([
    prisma.impression.count(),
    prisma.developer.count(),
    prisma.developer.aggregate({ _sum: { earningsCents: true } }),
    prisma.impression.groupBy({
      by: ["toolName"],
      _count: { id: true },
      where: { toolName: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.impression.groupBy({
      by: ["fileExt"],
      _count: { id: true },
      where: { fileExt: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.developer.findMany({
      orderBy: { earningsCents: "desc" },
      take: 10,
      select: { earningsCents: true, impressions: { select: { id: true } }, referralCode: true },
    }),
  ]);

  return NextResponse.json({
    totalImpressions,
    totalDevelopers,
    totalEarningsCents: totalEarningsResult._sum.earningsCents ?? 0,
    topTools: topTools.map((t: { toolName: string | null; _count: { id: number } }) => ({ tool: t.toolName, count: t._count.id })),
    topFileExts: topExts.map((e: { fileExt: string | null; _count: { id: number } }) => ({ ext: e.fileExt, count: e._count.id })),
    leaderboard: leaderboard.map((d, i) => ({
      rank: i + 1,
      handle: `dev_${d.referralCode.slice(0, 4)}***`,
      earningsCents: d.earningsCents,
      impressions: d.impressions.length,
    })),
  });
}
