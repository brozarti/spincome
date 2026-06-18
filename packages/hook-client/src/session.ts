import fs from "fs";
import path from "path";
import os from "os";

const SESSION_PATH  = path.join(os.homedir(), ".spincome", "session.json");
const LIFETIME_PATH = path.join(os.homedir(), ".spincome", "lifetime.json");
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours = one coding session

export interface Session {
  startedAt: number;
  totalCents: number;   // milli-cents earned this session
  impressions: number;
  referralCode?: string;
}

interface Lifetime {
  totalCents: number;   // milli-cents earned all time
}

function readSession(): Session | null {
  try {
    const raw = fs.readFileSync(SESSION_PATH, "utf8");
    const s = JSON.parse(raw) as Session;
    if (Date.now() - s.startedAt > SESSION_TTL_MS) return null;
    return s;
  } catch {
    return null;
  }
}

function writeSession(s: Session): void {
  const dir = path.dirname(SESSION_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SESSION_PATH, JSON.stringify(s));
}

function readLifetime(): Lifetime {
  try {
    return JSON.parse(fs.readFileSync(LIFETIME_PATH, "utf8")) as Lifetime;
  } catch {
    return { totalCents: 0 };
  }
}

function writeLifetime(l: Lifetime): void {
  const dir = path.dirname(LIFETIME_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LIFETIME_PATH, JSON.stringify(l));
}

export function addToSession(earnedCents: number, referralCode?: string): Session {
  const existing = readSession();
  const session: Session = existing
    ? {
        ...existing,
        totalCents: existing.totalCents + earnedCents,
        impressions: existing.impressions + 1,
        referralCode: referralCode ?? existing.referralCode,
      }
    : { startedAt: Date.now(), totalCents: earnedCents, impressions: 1, referralCode };
  writeSession(session);

  // Accumulate lifetime separately (no TTL)
  const lifetime = readLifetime();
  writeLifetime({ totalCents: lifetime.totalCents + earnedCents });

  return session;
}

export function getSessionSummary(): { session: Session | null; lifetimeCents: number } {
  return { session: readSession(), lifetimeCents: readLifetime().totalCents };
}

export function getCachedReferralCode(): string | undefined {
  return readSession()?.referralCode;
}
