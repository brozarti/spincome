import { Nav, Footer } from "@/app/components/nav";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">Privacy policy</h1>
        <div className="space-y-6 text-white/60 text-sm leading-relaxed">
          <p>Last updated: June 2026</p>

          <h2 className="text-white font-semibold text-base mt-8">What we collect</h2>
          <p>When the spincome hook runs after a Claude Code tool call, we receive:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The tool name (e.g. &quot;Bash&quot;, &quot;Read&quot;, &quot;Edit&quot;)</li>
            <li>The file extension being worked on (e.g. &quot;ts&quot;, &quot;py&quot;)</li>
            <li>Your developer key (for attribution)</li>
          </ul>

          <h2 className="text-white font-semibold text-base mt-8">What we never collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your source code or file contents</li>
            <li>Your Claude Code prompts or responses</li>
            <li>File paths or directory structures</li>
            <li>Any personally identifiable information beyond your email</li>
          </ul>

          <h2 className="text-white font-semibold text-base mt-8">How we use data</h2>
          <p>Tool name and file extension are used solely for ad targeting (e.g. showing TypeScript-relevant ads to TypeScript developers). This data is stored as part of the impression record and used in aggregate for market analytics.</p>

          <h2 className="text-white font-semibold text-base mt-8">Payments</h2>
          <p>Stripe handles all payment processing. We do not store credit card numbers, bank account details, or other financial credentials. Stripe&apos;s privacy policy governs payment data.</p>

          <h2 className="text-white font-semibold text-base mt-8">Data retention</h2>
          <p>Impression records are retained for billing and analytics. You can request deletion of your account and associated data by emailing spincome.io@gmail.com.</p>

          <h2 className="text-white font-semibold text-base mt-8">Contact</h2>
          <p>Questions about privacy: <a href="mailto:spincome.io@gmail.com" className="text-emerald-400 hover:text-emerald-300">spincome.io@gmail.com</a></p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
