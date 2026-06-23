"use client";

import Link from "next/link";
import { Nav } from "@/app/components/nav";

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-2">Get set up in 30 seconds</h1>
        <p className="text-white/50 mb-10">Run this in your terminal. That&apos;s it.</p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-sm mb-8 text-left">
          <span className="text-white/30 select-none">$ </span>
          <span className="text-emerald-400">npx @brozarti/spincome</span>
        </div>

        <ul className="space-y-4 text-sm text-white/60 text-left">
          <li className="flex gap-3">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span>Asks for your email and creates a free account</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span>Adds a PostToolUse hook to your Claude Code settings</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span>Starts earning immediately -- no further setup</span>
          </li>
          <li className="flex gap-3">
            <span className="text-white/30 mt-0.5">○</span>
            <span className="text-white/40">Connect Stripe later to withdraw earnings</span>
          </li>
        </ul>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/20 text-xs">or set up with the Widget</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="mt-8 bg-white/3 border border-white/8 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-lg font-bold text-black shrink-0">$</div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-medium mb-0.5">Menu Bar Widget for Mac</p>
            <p className="text-white/30 text-xs">Live earnings, ads, and withdrawals from your desktop.</p>
          </div>
          <Link
            href="/download"
            className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-5 py-2 rounded-lg text-xs transition-colors"
          >
            Download
          </Link>
        </div>
      </div>
    </div>
    </main>
  );
}
