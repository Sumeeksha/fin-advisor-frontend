"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { OHLCVBar } from "@/lib/api";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Tooltip, Legend, Filler, TimeScale
);

interface StockChartProps {
  data: OHLCVBar[];
  period: string;
  onPeriodChange: (p: string) => void;
  loading?: boolean;
  ticker: string;
}

const PERIODS = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

export default function StockChart({ data, period, onPeriodChange, loading, ticker }: StockChartProps) {
  const [showVolume, setShowVolume] = useState(true);

  if (loading) return <StockChartSkeleton />;
  if (!data || data.length === 0) return null;

  const labels = data.map((d) => d.date);
  const prices = data.map((d) => d.close);
  const volumes = data.map((d) => d.volume);

  const isPositive = prices.length > 1 && prices[prices.length - 1] >= prices[0];
  const lineColor = isPositive ? "#10d98a" : "#ff4d6d";
  const gradientId = `gradient-${ticker}`;

  // Min/Max for display
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const pricePad = (maxPrice - minPrice) * 0.05;

  const lineChartData = {
    labels,
    datasets: [
      {
        label: ticker,
        data: prices,
        borderColor: lineColor,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: lineColor,
        tension: 0.3,
        fill: true,
        backgroundColor: (ctx: { chart: ChartJS }) => {
          const chart = ctx.chart;
          const { ctx: canvas, chartArea } = chart;
          if (!chartArea) return "transparent";
          const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, isPositive ? "rgba(16,217,138,0.25)" : "rgba(255,77,109,0.25)");
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          return gradient;
        },
      },
    ],
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(8,13,26,0.95)",
        borderColor: "rgba(99,130,255,0.3)",
        borderWidth: 1,
        titleColor: "#8899bb",
        bodyColor: "#e8edf8",
        titleFont: { family: "Inter", size: 11 },
        bodyFont: { family: "JetBrains Mono", size: 13, weight: "bold" as const },
        callbacks: {
          label: (ctx) => ` $${(ctx.parsed.y ?? 0).toFixed(2)}`,
        },
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(99,130,255,0.06)", lineWidth: 1 },
        ticks: {
          color: "#8899bb",
          font: { family: "Inter", size: 11 },
          maxTicksLimit: 8,
          maxRotation: 0,
        },
        border: { color: "rgba(99,130,255,0.1)" },
      },
      y: {
        position: "right",
        grid: { color: "rgba(99,130,255,0.06)", lineWidth: 1 },
        ticks: {
          color: "#8899bb",
          font: { family: "JetBrains Mono", size: 11 },
          callback: (v) => `$${Number(v).toFixed(0)}`,
        },
        border: { color: "rgba(99,130,255,0.1)" },
        min: minPrice - pricePad,
        max: maxPrice + pricePad,
      },
    },
  };

  const volumeData = {
    labels,
    datasets: [
      {
        label: "Volume",
        data: volumes,
        backgroundColor: data.map((d, i) =>
          i > 0 && d.close >= data[i - 1].close
            ? "rgba(16,217,138,0.5)"
            : "rgba(255,77,109,0.5)"
        ),
        borderRadius: 2,
        borderSkipped: false,
      },
    ],
  };

  const volumeOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(8,13,26,0.95)",
        borderColor: "rgba(99,130,255,0.3)",
        borderWidth: 1,
        titleColor: "#8899bb",
        bodyColor: "#e8edf8",
        callbacks: {
          label: (ctx) => ` Vol: ${((ctx.parsed.y ?? 0) / 1e6).toFixed(1)}M`,
        },
        padding: 10,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
        border: { display: false },
      },
      y: {
        position: "right",
        grid: { display: false },
        ticks: {
          color: "#8899bb",
          font: { family: "Inter", size: 10 },
          maxTicksLimit: 3,
          callback: (v) => `${(Number(v) / 1e6).toFixed(0)}M`,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-[var(--text-primary)]">Price Chart</h3>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: lineColor }} />
            <span className="text-sm font-bold" style={{ color: lineColor }}>{ticker}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period toggle */}
          <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                id={`period-${p}`}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${period === p
                    ? "tab-active"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Volume toggle */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${showVolume
                ? "border-[rgba(79,128,255,0.4)] text-[var(--accent-blue)] bg-[rgba(79,128,255,0.1)]"
                : "border-[var(--border-color)] text-[var(--text-secondary)]"
              }`}
          >
            Vol
          </button>
        </div>
      </div>

      {/* Price chart */}
      <div style={{ height: 280 }}>
        <Line data={lineChartData} options={lineOptions} />
      </div>

      {/* Volume chart */}
      {showVolume && (
        <div style={{ height: 70, marginTop: 8 }}>
          <Bar data={volumeData} options={volumeOptions} />
        </div>
      )}
    </div>
  );
}

function StockChartSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between mb-5">
        <div className="shimmer h-6 w-32 rounded" />
        <div className="shimmer h-8 w-48 rounded-xl" />
      </div>
      <div className="shimmer rounded-xl" style={{ height: 280 }} />
    </div>
  );
}
