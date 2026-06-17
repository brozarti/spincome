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
}

export default function AdvertisePage() {
  const [form, setForm] = useState<FormState>({
    advertiserEmail: "",
    advertiserName: "",
    headline: "",
    body: "",
    cta: "",
    clickUrl: "",
    maxCpmBid: "5",
    budget: "50",
    targetLanguages: "",
    targetFrameworks: "",
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
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
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
          <div className="text-emerald-400 text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Campaign live</h1>
          <p className="text-white/50 text-sm mb-6">
            Your ad is in the auction. Campaign ID:{" "}
            <code className="text-white/80">{campaignId}</code>
          </p>
          <p className="text-white/40 text-xs">
            You only pay when you win the auction -- and you only win when a matching developer is active.
          </p>
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
        <Link href="/setup" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Install free</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Advertise to developers</h1>
        <p className="text-white/50 mb-10">
          Real-time auction. You set a max CPM bid -- you only pay what it takes to win.
          Target by language or framework to reach the exact developers you want.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account */}
          <fieldset className="space-y-4">
            <legend className="text-xs text-white/40 uppercase tracking-widest mb-4">Your account</legend>
            <Field label="Company / Name" value={form.advertiserName} onChange={set("advertiserName")} required />
            <Field label="Email" type="email" value={form.advertiserEmail} onChange={set("advertiserEmail")} required />
          </fieldset>

          {/* Ad creative */}
          <fieldset className="space-y-4 pt-4 border-t border-white/10">
            <legend className="text-xs text-white/40 uppercase tracking-widest mb-4">Ad creative</legend>
            <Field label="Headline (max 80 chars)" value={form.headline} onChange={set("headline")} maxLength={80} required />
            <div>
              <label className="block text-xs text-white/50 mb-1">Body (max 200 chars)</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                rows={3}
                value={form.body}
                onChange={set("body")}
                maxLength={200}
                required
              />
            </div>
            <Field label='CTA text (e.g. "Try free")' value={form.cta} onChange={set("cta")} maxLength={40} required />
            <Field label="Destination URL" type="url" value={form.clickUrl} onChange={set("clickUrl")} required />
          </fieldset>

          {/* Targeting */}
          <fieldset className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <legend className="text-xs text-white/40 uppercase tracking-widest">Targeting</legend>
              {isTargeted && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Premium CPM eligible
                </span>
              )}
            </div>
            <p className="text-white/30 text-xs -mt-2">
              Leave blank to reach all developers. Targeted campaigns win auctions against untargeted ones when the developer matches.
            </p>
            <Field
              label="Target languages (comma-separated)"
              placeholder="typescript, python, rust"
              value={form.targetLanguages}
              onChange={set("targetLanguages")}
            />
            <Field
              label="Target frameworks (comma-separated)"
              placeholder="nextjs, react, fastapi, django"
              value={form.targetFrameworks}
              onChange={set("targetFrameworks")}
            />
          </fieldset>

          {/* Budget */}
          <fieldset className="space-y-4 pt-4 border-t border-white/10">
            <legend className="text-xs text-white/40 uppercase tracking-widest mb-4">Bid & budget</legend>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Max CPM bid ($)" type="number" min="1" step="0.5" value={form.maxCpmBid} onChange={set("maxCpmBid")} required />
              <Field label="Total budget ($)" type="number" min="10" step="5" value={form.budget} onChange={set("budget")} required />
            </div>
            <p className="text-white/40 text-xs">
              Est. up to {impressions.toLocaleString()} impressions at ${form.maxCpmBid} CPM with ${form.budget} budget.
              Actual cost is second-price -- you often pay less than your max bid.
              Clicks cost 50x the winning impression rate.
            </p>
          </fieldset>

          {status === "error" && (
            <p className="text-red-400 text-sm">
              Something went wrong. Minimum bid $1 CPM, minimum budget $10.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            {status === "submitting" ? "Creating campaign..." : "Launch campaign"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  maxLength,
  min,
  step,
  placeholder,
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
      <label className="block text-xs text-white/50 mb-1">{label}</label>
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
