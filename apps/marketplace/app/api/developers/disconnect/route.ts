import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDeveloperFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const developer = await getDeveloperFromRequest(req);
  if (!developer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.developer.update({
    where: { id: developer.id },
    data: { stripeAccountId: null },
  });

  return NextResponse.json({ ok: true });
}
