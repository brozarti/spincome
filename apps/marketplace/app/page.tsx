import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="font-bold text-lg tracking-tight">spincome.io</span>
        <div className="flex gap-6 text-sm text-white/60">
          <Link href="/market" className="hover:text-white transition-colors">Market</Link>
          <Link href="/bids" className="hover:text-white transition-colors">Live bids</Link>
          <Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Advertisers</Link>
          <Link href="/dev" className="hover:text-white transition-colors">Developers</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="inline-block bg-white/10 text-white/70 text-xs font-mono px-3 py-1 rounded-full mb-8 tracking-widest uppercase">
          For Claude Code users
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
          Your idle time<br />
          <span className="text-emerald-400">earns you money.</span>
        </h1>
        <p className="text-white/50 text-lg md:text-xl max-w-xl mb-10">
          Spincome shows a small ad in your terminal after Claude Code tool calls.
          50% of every impression goes directly to you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/setup"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-3 rounded-lg transition-colors text-sm"
          >
            Get started -- free
          </Link>
          <Link
            href="/advertise"
            className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white px-8 py-3 rounded-lg transition-colors text-sm"
          >
            Advertise to developers
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-12 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Run one command",
                desc: "npx @brozarti/spincome installs a Claude Code hook in 30 seconds.",
              },
              {
                step: "2",
                title: "Ads appear in your terminal",
                desc: "A small, non-intrusive ad shows after tool calls while Claude is thinking.",
              },
              {
                step: "3",
                title: "You get paid",
                desc: "50% of CPM revenue credited to your account. Withdraw via Stripe anytime.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white/5 rounded-xl p-6">
                <div className="text-emerald-400 font-mono text-sm mb-3">0{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing callout */}
      <section className="border-t border-white/10 px-8 py-16 text-center">
        <p className="text-white/40 text-sm">
          Advertisers bid from $1.00 CPM. Clicks cost 50x the impression rate.
          Minimum campaign budget $10.
        </p>
      </section>
    </main>
  );
}
