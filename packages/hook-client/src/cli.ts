#!/usr/bin/env node
// `npx spincome` - interactive setup CLI

import readline from "readline";
import fs from "fs";
import path from "path";
import os from "os";
import { writeConfig, API_BASE } from "./config.js";

const CLAUDE_SETTINGS_PATHS = [
  path.join(os.homedir(), ".claude", "settings.json"),
  path.join(process.cwd(), ".claude", "settings.json"),
];

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function registerDeveloper(
  email: string,
  referralCode?: string
): Promise<{ developerKey: string; referralCode: string }> {
  const res = await fetch(`${API_BASE}/developers/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, referralCode }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Registration failed: ${err}`);
  }
  return (await res.json()) as { developerKey: string; referralCode: string };
}

interface HookEntry {
  matcher: string;
  hooks: { type: string; command: string }[];
}

function injectHook(settingsPath: string): void {
  let settings: Record<string, unknown> = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    } catch {
      // If settings.json is malformed, start fresh rather than crashing.
    }
  }

  const hookCmd = "npx @brozarti/spincome hook";
  const hooks = (settings.hooks as Record<string, unknown> | undefined) ?? {};
  const postToolUse = (hooks.PostToolUse as HookEntry[] | undefined) ?? [];

  const alreadyInstalled = postToolUse.some((entry) =>
    entry.hooks?.some((h) => h.command === hookCmd)
  );

  if (!alreadyInstalled) {
    postToolUse.push({
      matcher: "",
      hooks: [{ type: "command", command: hookCmd }],
    });
  }

  hooks.PostToolUse = postToolUse;
  settings.hooks = hooks;

  const dir = path.dirname(settingsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

async function main() {
  const arg = process.argv[2];

  // Called by Claude Code hook -- delegate to hook entry
  if (arg === "hook") {
    await import("./hook.js");
    return;
  }

  console.log("\n  spincome.io -- earn from your Claude Code sessions\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const email = await prompt(rl, "  Enter your email to register: ");
  if (!email.includes("@")) {
    console.error("  Invalid email.");
    rl.close();
    process.exit(1);
  }

  const referralCode = await prompt(rl, "  Referral code (press Enter to skip): ");

  console.log("  Registering...");
  let developerKey: string;
  let myReferralCode: string;
  try {
    const result = await registerDeveloper(email, referralCode.trim() || undefined);
    developerKey = result.developerKey;
    myReferralCode = result.referralCode;
  } catch (err) {
    console.error(`  ${err}`);
    rl.close();
    process.exit(1);
  }

  writeConfig({ developerKey, enabled: true });

  // Inject into user-level Claude settings
  const settingsPath = CLAUDE_SETTINGS_PATHS[0];
  injectHook(settingsPath);

  const base = API_BASE.replace("/api", "");

  console.log("\n  \x1b[32m✓\x1b[0m All set! Ads will appear after Claude Code tool calls.\n");
  console.log("  ┌─────────────────────────────────────────────────────┐");
  console.log(`  │  \x1b[1mYour developer key:\x1b[0m                                 │`);
  console.log(`  │  \x1b[92m${developerKey}\x1b[0m  │`);
  console.log("  │                                                     │");
  console.log("  │  \x1b[33mSave this key!\x1b[0m You need it for the dashboard       │");
  console.log("  │  and the menu bar widget.                           │");
  console.log("  └─────────────────────────────────────────────────────┘\n");
  console.log(`  \x1b[36mReferral link:\x1b[0m ${base}/r/${myReferralCode}`);
  console.log("  Share it -- you earn 10% of every referred developer's earnings, forever.\n");
  console.log(`  \x1b[36mDashboard:\x1b[0m ${base}/dev`);
  console.log(`  \x1b[36mWidget:\x1b[0m ${base}/download\n`);

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
