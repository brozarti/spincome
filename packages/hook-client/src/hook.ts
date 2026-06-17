#!/usr/bin/env node

import { fetchAd, recordImpression, type AdContext } from "./ad.js";
import { renderAd } from "./display.js";
import { readConfig } from "./config.js";
import { addToSession } from "./session.js";
import path from "path";

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

async function main() {
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

  // Record impression first to get earnedCents
  const earnedCents = await recordImpression(ad.id, config.developerKey, ad.actualCpmCents, context);
  const session = addToSession(earnedCents);

  process.stdout.write(renderAd(ad, earnedCents, session.totalCents, context));
}

main().catch(() => process.exit(0));
