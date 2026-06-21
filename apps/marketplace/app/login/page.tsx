"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="font-bold text-lg tracking-tight">spincome.io</Link>
        <Link href="/setup" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Install free</Link>
      </nav>

      <div className="max-w-sm mx-auto px-6 py-24">
        <h1 className="text-2xl font-bold mb-2 text-center">Sign in</h1>
        <p className="text-white/40 text-sm text-center mb-10">Access your developer dashboard</p>

        {/* Google */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dev" })}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-lg text-sm hover:bg-white/90 transition-colors mb-3"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.5 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 5.6 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.3 18.8 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 5.6 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5 0 9.5-1.8 13-4.7l-6-5.1C29.1 35.7 26.7 36 24 36c-5.4 0-9.9-3.5-11.3-8.5l-6.5 5C9.5 39.1 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6 5.1C36.7 39 44 34 44 24c0-1.3-.2-2.7-.4-3.9z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-white/20 text-xs text-center mt-8">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline hover:text-white/40">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-white/40">Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}
