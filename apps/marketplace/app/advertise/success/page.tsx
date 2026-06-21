import Link from "next/link";
import { Nav } from "@/app/components/nav";

export default function AdvertiseSuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-emerald-400 text-5xl mb-6">✓</div>
          <h1 className="text-2xl font-bold mb-3">Payment confirmed</h1>
          <p className="text-white/50 text-sm mb-8">
            Your campaign is now live in the auction. Ads start appearing in developer terminals immediately.
            You only spend budget when you win an impression.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/advertise"
              className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Launch another campaign
            </Link>
            <Link
              href="/"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
