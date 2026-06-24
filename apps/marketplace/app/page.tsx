import Link from "next/link";
import { Nav, Footer } from "@/app/components/nav";
import { LiveStats } from "@/app/components/live-stats";
import { EarningsCalc } from "@/app/components/earnings-calc";
import { CopyCommand } from "@/app/components/copy-command";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live -- developers earning right now
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-3xl leading-[1.1]">
          Get paid to<br />
          <span className="text-emerald-400">use Claude Code.</span>
        </h1>
        <p className="text-white/50 text-lg md:text-xl max-w-xl mb-4">
          A single terminal ad after each tool call. You keep 50% of the revenue.
          Offset your Claude subscription or earn pure profit.
        </p>
        <p className="text-white/30 text-sm mb-10">
          30-second install. No code changes. Disable anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/setup"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3.5 rounded-lg transition-colors text-sm"
          >
            Start earning -- free
          </Link>
          <Link
            href="/download"
            className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white px-8 py-3.5 rounded-lg transition-colors text-sm"
          >
            Download Mac Widget
          </Link>
        </div>
      </section>

      {/* Live network stats */}
      <section className="px-8 pb-12">
        <div className="max-w-2xl mx-auto border border-white/8 rounded-xl py-6 px-8">
          <LiveStats />
        </div>
      </section>

      {/* Terminal mockup */}
      <section className="px-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <span className="text-white/20 text-xs ml-2 font-mono">Terminal</span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed">
              <p className="text-white/30">$ claude &quot;refactor the auth module&quot;</p>
              <p className="text-white/20 mt-3">{"─".repeat(52)}</p>
              <p className="text-white/40"> Sponsored · Vercel · TypeScript dev</p>
              <p className="text-white font-bold"> Ship 10x faster with zero config</p>
              <p className="text-white/50"> The frontend cloud. Build, preview, ship.</p>
              <p className="text-white/10"> </p>
              <p> <span className="text-cyan-400">Start free</span>  <span className="text-white/20">vercel.com</span></p>
              <p className="text-white/10"> </p>
              <p className="text-emerald-400"> +$0.0125 earned  <span className="text-white/30">session: $0.2500</span></p>
              <p className="text-white/20">{"─".repeat(52)}</p>
              <p className="text-white/20 mt-3">{">"} Refactoring auth module... <span className="text-emerald-400 animate-pulse">|</span></p>
            </div>
          </div>
          <p className="text-center text-white/20 text-xs mt-4">What developers see after each Claude Code tool call</p>
        </div>
      </section>

      {/* Earnings calculator */}
      <section className="border-t border-white/10 px-8 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-3 text-center">How much will you earn?</h2>
          <p className="text-white/40 text-sm text-center mb-10">Drag the slider. Earnings depend on advertiser demand and your usage.</p>
          <EarningsCalc />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-12 text-center">Two ways to start</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/3 border border-white/8 rounded-xl p-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm font-bold mb-4">1</div>
              <h3 className="font-semibold mb-2">Terminal (30 seconds)</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-4">One command registers you, installs the hook, and starts earning. Nothing else needed.</p>
              <CopyCommand command="npx @brozarti/spincome" />
            </div>
            <div className="bg-white/3 border border-white/8 rounded-xl p-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm font-bold mb-4">2</div>
              <h3 className="font-semibold mb-2">Mac Widget (no terminal needed)</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-4">Download the menu bar widget. Register, install the hook, track earnings, and withdraw -- all from the widget.</p>
              <Link
                href="/download"
                className="inline-block bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                Download for Mac
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why it works for advertisers */}
      <section className="border-t border-white/10 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-3 text-center">Why advertisers pay premium rates</h2>
          <p className="text-white/40 text-sm text-center mb-10">This is why your earnings are real.</p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { value: "0", label: "Ad blockers", desc: "Terminal ads. uBlock can't touch them." },
              { value: "100%", label: "Senior devs", desc: "Every viewer is an active developer." },
              { value: "10s+", label: "View time", desc: "Ads sit while Claude thinks." },
              { value: "In-flow", label: "Context", desc: "Ads appear when devs need tools most." },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-emerald-400 mb-1">{s.value}</p>
                <p className="text-white text-xs font-medium mb-1">{s.label}</p>
                <p className="text-white/30 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral */}
      <section className="border-t border-white/10 px-8 py-16">
        <div className="max-w-2xl mx-auto bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Refer a developer, earn forever</h2>
          <p className="text-white/40 text-sm mb-6">
            Share your referral link and earn 10% of every referred developer&apos;s impression revenue. No cap. No expiry.
          </p>
          <Link
            href="/dev"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Get your referral link
          </Link>
        </div>
      </section>

      {/* For advertisers */}
      <section className="border-t border-white/10 px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">Want to reach developers?</h2>
          <p className="text-white/40 text-sm mb-6">
            Second-price auction. Target by language and framework. $10 minimum budget.
            Your ad appears when developers are actively coding -- the highest-intent moment possible.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/advertise"
              className="bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Launch a campaign
            </Link>
            <Link
              href="/bids"
              className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              See live bids
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
