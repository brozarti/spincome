"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Nav } from "@/app/components/nav";

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

const CLAUDE_MONTHLY_CENTS = 2000; // $20/month = 2,000,000 milli-cents
const MILLI_CENTS_PER_DOLLAR = 100000;

export default function DevDashboardPage() {
  const { data: session } = useSession();
  const [key, setKey] = useState("");
  const [stats, setStats] = useState<DevStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ languages: "", frameworks: "" });
  const [payoutStatus, setPayoutStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [payoutMsg, setPayoutMsg] = useState("");

  // Auto-load dashboard if signed in via GitHub
  useEffect(() => {
    const devKey = (session as unknown as Record<string, unknown>)?.developerKey as string | undefined;
    if (devKey && !stats) {
      setKey(devKey);
      fetch("/api/developers/me", {
        headers: { "X-Developer-Key": devKey },
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data) {
            setStats(data);
            setForm({ languages: data.languages ?? "", frameworks: data.frameworks ?? "" });
          }
        });
    }
  }, [session, stats]);

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
    try {
      const res = await fetch("/api/developers/connect", {
        method: "POST",
        headers: { "X-Developer-Key": key.trim() },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Failed to start Stripe onboarding. Make sure Stripe Connect is enabled on your account.");
      }
    } catch (err) {
      alert("Network error: " + String(err));
    }
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
    ? Math.min(100, Math.round((stats.earningsCents / (CLAUDE_MONTHLY_CENTS * 1000)) * 100))
    : 0;
  const referralUrl = stats ? `https://spincome.io/r/${stats.referralCode}` : "";

  return (
    <main className="min-h-screen bg-black text-white">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Developer dashboard</h1>

        {!stats ? (
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = "/api/auth/signin/github?callbackUrl=/dev"}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-lg text-sm hover:bg-white/90 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Sign in with GitHub
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/20 text-xs">or use your developer key</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
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
          </div>
        ) : (
          <div className="space-y-6">
            {/* Earnings */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/40 text-xs mb-1">Total earned</p>
              <p className="text-4xl font-bold text-emerald-400 mb-4">
                ${(stats.earningsCents / MILLI_CENTS_PER_DOLLAR).toFixed(4)}
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
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (stats.earningsCents < 1000000) {
                          setPayoutStatus("error");
                          setPayoutMsg(`You need $${((1000000 - stats.earningsCents) / MILLI_CENTS_PER_DOLLAR).toFixed(2)} more to reach the $10 minimum payout.`);
                          return;
                        }
                        requestPayout();
                      }}
                      disabled={payoutStatus === "loading"}
                      className={`font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors ${
                        stats.earningsCents >= 1000000
                          ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                          : "bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      }`}
                    >
                      {payoutStatus === "loading" ? "Processing..." : `Withdraw $${(stats.earningsCents / MILLI_CENTS_PER_DOLLAR).toFixed(2)}`}
                    </button>
                  </div>
                  {payoutMsg && (
                    <p className={`text-sm mt-3 ${payoutStatus === "error" ? "text-white/50" : "text-emerald-400"}`}>
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
                ? `$${((stats.earningsCents / stats.impressionCount / MILLI_CENTS_PER_DOLLAR) * 1000).toFixed(2)}`
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
