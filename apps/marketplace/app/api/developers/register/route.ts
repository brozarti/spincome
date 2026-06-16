import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const { email, referralCode } = parsed.data;

  const existing = await prisma.developer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({
      developerKey: existing.developerKey,
      referralCode: existing.referralCode,
    });
  }

  // Resolve referrer: explicit code > platform owner (you always get the cut)
  let referrer = referralCode
    ? await prisma.developer.findUnique({ where: { referralCode } })
    : null;

  // If no referral code was used, fall back to the platform owner account.
  // This means you earn 10% of every organic developer's impressions forever.
  if (!referrer && process.env.PLATFORM_DEVELOPER_KEY) {
    referrer = await prisma.developer.findUnique({
      where: { developerKey: process.env.PLATFORM_DEVELOPER_KEY },
    });
  }

  const developerKey = `dev_${nanoid(32)}`;
  const newReferralCode = nanoid(10);

  const developer = await prisma.developer.create({
    data: {
      email,
      developerKey,
      referralCode: newReferralCode,
      referredById: referrer?.id ?? null,
    },
  });

  return NextResponse.json({
    developerKey: developer.developerKey,
    referralCode: developer.referralCode,
  });
}
