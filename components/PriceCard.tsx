"use client";

import { QuoteData, CompanyInfo, formatPrice, formatLargeNumber, formatVolume } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, Building2, Globe, BarChart3 } from "lucide-react";

interface PriceCardProps {
  quote: QuoteData;
  info?: CompanyInfo | null;
  loading?: boolean;
}

export default function PriceCard({ quote, info, loading }: PriceCardProps) {
  if (loading || !quote) return <PriceCardSkeleton />;

  const isUp = quote.change_pct > 0;
  const isDown = quote.change_pct < 0;

  const changeColor = isUp ? "price-up" : isDown ? "price-down" : "price-neutral";
  const glowClass = isUp ? "var(--glow-green)" : isDown ? "var(--glow-red)" : "none";
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <div
      className="glass-card p-6 relative overflow-hidden"
      style={{ boxShadow: glowClass }}
    >
      {/* Background gradient accent */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: isUp
            ? "radial-gradient(circle at top right, #10d98a, transparent 60%)"
            : isDown
            ? "radial-gradient(circle at top right, #ff4d6d, transparent 60%)"
            : "radial-gradient(circle at top right, #f59e0b, transparent 60%)",
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              {quote.ticker}
            </h2>
            <span className="text-xs px-2 py-1 rounded-lg bg-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] font-medium">
              {quote.exchange || "NASDAQ"}
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--color-bull)]">
              <span className="live-pulse w-2 h-2 rounded-full bg-[var(--color-bull)] inline-block" />
              LIVE
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-sm font-medium">
            {info?.name || quote.name}
          </p>
          {info?.sector && (
            <p className="text-xs text-[var(--text-secondary)] opacity-70 mt-0.5">
              {info.sector} · {info.industry}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[rgba(79,128,255,0.15)] flex items-center justify-center">
          <BarChart3 size={22} className="text-[var(--accent-blue)]" />
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end gap-4 mb-5 relative">
        <div>
          <span className="text-5xl font-black mono tracking-tight text-[var(--text-primary)]">
            {quote.currency === "USD" ? "$" : ""}{formatPrice(quote.price)}
          </span>
        </div>
        <div className={`flex flex-col pb-1 ${changeColor}`}>
          <div className="flex items-center gap-1 font-bold text-lg">
            <TrendIcon size={18} />
            {isUp ? "+" : ""}{formatPrice(quote.change)}
          </div>
          <span className="text-sm font-semibold">
            ({isUp ? "+" : ""}{quote.change_pct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative">
        <StatItem label="Open" value={`$${formatPrice(quote.open)}`} />
        <StatItem label="Day High" value={`$${formatPrice(quote.day_high)}`} color="price-up" />
        <StatItem label="Day Low" value={`$${formatPrice(quote.day_low)}`} color="price-down" />
        <StatItem label="Prev Close" value={`$${formatPrice(quote.prev_close)}`} />
        <StatItem label="Volume" value={formatVolume(quote.volume)} />
        <StatItem label="Market Cap" value={formatLargeNumber(quote.market_cap)} />
      </div>

      {/* Extra company info */}
      {info && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border-color)] relative">
          {info.pe_ratio && (
            <div className="text-sm">
              <span className="text-[var(--text-secondary)]">P/E </span>
              <span className="font-semibold text-[var(--text-primary)]">{info.pe_ratio.toFixed(1)}</span>
            </div>
          )}
          {info.eps && (
            <div className="text-sm">
              <span className="text-[var(--text-secondary)]">EPS </span>
              <span className="font-semibold text-[var(--text-primary)]">${info.eps.toFixed(2)}</span>
            </div>
          )}
          {info.beta && (
            <div className="text-sm">
              <span className="text-[var(--text-secondary)]">Beta </span>
              <span className="font-semibold text-[var(--text-primary)]">{info.beta.toFixed(2)}</span>
            </div>
          )}
          {info["52w_high"] && (
            <div className="text-sm">
              <span className="text-[var(--text-secondary)]">52W H </span>
              <span className="font-semibold price-up">${formatPrice(info["52w_high"])}</span>
            </div>
          )}
          {info["52w_low"] && (
            <div className="text-sm">
              <span className="text-[var(--text-secondary)]">52W L </span>
              <span className="font-semibold price-down">${formatPrice(info["52w_low"])}</span>
            </div>
          )}
          {info.website && (
            <a
              href={info.website}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
            >
              <Globe size={16} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3">
      <div className="text-xs text-[var(--text-secondary)] mb-1">{label}</div>
      <div className={`font-bold text-sm mono ${color || "text-[var(--text-primary)]"}`}>{value}</div>
    </div>
  );
}

function PriceCardSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="shimmer h-7 w-24 rounded" />
          <div className="shimmer h-4 w-40 rounded" />
        </div>
        <div className="shimmer w-12 h-12 rounded-2xl" />
      </div>
      <div className="shimmer h-14 w-48 rounded mb-5" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="shimmer h-14 rounded-xl" />)}
      </div>
    </div>
  );
}
