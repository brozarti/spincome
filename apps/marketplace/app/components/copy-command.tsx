"use client";

import { useState } from "react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = command;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      onClick={copy}
      className="bg-white/5 border border-white/10 rounded-xl p-5 font-mono text-sm flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors group"
    >
      <div>
        <span className="text-white/30 select-none">$ </span>
        <span className="text-emerald-400">{command}</span>
      </div>
      <span className="text-xs text-white/20 group-hover:text-white/40 transition-colors shrink-0 ml-4">
        {copied ? "Copied!" : "Click to copy"}
      </span>
    </div>
  );
}
