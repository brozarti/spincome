"use client";

import { useState } from "react";
import Link from "next/link";

interface FormState {
  advertiserEmail: string;
  advertiserName: string;
  headline: string;
  body: string;
  cta: string;
  clickUrl: string;
  maxCpmBid: string;
  budget: string;
  targetLanguages: string;
  targetFrameworks: string;
  deliverySpeed: string;
  brandIcon: string;
}

const STATS = [
  { value: "100%", label: "senior devs" },
  { value: "$25+", label: "avg CPM" },
  { value: "10s", label: "avg view time" },
  { value: "0", label: "ad blockers" },
];

const LOGOS = ["Vercel", "Supabase", "Railway", "Sentry", "PlanetScale", "Render"];

export default function AdvertisePage() {
  const [form, setForm] = useState<FormState>({
    advertiserEmail: "",
    advertiserName: "",
    headline: "",
    body: "",
    cta: "",
    clickUrl: "",
    maxCpmBid: "25",
    budget: "10",
    targetLanguages: "",
    targetFrameworks: "",
    deliverySpeed: "medium",
    brandIcon: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [campaignId, setCampaignId] = useState("");

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const maxCpmCents = Math.round(parseFloat(form.maxCpmBid) * 100);
    const budgetCents = Math.round(parseFloat(form.budget) * 100);
    if (!maxCpmCents || !budgetCents || maxCpmCents < 100 || budgetCents < 1000) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/advertisers/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserEmail: form.advertiserEmail,
          advertiserName: form.advertiserName,
          headline: form.headline,
          body: form.body,
          cta: form.cta,
          clickUrl: form.clickUrl,
          maxCpmCents,
          budgetCents,
          targetLanguages: form.targetLanguages.trim() || null,
          targetFrameworks: form.targetFrameworks.trim() || null,
          deliverySpeed: form.deliverySpeed,
          brandIconBase64: form.brandIcon || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setCampaignId(data.campaignId);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-emerald-400 text-5xl mb-6">✓</div>
          <h1 className="text-2xl font-bold mb-2">Campaign live</h1>
          <p className="text-white/50 text-sm mb-2">
            Your ad is in the real-time auction. You only pay when you win.
          </p>
          <p className="text-white/30 text-xs font-mono">Campaign ID: {campaignId}</p>
        </div>
      </main>
    );
  }

  const impressions =
    Math.floor((parseFloat(form.budget) / parseFloat(form.maxCpmBid)) * 1000) || 0;
  const isTargeted = form.targetLanguages.trim() || form.targetFrameworks.trim();

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="font-bold text-lg tracking-tight">spincome.io</Link>
        <div className="flex items-center gap-6">
          <Link href="/bids" className="text-sm text-white/40 hover:text-white transition-colors">Live bids</Link>
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">My campaigns</Link>
          <Link href="/setup" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Install free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
          The only ad network with zero ad blockers
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Your ad inside<br />
          <span className="text-emerald-400">every Claude Code session</span>
        </h1>
        <p className="text-white/50 text-xl max-w-2xl mx-auto mb-12">
          Developers see spincome ads between tool calls -- while they are actively coding.
          No banners. No pop-ups. No ad blockers. Just your message at the exact moment
          they need a better tool.
        </p>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="bg-black/60 py-6 px-4">
              <p className="text-3xl font-bold text-emerald-400 mb-1">{s.value}</p>
              <p className="text-white/40 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="text-left bg-white/3 border border-white/8 rounded-xl p-6 mb-16 font-mono text-sm">
          <p className="text-white/30 text-xs mb-3 font-sans uppercase tracking-widest">What devs see in their terminal</p>
          <p className="text-white/20">──────────────────────────────────────────────────────────────</p>
          <p className="text-white/40"> Sponsored · <span className="text-white/60">Your Company</span> · TypeScript dev</p>
          <p className="text-white font-bold"> Deploy in seconds, not hours</p>
          <p className="text-white/50"> The platform that ships 10x faster. No DevOps required.</p>
          <p className="text-white/20"> </p>
          <p> <span className="text-cyan-400">Try free for 14 days</span>  <span className="text-white/30">https://yoursite.com</span></p>
          <p className="text-white/20"> </p>
          <p className="text-emerald-400"> +$0.0125 earned  <span className="text-white/30">session: $0.2500</span></p>
          <p className="text-white/20">──────────────────────────────────────────────────────────────</p>
        </div>

        {/* Why it works */}
        <div className="grid grid-cols-3 gap-6 mb-16 text-left">
          <div className="bg-white/3 border border-white/8 rounded-xl p-6">
            <p className="text-emerald-400 text-2xl mb-3">01</p>
            <h3 className="font-semibold mb-2">Zero ad blockers</h3>
            <p className="text-white/40 text-sm">Rendered in the terminal, not the browser. uBlock Origin cannot touch it.</p>
          </div>
          <div className="bg-white/3 border border-white/8 rounded-xl p-6">
            <p className="text-emerald-400 text-2xl mb-3">02</p>
            <h3 className="font-semibold mb-2">Pinpoint targeting</h3>
            <p className="text-white/40 text-sm">Target by language (TypeScript, Python, Rust) or framework (Next.js, FastAPI). Win the auction only when your audience is active.</p>
          </div>
          <div className="bg-white/3 border border-white/8 rounded-xl p-6">
            <p className="text-emerald-400 text-2xl mb-3">03</p>
            <h3 className="font-semibold mb-2">Second-price auction</h3>
            <p className="text-white/40 text-sm">You set a max bid. You pay one cent above the next bidder. Never overpay. Budget goes further.</p>
          </div>
        </div>

        {/* Social proof placeholder */}
        <div className="border border-white/5 rounded-xl px-8 py-6 mb-16">
          <p className="text-white/20 text-xs uppercase tracking-widest mb-6">Built for companies like</p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {LOGOS.map((l) => (
              <span key={l} className="text-white/25 font-semibold text-lg">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign form */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold mb-2">Launch your campaign</h2>
        <p className="text-white/40 text-sm mb-10">Minimum $10 budget. Live in minutes after payment.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Fieldset legend="Your account">
            <Field label="Company or product name" value={form.advertiserName} onChange={set("advertiserName")} required />
            <Field label="Email" type="email" value={form.advertiserEmail} onChange={set("advertiserEmail")} required />
          </Fieldset>

          <Fieldset legend="Ad creative">
            <Field label="Headline (max 80 chars)" value={form.headline} onChange={set("headline")} maxLength={80} placeholder="Deploy in seconds, not hours" required />
            <div>
              <label className="block text-xs text-white/40 mb-1">Body (max 200 chars)</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                rows={3}
                value={form.body}
                onChange={set("body")}
                maxLength={200}
                placeholder="The platform that ships 10x faster. No DevOps required."
                required
              />
            </div>
            <Field label='CTA text (e.g. "Try free for 14 days")' value={form.cta} onChange={set("cta")} maxLength={40} required />
            <Field label="Destination URL" type="url" value={form.clickUrl} onChange={set("clickUrl")} required />
          </Fieldset>

          <Fieldset legend="Targeting">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/30 text-xs">Leave blank to reach all active developers. Targeted bids beat untargeted bids in the auction.</p>
              {isTargeted && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full whitespace-nowrap ml-4">
                  Targeted
                </span>
              )}
            </div>
            <Field label="Languages (comma-separated)" placeholder="typescript, python, rust" value={form.targetLanguages} onChange={set("targetLanguages")} />
            <Field label="Frameworks (comma-separated)" placeholder="nextjs, react, fastapi, django" value={form.targetFrameworks} onChange={set("targetFrameworks")} />
          </Fieldset>

          {/* Live ad preview */}
          {form.headline && (
            <div className="pt-6 border-t border-white/8">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Live preview</p>
              <div className="bg-black border border-white/10 rounded-lg p-4 font-mono text-sm">
                <p className="text-white/20">{"─".repeat(50)}</p>
                <p className="text-white/40"> Sponsored · {form.advertiserName || "Your Company"}{isTargeted ? ` · ${(form.targetLanguages || form.targetFrameworks).split(",")[0].trim()} dev` : ""}</p>
                <p className="text-white font-bold"> {form.headline}</p>
                <p className="text-white/50"> {form.body}</p>
                <p> </p>
                <p> <span className="text-cyan-400">{form.cta || "Learn more"}</span>  <span className="text-white/30">{form.clickUrl || "https://..."}</span></p>
                <p> </p>
                <p className="text-emerald-400"> +$0.0125 earned  <span className="text-white/30">session: $0.2500</span></p>
                <p className="text-white/20">{"─".repeat(50)}</p>
              </div>
            </div>
          )}

          <Fieldset legend="Bid & budget">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Max CPM bid ($)" type="number" min="1" step="0.5" value={form.maxCpmBid} onChange={set("maxCpmBid")} required />
              <Field label="Total budget ($)" type="number" min="10" step="5" value={form.budget} onChange={set("budget")} required />
            </div>
            <div className="bg-white/3 border border-white/8 rounded-lg p-4 text-sm">
              <p className="text-white/60">
                Estimated <span className="text-white font-semibold">{impressions.toLocaleString()} impressions</span> at ${form.maxCpmBid} CPM with ${form.budget} budget.
              </p>
              <p className="text-white/30 text-xs mt-1">
                Actual cost uses second-price auction -- you usually pay less than your max bid.
              </p>
            </div>
          </Fieldset>

          <Fieldset legend="Delivery & branding">
            <div>
              <label className="block text-xs text-white/40 mb-2">Delivery speed</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "slow", label: "Slow", desc: "~2 days" },
                  { value: "medium", label: "Medium", desc: "~6 hours" },
                  { value: "fast", label: "Fast", desc: "ASAP" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, deliverySpeed: opt.value }))}
                    className={`border rounded-lg p-3 text-left transition-colors ${
                      form.deliverySpeed === opt.value
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <p className={`text-sm font-medium ${form.deliverySpeed === opt.value ? "text-emerald-400" : "text-white"}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-white/30">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Brand icon (optional, max 64KB)</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="w-full text-sm text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file || file.size > 65536) return;
                  const reader = new FileReader();
                  reader.onload = () => setForm((f) => ({ ...f, brandIcon: reader.result as string }));
                  reader.readAsDataURL(file);
                }}
              />
              {form.brandIcon && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={form.brandIcon} alt="Brand icon" className="w-8 h-8 rounded" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, brandIcon: "" }))}
                    className="text-xs text-white/30 hover:text-white/50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </Fieldset>

          {status === "error" && (
            <p className="text-red-400 text-sm">Something went wrong. Min bid $1 CPM, min budget $10.</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-colors text-base"
          >
            {status === "submitting" ? "Redirecting to payment..." : "Launch campaign"}
          </button>

          <p className="text-center text-white/20 text-xs">
            Stripe-secured payment. Campaign activates immediately after payment clears.
          </p>
        </form>
      </section>
    </main>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 pt-6 border-t border-white/8">
      <legend className="text-xs text-white/30 uppercase tracking-widest mb-4">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label, value, onChange, type = "text", required, maxLength, min, step, placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  min?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1">{label}</label>
      <input
        type={type}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        min={min}
        step={step}
        placeholder={placeholder}
      />
    </div>
  );
}
