import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tracks a click and redirects to the advertiser's destination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("cid");
  const developerId = searchParams.get("did");

  if (!campaignId || !developerId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return NextResponse.redirect("/");

  // Mark the most recent unclicked impression for this developer+campaign as clicked
  const impression = await prisma.impression.findFirst({
    where: { campaignId, developerId, clicked: false },
    orderBy: { createdAt: "desc" },
  });

  if (impression) {
    // Clicks cost 50x the actual winning impression rate (stored on the impression)
    const clickCostCents = Math.floor((impression.actualCpmCents / 1000) * 50);
    await prisma.$transaction([
      prisma.impression.update({ where: { id: impression.id }, data: { clicked: true } }),
      prisma.campaign.update({
        where: { id: campaignId },
        data: { spentCents: { increment: clickCostCents } },
      }),
    ]);
  }

  return NextResponse.redirect(campaign.clickUrl);
}
