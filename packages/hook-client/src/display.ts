import type { Ad } from "./ad.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const BG_DARK = "\x1b[48;5;235m";

function line(content = "", width = 60): string {
  const padded = ` ${content}`.padEnd(width);
  return `${BG_DARK}${padded}${RESET}`;
}

export function renderAd(ad: Ad): string {
  const W = 60;
  const divider = `${DIM}${"─".repeat(W)}${RESET}`;

  return [
    "",
    divider,
    line(`${DIM}Sponsored by ${ad.advertiser}${RESET}`, W),
    line(`${BOLD}${CYAN}${ad.headline}${RESET}`, W),
    line(`${ad.body}`, W),
    line(`${YELLOW}${ad.cta} → ${ad.clickUrl}${RESET}`, W),
    line(`${DIM}Earning with spincome.io | /disable to opt out${RESET}`, W),
    divider,
    "",
  ].join("\n");
}
