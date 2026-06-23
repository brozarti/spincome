"use client";

import { useState } from "react";

export function EarningsCalc() {
  const [calls, setCalls] = useState(200);

  const cpm = 10; // realistic mid-range CPM
  const devShare = 0.5;
  // 15s cooldown means not every tool call generates an impression
  const dailyImpressions = Math.min(calls, Math.floor(calls * 0.6)); // ~60% of calls become billable impressions
  const daily = (dailyImpressions / 1000) * cpm * devShare;
  const monthly = daily * 22; // work days
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
