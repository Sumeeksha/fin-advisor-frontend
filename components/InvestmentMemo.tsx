"use client";

import { useState, useEffect } from "react";
import { api, MemoData, formatLargeNumber } from "@/lib/api";
import {
  FileText, TrendingUp, TrendingDown, Minus, Shield, Target,
  AlertTriangle, BarChart2, Cpu, Zap, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";

interface InvestmentMemoProps {
  ticker: string;
}

/* ─── Rating config ──────────────────────────────────────────────────── */
const RATING_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  "Strong Buy":  { color: "#10d98a", bg: "rgba(16,217,138,0.10)", border: "rgba(16,217,138,0.35)", icon: TrendingUp },
  "Accumulate":  { color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.35)",  icon: TrendingUp },
  "Hold":        { color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.35)",  icon: Minus },
  "Trim":        { color: "#f97316", bg: "rgba(249,115,22,0.10)",  border: "rgba(249,115,22,0.35)",  icon: TrendingDown },
  "Sell":        { color: "#f43f5e", bg: "rgba(244,63,94,0.10)",   border: "rgba(244,63,94,0.35)",   icon: TrendingDown },
};

const getRatingCfg = (r: string) =>
  RATING_CONFIG[r] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", icon: Minus };

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function fmtNum(n: number | null | undefined, dec = 2) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
function fmtPrice(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${fmtNum(n)}`;
}

/* ─── Sub-components ─────────────────────────────────────────────────── */
function MetricRow({ label, value, context, highlight }: {
  label: string; value: string; context: string; highlight?: "bull" | "bear" | "neutral";
}) {
  const dot =
    highlight === "bull" ? "#10d98a" :
    highlight === "bear" ? "#f43f5e" : "#94a3b8";
  return (
    <tr className="border-b border-[var(--border-color)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      <td className="py-3 pr-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap w-36">{label}</td>
      <td className="py-3 pr-6 font-mono text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">
        <span className="flex items-center gap-2">
          <span style={{ color: dot }} className="text-lg leading-none">●</span>
          {value}
        </span>
      </td>
      <td className="py-3 text-xs text-[var(--text-secondary)] leading-relaxed">{context}</td>
    </tr>
  );
}

function InfoCard({ title, icon: Icon, children, accentColor = "var(--accent-cyan)" }: {
  title: string; icon: React.ElementType; children: React.ReactNode; accentColor?: string;
}) {
  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon size={15} style={{ color: accentColor }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function RiskPill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold
      bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.2)] text-[#f87171]">
      <AlertTriangle size={10} />
      {text}
    </span>
  );
}

/* ─── Skeleton Loader ─────────────────────────────────────────────────── */
function MemoSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="glass-card p-6 rounded-2xl h-40 bg-[var(--card-subtle)]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 rounded-2xl h-28 bg-[var(--card-subtle)]" />
        ))}
      </div>
      <div className="glass-card p-6 rounded-2xl h-64 bg-[var(--card-subtle)]" />
      <div className="glass-card p-5 rounded-2xl h-48 bg-[var(--card-subtle)]" />
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */
export default function InvestmentMemo({ ticker }: InvestmentMemoProps) {
  const [data, setData] = useState<MemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskProfile, setRiskProfile] = useState<"Conservative" | "Moderate" | "Aggressive">("Moderate");
  const [timeHorizon, setTimeHorizon] = useState<string>("12-Month");
  const [thesisExpanded, setThesisExpanded] = useState(false);

  const fetchMemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMemo(ticker, riskProfile, timeHorizon);
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate memo");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when ticker / params change
  useEffect(() => {
    fetchMemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, riskProfile, timeHorizon]);

  /* ── Rating badge ─── */
  const rating = data?.memo?.consensus_rating ?? "Hold";
  const cfg = getRatingCfg(rating);
  const RatingIcon = cfg.icon;

  const ts = data?.technical_snapshot;
  const fs = data?.forecast_snapshot;
  const ms = data?.market_snapshot;
  const memo = data?.memo;

  /* ── RSI highlight ─── */
  const rsiHighlight: "bull" | "bear" | "neutral" =
    (ts?.rsi ?? 50) < 35 ? "bull" : (ts?.rsi ?? 50) > 65 ? "bear" : "neutral";

  /* ── Price vs SMA highlight ─── */
  const sma50Highlight: "bull" | "bear" | "neutral" =
    ts?.price_vs_sma50 != null
      ? ts.price_vs_sma50 > 0 ? "bull" : "bear"
      : "neutral";
  const sma200Highlight: "bull" | "bear" | "neutral" =
    ts?.price_vs_sma200 != null
      ? ts.price_vs_sma200 > 0 ? "bull" : "bear"
      : "neutral";

  return (
    <div className="space-y-5">

      {/* ── Header Bar ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.25)] flex items-center justify-center">
            <FileText size={17} className="text-[var(--accent-cyan)]" />
          </div>
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)]">
              Investment Memo — <span className="text-[var(--accent-cyan)] font-mono">{ticker}</span>
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)]">
              AI-synthesised equity research • {data?.generated_at
                ? new Date(data.generated_at).toLocaleString()
                : "Generating..."}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Profile */}
          <div className="flex rounded-xl overflow-hidden border border-[var(--border-color)] text-[11px] font-bold">
            {(["Conservative", "Moderate", "Aggressive"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRiskProfile(r)}
                className={`px-3 py-1.5 transition-all cursor-pointer ${
                  riskProfile === r
                    ? "bg-[var(--accent-cyan)] text-slate-950"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-subtle)]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchMemo}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)]
              text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              hover:bg-[var(--card-subtle)] transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="glass-card p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-rose-400 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* ── Loading Skeleton ─────────────────────────────────────── */}
      {loading && <MemoSkeleton />}

      {/* ── Content ─────────────────────────────────────────────── */}
      {!loading && data && memo && (
        <>
          {/* ── Executive Summary Card ───────────────────────────── */}
          <div
            className="glass-card p-6 rounded-2xl border"
            style={{ borderColor: cfg.border, background: cfg.bg }}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              {/* Left: rating + action */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black tracking-wide border"
                    style={{ color: cfg.color, borderColor: cfg.border, background: cfg.bg }}
                  >
                    <RatingIcon size={16} />
                    {rating.toUpperCase()}
                  </span>
                  {data.is_fallback && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.25)] text-amber-400 font-semibold">
                      Quant Fallback
                    </span>
                  )}
                </div>
                <h3 className="text-[13px] font-semibold text-[var(--text-primary)] leading-relaxed max-w-xl">
                  {memo.recommended_action}
                </h3>
                <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
                  Generated by <span className="font-semibold text-[var(--accent-cyan)]">{memo.llm_provider}</span>
                  {" "}• Risk Profile: <span className="font-semibold">{data.risk_profile}</span>
                  {" "}• Horizon: <span className="font-semibold">{data.time_horizon}</span>
                </p>
              </div>

              {/* Right: price + change */}
              <div className="flex flex-col items-end shrink-0">
                <div className="text-3xl font-black font-mono text-[var(--text-primary)]">
                  {fmtPrice(ms?.current_price)}
                </div>
                <div className={`text-sm font-bold font-mono mt-1 ${
                  (ms?.change ?? 0) >= 0 ? "text-[#10d98a]" : "text-[#f43f5e]"
                }`}>
                  {(ms?.change ?? 0) >= 0 ? "▲" : "▼"} {fmtPrice(ms?.change)} ({fmtPct(ms?.change_pct)})
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                  {ms?.exchange} • {ms?.currency}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Mkt Cap: {formatLargeNumber(ms?.market_cap)}
                </div>
              </div>
            </div>
          </div>

          {/* ── Trade Parameters Row ─────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Entry Zone", value: `${fmtPrice(memo.entry_zone_low)} – ${fmtPrice(memo.entry_zone_high)}`, color: "#10d98a", icon: Target },
              { label: "12M Target", value: `${fmtPrice(memo.target_12m_low)} – ${fmtPrice(memo.target_12m_high)}`, color: "#00d4ff", icon: TrendingUp },
              { label: "Stop-Loss", value: fmtPrice(memo.stop_loss), color: "#f43f5e", icon: Shield },
              { label: "ARIMA Forecast", value: `${fmtPrice(fs?.projected_price)} (${fmtPct(fs?.projected_change_pct)})`, color: "#a78bfa", icon: Zap },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="glass-card p-4 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} style={{ color }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">{label}</span>
                </div>
                <span className="font-mono text-sm font-black" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* ── Technical Table ───────────────────────────────────── */}
          <InfoCard title="Part 1 — Technical &amp; Market Dynamics" icon={BarChart2} accentColor="#00d4ff">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="py-2 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] w-36">Metric</th>
                    <th className="py-2 pr-6 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] w-36">Value</th>
                    <th className="py-2 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  <MetricRow
                    label="Current Price"
                    value={fmtPrice(ts?.price)}
                    context={`Day Range: ${ms?.day_range ?? "N/A"}`}
                    highlight="neutral"
                  />
                  <MetricRow
                    label="50D SMA"
                    value={fmtPrice(ts?.sma_50)}
                    context={
                      ts?.price_vs_sma50 != null
                        ? `Price is ${ts.price_vs_sma50 > 0 ? "+" : ""}${fmtNum(ts.price_vs_sma50)}% ${ts.price_vs_sma50 > 0 ? "above" : "below"} 50D SMA — ${ts.price_vs_sma50 > 0 ? "bullish medium-term alignment" : "bearish medium-term structure"}`
                        : "50D SMA data unavailable"
                    }
                    highlight={sma50Highlight}
                  />
                  <MetricRow
                    label="200D SMA"
                    value={fmtPrice(ts?.sma_200)}
                    context={
                      ts?.price_vs_sma200 != null
                        ? `Price is ${ts.price_vs_sma200 > 0 ? "+" : ""}${fmtNum(ts.price_vs_sma200)}% ${ts.price_vs_sma200 > 0 ? "above" : "below"} 200D SMA — ${ts.golden_cross ?? "Trend confirmed"}`
                        : "200D SMA data unavailable"
                    }
                    highlight={sma200Highlight}
                  />
                  <MetricRow
                    label="RSI (14)"
                    value={ts?.rsi != null ? fmtNum(ts.rsi, 1) : "—"}
                    context={
                      ts?.rsi != null
                        ? `Signal: ${ts.rsi_signal ?? "—"} — ${ts.rsi < 30 ? "Oversold: potential reversal zone" : ts.rsi > 70 ? "Overbought: mean-reversion risk elevated" : "Neutral: healthy momentum, room in both directions"}`
                        : "RSI data unavailable"
                    }
                    highlight={rsiHighlight}
                  />
                  <MetricRow
                    label="MACD"
                    value={ts?.macd_crossover ?? "—"}
                    context="Based on 12/26/9 MACD configuration — crossover direction reflects short-term momentum"
                    highlight={
                      ts?.macd_crossover?.toLowerCase().includes("bull") ? "bull" :
                      ts?.macd_crossover?.toLowerCase().includes("bear") ? "bear" : "neutral"
                    }
                  />
                  <MetricRow
                    label="Bollinger Bands"
                    value={ts?.bb_upper != null ? `$${fmtNum(ts.bb_upper)} / $${fmtNum(ts.bb_lower)}` : "—"}
                    context="Upper / Lower Band. Price proximity to upper band = expansion / mean-reversion risk"
                    highlight="neutral"
                  />
                  <MetricRow
                    label="Forecast (14D)"
                    value={`${fmtPrice(fs?.projected_price)} (${fmtPct(fs?.projected_change_pct)})`}
                    context={`ARIMA ${fs?.method ?? ""} — ${fs?.outlook ?? "—"} outlook. Direction: ${fs?.direction ?? "—"}`}
                    highlight={fs?.projected_change_pct != null ? (fs.projected_change_pct >= 0 ? "bull" : "bear") : "neutral"}
                  />
                </tbody>
              </table>
            </div>
            {/* Technical context from LLM */}
            {memo.technical_context && (
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-[var(--border-color)] mt-2">
                💡 {memo.technical_context}
              </p>
            )}
          </InfoCard>

          {/* ── Part 2: Fundamental Performance (SEC 10-K / 10-Q Analysis) ── */}
          <InfoCard title="Part 2 — Fundamental Performance (SEC 10-K / 10-Q Analysis)" icon={FileText} accentColor="#10d98a">
            <div className="space-y-3 text-xs text-[var(--text-secondary)]">
              {(memo.revenue_margin_growth || memo.fundamental_summary) && (
                <div>
                  <span className="font-bold text-[var(--text-primary)] block mb-1">
                    • Revenue &amp; Margin Growth:
                  </span>
                  <p className="leading-relaxed pl-3 border-l-2 border-[#10d98a]/30">
                    {memo.revenue_margin_growth || memo.fundamental_summary}
                  </p>
                </div>
              )}

              {memo.free_cash_flow_leverage && (
                <div>
                  <span className="font-bold text-[var(--text-primary)] block mb-1">
                    • Free Cash Flow &amp; Leverage:
                  </span>
                  <p className="leading-relaxed pl-3 border-l-2 border-[#10d98a]/30">
                    {memo.free_cash_flow_leverage}
                  </p>
                </div>
              )}

              {/* Key Risks & Regulatory Disclosures */}
              {(() => {
                const rawRisk: unknown = memo.key_risks_disclosures ?? memo.key_risks;
                if (!rawRisk) return null;

                if (Array.isArray(rawRisk) && rawRisk.length > 0) {
                  return (
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block mb-1">
                        • Key Risks &amp; Regulatory Disclosures:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1.5 pl-3">
                        {rawRisk.map((r, i) => (
                          <RiskPill key={i} text={typeof r === "string" ? r : JSON.stringify(r)} />
                        ))}
                      </div>
                    </div>
                  );
                }

                if (typeof rawRisk === "string" && rawRisk.trim().length > 0) {
                  return (
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block mb-1">
                        • Key Risks &amp; Regulatory Disclosures:
                      </span>
                      <p className="leading-relaxed pl-3 border-l-2 border-[#10d98a]/30">
                        {rawRisk}
                      </p>
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          </InfoCard>

          {/* ── Part 3: Valuation Breakdown ────────────────────────────────── */}
          <InfoCard title="Part 3 — Valuation Breakdown" icon={Cpu} accentColor="#a78bfa">
            <div className="space-y-3 text-xs text-[var(--text-secondary)]">
              {(memo.multiples_analysis || memo.valuation_summary) && (
                <div>
                  <span className="font-bold text-[var(--text-primary)] block mb-1">
                    • Multiples Analysis:
                  </span>
                  <p className="leading-relaxed pl-3 border-l-2 border-[#a78bfa]/30">
                    {memo.multiples_analysis || memo.valuation_summary}
                  </p>
                </div>
              )}

              {(memo.fair_value_estimate || (memo.entry_zone_low && memo.target_12m_high)) && (
                <div>
                  <span className="font-bold text-[var(--text-primary)] block mb-1">
                    • Fair Value Estimate:
                  </span>
                  <p className="leading-relaxed pl-3 border-l-2 border-[#a78bfa]/30">
                    {memo.fair_value_estimate || `Calculated fair value corridor spans ${fmtPrice(memo.entry_zone_low)}–${fmtPrice(memo.entry_zone_high)} for accumulation and ${fmtPrice(memo.target_12m_low)}–${fmtPrice(memo.target_12m_high)} for 12M target.`}
                  </p>
                </div>
              )}
            </div>
          </InfoCard>

          {/* ── Moat & Catalysts ─────────────────────────────────── */}
          {memo.moat_and_catalysts && (
            <InfoCard title="Competitive Moat &amp; Strategic Catalysts" icon={Zap} accentColor="#fbbf24">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{memo.moat_and_catalysts}</p>
            </InfoCard>
          )}

          {/* ── Part 4: Risk Profile & Trade Parameters ───────────────────── */}
          <InfoCard title="Part 4 — Risk Profile &amp; Trade Parameters" icon={Shield} accentColor="#f43f5e">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[rgba(16,217,138,0.06)] border border-[rgba(16,217,138,0.2)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                  Optimal Entry Zone
                </span>
                <span className="font-mono text-sm font-black text-[#10d98a] mt-1 block">
                  {fmtPrice(memo.entry_zone_low)} – {fmtPrice(memo.entry_zone_high)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                  Target Price
                </span>
                <span className="font-mono text-sm font-black text-[#00d4ff] mt-1 block">
                  {fmtPrice(memo.target_12m_low)} – {fmtPrice(memo.target_12m_high)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.2)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                  Stop-Loss / Invalidation Cutoff
                </span>
                <span className="font-mono text-sm font-black text-[#f43f5e] mt-1 block">
                  {fmtPrice(memo.stop_loss)}
                </span>
              </div>
            </div>
          </InfoCard>

          {/* ── Final Synthesis & Investment Thesis ───────────────────────── */}
          <div className="glass-card p-6 rounded-2xl border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[var(--accent-cyan)]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent-cyan)]">
                  Final Synthesis &amp; Investment Thesis
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setThesisExpanded((e) => !e)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 font-semibold"
              >
                {thesisExpanded ? "Collapse" : "Expand"}
                {thesisExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            <div className={`space-y-3 text-xs md:text-sm text-[var(--text-primary)] leading-relaxed font-normal ${!thesisExpanded ? "line-clamp-4" : ""}`}>
              {memo.final_thesis.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {/* ── Disclaimer ───────────────────────────────────────── */}
          <p className="text-[10px] text-[var(--text-secondary)] text-center leading-relaxed px-4 opacity-60">
            ⚠️ {memo.disclaimer}
          </p>
        </>
      )}
    </div>
  );
}
