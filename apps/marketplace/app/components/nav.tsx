"use client";

import { useState } from "react";
import Link from "next/link";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-white/10">
      <div className="flex items-center justify-between px-8 py-5">
        <Link href="/" className="font-bold text-lg tracking-tight">spincome.io</Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/market" className="text-white/40 hover:text-white transition-colors">Market</Link>
          <Link href="/bids" className="text-white/40 hover:text-white transition-colors">Live bids</Link>
          <Link href="/advertise" className="text-white/40 hover:text-white transition-colors">Advertise</Link>
          <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">Advertisers</Link>
          <Link href="/dev" className="text-white/40 hover:text-white transition-colors">Developers</Link>
          <Link href="/download" className="text-emerald-400 hover:text-emerald-300 transition-colors">Download</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white/50 hover:text-white p-1"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-8 py-4 flex flex-col gap-3 text-sm">
          <Link href="/market" onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">Market</Link>
          <Link href="/bids" onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">Live bids</Link>
          <Link href="/advertise" onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">Advertise</Link>
          <Link href="/dashboard" onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">Advertisers</Link>
          <Link href="/dev" onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">Developers</Link>
          <Link href="/download" onClick={() => setOpen(false)} className="text-emerald-400 hover:text-emerald-300 transition-colors">Download</Link>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-8 py-10 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6 text-sm text-white/30">
          <Link href="/stats" className="hover:text-white/50 transition-colors">Stats</Link>
          <Link href="/market" className="hover:text-white/50 transition-colors">Market</Link>
          <Link href="/bids" className="hover:text-white/50 transition-colors">Live bids</Link>
          <Link href="/faq" className="hover:text-white/50 transition-colors">FAQ</Link>
          <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
        </div>
        <p className="text-white/15 text-xs">spincome.io</p>
      </div>
    </footer>
  );
}
