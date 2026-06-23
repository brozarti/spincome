"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Nav, Footer } from "@/app/components/nav";

interface Campaign {
  advertiser: string;
  headline: string;
  body: string;
  cta: string;
  maxCpmCents: number;
  budgetCents: number;
  spentCents: number;
  impressions: number;
  active: boolean;
  targetLanguages: string | null;
  targetFrameworks: string | null;
  createdAt: string;
}

interface BidsData {
  live: Campaign[];
  recent: Campaign[];
}

function dollars(milliCents: number) {
  return "$" + (milliCents / 100000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function cpmDollars(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  return days + "d ago";
}

export default function BidsPage() {
  const [data, setData] = useState<BidsData | null>(null);

  useEffect(() => {
    fetch("/api/bids").then((r) => r.json()).then(setData);
    const id = setInterval(() => {
      fetch("/api/bids").then((r) => r.json()).then(setData);
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const totalLiveBudget = data?.live.reduce((s, c) => s + c.budgetCents, 0) ?? 0;
  const totalSpent = data?.live.reduce((s, c) => s + c.spentCents, 0) ?? 0;
  const totalImpressions = data?.live.reduce((s, c) => s + c.impressions, 0) ?? 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <Nav />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Live auction board</h1>
            <p className="text-white/40 text-sm">
              Real campaigns. Real money. Updated every 15 seconds.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Live</span>
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-3 gap-4 mt-10 mb-12">
            <SummaryCard label="Live campaign budget" value={dollars(totalLiveBudget)} accent />
            <SummaryCard label="Total spent" value={dollars(totalSpent)} />
            <SummaryCard label="Impressions delivered" value={totalImpressions.toLocaleString()} />
          </div>
        )}

        {!data && (
          <div className="text-white/20 text-sm animate-pulse mt-10">Loading auction data...</div>
        )}

        {data && data.live.length === 0 && (
          <div className="border border-white/8 rounded-xl p-10 text-center">
            <p className="text-white/30 text-sm mb-4">No live campaigns right now.</p>
            <Link href="/advertise" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
              Be the first to advertise
            </Link>
          </div>
        )}

        {data && data.live.length > 0 && (
          <div className="space-y-4 mb-12">
            <h2 className="text-xs text-white/30 uppercase tracking-widest mb-4">
              {data.live.length} paid campaign{data.live.length !== 1 ? "s" : ""} running
            </h2>
            {data.live.map((c, i) => (
              <CampaignCard key={i} campaign={c} rank={i + 1} />
            ))}
          </div>
        )}

        {data && data.recent.length > 0 && (
          <div>
            <h2 className="text-xs text-white/30 uppercase tracking-widest mb-4">Completed campaigns</h2>
            <div className="space-y-3">
              {data.recent.map((c, i) => (
                <CampaignCard key={i} campaign={c} rank={null} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-8 text-center">
          <p className="text-white/70 text-sm mb-1">Want your ad in the auction?</p>
          <p className="text-white/40 text-xs mb-6">
            Pay once. Your ad enters the real-time auction immediately.
            You only spend budget when you win an impression.
          </p>
          <Link
            href="/advertise"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-lg text-sm transition-colors"
          >
            Launch a campaign
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function CampaignCard({ campaign: c, rank }: { campaign: Campaign; rank: number | null }) {
  const pctSpent = c.budgetCents > 0 ? Math.min(100, Math.round((c.spentCents / c.budgetCents) * 100)) : 0;
  const targets = [
    ...(c.targetLanguages ? c.targetLanguages.split(",").map((s) => s.trim()) : []),
    ...(c.targetFrameworks ? c.targetFrameworks.split(",").map((s) => s.trim()) : []),
  ].filter(Boolean);

  return (
    <div className={`border rounded-xl p-6 transition-all ${c.active ? "border-white/10 bg-white/3 hover:border-white/20" : "border-white/5 bg-white/1 opacity-60"}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 min-w-0">
          {rank !== null && (
            <span className="text-2xl font-bold text-emerald-400 mt-0.5 shrink-0">#{rank}</span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-white/50 text-xs font-medium">{c.advertiser}</span>
              {c.active ? (
                <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Running
                </span>
              ) : (
                <span className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              )}
              {targets.map((t) => (
                <span key={t} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
            <p className="font-semibold text-white leading-tight mb-1">{c.headline}</p>
            <p className="text-white/30 text-xs">{c.body}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-white">{cpmDollars(c.maxCpmCents)}</p>
          <p className="text-white/20 text-xs">CPM bid</p>
        </div>
      </div>

      {/* Money stats */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <div>
          <p className="text-white/20 text-[10px] uppercase tracking-wider">Paid</p>
          <p className="text-white text-sm font-semibold">{dollars(c.budgetCents)}</p>
        </div>
        <div>
          <p className="text-white/20 text-[10px] uppercase tracking-wider">Spent</p>
          <p className="text-emerald-400 text-sm font-semibold">{dollars(c.spentCents)}</p>
        </div>
        <div>
          <p className="text-white/20 text-[10px] uppercase tracking-wider">Remaining</p>
          <p className="text-white/60 text-sm font-semibold">{dollars(Math.max(0, c.budgetCents - c.spentCents))}</p>
        </div>
        <div>
          <p className="text-white/20 text-[10px] uppercase tracking-wider">Impressions</p>
          <p className="text-white text-sm font-semibold">{c.impressions.toLocaleString()}</p>
        </div>
      </div>

      {/* Budget bar */}
      <div className="space-y-1">
        <div className="h-2 bg-white/6 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pctSpent > 80 ? "bg-yellow-500" : "bg-emerald-500"}`}
            style={{ width: `${pctSpent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/15">
          <span>{pctSpent}% delivered</span>
          <span>Started {timeAgo(c.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-5">
      <p className="text-white/30 text-xs mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-emerald-400" : "text-white"}`}>{value}</p>
    </div>
  );
}
