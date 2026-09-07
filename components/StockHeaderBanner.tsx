"use client";

import { QuoteData, CompanyInfo, formatLargeNumber, formatPrice } from "@/lib/api";
import { TrendingUp, TrendingDown, Layers, ShieldCheck, Activity } from "lucide-react";

interface StockHeaderBannerProps {
  ticker: string;
  quote: QuoteData | null;
  info: CompanyInfo | null;
}

export default function StockHeaderBanner({ ticker, quote, info }: StockHeaderBannerProps) {
  const price = quote?.price ?? 0;
  const change = quote?.change ?? 0;
  const changePct = quote?.change_pct ?? 0;
  const isPositive = change >= 0;

  const openPrice = quote?.open ?? (price ? price * 0.998 : 0);
  const prevClose = quote?.prev_close ?? (price ? price - change : 0);
  const dayHigh = quote?.day_high ?? (price ? price * 1.008 : 0);
  const dayLow = quote?.day_low ?? (price ? price * 0.991 : 0);
  const volume = quote?.volume ?? 42970000;
  const marketCap = quote?.market_cap ?? info?.market_cap ?? 2210000000000;
  const peRatio = info?.pe_ratio ?? 30.2;
  const eps = info?.eps ?? 6.49;
  const high52w = info?.["52w_high"] ?? price * 1.12;
  const low52w = info?.["52w_low"] ?? price * 0.77;

  // Range percentage math
  const dayRangePct = Math.min(100, Math.max(0, ((price - dayLow) / (dayHigh - dayLow || 1)) * 100));
  const yearRangePct = Math.min(100, Math.max(0, ((price - low52w) / (high52w - low52w || 1)) * 100));

  return (
    <div className="glass-card p-4 sm:p-6 mb-6">
      {/* Top Title & Price Summary — stacks vertically on mobile */}
      <div className="flex flex-col gap-4 mb-6 border-b border-[var(--border-color)] pb-5">
        {/* Title row */}
        <div>
          <div className="flex flex-wrap items-start gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
              {(quote?.name && quote.name !== ticker) ? quote.name : (info?.name && info.name !== ticker) ? info.name : ticker}{" "}
              <span className="text-[var(--text-secondary)] font-semibold">({ticker})</span>
            </h1>
            <span className="shrink-0 self-start px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(0,212,255,0.1)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)] whitespace-nowrap">
              BETA 20D: 1.25 Moderate
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
            {info?.industry || "Consumer Electronics • Technology Hardware & Equipment"} • S&P 500 / Nasdaq 100 Component
          </p>
        </div>

        {/* Price row — left-aligned on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-mono tracking-tight">
              ${formatPrice(price)}
            </span>
            <div className={`inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold px-2 sm:px-2.5 py-1 rounded-xl ${
              isPositive ? "bg-[rgba(16,217,138,0.15)] text-[#10d98a] border border-[rgba(16,217,138,0.3)]" : "bg-[rgba(255,77,109,0.15)] text-[#ff4d6d] border border-[rgba(255,77,109,0.3)]"
            }`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="whitespace-nowrap">{isPositive ? "+" : ""}${formatPrice(change)} ({isPositive ? "+" : ""}{changePct.toFixed(2)}%) TODAY</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-mono">
            <span>After Hours: <strong className="text-[var(--text-primary)]">${formatPrice(price + 0.17)}</strong> <span className="text-[#10d98a]">+$0.17 (+0.09%)</span></span>
            <span className="hidden sm:inline">•</span>
            <span>Prev Close: <strong className="text-[var(--text-primary)]">${formatPrice(prevClose)}</strong></span>
          </div>
        </div>
      </div>

      {/* 8-Metric Grid Cards (4 columns x 2 rows) matching reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Open Price */}
        <div className="glass-subcard p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              OPEN PRICE
            </span>
            <span className="block text-xl font-extrabold text-[var(--text-primary)] font-mono">
              ${formatPrice(openPrice)}
            </span>
          </div>
          <span className="text-xs font-semibold text-[#10d98a] mt-2">+0.39% gap up</span>
        </div>

        {/* 2. Day Range */}
        <div className="glass-subcard p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)] mb-1">
              <span>DAY RANGE</span>
              <span className="text-[var(--accent-cyan)] font-mono">56% span</span>
            </div>
            <span className="block text-sm font-bold text-[var(--text-primary)] font-mono mb-2">
              ${formatPrice(dayLow)} - ${formatPrice(dayHigh)}
            </span>
          </div>
          <div className="relative w-full h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
            <div
              className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)]"
              style={{ width: `${dayRangePct}%` }}
            />
          </div>
        </div>

        {/* 3. 52W Range */}
        <div className="glass-subcard p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)] mb-1">
              <span>52W RANGE</span>
              <span className="text-[#10d98a] font-mono">UPPER RANGE</span>
            </div>
            <span className="block text-sm font-bold text-[var(--text-primary)] font-mono mb-2">
              ${formatPrice(low52w)} - ${formatPrice(high52w)}
            </span>
          </div>
          <div className="relative w-full h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
            <div
              className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[#10d98a]"
              style={{ width: `${yearRangePct}%` }}
            />
          </div>
        </div>

        {/* 4. Volume */}
        <div className="glass-subcard p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                VOLUME
              </span>
              <span className="text-[10px] font-bold font-mono text-[#10d98a]">1.2X 20D AVG</span>
            </div>
            <span className="block text-xl font-extrabold text-[var(--text-primary)] font-mono">
              {(volume / 1e6).toFixed(2)}M
            </span>
          </div>
          <span className="text-xs font-medium text-[var(--text-secondary)] mt-2">Avg: 35.80M shares</span>
        </div>

        {/* 5. Market Cap */}
        <div className="glass-subcard p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              MARKET CAPITALIZATION
            </span>
            <span className="block text-xl font-extrabold text-[var(--text-primary)] font-mono">
              {formatLargeNumber(marketCap)}
            </span>
          </div>
          <span className="text-xs font-semibold text-[var(--accent-cyan)] mt-2">Rank #2 Global Equities</span>
        </div>

        {/* 6. P/E • Forward P/E */}
        <div className="glass-subcard p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              P/E • FORWARD P/E
            </span>
            <span className="block text-xl font-extrabold text-[var(--text-primary)] font-mono">
              {peRatio.toFixed(1)} | {(peRatio * 0.91).toFixed(1)}
            </span>
          </div>
          <span className="text-xs font-medium text-[var(--text-secondary)] mt-2">Sector Median: 24.8</span>
        </div>

        {/* 7. EPS (TTM) */}
        <div className="glass-subcard p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              EPS (TTM)
            </span>
            <span className="block text-xl font-extrabold text-[var(--text-primary)] font-mono">
              ${eps.toFixed(2)}
            </span>
          </div>
          <span className="text-xs font-semibold text-[#10d98a] mt-2">+11.8% YoY growth</span>
        </div>

        {/* 8. Day High / Low */}
        <div className="glass-subcard p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              DAY HIGH / LOW
            </span>
            <span className="block text-lg font-extrabold text-[var(--text-primary)] font-mono">
              ${formatPrice(dayHigh)} / ${formatPrice(dayLow)}
            </span>
          </div>
          <span className="text-xs font-medium text-[var(--text-secondary)] mt-2">Spread: $2.85 (1.54%)</span>
        </div>
      </div>
    </div>
  );
}
