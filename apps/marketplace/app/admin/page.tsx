"use client";

import { useState } from "react";

interface RevenueData {
  totalImpressions: number;
  totalDevelopers: number;
  activeCampaigns: number;
  totalSpentCents: number;
  totalPaidOutCents: number;
  platformRevenueCents: number;
  takeRatePct: number;
  recentImpressions: { day: string; count: number }[];
}

function dollars(milliCents: number) {
  return `$${(milliCents / 100000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [data, setData] = useState<RevenueData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/revenue", {
      headers: { "x-admin-key": adminKey },
    });
    if (!res.ok) {
      setError("Wrong admin key.");
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoading(false);
  }

  // Sparkline -- simple inline bar chart
  function Sparkline({ points }: { points: { day: string; count: number }[] }) {
    if (!points.length) return <p className="text-white/20 text-xs">No data yet</p>;
    const max = Math.max(...points.map((p) => p.count), 1);
    return (
      <div className="flex items-end gap-0.5 h-12">
        {points.map((p) => (
          <div
            key={p.day}
            className="flex-1 bg-emerald-500/60 rounded-sm min-h-[2px]"
            style={{ height: `${Math.max(4, (p.count / max) * 48)}px` }}
            title={`${p.day}: ${p.count}`}
          />
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-2">Platform revenue</h1>
        <p className="text-white/40 text-xs mb-8">Creator-only. Do not share this URL.</p>

        {!data ? (
          <form onSubmit={load} className="flex gap-3 max-w-sm">
            <input
              type="password"
              placeholder="Admin key"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? "..." : "Enter"}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Top line: your money */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
              <p className="text-emerald-400/60 text-xs mb-1">Your platform revenue</p>
              <p className="text-5xl font-bold text-emerald-400 mb-2">
                {dollars(data.platformRevenueCents)}
              </p>
              <p className="text-white/30 text-xs">
                {data.takeRatePct}% effective take rate &middot;{" "}
                {dollars(data.totalSpentCents)} total ad spend &middot;{" "}
                {dollars(data.totalPaidOutCents)} paid to developers
              </p>
            </div>

            {/* Network stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card label="Total impressions" value={data.totalImpressions.toLocaleString()} />
              <Card label="Developers" value={data.totalDevelopers.toLocaleString()} />
              <Card label="Active campaigns" value={data.activeCampaigns.toLocaleString()} />
            </div>

            {/* Revenue breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-sm">Revenue breakdown</h2>
              <Row label="Advertiser spend (gross)" value={dollars(data.totalSpentCents)} />
              <Row label="Paid to developers (50%)" value={`- ${dollars(data.totalPaidOutCents)}`} dim />
              <div className="border-t border-white/10 pt-3">
                <Row label="Platform net revenue" value={dollars(data.platformRevenueCents)} accent />
              </div>
              <p className="text-white/20 text-xs pt-2">
                Note: developer payouts include your 10% referral cut on all organic signups --
                those earnings appear in your developer account, not here.
              </p>
            </div>

            {/* 30-day volume */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="font-semibold text-sm mb-4">Impressions — last 30 days</h2>
              <Sparkline points={data.recentImpressions} />
            </div>

            <button
              onClick={() => { setData(null); setAdminKey(""); }}
              className="text-white/30 text-xs hover:text-white/50 transition-colors"
            >
              Lock dashboard
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Row({ label, value, dim, accent }: { label: string; value: string; dim?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={dim ? "text-white/40" : "text-white/70"}>{label}</span>
      <span className={accent ? "text-emerald-400 font-semibold" : dim ? "text-white/40" : "text-white"}>
        {value}
      </span>
    </div>
  );
}
