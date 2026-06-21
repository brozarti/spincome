import Link from "next/link";
import { Nav } from "@/app/components/nav";

export default function AdvertiseCancelPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-white/20 text-5xl mb-6">×</div>
          <h1 className="text-2xl font-bold mb-3">Payment cancelled</h1>
          <p className="text-white/50 text-sm mb-8">
            No charge was made. Your campaign was not activated.
          </p>
          <Link
            href="/advertise"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Try again
          </Link>
        </div>
      </div>
    </main>
  );
}
