import Link from "next/link";
import { Nav, Footer } from "@/app/components/nav";

const DMG_URL = "https://github.com/brozarti/spincome/releases/latest/download/Spincome.dmg";

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 py-20 text-center flex-1">
        <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-black mx-auto mb-8">
          $
        </div>

        <h1 className="text-4xl font-bold mb-3">Spincome for Mac</h1>
        <p className="text-white/40 text-lg mb-10">
          Menu bar widget that tracks your Claude Code earnings in real time.
        </p>

        <a
          href={DMG_URL}
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-10 py-4 rounded-xl transition-colors text-base mb-4"
        >
          Download for macOS
        </a>
        <p className="text-white/20 text-xs mb-16">
          macOS 12+ (Apple Silicon). 105 MB.
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4 text-left mb-16">
          {[
            { title: "Live earnings", desc: "Session, lifetime, and Claude subscription coverage updated in real time." },
            { title: "Ad display", desc: "Ads pop during tool calls and auto-hide when Claude finishes thinking." },
            { title: "One-click withdraw", desc: "Connect Stripe and withdraw earnings directly from the widget." },
            { title: "Referral link", desc: "Copy your referral link and earn 10% of every referred developer's earnings." },
          ].map((f) => (
            <div key={f.title} className="bg-white/3 border border-white/8 rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Setup steps */}
        <div className="text-left">
          <h2 className="text-lg font-bold mb-6">Setup</h2>
          <div className="space-y-4">
            {[
              { step: "1", text: "Download the DMG. If macOS says it's damaged, open Terminal and run: xattr -cr ~/Downloads/Spincome.dmg -- then open the DMG again." },
              { step: "2", text: "Drag Spincome to Applications. Right-click (or Control-click) Spincome.app and select \"Open\". macOS will ask to confirm -- click \"Open\". You only need to do this once." },
              { step: "3", text: "Enter your developer key, or register with your email right in the widget." },
              { step: "4", text: "Install the Claude Code hook to start earning (if you haven't already):" },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold">{s.step}</span>
                <p className="text-white/60 text-sm pt-0.5">{s.text}</p>
              </div>
            ))}
            <code className="block bg-white/3 border border-white/8 rounded-lg px-4 py-3 text-sm text-emerald-400 font-mono ml-11">
              npx @brozarti/spincome
            </code>
          </div>
        </div>

        <div className="mt-16 border border-white/8 rounded-xl p-6">
          <p className="text-white/30 text-xs mb-2">Don&apos;t have a Mac?</p>
          <p className="text-white/50 text-sm">
            The terminal hook works on any OS. Run{" "}
            <code className="text-emerald-400 text-xs">npx @brozarti/spincome</code>{" "}
            to get started without the widget.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
