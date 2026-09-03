"use client";

import { InsightData } from "@/lib/api";
import { Brain, AlertTriangle, TrendingUp, Shield, Sparkles, Info } from "lucide-react";

interface InsightPanelProps {
  data: InsightData | null;
  loading?: boolean;
}

export default function InsightPanel({ data, loading }: InsightPanelProps) {
  if (loading) return <InsightSkeleton />;
  if (!data) return null;

  const { signal, confidence, risk_profile, llm_insight } = data;
  const { summary, trend_explanation, divergence_warning, key_risks, disclaimer } = llm_insight;

  const signalConfig = {
    BUY: {
      emoji: "🟢",
      className: "signal-buy",
      color: "#10d98a",
      glow: "0 0 30px rgba(16,217,138,0.12)",
      gradBg: "rgba(16,217,138,0.04)",
    },
    SELL: {
      emoji: "🔴",
      className: "signal-sell",
      color: "#ff4d6d",
      glow: "0 0 30px rgba(255,77,109,0.12)",
      gradBg: "rgba(255,77,109,0.04)",
    },
    HOLD: {
      emoji: "🟡",
      className: "signal-hold",
      color: "#f59e0b",
      glow: "0 0 30px rgba(245,158,11,0.12)",
      gradBg: "rgba(245,158,11,0.04)",
    },
  };

  const cfg = signalConfig[signal] || signalConfig.HOLD;

  return (
    <div
      className="glass-card p-6"
      style={{
        boxShadow: cfg.glow,
        background: `linear-gradient(135deg, ${cfg.gradBg}, transparent 60%)`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(79,128,255,0.2))" }}
          >
            <Brain size={16} className="text-[#a78bfa]" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm">AI Insight</h3>
            <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
              <Sparkles size={10} /> LLM Synthesis · {risk_profile}
            </span>
          </div>
        </div>
        <div className={`text-xl font-black px-4 py-1.5 rounded-xl ${cfg.className}`}>
          {cfg.emoji} {signal}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)]">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{summary}</p>
      </div>

      {/* Trend Explanation */}
      {trend_explanation && trend_explanation.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-[var(--accent-cyan)]" />
            Trend Analysis
          </h4>
          <ul className="space-y-1.5">
            {trend_explanation.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[var(--text-primary)] leading-relaxed"
              >
                <span className="text-[var(--accent-cyan)] mt-1 flex-shrink-0">•</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Divergence Warning */}
      {divergence_warning?.detected && (
        <div className="mb-4 p-3 rounded-xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-[#f59e0b] uppercase tracking-wide">Signal Divergence</span>
            <p className="text-sm text-[var(--text-primary)] mt-0.5 leading-relaxed">
              {divergence_warning.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Key Risks */}
      {key_risks && key_risks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-[#ff4d6d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield size={12} /> Key Risks
          </h4>
          <div className="flex flex-wrap gap-2">
            {key_risks.map((risk, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(255,77,109,0.08)] border border-[rgba(255,77,109,0.2)] text-[#ff8fa3]"
              >
                {risk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confidence */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--text-secondary)]">Signal Confidence</span>
          <span className="font-bold mono" style={{ color: cfg.color }}>{confidence}%</span>
        </div>
        <div className="bg-[rgba(255,255,255,0.05)] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${confidence}%`,
              backgroundColor: cfg.color,
              boxShadow: `0 0 8px ${cfg.color}50`,
            }}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)]">
        <Info size={12} className="text-[var(--text-secondary)] flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{disclaimer}</p>
      </div>
    </div>
  );
}

function InsightSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <div className="shimmer h-8 w-8 rounded-xl" />
          <div className="space-y-1">
            <div className="shimmer h-4 w-20 rounded" />
            <div className="shimmer h-3 w-32 rounded" />
          </div>
        </div>
        <div className="shimmer h-9 w-20 rounded-xl" />
      </div>
      <div className="shimmer h-14 rounded-xl" />
      <div className="space-y-2">
        <div className="shimmer h-4 w-24 rounded" />
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-3/4 rounded" />
      </div>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-6 w-24 rounded-lg" />)}
      </div>
      <div className="shimmer h-1.5 rounded-full" />
    </div>
  );
}
