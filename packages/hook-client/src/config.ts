import os from "os";
import path from "path";
import fs from "fs";

export const API_BASE = process.env.SPINCOME_API_URL ?? "https://spincome-marketplace-git-main-spincome.vercel.app/api";

export interface Config {
  developerKey: string;
  enabled: boolean;
}

const CONFIG_PATH = path.join(os.homedir(), ".spincome", "config.json");

export function readConfig(): Config | null {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw) as Config;
  } catch {
    return null;
  }
}

export function writeConfig(config: Config): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
