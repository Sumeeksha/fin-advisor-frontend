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
    <div className="flex items-center justify-between gap-4 flex-wrap text-xs text-[var(--text-secondary)] mb-4">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 flex-wrap font-medium">
        <span className="hover:text-[var(--text-primary)] cursor-pointer">Equities</span>
        <ChevronRight size={12} className="text-[rgba(255,255,255,0.3)]" />
        <span className="hover:text-[var(--text-primary)] cursor-pointer">{sector}</span>
        <ChevronRight size={12} className="text-[rgba(255,255,255,0.3)]" />
        <span className="font-bold text-[var(--text-primary)]">{companyName} ({ticker})</span>
        <span className="text-[rgba(255,255,255,0.2)]">•</span>
        <span className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.04)] border border-[var(--border-color)] font-mono text-[10px] text-[var(--accent-blue)]">
          {exchange}: {ticker}
        </span>
        <span className="text-[rgba(255,255,255,0.2)]">•</span>
        <span className="flex items-center gap-1 font-bold text-[#10d98a] bg-[rgba(16,217,138,0.1)] px-2 py-0.5 rounded text-[10px] border border-[rgba(16,217,138,0.25)]">
          <Zap size={10} />
          14D FORECAST (+1.5%)
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold transition-all cursor-pointer"
        >
          <Bookmark size={13} className="text-[var(--accent-cyan)]" />
          <span>Watchlist</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold transition-all cursor-pointer"
        >
          <Bell size={13} className="text-[var(--accent-blue)]" />
          <span>Alert ($186.00)</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold transition-all cursor-pointer"
        >
          <Download size={13} />
          <span>Export</span>
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
