"use client";

import { PipelineStage } from "@/lib/api";
import { Cpu, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Layers } from "lucide-react";

interface AIHybridPipelineBannerProps {
  stages?: PipelineStage[];
}

export default function AIHybridPipelineBanner({ stages }: AIHybridPipelineBannerProps) {
  const defaultStages: PipelineStage[] = [
    {
      id: "01",
      name: "DATA INGESTION",
      subtitle: "Market & Indicator Feed",
      details: "OHLCV 250D rolling window, technical indicators stream (WTI, MACD, RSI, SMA)",
      badge: "Synced",
      badge_color: "green",
    },
    {
      id: "02",
      name: "TIME-SERIES PATH",
      subtitle: "ARIMA (2,1,2) Forecaster",
      details: "Deterministic ARIMA model, 14-day statistical projection (AIC: 842.1, p = 0.01)",
      badge: "+1.49% Room",
      badge_color: "blue",
    },
    {
      id: "03",
      name: "MULTI-LLM REASONING",
      subtitle: "GPT-4o & Gemini 1.5 Pro",
      details: "Cross-valuation, macro news sentiment, 50-day SMA resistance cross-validation",
      badge: "Accumulate",
      badge_color: "cyan",
    },
    {
      id: "04",
      name: "RECONCILED OUTPUT",
      subtitle: "Executive Conviction",
      details: "Consensus: Hold / Cautious Accumulate ($179.13 - $185.00, 12M Target: $195.75)",
      badge: "HOLD / ACCUMULATE",
      badge_color: "green",
    },
  ];

  const activeStages = stages && stages.length > 0 ? stages : defaultStages;

  return (
    <div className="glass-card p-6 mb-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[rgba(0,212,255,0.03)] rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] text-[var(--accent-cyan)]">
            <Cpu size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-[var(--text-primary)] tracking-tight">
                AI Hybrid Engine • Dual-Tier Quantitative & Generative Pipeline
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[rgba(79,128,255,0.15)] text-[var(--accent-blue)] border border-[rgba(79,128,255,0.3)] uppercase">
                ARIMA PROJ: V4.12
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[rgba(16,217,138,0.15)] text-[#10d98a] border border-[rgba(16,217,138,0.3)] uppercase">
                CONSENSUS: SYNTHESIZED
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Statistical autoregressive pricing unified with multi-model contextual generative reasoning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-[#10d98a] animate-pulse" />
          <span>Live Ingestion: ARIMA (p,d,q) + OpenAI & Gemini Multi-LLM Synthesis</span>
          <span className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-[var(--text-secondary)]">
            Pipeline Latency: 42ms
          </span>
        </div>
      </div>

      {/* 4-Stage Flow Architecture Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {activeStages.map((st, index) => {
          const badgeStyle =
            st.badge_color === "green"
              ? "bg-[rgba(16,217,138,0.15)] text-[#10d98a] border-[rgba(16,217,138,0.3)]"
              : st.badge_color === "cyan"
              ? "bg-[rgba(0,212,255,0.15)] text-[var(--accent-cyan)] border-[rgba(0,212,255,0.3)]"
              : "bg-[rgba(79,128,255,0.15)] text-[var(--accent-blue)] border-[rgba(79,128,255,0.3)]";

          return (
            <div
              key={st.id}
              className="glass-subcard p-4 rounded-xl relative group hover:border-[rgba(0,212,255,0.4)] transition-all"
            >
              {/* Connector line on desktop */}
              {index < activeStages.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[var(--border-color)]">
                  <ArrowRight size={14} className="text-[rgba(255,255,255,0.2)]" />
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-[var(--accent-cyan)] tracking-wider">
                  {st.id} / {st.name}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${badgeStyle}`}>
                  {st.badge}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-[var(--text-primary)] mb-1">
                {st.subtitle}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {st.details}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
