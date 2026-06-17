import fs from "fs";
import path from "path";
import os from "os";

const SESSION_PATH = path.join(os.homedir(), ".spincome", "session.json");
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours = one coding session

interface Session {
  startedAt: number;
  totalCents: number;
  impressions: number;
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

export function addToSession(earnedCents: number): Session {
  const existing = readSession();
  const session: Session = existing
    ? { ...existing, totalCents: existing.totalCents + earnedCents, impressions: existing.impressions + 1 }
    : { startedAt: Date.now(), totalCents: earnedCents, impressions: 1 };
  writeSession(session);
  return session;
}

export function getSessionTotal(): number {
  return readSession()?.totalCents ?? 0;
}
