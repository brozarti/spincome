import type { Ad } from "./ad.js";

const R  = "\x1b[0m";
const B  = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN  = "\x1b[32m";
const BRIGHT_GREEN = "\x1b[92m";
const CYAN   = "\x1b[36m";
const YELLOW = "\x1b[33m";
const WHITE  = "\x1b[97m";
const BG     = "\x1b[48;5;234m";

const W = 62;

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

export function renderAd(ad: Ad, earnedCents: number, sessionCents: number, context?: { toolName?: string; fileExt?: string }): string {
  const earnedDollars  = (earnedCents / 100).toFixed(4);
  const sessionDollars = (sessionCents / 100).toFixed(4);

  const contextTag = context?.fileExt
    ? ` · ${context.fileExt.toUpperCase()} dev`
    : context?.toolName
    ? ` · ${context.toolName}`
    : "";

  const sponsorLine   = `${DIM}Sponsored · ${ad.advertiser}${contextTag}${R}`;
  const headlineLine  = `${B}${WHITE}${ad.headline}${R}`;
  const bodyLine      = `${DIM}${ad.body}${R}`;
  const ctaLine       = `${CYAN}${ad.cta}${R}  ${DIM}${ad.clickUrl}${R}`;
  const earnLine      = `${BRIGHT_GREEN}+$${earnedDollars} earned${R}  ${DIM}session total: ${GREEN}$${sessionDollars}${R}`;
  const footerLine    = `${DIM}spincome · /disable to opt out${R}`;

  const sponsorLen   = `Sponsored · ${ad.advertiser}${contextTag}`.length;
  const headlineLen  = ad.headline.length;
  const bodyLen      = ad.body.length;
  const ctaLen       = `${ad.cta}  ${ad.clickUrl}`.length;
  const earnLen      = `+$${earnedDollars} earned  session total: $${sessionDollars}`.length;
  const footerLen    = `spincome · /disable to opt out`.length;

  return [
    "",
    ruler(),
    box(sponsorLine,  sponsorLen),
    box(headlineLine, headlineLen),
    box(bodyLine,     bodyLen),
    box("", 0),
    box(ctaLine,      ctaLen),
    box("", 0),
    box(earnLine,     earnLen),
    box(footerLine,   footerLen),
    ruler(),
    "",
  ].join("\n");
}
