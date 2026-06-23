import Link from "next/link";
import { Nav, Footer } from "@/app/components/nav";

const EARNINGS_EXAMPLES = [
  { usage: "Light (50 tool calls/day)", daily: "$0.60", monthly: "$18" },
  { usage: "Moderate (200 tool calls/day)", daily: "$2.50", monthly: "$75" },
  { usage: "Heavy (500+ tool calls/day)", daily: "$6.25", monthly: "$187" },
];

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
          Claude Code<br />
          <span className="text-emerald-400">pays for itself.</span>
        </h1>
        <p className="text-white/50 text-lg md:text-xl max-w-xl mb-4">
          A single terminal ad after each tool call. You keep 50% of the revenue.
          Most developers earn enough to cover their Claude subscription.
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
            href="/advertise"
            className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white px-8 py-3.5 rounded-lg transition-colors text-sm"
          >
            Advertise to developers
          </Link>
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
              <p className="text-emerald-400"> +$0.0125 earned  <span className="text-white/30">session: $0.2500 · 1.3% of Claude covered</span></p>
              <p className="text-white/20">{"─".repeat(52)}</p>
              <p className="text-white/20 mt-3">{">"} Refactoring auth module... <span className="text-emerald-400 animate-pulse">|</span></p>
            </div>
          </div>
          <p className="text-center text-white/20 text-xs mt-4">What developers see after each Claude Code tool call</p>
        </div>
      </section>

      {/* Earnings projection */}
      <section className="border-t border-white/10 px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-3 text-center">How much can you earn?</h2>
          <p className="text-white/40 text-sm text-center mb-10">Based on $25 avg CPM. Actual earnings depend on advertiser demand.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {EARNINGS_EXAMPLES.map((e) => (
              <div key={e.usage} className="bg-white/3 border border-white/8 rounded-xl p-6 text-center">
                <p className="text-white/40 text-xs mb-3">{e.usage}</p>
                <p className="text-3xl font-bold text-emerald-400 mb-1">{e.monthly}<span className="text-lg text-white/30">/mo</span></p>
                <p className="text-white/20 text-xs">{e.daily}/day</p>
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-sm mt-6">
            A Claude Pro subscription costs $20/month. Most moderate users cover it within the first week.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-12 text-center">Three steps to earning</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Install in 30 seconds",
                desc: "One command sets up the Claude Code hook. No code changes, no config files, no dependencies.",
                code: "npx @brozarti/spincome setup",
              },
              {
                step: "2",
                title: "Code like you normally do",
                desc: "A small ad appears after tool calls. Non-intrusive. No pop-ups. No interruptions. It just sits there.",
              },
              {
                step: "3",
                title: "Watch your balance grow",
                desc: "50% of every impression goes to you. Track earnings in the menu bar widget. Withdraw via Stripe.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white/3 border border-white/8 rounded-xl p-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm font-bold mb-4">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-3">{item.desc}</p>
                {item.code && (
                  <code className="block bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono">
                    {item.code}
                  </code>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it works for advertisers */}
      <section className="border-t border-white/10 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-3 text-center">Why advertisers pay premium CPMs</h2>
          <p className="text-white/40 text-sm text-center mb-10">This is why your earnings are real.</p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { value: "0", label: "Ad blockers", desc: "Terminal ads. uBlock can't touch them." },
              { value: "100%", label: "Senior devs", desc: "Every viewer is an active developer." },
              { value: "10s+", label: "View time", desc: "Ads sit while Claude thinks." },
              { value: "$25+", label: "Avg CPM", desc: "Developer audiences command premium rates." },
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

      <Footer />
    </main>
  );
}
