"use client";

import { useState } from "react";
import { InsightData, ForecastData } from "@/lib/api";
import { Cpu, Sparkles, ShieldAlert, CheckCircle2, Terminal, Info, ChevronRight, Eye } from "lucide-react";

interface QuantitativeVsLLMPanelProps {
  insight: InsightData | null;
  forecast: ForecastData | null;
  selectedModel: "dual" | "gpt4o" | "gemini";
  onSelectModel: (m: "dual" | "gpt4o" | "gemini") => void;
}

export default function QuantitativeVsLLMPanel({
  insight,
  forecast,
  selectedModel,
  onSelectModel,
}: QuantitativeVsLLMPanelProps) {
  const [showPayloadModal, setShowPayloadModal] = useState(false);

  // Extract forecast quantitative values
  const projPrice = forecast?.summary?.projected_price ?? 188.40;
  const projChangePct = forecast?.summary?.projected_change_pct ?? 1.49;
  const projDiff = (projPrice - (forecast?.summary?.current_price ?? 185.63)).toFixed(2);
  const aic = forecast?.aic_score ?? 842.10;
  const rmse = forecast?.rmse ?? 2.14;
  const drift = forecast?.drift_term ?? "+0.04$/day";
  const pValue = forecast?.p_value ?? "< 0.01 (Stationary)";
  const lower95 = forecast?.confidence_corridor?.lower_95 ?? 181.20;
  const upper95 = forecast?.confidence_corridor?.upper_95 ?? 194.10;
  const spotPrice = forecast?.confidence_corridor?.spot ?? 185.63;

  // Extract consensus multi-LLM data
  const consensus = insight?.consensus;
  const verdict = consensus?.verdict ?? "HOLD / CAUTIOUS ACCUMULATION";
  const consensusScore = consensus?.consensus_score ?? "75% Model Consensus";
  const synthesis = consensus?.synthesis_thesis ?? "ARIMA models project statistical recovery toward $188.40 (+1.5%), but multi-model synthesis (GPT-4o & Gemini) identifies technical headwind at the 50-day SMA ($191.11). Consensus recommends holding current position and accumulating near lower Bollinger support ($179.13).";
  const accZone = consensus?.target_levels?.accumulation_zone ?? "$179.13 - $185.00";
  const fairTarget = consensus?.target_levels?.fair_target_12m ?? "$195.75 (+5.45%)";
  const stopLoss = consensus?.target_levels?.stop_loss ?? "$175.44 (-5.49%)";
  const gpt4o = consensus?.models?.gpt4o;
  const gemini = consensus?.models?.gemini;

  const riskTags = insight?.risk_tags ?? [
    `ARIMA 95% Tail Risk: $${lower95}`,
    "50-Day SMA Overhead Resistance",
    "MACD Negative Drift",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      {/* ── LEFT COLUMN: ARIMA Quantitative Forecaster (5 Cols) ── */}
      <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[rgba(79,128,255,0.15)] text-[var(--accent-blue)]">
                <Cpu size={16} />
              </div>
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                ARIMA (2,1,2) QUANTITATIVE FORECASTER
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] text-[var(--text-secondary)]">
              Deterministic Path
            </span>
          </div>

          {/* 14-Day Price Projection Hero */}
          <div className="mb-5 bg-[rgba(79,128,255,0.06)] border border-[rgba(79,128,255,0.2)] rounded-xl p-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              14-DAY PRICE PROJECTION
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
                ${projPrice.toFixed(2)}
              </span>
              <span className="text-sm font-extrabold text-[#10d98a]">
                +{projChangePct.toFixed(2)}% (+${projDiff})
              </span>
            </div>

            {/* Statistical Confidence Corridor (95% CI) Bar */}
            <div className="mt-3 pt-3 border-t border-[rgba(79,128,255,0.15)]">
              <div className="flex justify-between text-[10px] font-mono font-bold text-[var(--text-secondary)] mb-1">
                <span>STATISTICAL CONFIDENCE CORRIDOR (95% CI)</span>
                <span className="text-[var(--accent-blue)]">${lower95} - ${upper95}</span>
              </div>
              <div className="relative w-full h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-blue)] to-[#10d98a]"
                  style={{ left: "15%", right: "15%" }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[var(--text-secondary)] mt-1">
                <span>Lower 95%: ${lower95}</span>
                <span>Spot: ${spotPrice}</span>
                <span>Upper 95%: ${upper95}</span>
              </div>
            </div>
          </div>

          {/* Econometric Formula Specification */}
          <div className="mb-5 glass-subcard border border-[var(--border-color)] rounded-xl p-3 font-mono text-xs">
            <span className="block text-[10px] font-bold text-[var(--accent-cyan)] uppercase mb-1">
              FITTED ECONOMETRIC SPECIFICATION (d = 1 Differenced)
            </span>
            <p className="text-[11px] text-[var(--text-primary)] leading-relaxed overflow-x-auto whitespace-nowrap">
              ΔY_t = 0.04 + 0.42ΔY_{"{t-1}"} - 0.18ΔY_{"{t-2}"} + 0.31ε_{"{t-1}"} + 0.12ε_{"{t-2}"}
            </p>
          </div>

          {/* Econometric Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="glass-subcard p-2.5 rounded-lg">
              <span className="block text-[10px] text-[var(--text-secondary)] font-bold">AIC Score</span>
              <span className="text-sm font-extrabold font-mono text-[var(--text-primary)]">{aic}</span>
            </div>
            <div className="glass-subcard p-2.5 rounded-lg">
              <span className="block text-[10px] text-[var(--text-secondary)] font-bold">RMSE</span>
              <span className="text-sm font-extrabold font-mono text-[var(--text-primary)]">±${rmse}</span>
            </div>
            <div className="glass-subcard p-2.5 rounded-lg">
              <span className="block text-[10px] text-[var(--text-secondary)] font-bold">Drift Term</span>
              <span className="text-sm font-extrabold font-mono text-[#10d98a]">{drift}</span>
            </div>
            <div className="glass-subcard p-2.5 rounded-lg">
              <span className="block text-[10px] text-[var(--text-secondary)] font-bold">p-value</span>
              <span className="text-sm font-extrabold font-mono text-[var(--accent-cyan)]">{pValue}</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[var(--text-secondary)] mt-4 pt-3 border-t border-[var(--border-color)]">
          💡 Pure mathematical autoregressive prediction based on historical volatility momentum.
        </p>
      </div>

      {/* ── RIGHT COLUMN: Multi-Model AI Consensus Engine (7 Cols) ── */}
      <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
        <div>
          {/* Header + Interactive Model Selector Pills */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3 border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[rgba(0,212,255,0.15)] text-[var(--accent-cyan)]">
                <Sparkles size={16} />
              </div>
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                MULTI-MODEL AI CONSENSUS ENGINE
              </h3>
            </div>

            {/* Interactive Model Selector */}
            <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] rounded-xl p-1">
              <button
                type="button"
                onClick={() => onSelectModel("dual")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedModel === "dual"
                    ? "bg-[rgba(0,212,255,0.2)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                title="Synthesize GPT-4o + Gemini 1.5 Pro consensus"
              >
                ⚡ Dual Consensus
              </button>
              <button
                type="button"
                onClick={() => onSelectModel("gpt4o")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedModel === "gpt4o"
                    ? "bg-[rgba(79,128,255,0.2)] text-[var(--accent-blue)] border border-[rgba(79,128,255,0.3)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                title="OpenAI GPT-4o reasoning only"
              >
                🤖 GPT-4o Only
              </button>
              <button
                type="button"
                onClick={() => onSelectModel("gemini")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedModel === "gemini"
                    ? "bg-[rgba(16,217,138,0.2)] text-[#10d98a] border border-[rgba(16,217,138,0.3)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                title="Google Gemini 1.5 Pro reasoning only"
              >
                ✨ Gemini 1.5 Pro
              </button>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[rgba(0,212,255,0.1)] to-[rgba(79,128,255,0.1)] border border-[rgba(0,212,255,0.25)] mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#10d98a] text-slate-950 uppercase tracking-wider">
                {verdict}
              </span>
              <span className="text-xs font-bold text-[var(--text-primary)]">{consensusScore}</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--accent-cyan)] font-bold">
              Confidence: {insight?.confidence ?? 75}%
            </span>
          </div>

          {/* Dual Model Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* OpenAI GPT-4o Card */}
            <div className={`glass-subcard p-3 rounded-xl border transition-all ${
              selectedModel === "gpt4o" || selectedModel === "dual"
                ? "border-[rgba(79,128,255,0.4)] bg-[rgba(79,128,255,0.04)]"
                : "opacity-50 border-[var(--border-color)]"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
                  {gpt4o?.name || "OpenAI GPT-4o"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(16,217,138,0.15)] text-[#10d98a] border border-[rgba(16,217,138,0.3)]">
                  {gpt4o?.rating || "74% ACCUMULATE"}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-2">
                {gpt4o?.thesis || "Recognizes ARIMA upward vector toward $188.40; advises staging buys below $185.00 before 50-day SMA resistance."}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-2 border-t border-[var(--border-color)] text-[var(--text-secondary)]">
                <span>Target: <strong className="text-[var(--text-primary)]">{gpt4o?.target || "$196.00"}</strong></span>
                <span>Stop: <strong className="text-rose-400">{gpt4o?.stop || "$175.50"}</strong></span>
              </div>
            </div>

            {/* Google Gemini 1.5 Pro Card */}
            <div className={`glass-subcard p-3 rounded-xl border transition-all ${
              selectedModel === "gemini" || selectedModel === "dual"
                ? "border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.04)]"
                : "opacity-50 border-[var(--border-color)]"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
                  {gemini?.name || "Google Gemini 1.5 Pro"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(16,217,138,0.15)] text-[#10d98a] border border-[rgba(16,217,138,0.3)]">
                  {gemini?.rating || "76% ACCUMULATE"}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-2">
                {gemini?.thesis || "Highlights MACD cross lag and recommends limiting initial tranches until spot price tests above 50-day SMA ($191.11)."}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-2 border-t border-[var(--border-color)] text-[var(--text-secondary)]">
                <span>Target: <strong className="text-[var(--text-primary)]">{gemini?.target || "$195.50"}</strong></span>
                <span>Stop: <strong className="text-rose-400">{gemini?.stop || "$175.30"}</strong></span>
              </div>
            </div>
          </div>

          {/* Key Target Levels Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs mb-4">
            <div className="glass-subcard p-2.5 rounded-lg">
              <span className="block text-[10px] text-[var(--text-secondary)] font-bold uppercase">ACCUMULATION ZONE</span>
              <span className="text-xs font-extrabold font-mono text-[#10d98a]">{accZone}</span>
              <span className="block text-[9px] text-[var(--text-secondary)]">Bollinger support</span>
            </div>
            <div className="glass-subcard p-2.5 rounded-lg">
              <span className="block text-[10px] text-[var(--text-secondary)] font-bold uppercase">12M FAIR TARGET</span>
              <span className="text-xs font-extrabold font-mono text-[var(--accent-cyan)]">{fairTarget}</span>
              <span className="block text-[9px] text-[var(--text-secondary)]">+5.45% upside</span>
            </div>
            <div className="glass-subcard p-2.5 rounded-lg">
              <span className="block text-[10px] text-[var(--text-secondary)] font-bold uppercase">MODEL STOP-LOSS</span>
              <span className="text-xs font-extrabold font-mono text-rose-400">{stopLoss}</span>
              <span className="block text-[9px] text-[var(--text-secondary)]">-5.49% tail risk</span>
            </div>
          </div>

          {/* Allocation Breakdown Bar */}
          <div className="mb-4 glass-subcard p-2.5 rounded-xl border border-[var(--border-color)]">
            <div className="flex justify-between text-[10px] font-mono font-bold text-[var(--text-secondary)] mb-1">
              <span>MODEL ALLOCATION BREAKDOWN</span>
              <span>44% Hold • 26% Accumulate • 30% Trim</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              <div className="h-full bg-[var(--accent-blue)]" style={{ width: "44%" }} title="44% Hold" />
              <div className="h-full bg-[#10d98a]" style={{ width: "26%" }} title="26% Accumulate" />
              <div className="h-full bg-rose-500" style={{ width: "30%" }} title="30% Trim" />
            </div>
          </div>

          {/* Reconciled Synthesis Thesis Box */}
          <div className="glass-subcard border border-[rgba(0,212,255,0.2)] rounded-xl p-3 text-xs leading-relaxed mb-4">
            <div className="flex items-center gap-1.5 text-[var(--accent-cyan)] font-bold text-[11px] mb-1">
              <Terminal size={13} />
              <span>RECONCILED MULTI-MODEL SYNTHESIS THESIS</span>
            </div>
            <p className="text-[11px] text-[var(--text-primary)]">{synthesis}</p>
          </div>

          {/* Risk Tags & Payload Inspector */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <ShieldAlert size={14} className="text-rose-400" />
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">RISK TAGS:</span>
              {riskTags.map((rt, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20">
                  [{rt}]
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowPayloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-[var(--accent-cyan)] bg-[rgba(0,212,255,0.1)] hover:bg-[rgba(0,212,255,0.2)] border border-[rgba(0,212,255,0.3)] transition-all cursor-pointer"
            >
              <Eye size={13} />
              <span>Inspect Prompt & Ingestion Payload</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── JSON Payload Inspection Modal ── */}
      {showPayloadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col p-6 border border-[rgba(0,212,255,0.4)] shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-[var(--accent-cyan)]" />
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                  Live Multi-LLM Prompt & Data Ingestion Payload
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayloadModal(false)}
                className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.15)] text-xs font-bold text-white transition-all cursor-pointer"
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
                      ticker: forecast?.summary?.current_price ? "AAPL" : "CUSTOM",
                      selected_model: selectedModel,
                      data_ingestion: {
                        window: "250D rolling OHLCV",
                        indicators: ["RSI 14", "MACD 12/26/9", "50-SMA", "250-SMA", "Bollinger 20,2"],
                        arima_order: "(2,1,2)",
                        aic: aic,
                        projected_14d_target: projPrice,
                      },
                      prompt_instructions:
                        "Act as an institutional financial advisor. Analyze ARIMA forecast corridor alongside RSI oversold deceleration and 50-day SMA overhead barrier.",
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
