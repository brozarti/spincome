import { getSessionSummary } from "./session.js";

const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";
const CLEAR_LINE  = "\x1b[2K";
const UP_ONE      = "\x1b[1A";

const GREEN        = "\x1b[32m";
const BRIGHT_GREEN = "\x1b[92m";
const YELLOW       = "\x1b[33m";
const DIM          = "\x1b[2m";
const BOLD         = "\x1b[1m";
const R            = "\x1b[0m";
const BG           = "\x1b[48;5;234m";

// Little coin mascot -- 3 frames of walking animation
const MASCOT = [
  // Frame 0: standing
  [
    `${YELLOW} ╭──╮${R}`,
    `${YELLOW} │${BRIGHT_GREEN}$$${YELLOW}│${R}`,
    `${YELLOW} ╰┘╰┘${R}`,
  ],
  // Frame 1: left step
  [
    `${YELLOW} ╭──╮${R}`,
    `${YELLOW} │${BRIGHT_GREEN}$$${YELLOW}│${R}`,
    `${YELLOW}╰┘ ╰┘${R}`,
  ],
  // Frame 2: right step
  [
    `${YELLOW} ╭──╮${R}`,
    `${YELLOW} │${BRIGHT_GREEN}$$${YELLOW}│${R}`,
    `${YELLOW}╰┘  └╯${R}`,
  ],
  // Frame 3: bounce
  [
    `${YELLOW} ╭──╮${R}`,
    `${YELLOW} │${BRIGHT_GREEN}$$${YELLOW}│${R}`,
    `${YELLOW} ╰──╯${R}`,
  ],
];

const BAR_W = 24;

function renderBar(frame: number): string {
  const sweepPos = frame % BAR_W;
  const pulse = Math.floor(frame / 6) % 2 === 0;
  const base = pulse ? GREEN : "\x1b[38;5;22m";

  return Array.from({ length: BAR_W }, (_, i) => {
    const dist = Math.min(Math.abs(i - sweepPos), BAR_W - Math.abs(i - sweepPos));
    if (dist === 0) return `${BRIGHT_GREEN}█${R}${BG}`;
    if (dist === 1) return `${BRIGHT_GREEN}▓${R}${BG}`;
    if (dist === 2) return `${GREEN}▓${R}${BG}`;
    return `${base}░${R}${BG}`;
  }).join("");
}

function renderAmount(cents: number, frame: number): string {
  const dollars = (cents / 100000).toFixed(4);
  const pulse = Math.floor(frame / 5) % 2 === 0;
  return pulse
    ? `${BRIGHT_GREEN}${BOLD}$${dollars}${R}`
    : `${GREEN}$${dollars}${R}`;
}

export async function animateWhileLoading<T>(work: Promise<T>): Promise<T> {
  const { lifetimeCents } = getSessionSummary();

  process.stderr.write(HIDE_CURSOR);
  // Write 3 blank lines so we have space to animate into
  process.stderr.write("\n\n\n");

  let frame = 0;
  let done  = false;
  let result: T;

  const mascotFrame = () => MASCOT[Math.floor(frame / 4) % MASCOT.length];
  const walkCycle = () => Math.floor(frame / 4) % MASCOT.length;

  const tick = setInterval(() => {
    if (done) return;

    const m    = MASCOT[walkCycle()];
    const bar  = renderBar(frame);
    const amt  = renderAmount(lifetimeCents, frame);
    const dots = ".".repeat((Math.floor(frame / 3) % 3) + 1).padEnd(3);

    // Move up 3 lines and redraw
    process.stderr.write(
      `${UP_ONE}${UP_ONE}${UP_ONE}` +
      `${CLEAR_LINE}  ${m[0]}   ${BG} ${bar} ${R}\r\n` +
      `${CLEAR_LINE}  ${m[1]}   ${amt}  ${DIM}earning${dots}${R}\r\n` +
      `${CLEAR_LINE}  ${m[2]}   ${DIM}${BOLD}$ spincome${R}\r\n`
    );

    frame++;
  }, 80);

  try {
    result = await work;
  } finally {
    done = true;
    clearInterval(tick);
    // Clear the 3 animation lines
    process.stderr.write(
      `${UP_ONE}${UP_ONE}${UP_ONE}` +
      `${CLEAR_LINE}\r\n${CLEAR_LINE}\r\n${CLEAR_LINE}\r\n` +
      `${UP_ONE}${UP_ONE}${UP_ONE}`
    );
    process.stderr.write(SHOW_CURSOR);
  }

  return result!;
}
