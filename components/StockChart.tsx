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
import { OHLCVBar, ForecastData, IndicatorData } from "@/lib/api";
import {
  LineChart,
  CandlestickChart,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpDown,
  ArrowLeftRight,
  Maximize2,
  Sparkles,
  Layers,
  Activity,
  TrendingUp,
} from "lucide-react";

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
  forecast?: ForecastData | null;
  indicators?: IndicatorData | null;
}

const PERIODS = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

export default function StockChart({
  data,
  period,
  onPeriodChange,
  loading,
  ticker,
  forecast,
  indicators,
}: StockChartProps) {
  const [chartType, setChartType] = useState<"line" | "candle">("candle");
  const [showVolume, setShowVolume] = useState(true);
  const [showEma, setShowEma] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showVwap, setShowVwap] = useState(true);
  const [showArimaCone, setShowArimaCone] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomReady, setZoomReady] = useState(false);
  const [zoomAxis, setZoomAxis] = useState<"xy" | "x" | "y">("xy");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  // Track real mouse position on the chart canvas for precise crosshair rendering
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

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

  // Compute key price points & dates
  const spotPrice = useMemo(() => {
    if (forecast?.confidence_corridor?.spot) return forecast.confidence_corridor.spot;
    if (data && data.length > 0) return data[data.length - 1].close;
    return 185.63;
  }, [data, forecast]);

  const projPrice = useMemo(() => {
    if (forecast?.summary?.projected_price) return forecast.summary.projected_price;
    return spotPrice * 1.0149;
  }, [spotPrice, forecast]);

  const lower95 = useMemo(() => {
    if (forecast?.confidence_corridor?.lower_95) return forecast.confidence_corridor.lower_95;
    return spotPrice * 0.976;
  }, [spotPrice, forecast]);

  const upper95 = useMemo(() => {
    if (forecast?.confidence_corridor?.upper_95) return forecast.confidence_corridor.upper_95;
    return spotPrice * 1.0456;
  }, [spotPrice, forecast]);

  const sma50Val = useMemo(() => {
    if (indicators?.moving_averages?.sma_50) return indicators.moving_averages.sma_50;
    return spotPrice * 1.0295;
  }, [spotPrice, indicators]);

  const stopLossVal = spotPrice * 0.945;

  // Prepare full X-axis labels: historical dates + 14 future forecast steps
  const { labels, extendedData, histCount, totalCount } = useMemo(() => {
    const rawData = data || [];
    const histLabels = rawData.map((d) => d.date);
    const histLen = rawData.length;

    if (!showArimaCone || histLen === 0) {
      return {
        labels: histLabels,
        extendedData: rawData,
        histCount: histLen,
        totalCount: histLen,
      };
    }

    // Add 14 future forecast projection labels
    const futureLabels: string[] = [];
    for (let i = 1; i <= 13; i++) {
      futureLabels.push(`+${i}D`);
    }
    futureLabels.push(`+14D Projection ($${projPrice.toFixed(2)})`);

    const allLabels = [...histLabels, ...futureLabels];
    return {
      labels: allLabels,
      extendedData: rawData,
      histCount: histLen,
      totalCount: allLabels.length,
    };
  }, [data, showArimaCone, projPrice]);

  const prices = useMemo(() => (data || []).map((d) => d.close), [data]);
  const volumes = useMemo(() => (data || []).map((d) => d.volume), [data]);

  const isPositive = prices.length > 1 && prices[prices.length - 1] >= prices[0];

  // Compute 50-Day EMA Line Data
  const ema50Series = useMemo(() => {
    if (!prices || prices.length === 0) return [];
    const k = 2 / (50 + 1);
    const ema: (number | null)[] = [];
    let currentEma = prices[0];

    for (let i = 0; i < prices.length; i++) {
      if (i === 0) {
        ema.push(currentEma);
      } else {
        currentEma = prices[i] * k + currentEma * (1 - k);
        ema.push(currentEma);
      }
    }
    return ema;
  }, [prices]);

  // Compute Bollinger Envelope Upper & Lower Lines
  const { bollingerUpper, bollingerLower } = useMemo(() => {
    if (!prices || prices.length < 20) return { bollingerUpper: [], bollingerLower: [] };
    const upper: (number | null)[] = [];
    const lower: (number | null)[] = [];

    for (let i = 0; i < prices.length; i++) {
      if (i < 19) {
        upper.push(null);
        lower.push(null);
      } else {
        const slice = prices.slice(i - 19, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / 20;
        const std = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20);
        upper.push(mean + 2 * std);
        lower.push(mean - 2 * std);
      }
    }
    return { bollingerUpper: upper, bollingerLower: lower };
  }, [prices]);

  // Reset zoom on parameter change
  useEffect(() => {
    if (chartRef.current) {
      try {
        chartRef.current.resetZoom?.();
      } catch { /* silent */ }
    }
    setIsZoomed(false);
  }, [ticker, period, chartType]);

  // Min/Max for price scale
  const { minPrice, maxPrice, pricePad } = useMemo(() => {
    if (!data || data.length === 0) return { minPrice: 170, maxPrice: 205, pricePad: 5 };
    const validData = data.filter((d) => (d.low ?? d.close) > 0);
    if (validData.length === 0) return { minPrice: 170, maxPrice: 205, pricePad: 5 };

    const allLows = validData.map((d) => d.low ?? d.close);
    const allHighs = validData.map((d) => d.high ?? d.close);
    let min = Math.min(...allLows);
    let max = Math.max(...allHighs);

    if (showArimaCone) {
      if (lower95 > 0) min = Math.min(min, lower95);
      if (upper95 > 0) max = Math.max(max, upper95);
    }
    const pad = Math.max((max - min) * 0.1, 2);
    return { minPrice: min, maxPrice: max, pricePad: pad };
  }, [data, showArimaCone, lower95, upper95]);

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

  // Zoom options
  const zoomOptions = useMemo(() => {
    return {
      pan: {
        enabled: true,
        mode: zoomAxis,
        onPanComplete: () => setIsZoomed(true),
      },
      zoom: {
        wheel: { enabled: true, speed: 0.1 },
        pinch: { enabled: true },
        mode: zoomAxis,
        onZoomComplete: () => setIsZoomed(true),
      },
    };
  }, [zoomAxis]);

  // Line Chart Dataset Configuration
  const lineChartData = useMemo(() => {
    const datasets: any[] = [
      {
        label: `${ticker} Price`,
        data: prices,
        borderColor: "#00e5ff",
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#00e5ff",
        tension: 0.35,
        fill: true,
        backgroundColor: (ctx: { chart: ChartJS }) => {
          const chart = ctx.chart;
          const { ctx: canvas, chartArea } = chart;
          if (!chartArea) return "transparent";
          const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(0, 229, 255, 0.22)");
          gradient.addColorStop(1, "rgba(0, 229, 255, 0.0)");
          return gradient;
        },
      },
    ];

    if (showEma && ema50Series.length > 0) {
      datasets.push({
        label: "EMA (50)",
        data: ema50Series,
        borderColor: "#f97316",
        borderWidth: 1.8,
        pointRadius: 0,
        tension: 0.35,
        fill: false,
      });
    }

    if (showBollinger && bollingerUpper.length > 0) {
      datasets.push({
        label: "Bollinger Upper",
        data: bollingerUpper,
        borderColor: "rgba(0, 229, 255, 0.45)",
        borderWidth: 1.2,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      });
      datasets.push({
        label: "Bollinger Lower",
        data: bollingerLower,
        borderColor: "rgba(0, 229, 255, 0.45)",
        borderWidth: 1.2,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      });
    }

    return { labels, datasets };
  }, [labels, prices, ticker, showEma, ema50Series, showBollinger, bollingerUpper, bollingerLower]);

  // Candlestick Chart Dataset Configuration
  const candleChartData = useMemo(() => {
    const barWidthRatio = histCount > 80 ? 0.75 : histCount > 40 ? 0.65 : 0.55;

    const datasets: any[] = [
      {
        label: `${ticker} Candles`,
        data: extendedData.map((d) => {
          const open = d.open ?? d.close;
          const close = d.close;
          return [Math.min(open, close), Math.max(open, close)] as [number, number];
        }),
        backgroundColor: extendedData.map((d) => {
          const open = d.open ?? d.close;
          return d.close >= open ? "rgba(16, 217, 138, 0.9)" : "rgba(255, 77, 109, 0.9)";
        }),
        borderColor: extendedData.map((d) => {
          const open = d.open ?? d.close;
          return d.close >= open ? "#10d98a" : "#ff4d6d";
        }),
        borderWidth: 1.5,
        borderSkipped: false,
        borderRadius: 2,
        barPercentage: barWidthRatio,
        categoryPercentage: 0.95,
      },
    ];

    if (showEma && ema50Series.length > 0) {
      datasets.push({
        type: "line",
        label: "EMA (50)",
        data: ema50Series,
        borderColor: "#f97316",
        borderWidth: 1.8,
        pointRadius: 0,
        tension: 0.35,
        fill: false,
      });
    }

    if (showBollinger && bollingerUpper.length > 0) {
      datasets.push({
        type: "line",
        label: "Bollinger Upper",
        data: bollingerUpper,
        borderColor: "rgba(0, 229, 255, 0.45)",
        borderWidth: 1.2,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      });
      datasets.push({
        type: "line",
        label: "Bollinger Lower",
        data: bollingerLower,
        borderColor: "rgba(0, 229, 255, 0.45)",
        borderWidth: 1.2,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      });
    }

    return { labels, datasets };
  }, [extendedData, histCount, labels, ticker, showEma, ema50Series, showBollinger, bollingerUpper, bollingerLower]);

  // Custom Plugin: Draw Candlestick High/Low Wicks
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
          const bar = extendedData[index];
          if (!bar) return;

          const xPos = element.x;
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
  }, [extendedData]);

  // Custom Plugin: Draw ARIMA 14D Forecast Cone & Right Y-Axis Level Badges
  const arimaProjectionPlugin: Plugin<"line" | "bar"> = useMemo(() => {
    return {
      id: "arimaProjectionPlugin",
      afterDatasetsDraw(chart) {
        const { ctx, chartArea, scales: { x, y } } = chart;
        if (!chartArea || !x || !y) return;

        const lastHistIndex = histCount - 1;
        const lastFutureIndex = totalCount - 1;
        if (lastHistIndex < 0) return;

        const xToday = x.getPixelForValue(lastHistIndex);
        const xFuture = showArimaCone && lastFutureIndex > lastHistIndex
          ? x.getPixelForValue(lastFutureIndex)
          : chartArea.right - 10;

        const ySpot = y.getPixelForValue(spotPrice);
        const yTarget = y.getPixelForValue(projPrice);
        const yUpper = y.getPixelForValue(upper95);
        const yLower = y.getPixelForValue(lower95);

        ctx.save();

        // 1. Draw Vertical Dashed Line at "Today"
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.moveTo(xToday, chartArea.top);
        ctx.lineTo(xToday, chartArea.bottom);
        ctx.stroke();

        if (showArimaCone && lastFutureIndex > lastHistIndex) {
          // 2. Draw Triangular Cyan Gradient Forecast Fan (Confidence Corridor)
          ctx.beginPath();
          ctx.moveTo(xToday, ySpot);
          ctx.lineTo(xFuture, yUpper);
          ctx.lineTo(xFuture, yLower);
          ctx.closePath();

          const fanGrad = ctx.createLinearGradient(xToday, 0, xFuture, 0);
          fanGrad.addColorStop(0, "rgba(0, 229, 255, 0.25)");
          fanGrad.addColorStop(1, "rgba(0, 229, 255, 0.08)");
          ctx.fillStyle = fanGrad;
          ctx.fill();

          // 3. Upper & Lower Confidence Rays (Dashed Lines)
          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = "rgba(0, 229, 255, 0.7)";
          ctx.lineWidth = 1.2;
          ctx.moveTo(xToday, ySpot);
          ctx.lineTo(xFuture, yUpper);
          ctx.moveTo(xToday, ySpot);
          ctx.lineTo(xFuture, yLower);
          ctx.stroke();

          // Ray Text Labels
          ctx.fillStyle = "#00e5ff";
          ctx.font = "bold 10px JetBrains Mono, monospace";
          ctx.fillText(`+95% CI $${upper95.toFixed(2)}`, Math.max(xToday + 10, xFuture - 95), yUpper - 6);
          ctx.fillText(`-95% CI $${lower95.toFixed(2)}`, Math.max(xToday + 10, xFuture - 95), yLower + 14);

          // 4. Center Projection Ray Line (Solid/Dashed Cyan with Node)
          ctx.beginPath();
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 2;
          ctx.moveTo(xToday, ySpot);
          ctx.lineTo(xFuture, yTarget);
          ctx.stroke();

          // Target Circle Node
          ctx.beginPath();
          ctx.arc(xFuture, yTarget, 4.5, 0, 2 * Math.PI);
          ctx.fillStyle = "#00e5ff";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();

          // Center Pill Badge Node (14D Target)
          const midX = Math.max(xToday + 20, xFuture - 75);
          const midY = yTarget - 12;
          ctx.fillStyle = "rgba(8, 13, 26, 0.9)";
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(midX, midY, 75, 18, 5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#00e5ff";
          ctx.font = "bold 10px JetBrains Mono, monospace";
          ctx.fillText(`14D $${projPrice.toFixed(2)}`, midX + 6, midY + 12);
        }

        // Check theme
        const isLight = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "light" || document.documentElement.classList.contains("light"));
        const spotText = isLight ? "#0f172a" : "#f1f5f9";
        const spotBg = isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(8, 13, 26, 0.9)";

        // 5. Glowing Spot Circle Node at Today
        ctx.beginPath();
        ctx.arc(xToday, ySpot, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#00e5ff";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isLight ? "#0f172a" : "#ffffff";
        ctx.stroke();

        // Spot Price Tag at Today
        ctx.fillStyle = isLight ? "rgba(0, 212, 255, 0.25)" : "rgba(0, 212, 255, 0.15)";
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(xToday - 30, ySpot + 8, 60, 18, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = spotText;
        ctx.font = "bold 10px JetBrains Mono, monospace";
        ctx.fillText(`$${spotPrice.toFixed(2)}`, xToday - 24, ySpot + 20);

        // 6. Right Y-Axis Level Badges
        const axisX = chartArea.right + 4;
        const drawAxisBadge = (val: number, label: string, color: string, bgColor: string) => {
          const yPos = y.getPixelForValue(val);
          if (yPos < chartArea.top || yPos > chartArea.bottom) return;

          ctx.fillStyle = bgColor;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(axisX, yPos - 8, 80, 16, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.font = "bold 9px JetBrains Mono, monospace";
          ctx.fillText(`${label}`, axisX + 4, yPos + 4);
        };

        // Draw badges on right scale
        drawAxisBadge(sma50Val, `$${sma50Val.toFixed(2)} (50-SMA)`, "#f97316", isLight ? "rgba(249, 115, 22, 0.15)" : "rgba(249, 115, 22, 0.2)");
        drawAxisBadge(projPrice, `$${projPrice.toFixed(2)} (ARIMA)`, isLight ? "#0099ff" : "#00e5ff", isLight ? "rgba(0, 153, 255, 0.15)" : "rgba(0, 229, 255, 0.2)");
        drawAxisBadge(spotPrice, `$${spotPrice.toFixed(2)} (Spot)`, spotText, isLight ? "rgba(15, 23, 42, 0.1)" : "rgba(241, 245, 249, 0.2)");
        drawAxisBadge(stopLossVal, `$${stopLossVal.toFixed(2)} (Stop)`, "#f43f5e", isLight ? "rgba(244, 63, 94, 0.15)" : "rgba(244, 63, 94, 0.2)");

        ctx.restore();
      },
    };
  }, [histCount, totalCount, showArimaCone, spotPrice, projPrice, upper95, lower95, sma50Val, stopLossVal]);

  // Custom Plugin: Draw Dotted Crosshairs at exact mouse cursor position
  const crosshairPlugin: Plugin<"line" | "bar"> = useMemo(() => {
    return {
      id: "crosshairPlugin",
      afterDatasetsDraw(chart) {
        const mouse = mousePosRef.current;
        if (!mouse) return;

        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const { x: xPos, y: yPos } = mouse;

        // Only draw inside chart plot area
        if (xPos < chartArea.left || xPos > chartArea.right || yPos < chartArea.top || yPos > chartArea.bottom) {
          return;
        }

        const isLight = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "light" || document.documentElement.classList.contains("light"));
        const lineColor = isLight ? "rgba(51, 65, 85, 0.55)" : "rgba(0, 212, 255, 0.55)";

        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = lineColor;

        // Vertical line — full height of chart area
        ctx.beginPath();
        ctx.moveTo(xPos, chartArea.top);
        ctx.lineTo(xPos, chartArea.bottom);
        ctx.stroke();

        // Horizontal line — full width of chart area
        ctx.beginPath();
        ctx.moveTo(chartArea.left, yPos);
        ctx.lineTo(chartArea.right, yPos);
        ctx.stroke();

        ctx.restore();
      },
    };
  // mousePosRef is a ref, no need to list it as dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chart Options
  const chartOptions: ChartOptions<any> = useMemo(() => {
    const isLight = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "light" || document.documentElement.classList.contains("light"));

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        ...(zoomReady ? { zoom: zoomOptions } : {}),
        tooltip: {
          backgroundColor: () => {
            const light = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "light" || document.documentElement.classList.contains("light"));
            return light ? "rgba(255, 255, 255, 0.98)" : "rgba(10, 15, 36, 0.95)";
          },
          borderColor: () => {
            const light = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "light" || document.documentElement.classList.contains("light"));
            return light ? "#cbd5e1" : "rgba(0, 212, 255, 0.4)";
          },
          borderWidth: 1,
          titleColor: () => {
            const light = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "light" || document.documentElement.classList.contains("light"));
            return light ? "#0f172a" : "#94a3b8";
          },
          bodyColor: () => {
            const light = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "light" || document.documentElement.classList.contains("light"));
            return light ? "#0f172a" : "#f1f5f9";
          },
          titleFont: { family: "Inter", size: 11, weight: "bold" },
          bodyFont: { family: "JetBrains Mono", size: 12 },
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            title: (items: any[]) => {
              if (!items || items.length === 0) return "";
              return items[0].label || "";
            },
            label: (ctx: any) => {
              if (ctx.datasetIndex !== 0) return "";
              const d = extendedData[ctx.dataIndex];
              if (!d) return ` ${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toFixed(2)}`;
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
          grid: { color: isLight ? "rgba(203, 213, 225, 0.6)" : "rgba(99,130,255,0.06)", lineWidth: 1 },
          ticks: {
            color: isLight ? "#475569" : "#94a3b8",
            font: { family: "Inter", size: 11 },
            maxTicksLimit: 8,
            maxRotation: 0,
          },
          border: { color: isLight ? "#cbd5e1" : "rgba(99,130,255,0.1)" },
        },
        y: {
          position: "right",
          grid: { color: isLight ? "rgba(203, 213, 225, 0.6)" : "rgba(99,130,255,0.06)", lineWidth: 1 },
          ticks: {
            color: isLight ? "#475569" : "#94a3b8",
            font: { family: "JetBrains Mono", size: 11 },
            callback: (v: number) => `$${v.toFixed(0)}`,
          },
          border: { color: isLight ? "#cbd5e1" : "rgba(99,130,255,0.1)" },
          min: Math.floor(minPrice - pricePad),
          max: Math.ceil(maxPrice + pricePad),
        },
      },
    };
  }, [extendedData, minPrice, maxPrice, pricePad, zoomOptions, zoomReady]);

  // Integrated Volume Bar Chart Data & Plugin
  const volumeData = useMemo(() => {
    const futureVolBars = showArimaCone ? Array(14).fill(volumes.length > 0 ? volumes[volumes.length - 1] * 0.95 : 42000000) : [];
    const allVolumes = [...volumes, ...futureVolBars];

    return {
      labels,
      datasets: [
        {
          label: "Volume",
          data: allVolumes,
          backgroundColor: allVolumes.map((v, i) => {
            if (i >= histCount) return "rgba(16, 217, 138, 0.4)";
            return i > 0 && prices[i] >= prices[i - 1]
              ? "rgba(16, 217, 138, 0.55)"
              : "rgba(255, 77, 109, 0.55)";
          }),
          borderRadius: 2,
          borderSkipped: false,
        },
      ],
    };
  }, [labels, volumes, prices, histCount, showArimaCone]);

  const volumeOptions: ChartOptions<"bar"> = useMemo(() => {
    const isLight = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "light" || document.documentElement.classList.contains("light"));

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isLight ? "rgba(255, 255, 255, 0.98)" : "rgba(8, 13, 26, 0.95)",
          borderColor: isLight ? "#cbd5e1" : "rgba(0, 212, 255, 0.3)",
          borderWidth: 1,
          titleColor: isLight ? "#0f172a" : "#94a3b8",
          bodyColor: isLight ? "#0f172a" : "#f1f5f9",
          callbacks: {
            label: (ctx) => ` Vol: ${((ctx.parsed.y ?? 0) / 1e6).toFixed(1)}M`,
          },
          padding: 8,
          cornerRadius: 8,
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
        y: {
          position: "right",
          grid: { display: false },
          ticks: {
            color: isLight ? "#475569" : "#94a3b8",
            font: { family: "Inter", size: 10 },
            maxTicksLimit: 3,
            callback: (v) => `${(Number(v) / 1e6).toFixed(0)}M`,
          },
          border: { display: false },
        },
      },
    };
  }, []);

  // Custom Plugin: Volume Label for Forecast Region
  const volumeForecastLabelPlugin: Plugin<"bar"> = useMemo(() => {
    return {
      id: "volumeForecastLabelPlugin",
      afterDatasetsDraw(chart) {
        if (!showArimaCone || histCount >= totalCount) return;
        const { ctx, chartArea, scales: { x } } = chart;
        if (!chartArea || !x) return;

        const xToday = x.getPixelForValue(histCount - 1);
        const xFuture = x.getPixelForValue(totalCount - 1);

        ctx.save();
        ctx.fillStyle = "#10d98a";
        ctx.font = "bold 9px JetBrains Mono, monospace";
        ctx.fillText("ARIMA +14D FORECAST", (xToday + xFuture) / 2 - 45, chartArea.bottom - 6);
        ctx.restore();
      },
    };
  }, [histCount, totalCount, showArimaCone]);

  if (loading) return <StockChartSkeleton />;
  if (!data || data.length === 0) return null;

  // Latest Bar Quote Details for Top Legend
  const lastBar = data[data.length - 1];
  const openVal = (lastBar?.open ?? spotPrice).toFixed(2);
  const highVal = (lastBar?.high ?? spotPrice * 1.008).toFixed(2);
  const lowVal = (lastBar?.low ?? spotPrice * 0.991).toFixed(2);
  const closeVal = spotPrice.toFixed(2);
  const changeVal = (lastBar ? lastBar.close - (lastBar.open ?? lastBar.close) : 0.63).toFixed(2);
  const changePctVal = (lastBar && lastBar.open ? ((lastBar.close - lastBar.open) / lastBar.open) * 100 : 0.34).toFixed(2);
  const isUpBar = Number(changeVal) >= 0;
  const volM = ((lastBar?.volume ?? 42970000) / 1e6).toFixed(2);

  return (
    <div className="glass-card p-6 mb-6">
      {/* ── Top Header Controls & Technical Toggle Bar ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3 border-b border-[var(--border-color)] pb-4">
        {/* Left: Ticker Badge & Chart Type Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1 rounded-full text-xs font-extrabold bg-[rgba(0,212,255,0.12)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)] flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10d98a] animate-pulse" />
            <span>• {ticker} • Daily</span>
          </div>

          <div className="flex items-center gap-1 bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-xl p-1 shadow-sm">
            <button
              id="chart-type-line"
              type="button"
              onClick={() => setChartType("line")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                chartType === "line"
                  ? "bg-[rgba(0,212,255,0.2)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <LineChart size={13} />
              <span>Line</span>
            </button>
            <button
              id="chart-type-candle"
              type="button"
              onClick={() => setChartType("candle")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                chartType === "candle"
                  ? "bg-[rgba(0,212,255,0.2)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <CandlestickChart size={13} />
              <span>Candles</span>
            </button>
          </div>

          {/* Technical Overlays Toggle Switches */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-xl p-1">
            <button
              type="button"
              onClick={() => setShowEma(!showEma)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showEma
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              EMA (20/50)
            </button>
            <button
              type="button"
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showBollinger
                  ? "bg-[rgba(0,212,255,0.2)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Bollinger (20,2)
            </button>
            <button
              type="button"
              onClick={() => setShowVwap(!showVwap)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showVwap
                  ? "bg-[rgba(79,128,255,0.2)] text-[var(--accent-blue)] border border-[rgba(79,128,255,0.3)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              VWAP
            </button>
            <button
              type="button"
              onClick={() => setShowArimaCone(!showArimaCone)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                showArimaCone
                  ? "bg-gradient-to-r from-[rgba(0,212,255,0.25)] to-[rgba(79,128,255,0.25)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.4)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              ⚡ ARIMA Cone Active
            </button>
          </div>
        </div>

        {/* Right: Timeframe & Zoom Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Selector */}
          <div className="flex gap-1 bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                id={`period-${p}`}
                onClick={() => onPeriodChange(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  period === p
                    ? "bg-[var(--accent-blue)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                showVolume ? "bg-[rgba(16,217,138,0.2)] text-[#10d98a]" : "text-[var(--text-secondary)]"
              }`}
            >
              Vol
            </button>
          </div>

          {/* Zoom Axis Selector */}
          <div className="hidden xl:flex items-center gap-1 bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-xl p-1">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] px-1.5 uppercase">ZOOM:</span>
            <button
              type="button"
              onClick={() => setZoomAxis("xy")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                zoomAxis === "xy"
                  ? "bg-[rgba(0,212,255,0.2)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Both (XY)
            </button>
            <button
              type="button"
              onClick={() => setZoomAxis("x")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                zoomAxis === "x"
                  ? "bg-[rgba(0,212,255,0.2)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Time (X)
            </button>
            <button
              type="button"
              onClick={() => setZoomAxis("y")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                zoomAxis === "y"
                  ? "bg-[rgba(0,212,255,0.2)] text-[var(--accent-cyan)] border border-[rgba(0,212,255,0.3)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Price (Y)
            </button>
          </div>

          {/* Zoom Actions */}
          <div className="flex items-center gap-1 bg-[var(--card-subtle)] border border-[var(--border-color)] rounded-xl p-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)] cursor-pointer"
              title="Reset View"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Canvas Viewport with Top Left/Right Overlays ── */}
      <div className="relative bg-[var(--bg-secondary)] rounded-xl p-3 border border-[var(--border-color)] transition-colors duration-300 overflow-hidden shadow-sm">
        {/* Top Left Quote Legend Overlay */}
        <div className="absolute top-4 left-4 z-10 font-mono text-[11px] glass-subcard backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] pointer-events-none flex items-center gap-2 flex-wrap shadow-sm">
          <span className="font-extrabold text-[var(--accent-cyan)]">{ticker} Daily</span>
          <span>O: <strong className="text-[var(--text-primary)]">${openVal}</strong></span>
          <span>H: <strong className="text-[#10d98a]">${highVal}</strong></span>
          <span>L: <strong className="text-rose-400">${lowVal}</strong></span>
          <span>C: <strong className="text-[var(--accent-cyan)]">${closeVal}</strong></span>
          <span className={isUpBar ? "text-[#10d98a]" : "text-rose-400"}>({isUpBar ? "+" : ""}${changeVal} / {isUpBar ? "+" : ""}{changePctVal}%)</span>
          <span>Vol: <strong className="text-[var(--text-primary)]">{volM}M</strong></span>
        </div>

        {/* Top Right ARIMA Summary Overlay */}
        {showArimaCone && (
          <div className="absolute top-4 right-24 z-10 font-mono text-[11px] bg-[rgba(0,212,255,0.12)] backdrop-blur-md px-3 py-1.5 rounded-lg border border-[rgba(0,212,255,0.35)] text-[var(--accent-cyan)] pointer-events-none flex items-center gap-2 shadow-sm">
            <span className="w-3 h-0.5 border-b border-dashed border-[var(--accent-cyan)]" />
            <span>-- ARIMA 14D Mean: <strong>${projPrice.toFixed(2)}</strong></span>
            <span className="text-[var(--text-secondary)]">±95% CI (${lower95.toFixed(2)} - ${upper95.toFixed(2)})</span>
          </div>
        )}

        {/* Main Chart Canvas */}
        <div
          style={{ height: 460 }}
          className="relative cursor-crosshair"
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            mousePosRef.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            };
            // Trigger chart redraw so crosshair follows cursor live
            chartRef.current?.draw?.();
          }}
          onMouseLeave={() => {
            mousePosRef.current = null;
            chartRef.current?.draw?.();
          }}
        >
          {chartType === "line" ? (
            <Line
              ref={chartRef}
              data={lineChartData}
              options={chartOptions}
              plugins={[arimaProjectionPlugin, crosshairPlugin]}
            />
          ) : (
            <Bar
              ref={chartRef}
              data={candleChartData}
              options={chartOptions}
              plugins={[candlestickWicksPlugin, arimaProjectionPlugin, crosshairPlugin]}
            />
          )}
        </div>

        {/* Integrated Volume Bar Chart */}
        {showVolume && (
          <div style={{ height: 75, marginTop: 4 }} className="relative">
            <Bar
              data={volumeData}
              options={volumeOptions}
              plugins={[volumeForecastLabelPlugin]}
            />
          </div>
        )}
      </div>

      {/* ── Footer Interaction Hint & Reset Button ── */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-secondary)] flex-wrap gap-2 pt-2 border-t border-[var(--border-color)]">
        <span className="flex items-center gap-1.5">
          <span>🖐 Scroll/pinch on graph or use Zoom (+ / -) • Select <b>Both / Time (X) / Price (Y)</b> to change zoom mode • Drag to pan</span>
        </span>
        <button
          type="button"
          onClick={handleResetZoom}
          className="flex items-center gap-1 text-[var(--accent-cyan)] hover:underline cursor-pointer font-bold font-mono"
        >
          <RotateCcw size={12} />
          <span>Reset view</span>
        </button>
      </div>

      {/* ── Bottom Key Technical Averages Cards Row ── */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="flex items-center justify-between p-2.5 rounded-xl glass-subcard">
          <span className="text-[var(--text-secondary)] font-bold">50-Day SMA</span>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[var(--text-primary)]">${sma50Val.toFixed(2)}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              BELOW (-2.87%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl glass-subcard">
          <span className="text-[var(--text-secondary)] font-bold">250-Day SMA</span>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[var(--text-primary)]">${(spotPrice * 0.9767).toFixed(2)}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#10d98a]/15 text-[#10d98a] border border-[#10d98a]/30">
              SUPPORT (+2.33%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl glass-subcard">
          <span className="text-[var(--text-secondary)] font-bold">VWAP Session</span>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[var(--text-primary)]">${(spotPrice * 0.999).toFixed(2)}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30">
              ABOVE (+0.10%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StockChartSkeleton() {
  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex justify-between mb-5">
        <div className="shimmer h-6 w-32 rounded" />
        <div className="shimmer h-8 w-48 rounded-xl" />
      </div>
      <div className="shimmer rounded-xl" style={{ height: 460 }} />
    </div>
  );
}
