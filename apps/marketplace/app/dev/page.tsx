"use client";

import { useState } from "react";
import Link from "next/link";

interface DevStats {
  email: string;
  earningsCents: number;
  referralCode: string;
  referralCount: number;
  impressionCount: number;
  languages: string;
  frameworks: string;
  stripeConnected: boolean;
}

const CLAUDE_MONTHLY_CENTS = 2000; // $20/month

export default function DevDashboardPage() {
  const [key, setKey] = useState("");
  const [stats, setStats] = useState<DevStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ languages: "", frameworks: "" });
  const [payoutStatus, setPayoutStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [payoutMsg, setPayoutMsg] = useState("");

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/developers/me", {
      headers: { "X-Developer-Key": key.trim() },
    });
    if (!res.ok) {
      setError("Developer key not found.");
      setLoading(false);
      return;
    }
    const data: DevStats = await res.json();
    setStats(data);
    setForm({ languages: data.languages ?? "", frameworks: data.frameworks ?? "" });
    setLoading(false);
  }

  async function connectStripe() {
    const res = await fetch("/api/developers/connect", {
      method: "POST",
      headers: { "X-Developer-Key": key.trim() },
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function requestPayout() {
    setPayoutStatus("loading");
    const res = await fetch("/api/developers/payout", {
      method: "POST",
      headers: { "X-Developer-Key": key.trim() },
    });
    const data = await res.json();
    if (res.ok) {
      setPayoutStatus("done");
      setPayoutMsg(`$${(data.paidOutCents / 100).toFixed(2)} sent to your Stripe account.`);
      setStats((s) => s ? { ...s, earningsCents: 0 } : s);
    } else {
      setPayoutStatus("error");
      setPayoutMsg(data.error ?? "Payout failed.");
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/developers/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Developer-Key": key.trim() },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const pctOfSubscription = stats
    ? Math.min(100, Math.round((stats.earningsCents / CLAUDE_MONTHLY_CENTS) * 100))
    : 0;
  const referralUrl = stats ? `https://spincome.io/r/${stats.referralCode}` : "";

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="font-bold text-lg tracking-tight">spincome.io</Link>
        <Link href="/setup" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Install free</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Developer dashboard</h1>

        {!stats ? (
          <form onSubmit={lookup} className="flex gap-3">
            <input
              type="text"
              placeholder="dev_..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? "..." : "View"}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Earnings */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/40 text-xs mb-1">Total earned</p>
              <p className="text-4xl font-bold text-emerald-400 mb-4">
                ${(stats.earningsCents / 100).toFixed(2)}
              </p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${pctOfSubscription}%` }}
                />
              </div>
              <p className="text-white/30 text-xs">
                {pctOfSubscription}% of your $20/mo Claude subscription covered
              </p>
            </div>

            {/* Payout */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="font-semibold mb-1">Withdraw earnings</h2>
              <p className="text-white/40 text-xs mb-4">Minimum payout $10. Funds arrive in 1-2 business days.</p>
              {!stats.stripeConnected ? (
                <button
                  onClick={connectStripe}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Connect Stripe to withdraw
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={requestPayout}
                    disabled={payoutStatus === "loading" || stats.earningsCents < 1000}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {payoutStatus === "loading" ? "Processing..." : `Withdraw $${(stats.earningsCents / 100).toFixed(2)}`}
                  </button>
                  {payoutMsg && (
                    <p className={`text-sm ${payoutStatus === "error" ? "text-red-400" : "text-emerald-400"}`}>
                      {payoutMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Impressions" value={stats.impressionCount.toLocaleString()} />
              <Stat label="Referrals" value={stats.referralCount.toLocaleString()} />
              <Stat label="Avg CPM" value={stats.impressionCount > 0
                ? `$${((stats.earningsCents / stats.impressionCount) * 2).toFixed(3)}`
                : "--"} />
            </div>

            {/* Referral */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="font-semibold mb-1">Your referral link</h2>
              <p className="text-white/40 text-xs mb-4">
                Earn 10% of every referred developer&apos;s impressions -- forever.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-emerald-400 truncate">
                  {referralUrl}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(referralUrl)}
                  className="border border-white/20 hover:border-white/40 px-4 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-white/30 text-xs mt-2">
                {stats.referralCount} developer{stats.referralCount !== 1 ? "s" : ""} referred so far
              </p>
            </div>

            {/* Targeting profile */}
            <form onSubmit={saveProfile} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <h2 className="font-semibold mb-1">Targeting profile</h2>
                <p className="text-white/40 text-xs">
                  Opt in to receive targeted ads relevant to your stack. Targeted ads pay higher CPM.
                </p>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Languages (comma-separated)</label>
                <input
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="typescript, python, rust"
                  value={form.languages}
                  onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Frameworks (comma-separated)</label>
                <input
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="nextjs, react, fastapi"
                  value={form.frameworks}
                  onChange={(e) => setForm((f) => ({ ...f, frameworks: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {saved ? "Saved!" : "Save profile"}
              </button>
            </form>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
