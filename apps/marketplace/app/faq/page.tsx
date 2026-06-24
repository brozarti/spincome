import { Nav, Footer } from "@/app/components/nav";

const FAQS = [
  {
    category: "Developers",
    questions: [
      {
        q: "How do I start earning?",
        a: "Run 'npx @brozarti/spincome' in your terminal or download the menu bar Widget. Ads appear after Claude Code tool calls, and you earn 50% of every impression.",
      },
      {
        q: "How much can I earn?",
        a: "Earnings depend on advertiser demand. At typical CPMs ($5-25), active Claude Code users can earn $1-5/day -- enough to offset a significant portion of your Claude subscription.",
      },
      {
        q: "When do I get paid?",
        a: "Payouts happen automatically every Monday via Stripe. Connect your Stripe account in the developer dashboard or Widget. Minimum payout is $10.",
      },
      {
        q: "What data do you collect?",
        a: "Only the tool name (e.g. 'Bash', 'Read') and file extension (e.g. 'ts', 'py') from the hook payload. We never see your code, file contents, prompts, or responses.",
      },
      {
        q: "Can I disable ads?",
        a: "Yes. Run 'npx @brozarti/spincome disable' or set enabled: false in ~/.spincome/config.json. You can re-enable anytime.",
      },
      {
        q: "How does the referral program work?",
        a: "Share your referral link and earn 10% of every referred developer's impression earnings -- forever. There's no cap.",
      },
    ],
  },
  {
    category: "Advertisers",
    questions: [
      {
        q: "How does bidding work?",
        a: "You set a max CPM (cost per 1,000 impressions) bid. The auction uses second-price (Vickrey) rules -- you pay one cent above the next highest bid. This incentivizes honest bidding.",
      },
      {
        q: "What's the minimum bid and budget?",
        a: "Minimum CPM bid is $1.00. Minimum campaign budget is $10. You can target specific languages or frameworks to reach the exact developers you want.",
      },
      {
        q: "How are clicks billed?",
        a: "Clicks cost 50x the winning impression rate. For example, if your winning CPM is $10, each click costs $0.50. This is charged against your campaign budget.",
      },
      {
        q: "What are delivery speeds?",
        a: "Slow (~2 days): spreads impressions evenly over time. Medium (~6 hours): moderate pacing. Fast (ASAP): delivers all impressions as quickly as possible. All reach the same audience.",
      },
      {
        q: "Can I upload a brand icon?",
        a: "Yes. Upload a PNG, JPG, or WebP file (max 64KB) when creating your campaign. It appears next to your ad in developer terminals.",
      },
      {
        q: "When does my campaign go live?",
        a: "Immediately after payment clears via Stripe Checkout. Your ad enters the real-time auction and starts competing for impressions within minutes.",
      },
      {
        q: "Can I see what other advertisers are bidding?",
        a: "Yes. The Live Bids page shows all active campaigns, their CPM bids, budget pacing, and targeting. Full transparency.",
      },
    ],
  },
  {
    category: "Platform",
    questions: [
      {
        q: "How does spincome make money?",
        a: "The platform keeps approximately 40-50% of impression revenue after paying developers (50%) and referrers (10% of developer share). Advertisers pay the full CPM; the split is internal.",
      },
      {
        q: "Is this safe to use with Claude Code?",
        a: "Yes. The hook runs as a PostToolUse hook -- it fires after tool calls complete, not during. It cannot intercept, modify, or read your Claude Code session. It only writes to stderr/stdout.",
      },
      {
        q: "Why can't ad blockers block these ads?",
        a: "Ads are rendered directly in the terminal via ANSI text, not in a browser. Browser-based ad blockers like uBlock Origin have no access to terminal output.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">FAQ</h1>
        <p className="text-white/40 text-sm mb-12">Everything you need to know about spincome.</p>

        {FAQS.map((section) => (
          <div key={section.category} className="mb-12">
            <h2 className="text-xs text-white/30 uppercase tracking-widest mb-6">{section.category}</h2>
            <div className="space-y-6">
              {section.questions.map((faq) => (
                <div key={faq.q} className="border-b border-white/5 pb-6 last:border-0">
                  <h3 className="font-medium mb-2">{faq.q}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="border border-white/8 rounded-xl p-6 text-center mt-8">
          <p className="text-white/40 text-sm mb-4">Still have questions?</p>
          <a
            href="mailto:spincome.io@gmail.com"
            className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
          >
            spincome.io@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}
