"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalImpressions: number;
  totalDevelopers: number;
  totalEarningsCents: number;
  topTools: { tool: string; count: number }[];
  topFileExts: { ext: string; count: number }[];
  leaderboard: { rank: number; handle: string; earningsCents: number; impressions: number }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
  }, []);

  const fmt = (n: number) => n.toLocaleString();
  const dollars = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="font-bold text-lg tracking-tight">spincome.io</Link>
        <Link href="/setup" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Install free</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Live network stats</h1>
        <p className="text-white/40 text-sm mb-12">Updated in real time. Every number here is real money earned by real developers.</p>

        {!stats ? (
          <div className="text-white/30 text-sm animate-pulse">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-12">
              <StatCard
                label="Total paid out"
                value={dollars(stats.totalEarningsCents)}
                accent
              />
              <StatCard
                label="Active developers"
                value={fmt(stats.totalDevelopers)}
              />
              <StatCard
                label="Total impressions"
                value={fmt(stats.totalImpressions)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-sm text-white/40 uppercase tracking-widest mb-4">Top tools by impressions</h2>
                <div className="space-y-3">
                  {stats.topTools.length === 0 && <p className="text-white/20 text-sm">No data yet</p>}
                  {stats.topTools.map((t, i) => (
                    <div key={t.tool} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white/20 text-xs w-4">{i + 1}</span>
                        <span className="font-mono text-sm">{t.tool}</span>
                      </div>
                      <span className="text-white/40 text-sm">{fmt(t.count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm text-white/40 uppercase tracking-widest mb-4">Top languages</h2>
                <div className="space-y-3">
                  {stats.topFileExts.length === 0 && <p className="text-white/20 text-sm">No data yet</p>}
                  {stats.topFileExts.map((e, i) => (
                    <div key={e.ext} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white/20 text-xs w-4">{i + 1}</span>
                        <span className="font-mono text-sm">.{e.ext}</span>
                      </div>
                      <span className="text-white/40 text-sm">{fmt(e.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            {stats.leaderboard.length > 0 && (
              <div className="mt-12">
                <h2 className="text-sm text-white/40 uppercase tracking-widest mb-4">Top earners</h2>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/30 text-xs">
                        <th className="text-left px-5 py-3 font-normal">Rank</th>
                        <th className="text-left px-5 py-3 font-normal">Developer</th>
                        <th className="text-right px-5 py-3 font-normal">Impressions</th>
                        <th className="text-right px-5 py-3 font-normal">Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.leaderboard.map((d) => (
                        <tr key={d.rank} className="border-b border-white/5 last:border-0 hover:bg-white/3">
                          <td className="px-5 py-3 text-white/20 font-mono">#{d.rank}</td>
                          <td className="px-5 py-3 font-mono text-white/70">{d.handle}</td>
                          <td className="px-5 py-3 text-right text-white/50">{fmt(d.impressions)}</td>
                          <td className="px-5 py-3 text-right text-emerald-400 font-semibold">{dollars(d.earningsCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-16 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-white/50 text-sm mb-4">
                Spincome developers have collectively earned{" "}
                <span className="text-emerald-400 font-semibold">{dollars(stats.totalEarningsCents)}</span>{" "}
                just by using Claude Code.
              </p>
              <Link
                href="/setup"
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Start earning
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <p className="text-white/40 text-xs mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-emerald-400" : "text-white"}`}>{value}</p>
    </div>
  );
}
