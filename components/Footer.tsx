"use client";

import { Sparkles, ShieldCheck, Cpu, Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--header-bg)] py-6 mt-12 text-xs text-[var(--text-secondary)]">
      <div className="max-w-[1700px] mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="FinAdvisor Logo" className="w-6 h-6 rounded-lg shadow-sm object-cover" />
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-sm text-[var(--text-primary)]">
              Fin<span className="text-[var(--accent-cyan)]">Advisor</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider px-1 py-0.2 rounded bg-[rgba(0,212,255,0.15)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)]">
              AI PRO
            </span>
          </div>
          <span className="text-[var(--border-color)]">|</span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10d98a]" />
            Institutional Terminal v4.12.0 - Low Latency Direct Feed
          </span>
        </div>

        {/* Center: Legal Links */}
        <div className="flex items-center gap-4 text-[11px] font-medium flex-wrap">
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Execution Policies</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">SEC Disclosures</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">API Integration</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terminal Status</a>
        </div>

        {/* Right: Copyright */}
        <div className="text-[11px]">
          © {new Date().getFullYear()} FinAdvisor Technologies Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
