import Link from "next/link";

export function Nav() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
      <Link href="/" className="font-bold text-lg tracking-tight">spincome.io</Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/market" className="text-white/40 hover:text-white transition-colors">Market</Link>
        <Link href="/bids" className="text-white/40 hover:text-white transition-colors">Live bids</Link>
        <Link href="/advertise" className="text-white/40 hover:text-white transition-colors">Advertise</Link>
        <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">Advertisers</Link>
        <Link href="/dev" className="text-white/40 hover:text-white transition-colors">Developers</Link>
        <Link href="/setup" className="text-emerald-400 hover:text-emerald-300 transition-colors">Install free</Link>
      </div>
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
