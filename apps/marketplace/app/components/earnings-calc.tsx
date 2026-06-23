"use client";

import { useState } from "react";

export function EarningsCalc() {
  const [calls, setCalls] = useState(200);

  const cpm = 25;
  const devShare = 0.5;
  const perImpression = (cpm / 1000) * devShare;
  const cooldownPerMin = 4; // max 4 impressions/min (15s cooldown)
  const activeMinutes = Math.min(calls / 2, 480); // assume ~2 calls/min, max 8hr day
  const dailyImpressions = Math.min(calls, activeMinutes * cooldownPerMin);
  const daily = dailyImpressions * perImpression;
  const monthly = daily * 30;
  const claudeCovered = Math.min(100, (monthly / 20) * 100);

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-6">
      <label className="block text-white/40 text-xs mb-3">
        How many Claude Code tool calls do you make per day?
      </label>
      <input
        type="range"
        min="10"
        max="1000"
        step="10"
        value={calls}
        onChange={(e) => setCalls(parseInt(e.target.value))}
        className="w-full mb-4 accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-white/20 mb-6">
        <span>10</span>
        <span className="text-white/50 font-medium">{calls} calls/day</span>
        <span>1000</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-emerald-400">${daily.toFixed(2)}</p>
          <p className="text-white/30 text-xs">per day</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">${monthly.toFixed(0)}</p>
          <p className="text-white/30 text-xs">per month</p>
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: claudeCovered >= 100 ? "#10b981" : "#fbbf24" }}>
            {claudeCovered.toFixed(0)}%
          </p>
          <p className="text-white/30 text-xs">Claude covered</p>
        </div>
      </div>
    </div>
  );
}
