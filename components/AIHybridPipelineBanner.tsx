"use client";

import { PipelineStage } from "@/lib/api";
import { Cpu, ArrowRight, Zap } from "lucide-react";

interface AIHybridPipelineBannerProps {
  stages?: PipelineStage[];
  ticker?: string;
  latencyMs?: number;
  consensusLabel?: string;
}

export default function AIHybridPipelineBanner({
  stages,
  ticker = "AAPL",
  latencyMs = 38,
  consensusLabel = "Consensus: Staged Accumulation",
}: AIHybridPipelineBannerProps) {
  const defaultStages: PipelineStage[] = [
    {
      id: "1",
      name: "Market Feed",
      subtitle: "Live OHLCV & orderbook synchronized",
      details: "OHLCV 250D rolling window, indicator stream",
      badge: "SYNCED",
      badge_color: "green",
    },
    {
      id: "2",
      name: "Trend Forecast",
      subtitle: "$203.60 projection trajectory",
      details: "14D projection, AIC 605.61",
      badge: "+1.49% ROOM",
      badge_color: "blue",
    },
    {
      id: "3",
      name: "Dual-AI Reasoning",
      subtitle: "GPT-4o & Gemini contextual analysis",
      details: "Cross-valuation, news sentiment, 50D SMA",
      badge: "ACCUMULATE",
      badge_color: "cyan",
    },
    {
      id: "4",
      name: "Final Stance",
      subtitle: "Cautious Accumulate active",
      details: "Consensus Hold / Staged Accumulation",
      badge: "ACTIVE SIGNAL",
      badge_color: "green",
    },
  ];

  const activeStages = stages && stages.length > 0 ? stages : defaultStages;

  const badgeClass = (color: string) => {
    if (color === "green")  return "bg-[rgba(16,217,138,0.15)] text-[#10d98a] border-[rgba(16,217,138,0.3)]";
    if (color === "cyan")   return "bg-[rgba(0,212,255,0.15)] text-[var(--accent-cyan)] border-[rgba(0,212,255,0.3)]";
    return                         "bg-[rgba(79,128,255,0.15)] text-[var(--accent-blue)] border-[rgba(79,128,255,0.3)]";
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[rgba(0,212,255,0.04)] rounded-full blur-3xl pointer-events-none" />

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.3)]">
            <Cpu size={20} className="text-[var(--accent-cyan)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-base text-[var(--text-primary)] tracking-tight">
                {ticker} &nbsp;•&nbsp; AI Investment Consensus
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Synthesized quantitative forecast & multi-model reasoning pipeline
            </p>
          </div>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[rgba(16,217,138,0.35)] bg-[rgba(16,217,138,0.08)]">
            <span className="w-2 h-2 rounded-full bg-[#10d98a] animate-pulse" />
            <span className="text-xs font-bold text-[#10d98a]">{consensusLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
            <span className="px-2 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)]">
              Live • {latencyMs}ms
            </span>
          </div>
        </div>
      </div>

      {/* ── 4-Step Pipeline ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {activeStages.map((st, index) => (
          <div key={st.id} className="relative flex items-stretch gap-3">
            {/* Stage card */}
            <div className="flex-1 rounded-2xl border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(0,212,255,0.35)] hover:bg-[rgba(0,212,255,0.03)] transition-all p-4 group">
              {/* Step number + badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[rgba(255,255,255,0.06)] border border-[var(--border-color)] text-xs font-black text-[var(--text-secondary)]">
                  {st.id}
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${badgeClass(st.badge_color)}`}>
                  {st.badge}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-extrabold text-sm text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-cyan)] transition-colors">
                {st.name}
              </h3>
              {/* Subtitle */}
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {st.subtitle}
              </p>
            </div>

            {/* Arrow connector (desktop only) */}
            {index < activeStages.length - 1 && (
              <div className="hidden lg:flex items-center flex-shrink-0 text-[var(--border-color)]">
                <ArrowRight size={14} className="text-[rgba(255,255,255,0.15)]" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Bottom live status bar ────────────────────────────── */}
      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[var(--border-color)] text-[11px] font-mono text-[var(--text-secondary)]">
        <Zap size={12} className="text-[var(--accent-cyan)]" />
        <span>Live Ingestion: ARIMA (p,d,q) + OpenAI & Gemini Multi-LLM Synthesis</span>
        <span className="ml-auto px-2 py-0.5 rounded bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)]">
          Pipeline Latency: {latencyMs}ms
        </span>
      </div>
    </div>
  );
}
