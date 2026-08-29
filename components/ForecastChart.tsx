"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ForecastData, formatPrice } from "@/lib/api";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface ForecastChartProps {
  data: ForecastData | null;
  loading?: boolean;
}

export default function ForecastChart({ data, loading }: ForecastChartProps) {
  if (loading) return <ForecastSkeleton />;
  if (!data) return null;

  const { history, forecast, summary, method, disclaimer } = data;

  const isUp = summary.direction === "up";
  const forecastColor = isUp ? "#10d98a" : "#ff4d6d";
  const outlookBg = summary.outlook === "Bullish"
    ? "rgba(16,217,138,0.1)"
    : summary.outlook === "Bearish"
    ? "rgba(255,77,109,0.1)"
    : "rgba(245,158,11,0.1)";

  // Combine history + forecast labels
  const allLabels = [...history.dates, ...forecast.dates];
  const histLen = history.dates.length;
  const forecastLen = forecast.dates.length;

  // History dataset (full length, null for forecast portion)
  const histData = [
    ...history.prices,
    ...Array(forecastLen).fill(null),
  ];

  // Forecast dataset (null for history portion, then forecast values)
  const forecastData = [
    ...Array(histLen - 1).fill(null),
    history.prices[history.prices.length - 1], // connect from last history point
    ...forecast.prices,
  ];

  const upperData = [
    ...Array(histLen).fill(null),
    ...forecast.upper_band,
  ];

  const lowerData = [
    ...Array(histLen).fill(null),
    ...forecast.lower_band,
  ];

  const chartData = {
    labels: allLabels,
    datasets: [
      // History line
      {
        label: "History",
        data: histData,
        borderColor: "#4f80ff",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: false,
      },
      // Upper confidence band (fill down to lowerData)
      {
        label: "Upper Band",
        data: upperData,
        borderColor: "transparent",
        borderWidth: 0,
        pointRadius: 0,
        fill: "+1",
        backgroundColor: isUp ? "rgba(16,217,138,0.12)" : "rgba(255,77,109,0.12)",
        tension: 0.3,
      },
      // Lower confidence band
      {
        label: "Lower Band",
        data: lowerData,
        borderColor: "transparent",
        borderWidth: 0,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      },
      // Forecast line
      {
        label: "Forecast",
        data: forecastData,
        borderColor: forecastColor,
        borderWidth: 2,
        borderDash: [6, 3],
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(8,13,26,0.95)",
        borderColor: "rgba(99,130,255,0.3)",
        borderWidth: 1,
        titleColor: "#8899bb",
        bodyColor: "#e8edf8",
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => {
            if (ctx.parsed.y == null) return "";
            return ` ${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(99,130,255,0.06)" },
        ticks: {
          color: "#8899bb",
          font: { family: "Inter", size: 10 },
          maxTicksLimit: 10,
          maxRotation: 0,
        },
        border: { color: "rgba(99,130,255,0.1)" },
      },
      y: {
        position: "right",
        grid: { color: "rgba(99,130,255,0.06)" },
        ticks: {
          color: "#8899bb",
          font: { family: "JetBrains Mono", size: 11 },
          callback: (v) => `$${Number(v).toFixed(0)}`,
        },
        border: { color: "rgba(99,130,255,0.1)" },
      },
    },
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-[var(--text-primary)] mb-1">Price Forecast</h3>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.05)]">Method: {method}</span>
            <span className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.05)]">{forecast.dates.length}d horizon</span>
          </div>
        </div>

        {/* Summary card */}
        <div
          className="rounded-xl px-4 py-2 text-center"
          style={{ background: outlookBg, border: `1px solid ${isUp ? "rgba(16,217,138,0.3)" : "rgba(255,77,109,0.3)"}` }}
        >
          <div className="flex items-center gap-1 text-xs font-semibold mb-1" style={{ color: forecastColor }}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {summary.outlook} Outlook
          </div>
          <div className="mono font-bold text-base text-[var(--text-primary)]">
            ${formatPrice(summary.projected_price)}
          </div>
          <div className={`text-xs font-semibold ${isUp ? "price-up" : "price-down"}`}>
            {isUp ? "+" : ""}{summary.projected_change_pct.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <LegendItem color="#4f80ff" label="Historical" dash={false} />
        <LegendItem color={forecastColor} label="Forecast" dash={true} />
        <LegendItem color={isUp ? "rgba(16,217,138,0.4)" : "rgba(255,77,109,0.4)"} label="80% CI Band" dash={false} wide />
      </div>

      {/* Chart */}
      <div style={{ height: 260 }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 mt-4 rounded-xl bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)]">
        <AlertTriangle size={14} className="text-[var(--color-neutral)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{disclaimer}</p>
      </div>
    </div>
  );
}

function LegendItem({ color, label, dash, wide }: { color: string; label: string; dash: boolean; wide?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {wide ? (
        <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: color }} />
      ) : (
        <svg width="20" height="2">
          {dash ? (
            <line x1="0" y1="1" x2="20" y2="1" stroke={color} strokeWidth="2" strokeDasharray="4,2" />
          ) : (
            <line x1="0" y1="1" x2="20" y2="1" stroke={color} strokeWidth="2" />
          )}
        </svg>
      )}
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}

function ForecastSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between mb-4">
        <div className="shimmer h-6 w-36 rounded" />
        <div className="shimmer h-16 w-28 rounded-xl" />
      </div>
      <div className="shimmer rounded-xl" style={{ height: 260 }} />
    </div>
  );
}
