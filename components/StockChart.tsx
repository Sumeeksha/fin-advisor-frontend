"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Plugin,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { OHLCVBar } from "@/lib/api";
import { LineChart, CandlestickChart, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

interface StockChartProps {
  data: OHLCVBar[];
  period: string;
  onPeriodChange: (p: string) => void;
  loading?: boolean;
  ticker: string;
}

const PERIODS = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

export default function StockChart({
  data,
  period,
  onPeriodChange,
  loading,
  ticker,
}: StockChartProps) {
  const [chartType, setChartType] = useState<"line" | "candle">("line");
  const [showVolume, setShowVolume] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomReady, setZoomReady] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  // Register zoom plugin on client mount safely for SSR
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("chartjs-plugin-zoom").then((zoomPluginModule) => {
        const zoomPlugin = zoomPluginModule.default || zoomPluginModule;
        ChartJS.register(zoomPlugin);
        setZoomReady(true);
      }).catch(() => {});
    }
  }, []);

  const labels = useMemo(() => (data || []).map((d) => d.date), [data]);
  const prices = useMemo(() => (data || []).map((d) => d.close), [data]);
  const volumes = useMemo(() => (data || []).map((d) => d.volume), [data]);

  const isPositive = prices.length > 1 && prices[prices.length - 1] >= prices[0];
  const lineColor = isPositive ? "#10d98a" : "#ff4d6d";

  // Reset zoom when ticker, period, or chart type changes
  useEffect(() => {
    if (chartRef.current) {
      try {
        chartRef.current.resetZoom?.();
      } catch { /* silent */ }
    }
    setIsZoomed(false);
  }, [ticker, period, chartType]);

  // Min/Max for display
  const minPrice = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.min(...data.map((d) => (d.low !== undefined && d.low !== null ? d.low : d.close)));
  }, [data]);

  const maxPrice = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((d) => (d.high !== undefined && d.high !== null ? d.high : d.close)));
  }, [data]);

  const pricePad = (maxPrice - minPrice) * 0.05 || 1;

  // Zoom handlers
  const handleZoomIn = () => {
    if (chartRef.current) {
      chartRef.current.zoom?.(1.3);
      setIsZoomed(true);
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.zoom?.(0.77);
      setIsZoomed(true);
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom?.();
      setIsZoomed(false);
    }
  };

  // Zoom & pan plugin options
  const zoomOptions = useMemo(() => {
    return {
      pan: {
        enabled: true,
        mode: "x" as const,
        onPanComplete: () => setIsZoomed(true),
      },
      zoom: {
        wheel: {
          enabled: true,
          speed: 0.1,
        },
        pinch: {
          enabled: true,
        },
        mode: "x" as const,
        onZoomComplete: () => setIsZoomed(true),
      },
    };
  }, []);

  // Line chart configuration
  const lineChartData = useMemo(() => {
    return {
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
  }, [labels, prices, ticker, lineColor, isPositive]);

  const lineOptions: ChartOptions<"line"> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        ...(zoomReady ? { zoom: zoomOptions } : {}),
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
  }, [minPrice, maxPrice, pricePad, zoomOptions, zoomReady]);

  // Candlestick chart configuration using floating bars
  const candleChartData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };
    const barWidthRatio = data.length > 80 ? 0.75 : data.length > 40 ? 0.65 : 0.55;

    return {
      labels,
      datasets: [
        {
          label: ticker,
          data: data.map((d) => {
            const open = d.open ?? d.close;
            const close = d.close;
            return [Math.min(open, close), Math.max(open, close)] as [number, number];
          }),
          backgroundColor: data.map((d) => {
            const open = d.open ?? d.close;
            return d.close >= open ? "rgba(16, 217, 138, 0.9)" : "rgba(255, 77, 109, 0.9)";
          }),
          borderColor: data.map((d) => {
            const open = d.open ?? d.close;
            return d.close >= open ? "#10d98a" : "#ff4d6d";
          }),
          borderWidth: 1.5,
          borderSkipped: false,
          borderRadius: 2,
          barPercentage: barWidthRatio,
          categoryPercentage: 0.95,
        },
      ],
    };
  }, [data, labels, ticker]);

  const candleOptions: ChartOptions<"bar"> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        ...(zoomReady ? { zoom: zoomOptions } : {}),
        tooltip: {
          backgroundColor: "rgba(8,13,26,0.95)",
          borderColor: "rgba(99,130,255,0.35)",
          borderWidth: 1,
          titleColor: "#8899bb",
          bodyColor: "#e8edf8",
          titleFont: { family: "Inter", size: 11 },
          bodyFont: { family: "JetBrains Mono", size: 12 },
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => {
              const d = data[ctx.dataIndex];
              if (!d) return "";
              const open = d.open ?? d.close;
              const diff = d.close - open;
              const pct = open > 0 ? (diff / open) * 100 : 0;
              const sign = diff >= 0 ? "+" : "";
              return [
                ` Open:   $${open.toFixed(2)}`,
                ` High:   $${(d.high ?? d.close).toFixed(2)}`,
                ` Low:    $${(d.low ?? d.close).toFixed(2)}`,
                ` Close:  $${d.close.toFixed(2)}`,
                ` Change: ${sign}$${diff.toFixed(2)} (${sign}${pct.toFixed(2)}%)`,
              ];
            },
          },
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
  }, [data, minPrice, maxPrice, pricePad, zoomOptions, zoomReady]);

  // Plugin to draw high/low wicks through each candlestick (with clipping to chartArea)
  const candlestickWicksPlugin: Plugin<"bar"> = useMemo(() => {
    return {
      id: "candlestickWicks",
      beforeDatasetsDraw(chart) {
        const { ctx, chartArea, scales: { y } } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data || !chartArea) return;

        ctx.save();
        ctx.beginPath();
        ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        ctx.clip();

        meta.data.forEach((element, index) => {
          const bar = data[index];
          if (!bar) return;

          const xPos = element.x;
          // Skip if outside visible chart area
          if (xPos < chartArea.left - 20 || xPos > chartArea.right + 20) return;

          const yHigh = y.getPixelForValue(bar.high !== undefined && bar.high !== null ? bar.high : bar.close);
          const yLow = y.getPixelForValue(bar.low !== undefined && bar.low !== null ? bar.low : bar.close);
          const isBull = bar.close >= (bar.open ?? bar.close);

          ctx.beginPath();
          ctx.strokeStyle = isBull ? "#10d98a" : "#ff4d6d";
          ctx.lineWidth = 1.5;
          ctx.moveTo(xPos, yHigh);
          ctx.lineTo(xPos, yLow);
          ctx.stroke();
        });
        ctx.restore();
      },
    };
  }, [data]);

  // Volume chart data and options
  const volumeData = useMemo(() => {
    return {
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
  }, [labels, volumes, data]);

  const volumeOptions: ChartOptions<"bar"> = useMemo(() => {
    return {
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
  }, []);

  if (loading) return <StockChartSkeleton />;
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-[var(--text-primary)]">Price Chart</h3>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: lineColor }} />
            <span className="text-sm font-bold" style={{ color: lineColor }}>{ticker}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom In / Zoom Out / Reset Zoom Controls */}
          <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] rounded-xl p-1 shadow-sm">
            <button
              id="zoom-in-btn"
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(79,128,255,0.15)] transition-all cursor-pointer"
              title="Zoom In (or use mouse scroll / trackpad)"
            >
              <ZoomIn size={14} />
            </button>
            <button
              id="zoom-out-btn"
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(79,128,255,0.15)] transition-all cursor-pointer"
              title="Zoom Out (or use mouse scroll / trackpad)"
            >
              <ZoomOut size={14} />
            </button>
            {isZoomed && (
              <button
                id="reset-zoom-btn"
                type="button"
                onClick={handleResetZoom}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--accent-cyan)] bg-[rgba(0,212,255,0.1)] hover:bg-[rgba(0,212,255,0.2)] border border-[rgba(0,212,255,0.3)] transition-all cursor-pointer animate-pulse"
                title="Reset Zoom"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Chart Type Toggle: Line vs Candle */}
          <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] rounded-xl p-1 shadow-sm">
            <button
              id="chart-type-line"
              type="button"
              onClick={() => setChartType("line")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                chartType === "line"
                  ? "tab-active bg-[rgba(79,128,255,0.2)] text-[var(--accent-blue)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              title="Line Chart"
            >
              <LineChart size={14} />
              <span className="hidden sm:inline">Line</span>
            </button>
            <button
              id="chart-type-candle"
              type="button"
              onClick={() => setChartType("candle")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                chartType === "candle"
                  ? "tab-active bg-[rgba(79,128,255,0.2)] text-[var(--accent-blue)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              title="Candlestick Chart"
            >
              <CandlestickChart size={14} />
              <span className="hidden sm:inline">Candles</span>
            </button>
          </div>

          {/* Period toggle */}
          <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                id={`period-${p}`}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  period === p
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
            id="volume-toggle-btn"
            type="button"
            onClick={() => setShowVolume(!showVolume)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border cursor-pointer ${
              showVolume
                ? "border-[rgba(79,128,255,0.4)] text-[var(--accent-blue)] bg-[rgba(79,128,255,0.1)]"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Vol
          </button>
        </div>
      </div>

      {/* Price chart display (Line or Candlestick) with interactive Zoom & Pan */}
      <div style={{ height: 280 }} className="relative cursor-crosshair">
        {chartType === "line" ? (
          <Line ref={chartRef} data={lineChartData} options={lineOptions} />
        ) : (
          <Bar ref={chartRef} data={candleChartData} options={candleOptions} plugins={[candlestickWicksPlugin]} />
        )}
      </div>

      {/* Volume chart */}
      {showVolume && (
        <div style={{ height: 70, marginTop: 8 }}>
          <Bar data={volumeData} options={volumeOptions} />
        </div>
      )}

      {/* Helpful Hint Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
        <span>💡 Scroll/pinch on graph or use Zoom buttons (+ / -) • Drag to pan timeline</span>
        {isZoomed && (
          <button
            onClick={handleResetZoom}
            className="text-[var(--accent-cyan)] hover:underline cursor-pointer"
          >
            Reset view
          </button>
        )}
      </div>
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
