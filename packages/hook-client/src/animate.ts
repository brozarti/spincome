// No animation -- Claude Code desktop doesn't render terminal cursor movement.
// The earnings display in display.ts handles all visual output.
export async function animateWhileLoading<T>(work: Promise<T>): Promise<T> {
  return work;
}
