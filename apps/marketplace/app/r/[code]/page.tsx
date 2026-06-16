import Link from "next/link";

export default async function ReferralPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono px-3 py-1 rounded-full mb-8">
          You were invited
        </div>
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Earn from your<br />Claude Code sessions
        </h1>
        <p className="text-white/50 mb-10">
          A small ad appears in your terminal after tool calls.
          You keep 50% of every impression. One command to set up.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-sm mb-8 text-left">
          <span className="text-white/30 select-none">$ </span>
          <span className="text-emerald-400">npx @brozarti/spincome</span>
          <br />
          <span className="text-white/20 text-xs mt-2 block">When prompted for a referral code, enter: {code}</span>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/setup"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Get started
          </Link>
          <Link
            href="/stats"
            className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white px-6 py-3 rounded-lg transition-colors text-sm"
          >
            See live stats
          </Link>
        </div>
      </div>
    </main>
  );
}
