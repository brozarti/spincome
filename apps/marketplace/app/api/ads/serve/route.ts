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
  targetLanguages: string | null;
  targetFrameworks: string | null;
  advertiser: { name: string };
};

// Real-time second-price auction:
// 1. Filter to campaigns that match the developer's context (language/framework)
// 2. Sort by max bid descending
// 3. Winner pays second-highest bid + 1 cent (or their own bid if only one eligible)
function runAuction(campaigns: Campaign[], devLanguages: string[], devFrameworks: string[]): {
  winner: Campaign;
  actualCpmCents: number;
} | null {
  const eligible = campaigns.filter((c) => {
    if (c.spentCents >= c.budgetCents) return false;
    // If campaign has targeting, developer must match at least one value
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
    return c.spentCents < c.budgetCents && !c.targetLanguages && !c.targetFrameworks;
  });

  if (pool.length === 0) return null;

  pool.sort((a, b) => b.maxCpmCents - a.maxCpmCents);
  const winner = pool[0];
  // Second-price: winner pays second bid + 1 cent (Vickrey auction -- maximises honest bidding)
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

  const result = runAuction(campaigns, devLanguages, devFrameworks);
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
