"use client";

import { useState } from "react";

interface Campaign {
  id: string;
  headline: string;
  cpmBidCents: number;
  budgetCents: number;
  spentCents: number;
  active: boolean;
  _count: { impressions: number };
  createdAt: string;
}

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/advertisers/campaigns?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setCampaigns(data.campaigns ?? []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Advertiser dashboard</h1>

        <form onSubmit={lookup} className="flex gap-3 mb-10">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? "..." : "Look up"}
          </button>
        </form>

        {campaigns !== null && campaigns.length === 0 && (
          <p className="text-white/40 text-sm">No campaigns found for this email.</p>
        )}

        {campaigns && campaigns.length > 0 && (
          <div className="space-y-4">
            {campaigns.map((c) => {
              const pctSpent = Math.min(100, Math.round((c.spentCents / c.budgetCents) * 100));
              return (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{c.headline}</h3>
                      <p className="text-white/40 text-xs mt-1">${(c.cpmBidCents / 100).toFixed(2)} CPM</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${c.active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>
                      {c.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <Stat label="Impressions" value={c._count.impressions.toLocaleString()} />
                    <Stat label="Spent" value={`$${(c.spentCents / 100).toFixed(2)}`} />
                    <Stat label="Budget" value={`$${(c.budgetCents / 100).toFixed(2)}`} />
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${pctSpent}%` }}
                    />
                  </div>
                  <p className="text-white/30 text-xs mt-2">{pctSpent}% of budget used</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
