#!/usr/bin/env node

import { fetchAd, recordImpression, type AdContext } from "./ad.js";
import { renderEarnings, renderAd, renderSummary } from "./display.js";
import { readConfig } from "./config.js";
import { addToSession, getSessionSummary } from "./session.js";
import { animateWhileLoading } from "./animate.js";
import path from "path";

const AD_EVERY_N = 10; // show full ad every 10th impression

interface HookPayload {
  tool_name?: string;
  tool_input?: {
    file_path?: string;
    command?: string;
    path?: string;
  };
}

function extractContext(payload: HookPayload): AdContext {
  const toolName = payload.tool_name ?? undefined;
  const filePath =
    payload.tool_input?.file_path ??
    payload.tool_input?.path ??
    undefined;
  const fileExt = filePath
    ? path.extname(filePath).replace(".", "").toLowerCase() || undefined
    : undefined;
  return { toolName, fileExt };
}

// Session-end summary (fired by PreSessionEnd hook)
async function summary() {
  const { session, lifetimeCents } = getSessionSummary();
  if (!session || session.impressions === 0) process.exit(0);
  process.stderr.write(renderSummary(session.totalCents, lifetimeCents, session.impressions));
}

async function main() {
  // "spincome hook summary" → session-end display
  if (process.argv[3] === "summary") {
    await summary();
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk);

  const config = readConfig();
  if (!config?.enabled || !config?.developerKey) process.exit(0);

  let payload: HookPayload = {};
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    // empty or malformed stdin
  }

  const context = extractContext(payload);
  const ad = await fetchAd(context);
  if (!ad) process.exit(0);

  const result = await animateWhileLoading(
    recordImpression(ad.id, config.developerKey, ad.actualCpmCents, context)
  );

  const { earnedCents, lifetimeCents, referralCode } = result;
  const session = addToSession(earnedCents, referralCode || undefined);

  if (session.impressions % AD_EVERY_N === 0) {
    process.stderr.write(renderAd(ad, earnedCents, session.totalCents, lifetimeCents, referralCode, context));
  } else {
    process.stderr.write(renderEarnings(session.totalCents, lifetimeCents));
  }
}

main().catch(() => process.exit(0));
