"use client";

import { useState } from "react";
import { InsightData, ForecastData } from "@/lib/api";
import {
  Sparkles,
  ShieldAlert,
  Terminal,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  ChevronDown,
  Download,
  Filter,
  Check
} from "lucide-react";

export type ModelKey =
  | "dual"
  | "fingpt"
  | "finma"
  | "alli"
  | "gpt4o"
  | "gemini"
  | "claude"
  | "deepseek";

export type FilterCategory = "all" | "domain" | "frontier";

interface QuantitativeVsLLMPanelProps {
  insight: InsightData | null;
  forecast: ForecastData | null;
  selectedModel: ModelKey;
  onSelectModel: (m: ModelKey) => void;
}

interface ModelCardDefinition {
  key: ModelKey;
  category: "domain" | "frontier";
  name: string;
  arch: string;
  subtitle: string;
  dotBg: string;
  badgeText: string;
  badgeStyle: string; // Tailwind colors for badge
  thesis: string;
  tags: [string, string, string];
  targetPrice: string;
  targetPct: string;
  stopPrice: string;
  stopPct: string;
  footerMeta: string;
}

export default function QuantitativeVsLLMPanel({
  insight,
  forecast,
  selectedModel,
  onSelectModel,
}: QuantitativeVsLLMPanelProps) {
  const [showPayloadModal, setShowPayloadModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [activeModels, setActiveModels] = useState<Set<ModelKey>>(
    new Set(["fingpt", "finma", "alli", "gpt4o", "gemini"])
  );

  // ── Quantitative values ───────────────────────────────────────
  const currentPrice  = forecast?.summary?.current_price ?? forecast?.confidence_corridor?.spot ?? 136.54;
  const projPrice     = forecast?.summary?.projected_price ?? (currentPrice ? currentPrice * 1.025 : 139.96);
  const projChangePct = forecast?.summary?.projected_change_pct ?? 2.5;
  const aic           = forecast?.aic_score ?? 842.10;
  const lower95       = forecast?.confidence_corridor?.lower_95 ?? (currentPrice ? currentPrice * 0.909 : 124.12);

  // ── Consensus / LLM values ────────────────────────────────────
  const consensus     = insight?.consensus;
  const verdict       = consensus?.verdict ?? "HOLD / CAUTIOUS ACCUMULATION";
  const synthesis     = consensus?.synthesis_thesis ?? "ARIMA models project statistical recovery toward projected target, but multi-model synthesis identifies technical headwinds at the 50-day SMA. Consensus recommends holding current position and accumulating near lower Bollinger support.";
  const accZone       = consensus?.target_levels?.accumulation_zone ?? `$${(currentPrice * 0.965).toFixed(2)} – $${(currentPrice * 0.985).toFixed(2)}`;
  const allocation    = consensus?.allocation ?? { hold: 44, accumulate: 26, trim: 30 };
  const riskTags      = insight?.risk_tags ?? [
    `ARIMA 95% Tail Risk: $${lower95.toFixed(2)}`,
    `50-Day SMA Overhead Resistance ($${(currentPrice * 1.042).toFixed(2)})`,
    "MACD Negative Drift",
  ];

  const confidence    = insight?.confidence ?? 75;
  const isUpside      = projChangePct >= 0;

  // ── Model Card Definitions (Matching User Screenshot Exact Design) ───────
  const modelsList: ModelCardDefinition[] = [
    {
      key: "fingpt",
      category: "domain",
      name: "FinGPT",
      arch: "(AI4Finance)",
      subtitle: "Real-time Sentiment & News NLP",
      dotBg: "bg-sky-500 dark:bg-sky-400",
      badgeText: "81% SENTIMENT BUY",
      badgeStyle: "bg-sky-100/70 text-sky-800 font-bold border-0 dark:bg-[rgba(0,212,255,0.15)] dark:text-[var(--accent-cyan)]",
      thesis: "Fine-tuned on real-time news & financial social feeds. Flags strong bullish sentiment bias with low mentions of sovereign AI demand deceleration.",
      tags: ["Twitter/X Sentiment", "Earnings Call Audio", "Open Weight"],
      targetPrice: `$${(currentPrice * 1.015).toFixed(2)}`,
      targetPct: "+1.5%",
      stopPrice: `$${(currentPrice * 0.915).toFixed(2)}`,
      stopPct: "-8.5%",
      footerMeta: "Confidence: 81.4%",
    },
    {
      key: "finma",
      category: "domain",
      name: "FinMA / Pixiu",
      arch: "(Financial QA)",
      subtitle: "Credit & Leverage Scoring Engine",
      dotBg: "bg-amber-500 dark:bg-amber-400",
      badgeText: "78% MODERATE BUY",
      badgeStyle: "bg-amber-100/70 text-amber-800 font-bold border-0 dark:bg-[rgba(245,158,11,0.15)] dark:text-amber-300",
      thesis: "Specialized financial QA & credit engine confirms healthy leverage ratios and positive cash flow momentum, though inventory turnover signals minor deceleration.",
      tags: ["Credit Health A+", "FCF Multiple", "Moderate Risk"],
      targetPrice: `$${(currentPrice * 1.012).toFixed(2)}`,
      targetPct: "+1.2%",
      stopPrice: `$${(currentPrice * 0.906).toFixed(2)}`,
      stopPct: "-9.4%",
      footerMeta: "Coverage: Fundamental",
    },
    {
      key: "alli",
      category: "domain",
      name: "Alli Finance LLM",
      arch: "(Enterprise RAG)",
      subtitle: "Buy-side Research & Proprietary RAG",
      dotBg: "bg-indigo-500 dark:bg-indigo-400",
      badgeText: "84% ENTERPRISE ACCUMULATE",
      badgeStyle: "bg-indigo-100/70 text-indigo-800 font-bold border border-indigo-200/60 dark:bg-[rgba(129,140,248,0.15)] dark:text-indigo-300 dark:border-transparent",
      thesis: "Institutional RAG engine verifies internal sell-side revisions and hyperscaler capital expenditure forward guidance to confirm low downside risk.",
      tags: ["Sell-Side Consensus", "Hyperscaler Capex", "Vector Embeddings"],
      targetPrice: `$${(currentPrice * 1.018).toFixed(2)}`,
      targetPct: "+1.8%",
      stopPrice: `$${(currentPrice * 0.911).toFixed(2)}`,
      stopPct: "-8.9%",
      footerMeta: "Corroboration: 92%",
    },
    {
      key: "gpt4o",
      category: "frontier",
      name: "OpenAI GPT-4o",
      arch: "(Frontier Omni)",
      subtitle: "Multimodal Quant Analysis",
      dotBg: "bg-emerald-500 dark:bg-emerald-400",
      badgeText: "74% ACCUMULATE",
      badgeStyle: "bg-emerald-100/70 text-emerald-800 font-bold border-0 dark:bg-[rgba(16,217,138,0.15)] dark:text-[#10d98a]",
      thesis: "Recognizes ARIMA upward vector toward projected target; advises staging incremental buys below entry threshold before overhead 50-day SMA resistance test.",
      tags: ["ARIMA Multi-Horizon", "50-day SMA Drift", "Frontier CoT"],
      targetPrice: `$${(currentPrice * 1.013).toFixed(2)}`,
      targetPct: "+1.3%",
      stopPrice: `$${(currentPrice * 0.907).toFixed(2)}`,
      stopPct: "-9.3%",
      footerMeta: "Stage: Limit Orders",
    },
    {
      key: "gemini",
      category: "frontier",
      name: "Google Gemini 1.5 Pro",
      arch: "(2M Context)",
      subtitle: "Cross-Asset Historical Correlation",
      dotBg: "bg-blue-500 dark:bg-blue-400",
      badgeText: "76% ACCUMULATE",
      badgeStyle: "bg-blue-100/70 text-blue-800 font-bold border-0 dark:bg-[rgba(59,130,246,0.15)] dark:text-blue-300",
      thesis: "Highlights MACD cross lag and recommends limiting initial tranches until spot price tests above 50-day SMA, confirming institutional accumulation volume.",
      tags: ["MACD Signal Lag", "Tranche Execution", "Long-Context"],
      targetPrice: `$${(currentPrice * 1.011).toFixed(2)}`,
      targetPct: "+1.1%",
      stopPrice: `$${(currentPrice * 0.906).toFixed(2)}`,
      stopPct: "-9.4%",
      footerMeta: "Execution: DCA Tranches",
    },
  ];

  // Filter models based on category & active toggles
  const filteredModels = modelsList.filter((m) => {
    if (!activeModels.has(m.key)) return false;
    if (activeFilter === "domain") return m.category === "domain";
    if (activeFilter === "frontier") return m.category === "frontier";
    return true;
  });

  const toggleModelActive = (key: ModelKey) => {
    const next = new Set(activeModels);
    if (next.has(key)) {
      if (next.size > 1) next.delete(key);
    } else {
      next.add(key);
    }
    setActiveModels(next);
  };

  return (
    <div className="space-y-6">
      {/* ── Verdict Banner ─────────────────────────────────────── */}
      <div
        className="glass-card p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(16,217,138,0.06), transparent 60%)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[rgba(0,212,255,0.04)] rounded-full blur-3xl pointer-events-none" />

        {/* Top row */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#10d98a] text-slate-950 uppercase tracking-wider">
              {verdict}
            </span>
            <span className="ml-3 text-xs font-semibold text-[var(--text-secondary)]">Recommended Action</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span>
              Engine Confidence: <strong className="text-[var(--text-primary)] font-mono">{confidence}%</strong>
            </span>
            <span className="text-[var(--border-color)]">|</span>
            <span>Low Volatility Regime</span>
          </div>
        </div>

        {/* Synthesis paragraph */}
        <p className="text-sm text-[var(--text-primary)] leading-relaxed max-w-3xl">
          {synthesis}
        </p>
      </div>

      {/* ── Three Metric Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Target Price */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Target Price (12M)
            </span>
            {isUpside
              ? <span className="text-[11px] font-bold text-emerald-600 dark:text-[#10d98a] flex items-center gap-1"><TrendingUp size={12}/> +{projChangePct.toFixed(1)}% Upside</span>
              : <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1"><TrendingDown size={12}/> {projChangePct.toFixed(1)}%</span>
            }
          </div>
          <div className="text-3xl font-black font-mono text-[var(--text-primary)] my-2">
            ${projPrice.toFixed(2)}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-3">
            Multi-model fair value composite & autoregressive mean.
          </p>
          <div className="text-[10px] text-[var(--text-secondary)] font-mono">ARIMA + Financial LLMs + DCF</div>
          <button
            onClick={() => setShowPayloadModal(true)}
            className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-[var(--accent-cyan)] hover:text-sky-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            Inspect math <ArrowUpRight size={11} />
          </button>
        </div>

        {/* Optimal Buy Range */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Optimal Buy Range
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200 dark:bg-[rgba(0,212,255,0.15)] dark:text-[var(--accent-cyan)] dark:border-[rgba(0,212,255,0.3)]">
              Optimal Entry Zone
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-[#10d98a] my-2 leading-tight">
            {accZone}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-3">
            Lower Bollinger support band & high-volume accumulation shelf.
          </p>
          <div className="text-[10px] text-[var(--text-secondary)] font-mono">20D Lower (2σ) + 50D SMA</div>
          <button
            onClick={() => setShowPayloadModal(true)}
            className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-[var(--accent-cyan)] hover:text-sky-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            Inspect math <ArrowUpRight size={11} />
          </button>
        </div>

        {/* Stop-Loss */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Invalidation / Stop-Loss
            </span>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <TrendingDown size={12}/> -5.5% Tail Risk
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400 my-2">
            ${lower95.toFixed(2)}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-3">
            Strict structural downside cutoff to protect capital.
          </p>
          <div className="text-[10px] text-[var(--text-secondary)] font-mono">-1.8σ Parametric 95% VaR</div>
          <button
            onClick={() => setShowPayloadModal(true)}
            className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-[var(--accent-cyan)] hover:text-sky-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            Inspect math <ArrowUpRight size={11} />
          </button>
        </div>
      </div>

      {/* ── AI MODEL COMPARISON & SELECTION PANEL ───────────────── */}
      <div className="glass-card p-6 border border-[var(--border-color)] shadow-xl rounded-3xl bg-white dark:bg-slate-950">
        {/* Panel Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-[var(--border-color)]">
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 dark:bg-[rgba(168,85,247,0.12)] dark:border-[rgba(168,85,247,0.3)] dark:text-purple-400 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-[var(--text-primary)] tracking-wide uppercase flex items-center gap-2">
                AI MODEL COMPARISON & SELECTION
              </h3>
              <p className="text-xs text-slate-500 dark:text-[var(--text-secondary)] mt-0.5">
                Live quantitative thesis decomposition across specialized financial & general frontier LLMs
              </p>
            </div>
          </div>

          {/* Right Filter Pills & Multi-Select Dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-[rgba(255,255,255,0.03)] p-1 rounded-xl border border-slate-200/70 dark:border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 dark:text-[var(--text-secondary)] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All Active ({activeModels.size})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("domain")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === "domain"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 dark:text-[var(--text-secondary)] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Domain Only
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("frontier")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === "frontier"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 dark:text-[var(--text-secondary)] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Frontier Reasoning
              </button>
            </div>

            {/* Multi-Select Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-xs dark:bg-slate-900 dark:text-white dark:border-[rgba(0,212,255,0.3)] dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                <Filter size={13} className="text-sky-600 dark:text-[var(--accent-cyan)]" />
                <span>Select AI Models</span>
                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/80 font-mono text-[10px] font-bold dark:bg-blue-600 dark:text-white dark:border-transparent">
                  {activeModels.size}/6
                </span>
                <ChevronDown size={14} className="text-slate-500 dark:text-slate-400" />
              </button>

              {/* Dropdown Menu Popup */}
              {showModelDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 space-y-1">
                  <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase px-3 py-1.5 tracking-wider">
                    Toggle Included AI Engines
                  </div>
                  {modelsList.map((m) => {
                    const isChecked = activeModels.has(m.key);
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => toggleModelActive(m.key)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${m.dotBg}`} />
                          {m.name}
                        </span>
                        {isChecked && <Check size={14} className="text-emerald-600 dark:text-[var(--accent-cyan)]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 3-Column Model Cards Grid ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {filteredModels.map((m) => {
            const isSelected = selectedModel === m.key;

            return (
              <div
                key={m.key}
                onClick={() => onSelectModel(m.key)}
                className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? "border-2 border-emerald-500 bg-white shadow-sm dark:border-emerald-500 dark:bg-[rgba(16,217,138,0.04)]"
                    : "border border-slate-200/80 bg-white hover:border-slate-300 dark:border-[var(--border-color)] dark:bg-[rgba(255,255,255,0.015)] dark:hover:border-slate-700"
                }`}
              >
                {/* Top Title & Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${m.dotBg} flex-shrink-0`} />
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-[var(--text-primary)]">
                          {m.name}
                        </h4>
                        <span className="text-xs text-slate-400 dark:text-[var(--text-secondary)] font-normal">
                          {m.arch}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-[var(--text-secondary)] mt-0.5 font-normal">
                        {m.subtitle}
                      </p>
                    </div>
                    {/* Recommendation Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${m.badgeStyle}`}
                    >
                      {m.badgeText}
                    </span>
                  </div>

                  {/* Thesis Quote Box */}
                  <div className="my-3.5 p-3.5 rounded-xl bg-[#f8fafc] border border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed italic font-normal">
                      &ldquo;{m.thesis}&rdquo;
                    </p>
                  </div>

                  {/* 3 Badges Row */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {m.tags.map((tag, idx) => {
                      // 3rd tag gets custom colored pill based on model accent
                      let tagStyle = "bg-slate-100/80 text-slate-600 border border-slate-200/60 font-semibold";
                      if (idx === 2) {
                        if (m.key === "gpt4o") tagStyle = "bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 font-bold";
                        else if (m.key === "fingpt") tagStyle = "bg-sky-100/80 text-sky-800 border border-sky-200/60 font-bold";
                        else if (m.key === "finma") tagStyle = "bg-amber-100/80 text-amber-800 border border-amber-200/60 font-bold";
                        else if (m.key === "alli") tagStyle = "bg-indigo-100/80 text-indigo-800 border border-indigo-200/60 font-bold";
                        else if (m.key === "gemini") tagStyle = "bg-blue-100/80 text-blue-800 border border-blue-200/60 font-bold";
                      }

                      return (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded-md text-[10px] ${tagStyle}`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Target Price & Stop Loss Box Pair */}
                <div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Target Price */}
                    <div
                      className={`p-3 rounded-xl border ${
                        isSelected
                          ? "bg-emerald-50/60 border-emerald-100"
                          : "bg-[#f8fafc] border-slate-100"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        TARGET PRICE
                      </span>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-base font-extrabold font-mono text-slate-900">
                          {m.targetPrice}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          {m.targetPct}
                        </span>
                      </div>
                    </div>

                    {/* Stop Loss */}
                    <div
                      className={`p-3 rounded-xl border ${
                        isSelected
                          ? "bg-rose-50/60 border-rose-100"
                          : "bg-[#f8fafc] border-slate-100"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        STOP LOSS
                      </span>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-base font-extrabold font-mono text-slate-900">
                          {m.stopPrice}
                        </span>
                        <span className="text-[10px] font-bold text-rose-500">
                          {m.stopPct}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Metadata info on left, Inspect math link on right */}
                  <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100 dark:border-[var(--border-color)]">
                    <span className="text-[11px] text-slate-400 dark:text-[var(--text-secondary)] font-mono font-medium">
                      {m.footerMeta}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPayloadModal(true);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                    >
                      Inspect math <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Consensus Target Portfolio Allocation ─────────────────── */}
        <div
          className="rounded-2xl border border-slate-200 dark:border-[var(--border-color)] p-5 mb-5 bg-slate-50/40 dark:bg-[rgba(255,255,255,0.015)]"
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-sky-600 dark:text-[var(--accent-blue)]" />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-[var(--text-primary)]">
                  Consensus Target Portfolio Allocation
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-[var(--text-secondary)]">
                  Synthesized portfolio weighting across active neural & financial models
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-[var(--accent-blue)]" />
                {allocation.hold}% Hold
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-[#10d98a]" />
                {allocation.accumulate}% Accumulate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                {allocation.trim}% Trim / Cash
              </span>
            </div>
          </div>

          {/* Allocation Progress Bar */}
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-[var(--border-color)]">
            <div
              className="h-full rounded-l-full bg-blue-600 dark:bg-[var(--accent-blue)] transition-all duration-500"
              style={{ width: `${allocation.hold}%` }}
              title={`${allocation.hold}% Hold`}
            />
            <div
              className="h-full bg-emerald-500 dark:bg-[#10d98a] transition-all duration-500"
              style={{ width: `${allocation.accumulate}%` }}
              title={`${allocation.accumulate}% Accumulate`}
            />
            <div
              className="h-full rounded-r-full bg-rose-500 transition-all duration-500"
              style={{ width: `${allocation.trim}%` }}
              title={`${allocation.trim}% Trim`}
            />
          </div>
        </div>

        {/* ── Bottom Key Watchpoints & Action Buttons ────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          {/* Key Watchpoints */}
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldAlert size={15} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              KEY WATCHPOINTS:
            </span>
            {riskTags.map((rt, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-950 border border-amber-300/80 dark:bg-[rgba(245,158,11,0.08)] dark:text-amber-300 dark:border-[rgba(245,158,11,0.2)] flex items-center gap-1.5 shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                {rt}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(insight, null, 2));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `AI_Consensus_Synthesis_${insight?.ticker || "STOCK"}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-100 bg-white border border-slate-200 dark:text-slate-300 dark:bg-[rgba(255,255,255,0.04)] dark:hover:bg-[rgba(255,255,255,0.08)] dark:border-[var(--border-color)] transition-all cursor-pointer shadow-sm"
            >
              <Download size={13} />
              Export Synthesis
            </button>
            <button
              type="button"
              onClick={() => setShowPayloadModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-sky-500 hover:bg-sky-600 dark:text-slate-950 dark:bg-[var(--accent-cyan)] dark:hover:bg-cyan-300 transition-all cursor-pointer shadow-lg shadow-sky-500/20 dark:shadow-[rgba(0,212,255,0.2)]"
            >
              <Eye size={14} />
              Inspect Model Reasoning
            </button>
          </div>
        </div>
      </div>

      {/* ── JSON Payload Inspection Modal ─────────────────────── */}
      {showPayloadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col p-6 border border-slate-200 dark:border-[rgba(0,212,255,0.4)] shadow-2xl rounded-3xl bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-sky-600 dark:text-[var(--accent-cyan)]" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-[var(--text-primary)]">
                  Live Multi-LLM Prompt & Data Ingestion Payload
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayloadModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.15)] text-xs font-bold dark:text-white transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-xs p-4 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 space-y-4">
              <div>
                <span className="text-slate-500">// Engine System Instructions & Ingested Parameters</span>
                <pre className="text-slate-300 mt-1 whitespace-pre-wrap">
                  {JSON.stringify(
                    {
                      selected_model: selectedModel,
                      active_models_count: activeModels.size,
                      data_ingestion: {
                        window: "250D rolling OHLCV",
                        indicators: ["RSI 14", "MACD 12/26/9", "50-SMA", "250-SMA", "Bollinger 20,2"],
                        arima_order: "(2,1,2)",
                        aic: aic,
                        projected_target: projPrice.toFixed(2),
                        confidence_corridor: { lower_95: lower95.toFixed(2) },
                      },
                      prompt_instructions:
                        "Act as an institutional financial advisor. Decompose multi-model quantitative thesis across FinGPT, FinMA, Alli Finance, GPT-4o, and Gemini 1.5 Pro.",
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
