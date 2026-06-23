import type { Ad } from "./ad.js";

const R            = "\x1b[0m";
const B            = "\x1b[1m";
const DIM          = "\x1b[2m";
const GREEN        = "\x1b[32m";
const BRIGHT_GREEN = "\x1b[92m";
const CYAN         = "\x1b[36m";
const WHITE        = "\x1b[97m";
const YELLOW       = "\x1b[33m";
const BG           = "\x1b[48;5;234m";

const W = 62;
import { readConfig, PLAN_COST_MILLI_CENTS } from "./config.js";

function getPlancost(): number {
  const plan = readConfig()?.plan ?? "pro";
  return PLAN_COST_MILLI_CENTS[plan];
}

function pad(text: string, visibleLen: number): string {
  const spaces = Math.max(0, W - 2 - visibleLen);
  return ` ${text}${" ".repeat(spaces)} `;
}

function box(content: string, visibleLen: number): string {
  return `${BG}${pad(content, visibleLen)}${R}`;
}

function ruler(): string {
  return `${DIM}${"─".repeat(W)}${R}`;
}

function coverageStr(lifetimeCents: number): string {
  const cost = getPlancost();
  if (cost === 0) return "";
  const pct = (lifetimeCents / cost) * 100;
  if (pct >= 100) return `  ${DIM}·${R}  ${BRIGHT_GREEN}Claude paid for${R}`;
  if (pct < 0.01) return "";
  return `  ${DIM}·${R}  ${YELLOW}${pct.toFixed(1)}% of Claude covered${R}`;
}

// Compact earnings ticker -- shown every tool call (stdout → inline in chat)
export function renderEarnings(sessionCents: number, lifetimeCents: number): string {
  const sessionDollars  = (sessionCents  / 100000).toFixed(4);
  const lifetimeDollars = (lifetimeCents / 100000).toFixed(4);
  const cost = getPlancost();
  if (cost === 0) {
    return (
      `\n  ${B}${GREEN}💲${R} ${B}spincome${R}  ` +
      `${BRIGHT_GREEN}+$${sessionDollars}${R}  ` +
      `${GREEN}$${lifetimeDollars}${R} ${DIM}lifetime${R}\n`
    );
  }
  const pct = Math.min(100, (lifetimeCents / cost) * 100);
  const barW = 20;
  const filled = Math.round((pct / 100) * barW);
  const bar = `${BRIGHT_GREEN}${"█".repeat(filled)}${DIM}${"░".repeat(barW - filled)}${R}`;
  const label = pct >= 100
    ? `${BRIGHT_GREEN}Claude paid for${R}`
    : `${YELLOW}${pct.toFixed(1)}%${R} ${DIM}of Claude covered${R}`;
  return (
    `\n  ${B}${GREEN}💲${R} ${B}spincome${R}  ` +
    `${BRIGHT_GREEN}+$${sessionDollars}${R}  ` +
    `${bar}  ` +
    `${GREEN}$${lifetimeDollars}${R} ${DIM}lifetime${R}  ` +
    `${label}\n`
  );
}

// Session-end summary -- shown when Claude Code closes
export function renderSummary(sessionCents: number, lifetimeCents: number, impressions: number): string {
  const sessionDollars  = (sessionCents  / 100000).toFixed(4);
  const lifetimeDollars = (lifetimeCents / 100000).toFixed(4);
  const cost = getPlancost();
  const planPrice = (cost / 100000).toFixed(0);

  const lines = [
    "",
    ruler(),
    box(`${B}${WHITE}spincome · session complete${R}`, 27),
    box("", 0),
    box(`${DIM}Earned this session   ${R}${BRIGHT_GREEN}$${sessionDollars}${R}`, `Earned this session   $${sessionDollars}`.length),
    box(`${DIM}Lifetime total        ${R}${GREEN}$${lifetimeDollars}${R}`, `Lifetime total        $${lifetimeDollars}`.length),
    box(`${DIM}Tool calls            ${R}${WHITE}${impressions}${R}`, `Tool calls            ${impressions}`.length),
  ];

  if (cost > 0) {
    const pct = Math.min(100, (lifetimeCents / cost) * 100);
    const barFilled = Math.round(pct / 2);
    const bar = `${BRIGHT_GREEN}${"█".repeat(barFilled)}${DIM}${"░".repeat(50 - barFilled)}${R}`;
    const coverageText = pct >= 100
      ? `${BRIGHT_GREEN}Claude subscription fully covered!${R}`
      : `${YELLOW}${pct.toFixed(1)}% of your $${planPrice}/mo Claude subscription offset${R}`;
    const coverageLen = pct >= 100
      ? "Claude subscription fully covered!".length
      : `${pct.toFixed(1)}% of your $${planPrice}/mo Claude subscription offset`.length;

    lines.push(
      box("", 0),
      box(`${DIM}Claude subscription coverage${R}`, "Claude subscription coverage".length),
      box(bar, 50),
      box(coverageText, coverageLen),
    );
  }

  lines.push(ruler(), "");
  return lines.join("\n");
}

// Full ad box -- shown every Nth call
export function renderAd(
  ad: Ad,
  earnedCents: number,
  sessionCents: number,
  lifetimeCents: number,
  referralCode: string,
  context?: { toolName?: string; fileExt?: string }
): string {
  const earnedDollars  = (earnedCents  / 100000).toFixed(4);
  const sessionDollars = (sessionCents / 100000).toFixed(4);
  const coverage = coverageStr(lifetimeCents);

  const contextTag = context?.fileExt
    ? ` · ${context.fileExt.toUpperCase()} dev`
    : context?.toolName
    ? ` · ${context.toolName}`
    : "";

  const base = process.env.SPINCOME_API_URL
    ? process.env.SPINCOME_API_URL.replace("/api", "")
    : "https://spincome.io";
  const referralUrl = referralCode ? `${base}/r/${referralCode}` : `${base}/setup`;

  const sponsorLine   = `${DIM}Sponsored · ${ad.advertiser}${contextTag}${R}`;
  const headlineLine  = `${B}${WHITE}${ad.headline}${R}`;
  const bodyLine      = `${DIM}${ad.body}${R}`;
  const ctaLine       = `${CYAN}${ad.cta}${R}  ${DIM}${ad.clickUrl}${R}`;
  const earnLine      = `${BRIGHT_GREEN}+$${earnedDollars} earned${R}  ${DIM}session: ${GREEN}$${sessionDollars}${R}${coverage}`;
  const referralLine  = `${DIM}Refer a dev → earn 10% of their impressions forever${R}  ${CYAN}${referralUrl}${R}`;
  const footerLine    = `${DIM}spincome · /disable to opt out${R}`;

  const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");
  const earnLen      = stripAnsi(earnLine).length;
  const referralLen  = stripAnsi(referralLine).length;

  return [
    "",
    ruler(),
    box(sponsorLine,  `Sponsored · ${ad.advertiser}${contextTag}`.length),
    box(headlineLine, ad.headline.length),
    box(bodyLine,     ad.body.length),
    box("", 0),
    box(ctaLine,      `${ad.cta}  ${ad.clickUrl}`.length),
    box("", 0),
    box(earnLine,     earnLen),
    box("", 0),
    box(referralLine, referralLen),
    box(footerLine,   "spincome · /disable to opt out".length),
    ruler(),
    "",
  ].join("\n");
}
