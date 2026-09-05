"use client";

import { AdviceData, formatPrice } from "@/lib/api";
import { ShieldAlert, Target, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

interface AdvicePanelProps {
  data: AdviceData | null;
  loading?: boolean;
}

export default function AdvicePanel({ data, loading }: AdvicePanelProps) {
  if (loading) return <AdviceSkeleton />;
  if (!data) return null;

  const { signal, confidence, trend, reasons, risk_factors, entry_range, exit_target, stop_loss, disclaimer } = data;

  const signalConfig = {
    BUY: {
      label: "BUY",
      emoji: "🟢",
      className: "signal-buy",
      color: "#10d98a",
      bg: "rgba(16,217,138,0.05)",
      glow: "0 0 40px rgba(16,217,138,0.15)",
    },
    SELL: {
      label: "SELL",
      emoji: "🔴",
      className: "signal-sell",
      color: "#ff4d6d",
      bg: "rgba(255,77,109,0.05)",
      glow: "0 0 40px rgba(255,77,109,0.15)",
    },
    HOLD: {
      label: "HOLD",
      emoji: "🟡",
      className: "signal-hold",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.05)",
      glow: "0 0 40px rgba(245,158,11,0.15)",
    },
  };

  const cfg = signalConfig[signal];
  const trendColor = trend === "bullish" ? "#10d98a" : trend === "bearish" ? "#ff4d6d" : "#f59e0b";

  return (
    <div className="glass-card p-6" style={{ boxShadow: cfg.glow, background: `linear-gradient(135deg, ${cfg.bg}, transparent 50%)` }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-bold text-[var(--text-primary)] mb-1">AI Recommendation</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Market Trend:</span>
            <span className="text-xs font-bold capitalize" style={{ color: trendColor }}>
              {trend === "bullish" ? "▲" : trend === "bearish" ? "▼" : "→"} {trend}
            </span>
          </div>
        </div>
        <div className={`text-3xl font-black px-5 py-2.5 rounded-2xl ${cfg.className}`}>
          {cfg.emoji} {cfg.label}
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[var(--text-secondary)] font-medium">Signal Confidence</span>
          <span className="font-bold mono" style={{ color: cfg.color }}>{confidence}%</span>
        </div>
        <div className="bg-[rgba(255,255,255,0.05)] rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full confidence-bar-fill"
            style={{ width: `${confidence}%`, backgroundColor: cfg.color, boxShadow: `0 0 10px ${cfg.color}60` }}
          />
        </div>
      </div>

      {/* Price Levels */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <LevelCard
          label="Entry Range"
          value={`$${formatPrice(entry_range.low)} – $${formatPrice(entry_range.high)}`}
          icon={<Target size={14} />}
          color="#4f80ff"
        />
        <LevelCard
          label="Price Target"
          value={`$${formatPrice(exit_target)}`}
          icon={<TrendingUp size={14} />}
          color="#10d98a"
        />
        <LevelCard
          label="Stop Loss"
          value={`$${formatPrice(stop_loss)}`}
          icon={<TrendingDown size={14} />}
          color="#ff4d6d"
        />
      </div>

      {/* Evidence */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Analysis Evidence
        </h4>
        <div className="space-y-2">
          {reasons.map((r, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.01]
                ${r.sentiment === "bullish"
                  ? "bg-[rgba(16,217,138,0.06)] border border-[rgba(16,217,138,0.15)]"
                  : r.sentiment === "bearish"
                  ? "bg-[rgba(255,77,109,0.06)] border border-[rgba(255,77,109,0.15)]"
                  : "glass-subcard border border-[var(--border-color)]"
                }`}
            >
              <span className="text-base flex-shrink-0 mt-0.5">{r.icon}</span>
              <span className="text-[var(--text-primary)] leading-relaxed">{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      {risk_factors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-[#ff4d6d] uppercase tracking-wider mb-2 flex items-center gap-1">
            <ShieldAlert size={12} /> Risk Factors
          </h4>
          <div className="flex flex-wrap gap-2">
            {risk_factors.map((r, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.2)] text-[#ff4d6d]">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl glass-subcard">
        <AlertTriangle size={14} className="text-[var(--color-neutral)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{disclaimer}</p>
      </div>
    </div>
  );
}

function LevelCard({
  label, value, icon, color
}: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-subcard rounded-xl p-3 text-center">
      <div className="flex items-center justify-center gap-1 mb-1" style={{ color }}>
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div className="mono font-bold text-xs text-[var(--text-primary)] leading-tight">{value}</div>
    </div>
  );
}

function AdviceSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex justify-between">
        <div className="shimmer h-6 w-36 rounded" />
        <div className="shimmer h-10 w-24 rounded-2xl" />
      </div>
      <div className="shimmer h-2.5 rounded-full" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
      </div>
      {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />)}
    </div>
  );
}
