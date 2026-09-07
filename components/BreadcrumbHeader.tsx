"use client";

import { Bookmark, Bell, Download, MoreHorizontal, ChevronRight, Zap } from "lucide-react";
import { QuoteData, CompanyInfo } from "@/lib/api";

interface BreadcrumbHeaderProps {
  ticker: string;
  quote: QuoteData | null;
  info: CompanyInfo | null;
}

export default function BreadcrumbHeader({ ticker, quote, info }: BreadcrumbHeaderProps) {
  const companyName = quote?.name || info?.name || ticker;
  const sector = info?.sector || "Mega-Cap Tech";
  const exchange = quote?.exchange || "NASDAQ";

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 text-xs text-[var(--text-secondary)] mb-4 min-w-0">
      {/* Left: Breadcrumbs — truncate on mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 font-medium flex-wrap min-w-0">
        <span className="hidden sm:inline hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap">Equities</span>
        <ChevronRight size={12} className="hidden sm:inline text-[rgba(255,255,255,0.3)]" />
        <span className="hidden sm:inline hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap">{sector}</span>
        <ChevronRight size={12} className="hidden sm:inline text-[rgba(255,255,255,0.3)]" />
        <span className="font-bold text-[var(--text-primary)] truncate max-w-[120px] sm:max-w-none">{companyName} ({ticker})</span>
        <span className="hidden sm:inline text-[rgba(255,255,255,0.2)]">•</span>
        <span className="px-1.5 sm:px-2 py-0.5 rounded bg-[rgba(255,255,255,0.04)] border border-[var(--border-color)] font-mono text-[10px] text-[var(--accent-blue)] whitespace-nowrap">
          {exchange}: {ticker}
        </span>
        <span className="hidden sm:inline text-[rgba(255,255,255,0.2)]">•</span>
        <span className="flex items-center gap-1 font-bold text-[#10d98a] bg-[rgba(16,217,138,0.1)] px-1.5 sm:px-2 py-0.5 rounded text-[10px] border border-[rgba(16,217,138,0.25)] whitespace-nowrap">
          <Zap size={10} />
          <span className="hidden xs:inline">14D FORECAST </span>(+1.5%)
        </span>
      </div>

      {/* Right: Actions — icon-only on mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold transition-all cursor-pointer"
        >
          <Bell size={13} className="text-[var(--accent-blue)]" />
          <span className="hidden sm:inline">Alert {quote?.price ? `($${quote.price.toFixed(2)})` : ""}</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold transition-all cursor-pointer"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          type="button"
          className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border-color)] text-[var(--text-secondary)] transition-all cursor-pointer"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}
