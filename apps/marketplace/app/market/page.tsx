"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Nav, Footer } from "@/app/components/nav";

interface MarketData {
  currentHourImpressions: number;
  avgCpm24h: number;
  allTimeAvgCpm: number;
  allTimeImpressions: number;
  activeCampaigns: number;
  priceHistory: { hour: string; avgCpmCents: number; impressions: number }[];
  dailyHistory: { day: string; avgCpmCents: number; impressions: number }[];
}

export default function MarketPage() {
  const [data, setData] = useState<MarketData | null>(null);
  const [view, setView] = useState<"24h" | "7d">("24h");

  useEffect(() => {
    fetch("/api/market").then((r) => r.json()).then(setData);
    const id = setInterval(() => {
      fetch("/api/market").then((r) => r.json()).then(setData);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Nav />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Market data</h1>
            <p className="text-white/40 text-sm">Real-time pricing and volume — refreshes every 30 seconds.</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Live</span>
          </div>
        </div>

        {!data ? (
          <div className="text-white/20 text-sm animate-pulse mt-10">Loading market data...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4 mt-10 mb-10">
              <Card label="Impressions/hr" value={data.currentHourImpressions.toLocaleString()} accent />
              <Card label="Avg CPM (24h)" value={`$${(data.avgCpm24h / 100).toFixed(2)}`} />
              <Card label="Avg CPM (all-time)" value={`$${(data.allTimeAvgCpm / 100).toFixed(2)}`} />
              <Card label="Active campaigns" value={String(data.activeCampaigns)} />
            </div>

            {/* Chart toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setView("24h")}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${view === "24h" ? "bg-emerald-500/20 text-emerald-400" : "text-white/30 hover:text-white/50"}`}
              >
                24 hours
              </button>
              <button
                onClick={() => setView("7d")}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${view === "7d" ? "bg-emerald-500/20 text-emerald-400" : "text-white/30 hover:text-white/50"}`}
              >
                7 days
              </button>
            </div>

            {/* Price chart */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-6 mb-10">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-4">
                {view === "24h" ? "Average CPM by hour" : "Average CPM by day"}
              </p>
              <Chart
                data={view === "24h"
                  ? data.priceHistory.map((p) => ({ label: p.hour.slice(11, 16), value: p.avgCpmCents, volume: p.impressions }))
                  : data.dailyHistory.map((d) => ({ label: d.day.slice(5), value: d.avgCpmCents, volume: d.impressions }))
                }
              />
            </div>

            {/* Volume chart */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-6 mb-10">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-4">
                {view === "24h" ? "Impressions by hour" : "Impressions by day"}
              </p>
              <VolumeChart
                data={view === "24h"
                  ? data.priceHistory.map((p) => ({ label: p.hour.slice(11, 16), value: p.impressions }))
                  : data.dailyHistory.map((d) => ({ label: d.day.slice(5), value: d.impressions }))
                }
              />
            </div>

            {/* All-time stats */}
            <div className="border border-white/8 rounded-xl p-6 text-center">
              <p className="text-white/30 text-xs mb-2">All-time network volume</p>
              <p className="text-3xl font-bold text-emerald-400">{data.allTimeImpressions.toLocaleString()}</p>
              <p className="text-white/20 text-xs mt-1">total impressions served</p>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-5">
      <p className="text-white/30 text-xs mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-emerald-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

function Chart({ data }: { data: { label: string; value: number; volume: number }[] }) {
  if (data.length === 0) return <p className="text-white/20 text-sm">No data yet</p>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartH = 160;

  return (
    <div className="flex items-end gap-1" style={{ height: chartH }}>
      {data.map((d, i) => {
        const h = Math.max(2, (d.value / maxVal) * chartH);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
            <div className="absolute -top-8 hidden group-hover:block bg-black border border-white/10 rounded px-2 py-1 text-xs text-white whitespace-nowrap z-10">
              ${(d.value / 100).toFixed(2)} CPM · {d.volume} imps
            </div>
            <div
              className="w-full rounded-t bg-emerald-500/60 hover:bg-emerald-400/80 transition-colors"
              style={{ height: h }}
            />
            <span className="text-white/20 text-[9px] mt-1 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function VolumeChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) return <p className="text-white/20 text-sm">No data yet</p>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartH = 120;

  return (
    <div className="flex items-end gap-1" style={{ height: chartH }}>
      {data.map((d, i) => {
        const h = Math.max(2, (d.value / maxVal) * chartH);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
            <div className="absolute -top-8 hidden group-hover:block bg-black border border-white/10 rounded px-2 py-1 text-xs text-white whitespace-nowrap z-10">
              {d.value} impressions
            </div>
            <div
              className="w-full rounded-t bg-white/10 hover:bg-white/20 transition-colors"
              style={{ height: h }}
            />
            <span className="text-white/20 text-[9px] mt-1 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
