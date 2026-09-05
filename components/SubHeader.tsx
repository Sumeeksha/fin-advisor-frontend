"use client";

import { useState, useEffect } from "react";
import { Activity, BarChart2, Cpu, FileText, Newspaper, PieChart, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

export type SubTabId =
  | "overview"
  | "indicators"
  | "forecast"
  | "chat"
  | "financials"
  | "news"
  | "options";

interface SubHeaderProps {
  activeTab: SubTabId;
  onTabChange: (tab: SubTabId) => void;
}

const TABS: { id: SubTabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "indicators", label: "Technical Indicators", icon: BarChart2 },
  { id: "forecast", label: "AI Forecast & Valuation", icon: Cpu },
  { id: "chat", label: "AI Copilot & Simulator", icon: MessageSquare },
  { id: "financials", label: "Financials & SEC Filings", icon: FileText },
  { id: "news", label: "News & Sentiment", icon: Newspaper },
  { id: "options", label: "Options Flow & Dark Pool", icon: PieChart },
];

export default function SubHeader({ activeTab, onTabChange }: SubHeaderProps) {
  const [indices, setIndices] = useState([
    { label: "S&P 500", price: "5,117.09", change: "+0.42%", isUp: true },
    { label: "NASDAQ", price: "16,288.36", change: "+0.85%", isUp: true },
  ]);

  useEffect(() => {
    let mounted = true;
    api.getMarketRibbon().then((data) => {
      if (!mounted || !data) return;
      const sp = data.find((d) => d.symbol === "^GSPC" || d.label === "S&P 500");
      const nas = data.find((d) => d.symbol === "^IXIC" || d.label === "NASDAQ");

      if (sp || nas) {
        const updated = [];
        if (sp) {
          const isUp = sp.change_pct >= 0;
          updated.push({
            label: "S&P 500",
            price: sp.price.toLocaleString("en-US", { minimumFractionDigits: 2 }),
            change: `${isUp ? "+" : ""}${sp.change_pct.toFixed(2)}%`,
            isUp,
          });
        }
        if (nas) {
          const isUp = nas.change_pct >= 0;
          updated.push({
            label: "NASDAQ",
            price: nas.price.toLocaleString("en-US", { minimumFractionDigits: 2 }),
            change: `${isUp ? "+" : ""}${nas.change_pct.toFixed(2)}%`,
            isUp,
          });
        }
        if (updated.length > 0) setIndices(updated);
      }
    }).catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-[var(--bg-secondary)] backdrop-blur-md border-b border-[var(--border-color)] overflow-x-auto no-scrollbar scrollbar-none transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-4 flex items-center justify-between gap-4">
        {/* Left: Tab list */}
        <div className="flex items-center gap-1.5 py-1.5 min-w-max flex-nowrap overflow-x-auto no-scrollbar scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive
                    ? "bg-[rgba(0,212,255,0.12)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-subtle)] border border-transparent"
                }`}
              >
                <Icon size={14} className={`shrink-0 ${isActive ? "text-[var(--accent-cyan)]" : "text-[var(--text-secondary)]"}`} />
                <span className="shrink-0">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: S&P 500 & NASDAQ live indices */}
        <div className="hidden xl:flex items-center gap-4 text-xs font-mono font-bold text-[var(--text-secondary)] py-1.5 min-w-max">
          {indices.map((idx) => (
            <div key={idx.label} className="flex items-center gap-1.5">
              <span className="text-[var(--text-secondary)]">{idx.label}</span>
              <span className="text-[var(--text-primary)]">{idx.price}</span>
              <span className={idx.isUp ? "text-[#10d98a]" : "text-rose-400"}>{idx.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
