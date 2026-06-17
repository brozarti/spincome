"use client";

import Link from "next/link";

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="font-bold text-lg tracking-tight">spincome.io</Link>
        <Link href="/advertise" className="text-sm text-white/60 hover:text-white transition-colors">Advertise</Link>
      </nav>
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
      </div>
    </div>
    </main>
  );
}
