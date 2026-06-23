"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav, Footer } from "@/app/components/nav";

interface Campaign {
  id: string;
  headline: string;
  body: string;
  cta: string;
  clickUrl: string;
  maxCpmCents: number;
  budgetCents: number;
  spentCents: number;
  active: boolean;
  targetLanguages: string | null;
  targetFrameworks: string | null;
  _count: { impressions: number };
  createdAt: string;
}

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Campaign | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/advertisers/campaigns?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setCampaigns(data.campaigns ?? []);
    setLoading(false);
  }

  const totalSpent = campaigns?.reduce((s, c) => s + c.spentCents, 0) ?? 0;
  const totalBudget = campaigns?.reduce((s, c) => s + c.budgetCents, 0) ?? 0;
  const totalImpressions = campaigns?.reduce((s, c) => s + c._count.impressions, 0) ?? 0;
  const activeCount = campaigns?.filter(c => c.active).length ?? 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-2">Advertiser dashboard</h1>
        <p className="text-white/40 text-sm mb-8">View your campaigns, track spend, and preview your ads.</p>

        {!campaigns ? (
          <form onSubmit={lookup} className="flex gap-3">
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
              {loading ? "..." : "View campaigns"}
            </button>
          </form>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <StatCard label="Active" value={String(activeCount)} />
              <StatCard label="Total impressions" value={totalImpressions.toLocaleString()} />
              <StatCard label="Total spent" value={`$${(totalSpent / 100000).toFixed(2)}`} accent />
              <StatCard label="Total budget" value={`$${(totalBudget / 100000).toFixed(2)}`} />
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
                <p className="text-white/40 text-sm mb-4">No campaigns yet.</p>
                <Link href="/advertise" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
                  Create your first campaign
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((c) => {
                  const pctSpent = c.budgetCents > 0 ? Math.min(100, Math.round((c.spentCents / c.budgetCents) * 100)) : 0;
                  const targets = [
                    ...(c.targetLanguages ? c.targetLanguages.split(",").map(s => s.trim()) : []),
                    ...(c.targetFrameworks ? c.targetFrameworks.split(",").map(s => s.trim()) : []),
                  ].filter(Boolean);

                  return (
                    <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{c.headline}</h3>
                            {targets.map(t => (
                              <span key={t} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                          <p className="text-white/40 text-xs">{c.body}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={() => setPreview(preview?.id === c.id ? null : c)}
                            className="text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1 rounded-lg transition-colors"
                          >
                            {preview?.id === c.id ? "Hide preview" : "Preview"}
                          </button>
                          <span className={`text-xs px-2 py-1 rounded-full ${c.active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>
                            {c.active ? "Live" : "Pending payment"}
                          </span>
                        </div>
                      </div>

                      {/* Ad preview */}
                      {preview?.id === c.id && (
                        <div className="bg-black border border-white/10 rounded-lg p-4 mb-4 font-mono text-sm">
                          <p className="text-white/30 text-xs mb-2 font-sans uppercase tracking-widest">Terminal preview</p>
                          <p className="text-white/20">{"─".repeat(50)}</p>
                          <p className="text-white/40"> Sponsored · Your Company</p>
                          <p className="text-white font-bold"> {c.headline}</p>
                          <p className="text-white/50"> {c.body}</p>
                          <p> </p>
                          <p> <span className="text-cyan-400">{c.cta}</span>  <span className="text-white/30">{c.clickUrl}</span></p>
                          <p> </p>
                          <p className="text-emerald-400"> +$0.0125 earned  <span className="text-white/30">session: $0.2500</span></p>
                          <p className="text-white/20">{"─".repeat(50)}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                        <Stat label="CPM bid" value={`$${(c.maxCpmCents / 100).toFixed(2)}`} />
                        <Stat label="Impressions" value={c._count.impressions.toLocaleString()} />
                        <Stat label="Spent" value={`$${(c.spentCents / 100000).toFixed(2)}`} />
                        <Stat label="Budget" value={`$${(c.budgetCents / 100000).toFixed(2)}`} />
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pctSpent > 80 ? "bg-yellow-500" : "bg-emerald-500"}`}
                          style={{ width: `${pctSpent}%` }}
                        />
                      </div>
                      <p className="text-white/30 text-xs mt-2">{pctSpent}% of budget used</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Link
                href="/advertise"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                Launch new campaign
              </Link>
              <Link
                href="/bids"
                className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                View all live bids
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-white/30 text-xs mb-1">{label}</p>
      <p className={`text-lg font-bold ${accent ? "text-emerald-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/30 text-xs mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
