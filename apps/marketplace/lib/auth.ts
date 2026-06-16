import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export async function getDeveloperFromRequest(req: NextRequest) {
  const key = req.headers.get("x-developer-key");
  if (!key) return null;
  return prisma.developer.findUnique({ where: { developerKey: key } });
}
