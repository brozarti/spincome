"use client";

import Link from "next/link";
import { Nav } from "@/app/components/nav";

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-2">Get set up in 30 seconds</h1>
        <p className="text-white/50 mb-10">Run this in your terminal. That&apos;s it.</p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-sm mb-8">
          <span className="text-white/30 select-none">$ </span>
          <span className="text-emerald-400">npx @brozarti/spincome</span>
        </div>

        <ul className="space-y-4 text-sm text-white/60">
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

        <div className="mt-10 pt-8 border-t border-white/10">
          <h2 className="font-semibold mb-2">Want a menu bar widget?</h2>
          <p className="text-white/40 text-sm mb-4">
            Track your earnings in real time from the macOS menu bar. See ads, withdraw, and copy your referral link -- all without leaving your desktop.
          </p>
          <Link
            href="/download"
            className="inline-block border border-white/20 hover:border-white/40 text-white/70 hover:text-white px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Download for Mac
          </Link>
        </div>
      </div>
    </div>
    </main>
  );
}
