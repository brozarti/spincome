import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeveloperFromRequest } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const developer = await getDeveloperFromRequest(req);
  if (!developer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [impressionCount, referralCount] = await Promise.all([
    prisma.impression.count({ where: { developerId: developer.id } }),
    prisma.developer.count({ where: { referredById: developer.id } }),
  ]);

  return NextResponse.json({
    email: developer.email,
    earningsCents: developer.earningsCents,
    referralCode: developer.referralCode,
    referralCount,
    impressionCount,
    languages: developer.languages ?? "",
    frameworks: developer.frameworks ?? "",
  });
}

const updateSchema = z.object({
  languages: z.string().optional(),
  frameworks: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const developer = await getDeveloperFromRequest(req);
  if (!developer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const updated = await prisma.developer.update({
    where: { id: developer.id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true, languages: updated.languages, frameworks: updated.frameworks });
}
