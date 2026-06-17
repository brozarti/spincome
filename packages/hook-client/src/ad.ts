import { API_BASE, readConfig } from "./config.js";

export interface AdContext {
  toolName?: string;
  fileExt?: string;
}

export interface Ad {
  id: string;
  headline: string;
  body: string;
  cta: string;
  clickUrl: string;
  advertiser: string;
  actualCpmCents: number;
}

export async function fetchAd(context: AdContext): Promise<Ad | null> {
  const config = readConfig();
  if (!config?.enabled || !config?.developerKey) return null;

  try {
    const res = await fetch(`${API_BASE}/ads/serve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Developer-Key": config.developerKey,
      },
      body: JSON.stringify(context),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Ad;
  } catch {
    return null;
  }
}

export async function recordImpression(
  adId: string,
  developerKey: string,
  actualCpmCents: number,
  context: AdContext
): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/ads/impression`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Developer-Key": developerKey,
      },
      body: JSON.stringify({ adId, actualCpmCents, ...context }),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json() as { earnedCents?: number };
      return data.earnedCents ?? 0;
    }
  } catch {
    // ignore
  }
  return 0;
}
