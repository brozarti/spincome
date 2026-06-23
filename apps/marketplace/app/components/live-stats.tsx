"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalImpressions: number;
  totalDevelopers: number;
  totalEarningsCents: number;
}

export function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="flex flex-wrap justify-center gap-8 text-center">
      <div>
        <p className="text-2xl font-bold text-emerald-400">{stats.totalDevelopers.toLocaleString()}</p>
        <p className="text-white/30 text-xs">developers earning</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{stats.totalImpressions.toLocaleString()}</p>
        <p className="text-white/30 text-xs">impressions served</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-emerald-400">${(stats.totalEarningsCents / 100000).toFixed(2)}</p>
        <p className="text-white/30 text-xs">paid to developers</p>
      </div>
    </div>
  );
}
