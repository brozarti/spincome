import { getSessionSummary } from "./session.js";

const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";
const CLEAR_LINE  = "\x1b[2K\r";

const GREEN        = "\x1b[32m";
const BRIGHT_GREEN = "\x1b[92m";
const DIM          = "\x1b[2m";
const BOLD         = "\x1b[1m";
const R            = "\x1b[0m";
const BG           = "\x1b[48;5;234m";  // same dark bg as the website ad box
const BLACK        = "\x1b[30m";

const BAR_W = 30;

// Sweeping bright segment across a green bar -- like a loading shimmer
function renderBar(frame: number): string {
  // Pulse: alternate the base fill color every 6 frames
  const pulse = Math.floor(frame / 6) % 2 === 0;
  const baseFill = pulse ? GREEN : "\x1b[38;5;22m"; // green / dark green alternating

  // Bright sweep position (wraps)
  const sweepPos = frame % BAR_W;

  const chars = Array.from({ length: BAR_W }, (_, i) => {
    const dist = Math.min(
      Math.abs(i - sweepPos),
      BAR_W - Math.abs(i - sweepPos)
    );
    if (dist === 0) return BRIGHT_GREEN + "█" + R + BG;
    if (dist === 1) return BRIGHT_GREEN + "▓" + R + BG;
    if (dist === 2) return GREEN        + "▓" + R + BG;
    return baseFill + "░" + R + BG;
  }).join("");

  return chars;
}

// Dollar amount -- pulses between bright and dim
function renderAmount(lifetimeCents: number, frame: number): string {
  const dollars = (lifetimeCents / 100000).toFixed(4);
  const pulse = Math.floor(frame / 4) % 2 === 0;
  const color = pulse ? BRIGHT_GREEN : GREEN;
  return `${color}${BOLD}$${dollars}${R}`;
}

export async function animateWhileLoading<T>(work: Promise<T>): Promise<T> {
  const { lifetimeCents } = getSessionSummary();

  process.stderr.write(HIDE_CURSOR);

  let frame = 0;
  let done  = false;
  let result: T;

  const tick = setInterval(() => {
    if (done) return;

    const bar    = renderBar(frame);
    const amount = renderAmount(lifetimeCents, frame);
    const label  = `${DIM}${BOLD} spincome${R}`;

    process.stderr.write(
      CLEAR_LINE +
      `${BG} ${BLACK}${BOLD}$${R}${label}  ${BG}${bar}${R}  ${amount} `
    );
    frame++;
  }, 60);

  try {
    result = await work;
  } finally {
    done = true;
    clearInterval(tick);
    process.stderr.write(CLEAR_LINE);
    process.stderr.write(SHOW_CURSOR);
  }

  return result!;
}
