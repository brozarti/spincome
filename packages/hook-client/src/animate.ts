const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";
const CLEAR_LINE  = "\x1b[2K\r";
const UP_ONE      = "\x1b[1A";

const GREEN        = "\x1b[32m";
const BRIGHT_GREEN = "\x1b[92m";
const DIM          = "\x1b[2m";
const BOLD         = "\x1b[1m";
const R            = "\x1b[0m";

const SPINNER = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
const COIN    = ["◐","◓","◑","◒"];

const LOGO = `${BOLD}${GREEN}$${R}${BOLD} spincome${R}`;

export async function animateWhileLoading<T>(work: Promise<T>): Promise<T> {
  process.stdout.write(HIDE_CURSOR);

  let frame = 0;
  let dots  = 0;
  let done  = false;
  let result: T;

  const tick = setInterval(() => {
    if (done) return;
    const spinner = BRIGHT_GREEN + SPINNER[frame % SPINNER.length] + R;
    const coin    = GREEN + COIN[frame % COIN.length] + R;
    dots = (dots + 1) % 4;
    const dotStr  = DIM + ".".repeat(dots).padEnd(3) + R;
    process.stdout.write(
      CLEAR_LINE +
      `  ${spinner}  ${LOGO}  ${coin} ${DIM}earning${R}${dotStr}`
    );
    frame++;
  }, 80);

  try {
    result = await work;
  } finally {
    done = true;
    clearInterval(tick);
    process.stdout.write(CLEAR_LINE);
    process.stdout.write(UP_ONE + CLEAR_LINE);
    process.stdout.write(SHOW_CURSOR);
  }

  return result!;
}
