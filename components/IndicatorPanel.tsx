"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { IndicatorData, formatPrice } from "@/lib/api";
import { HelpCircle } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler);

interface IndicatorPanelProps {
  data: IndicatorData | null;
  loading?: boolean;
}

export default function IndicatorPanel({ data, loading }: IndicatorPanelProps) {
  if (loading) return <IndicatorSkeleton />;
  if (!data) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
        Technical Indicators
        <span className="text-xs px-2 py-0.5 rounded bg-[rgba(79,128,255,0.15)] text-[var(--accent-blue)]">
          {data.period}
        </span>
      </h3>

      <div className="space-y-6">
        {/* RSI */}
        <RSISection rsi={data.rsi} />

        {/* MACD */}
        <MACDSection macd={data.macd} />

        {/* Moving Averages */}
        <MASection ma={data.moving_averages} price={data.current_price} />

        {/* Bollinger Bands */}
        <BollingerSection bb={data.bollinger_bands} />

        {/* Volume */}
        <VolumeSection vol={data.volume} />
      </div>
    </div>
  );
}

// ── RSI ───────────────────────────────────────
function RSISection({ rsi }: { rsi: IndicatorData["rsi"] }) {
  const val = rsi.current ?? 50;
  const pct = Math.min(100, Math.max(0, val));

  const signalColor = rsi.signal === "oversold" ? "#10d98a"
    : rsi.signal === "overbought" ? "#ff4d6d"
    : rsi.signal === "bullish" ? "#4f80ff"
    : rsi.signal === "bearish" ? "#f59e0b"
    : "#8899bb";

  // Mini RSI sparkline
  const dates = rsi.dates.slice(-30);
  const history = rsi.history.slice(-30);
  const miniData = {
    labels: dates,
    datasets: [
      {
        data: history,
        borderColor: signalColor,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        fill: false,
      },
    ],
  };
  const miniOpts: ChartOptions<"line"> = {
    responsive: true, maintainAspectRatio: false, animation: false as const,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0, max: 100 },
    },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-primary)]">RSI (14)</span>
          <Tooltip2 text="Relative Strength Index. < 30 = Oversold, > 70 = Overbought." />
        </div>
        <div className="flex items-center gap-2">
          <span className="mono font-bold text-lg" style={{ color: signalColor }}>
            {val.toFixed(1)}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase"
            style={{ color: signalColor, background: `${signalColor}20`, border: `1px solid ${signalColor}40` }}
          >
            {rsi.signal}
          </span>
        </div>
      </div>

      {/* Gauge bar */}
      <div className="rsi-bar mb-1 relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-500"
          style={{ left: `calc(${pct}% - 6px)`, backgroundColor: signalColor }}
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-3">
        <span>0 Oversold</span>
        <span>30</span>
        <span>70</span>
        <span>Overbought 100</span>
      </div>

      {/* Sparkline */}
      {history.filter(Boolean).length > 5 && (
        <div style={{ height: 50 }}>
          <Line data={miniData} options={miniOpts} />
        </div>
      )}
    </div>
  );
}

// ── MACD ──────────────────────────────────────
function MACDSection({ macd }: { macd: IndicatorData["macd"] }) {
  const crossoverColor = macd.crossover === "bullish" ? "#10d98a" : "#ff4d6d";
  const dates = macd.dates.slice(-40);
  const histData = macd.histogram_history.slice(-40);

  const barColors = histData.map((v) =>
    v == null ? "transparent" : v >= 0 ? "rgba(16,217,138,0.7)" : "rgba(255,77,109,0.7)"
  );

  const chartData = {
    labels: dates,
    datasets: [
      {
        type: "line" as const,
        label: "MACD",
        data: macd.macd_history.slice(-40),
        borderColor: "#4f80ff",
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
      },
      {
        type: "line" as const,
        label: "Signal",
        data: macd.signal_history.slice(-40),
        borderColor: "#f59e0b",
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
      },
      {
        type: "bar" as const,
        label: "Histogram",
        data: histData,
        backgroundColor: barColors,
        borderRadius: 2,
      },
    ],
  };

  const opts: ChartOptions<"bar"> = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(8,13,26,0.95)",
        borderColor: "rgba(99,130,255,0.3)",
        borderWidth: 1,
        titleColor: "#8899bb",
        bodyColor: "#e8edf8",
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: "rgba(99,130,255,0.06)" },
        ticks: { color: "#8899bb", font: { size: 10 }, maxTicksLimit: 5 },
        border: { display: false },
      },
    },
  };

  return (
    <div className="border-t border-[var(--border-color)] pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-primary)]">MACD (12, 26, 9)</span>
          <Tooltip2 text="Moving Average Convergence Divergence. Blue = MACD line, Orange = Signal line." />
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ color: crossoverColor, background: `${crossoverColor}20`, border: `1px solid ${crossoverColor}40` }}
        >
          {macd.crossover}
        </span>
      </div>

      <div className="flex gap-4 text-xs mb-3">
        <span><span className="text-[#4f80ff] font-bold">MACD</span> <span className="mono text-[var(--text-primary)]">{macd.macd.toFixed(3)}</span></span>
        <span><span className="text-[#f59e0b] font-bold">Signal</span> <span className="mono text-[var(--text-primary)]">{macd.signal.toFixed(3)}</span></span>
        <span>
          <span className="text-[var(--text-secondary)]">Hist</span>{" "}
          <span className={`mono font-bold ${macd.histogram >= 0 ? "price-up" : "price-down"}`}>
            {macd.histogram.toFixed(3)}
          </span>
        </span>
      </div>

      <div style={{ height: 80 }}>
        <Bar data={chartData as Parameters<typeof Bar>[0]["data"]} options={opts} />
      </div>
    </div>
  );
}

// ── Moving Averages ───────────────────────────
function MASection({ ma, price }: { ma: IndicatorData["moving_averages"]; price: number }) {
  const items = [
    { label: "SMA 20", value: ma.sma_20 },
    { label: "SMA 50", value: ma.sma_50 },
    { label: "SMA 200", value: ma.sma_200 },
    { label: "EMA 12", value: ma.ema_12 },
    { label: "EMA 26", value: ma.ema_26 },
  ];

  const goldenColor = ma.golden_cross === "golden_cross" ? "#f59e0b"
    : ma.golden_cross === "death_cross" ? "#ff4d6d"
    : "#8899bb";

  return (
    <div className="border-t border-[var(--border-color)] pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-primary)]">Moving Averages</span>
          <Tooltip2 text="SMA = Simple Moving Average. EMA = Exponential Moving Average." />
        </div>
        {ma.golden_cross && (
          <span className="text-xs font-semibold" style={{ color: goldenColor }}>
            {ma.golden_cross === "golden_cross" ? "⭐ Golden Cross"
              : ma.golden_cross === "death_cross" ? "💀 Death Cross"
              : ma.golden_cross === "positive" ? "↑ SMA50 > SMA200"
              : "↓ SMA50 < SMA200"}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(({ label, value }) => {
          if (value == null) return null;
          const abovePrice = price > value;
          return (
            <div key={label} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3">
              <div className="text-xs text-[var(--text-secondary)] mb-1">{label}</div>
              <div className="mono font-bold text-sm text-[var(--text-primary)]">${formatPrice(value)}</div>
              <div className={`text-xs mt-1 ${abovePrice ? "price-up" : "price-down"}`}>
                {abovePrice ? "▲ Above" : "▼ Below"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Bollinger Bands ───────────────────────────
function BollingerSection({ bb }: { bb: IndicatorData["bollinger_bands"] }) {
  if (!bb.upper || !bb.lower || !bb.middle) return null;
  const pctB = bb.percent_b ?? 50;
  const position = Math.min(100, Math.max(0, pctB));

  return (
    <div className="border-t border-[var(--border-color)] pt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-[var(--text-primary)]">Bollinger Bands (20, 2σ)</span>
        <Tooltip2 text="Bands that widen during high volatility. Price near lower band = possible buy. Near upper = possible sell." />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 text-center">
          <div className="text-xs text-[#10d98a] mb-1">Lower</div>
          <div className="mono font-bold text-sm">${formatPrice(bb.lower)}</div>
        </div>
        <div className="bg-[rgba(79,128,255,0.05)] rounded-xl p-3 text-center">
          <div className="text-xs text-[var(--accent-blue)] mb-1">Middle</div>
          <div className="mono font-bold text-sm">${formatPrice(bb.middle)}</div>
        </div>
        <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 text-center">
          <div className="text-xs text-[#ff4d6d] mb-1">Upper</div>
          <div className="mono font-bold text-sm">${formatPrice(bb.upper)}</div>
        </div>
      </div>
      {bb.percent_b != null && (
        <>
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
            <span>Lower</span>
            <span>%B = {pctB.toFixed(1)}%</span>
            <span>Upper</span>
          </div>
          <div className="bg-[rgba(255,255,255,0.05)] rounded h-2 relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--accent-blue)] border-2 border-white shadow transition-all duration-500"
              style={{ left: `calc(${position}% - 6px)` }}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Volume ────────────────────────────────────
function VolumeSection({ vol }: { vol: IndicatorData["volume"] }) {
  if (!vol.current) return null;
  const rel = vol.relative ?? 1;
  const pct = Math.min(100, (rel / 3) * 100);
  const color = rel > 1.5 ? (rel > 2 ? "#ff4d6d" : "#f59e0b") : "#4f80ff";

  return (
    <div className="border-t border-[var(--border-color)] pt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">Volume</span>
        <span className="mono font-bold text-sm" style={{ color }}>
          {rel.toFixed(1)}x avg
        </span>
      </div>
      <div className="bg-[rgba(255,255,255,0.05)] rounded-full h-2 overflow-hidden mb-2">
        <div
          className="h-full rounded-full confidence-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex gap-4 text-xs text-[var(--text-secondary)]">
        <span>Current: <span className="text-[var(--text-primary)] font-medium">
          {vol.current ? (vol.current / 1e6).toFixed(2) + "M" : "—"}
        </span></span>
        <span>20D Avg: <span className="text-[var(--text-primary)] font-medium">
          {vol.avg_20d ? (vol.avg_20d / 1e6).toFixed(2) + "M" : "—"}
        </span></span>
      </div>
    </div>
  );
}

// ── Tooltip helper ────────────────────────────
function Tooltip2({ text }: { text: string }) {
  return (
    <div className="relative group">
      <HelpCircle size={13} className="text-[var(--text-secondary)] cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 rounded-lg bg-[rgba(8,13,26,0.95)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
        {text}
      </div>
    </div>
  );
}

function IndicatorSkeleton() {
  return (
    <div className="glass-card p-6 space-y-5">
      <div className="shimmer h-6 w-40 rounded" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2 border-t border-[var(--border-color)] pt-4">
          <div className="shimmer h-4 w-32 rounded" />
          <div className="shimmer h-16 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
