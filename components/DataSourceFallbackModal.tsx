"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, ExternalLink, Database, RefreshCw } from "lucide-react";

interface DataSourceFallbackModalProps {
  visible: boolean;
  currentSource: string;
  fallbackOptions: string[];
  onDismiss: () => void;
  onSelectFallback: (source: string) => void;
}

const SOURCE_LABELS: Record<string, { name: string; description: string; icon: string }> = {
  yfinance: {
    name: "Yahoo Finance",
    description: "Free real-time & historical data via yfinance API. Reliable with occasional rate limits.",
    icon: "📈",
  },
  finnhub: {
    name: "Finnhub",
    description: "Professional-grade financial data API. Requires API key for live quotes.",
    icon: "🔗",
  },
  alpha_vantage: {
    name: "Alpha Vantage",
    description: "Comprehensive stock market data with technical indicators. Free tier available.",
    icon: "📊",
  },
};

export default function DataSourceFallbackModal({
  visible,
  currentSource,
  fallbackOptions,
  onDismiss,
  onSelectFallback,
}: DataSourceFallbackModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (visible) setIsClosing(false);
  }, [visible]);

  if (!visible) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onDismiss, 250);
  };

  const handleSelect = (source: string) => {
    onSelectFallback(source);
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-250 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      style={{ backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.55)" }}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl border transition-transform duration-250 ${
          isClosing ? "scale-95" : "scale-100"
        }`}
        style={{
          background: "var(--bg-secondary, #1a1d23)",
          borderColor: "var(--border-primary, #2d2f36)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4 rounded-t-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))",
            borderBottom: "1px solid rgba(251,191,36,0.2)",
          }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "rgba(251,191,36,0.15)" }}
          >
            <AlertTriangle size={20} style={{ color: "#fbbf24" }} />
          </div>
          <div className="flex-1">
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--text-primary, #e5e7eb)" }}
            >
              Live TradingView Data Unavailable
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-secondary, #9ca3af)" }}
            >
              Current source: <span className="font-semibold">{currentSource || "None"}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X size={16} style={{ color: "var(--text-secondary, #9ca3af)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary, #9ca3af)" }}
          >
            TradingView real-time price data is currently not available (network issue or rate limit).
            Would you like to use a different data source? The data will be used for all analysis
            including LLM Insights and ARIMA Forecast.
          </p>

          {/* Fallback Options */}
          <div className="space-y-2.5">
            {fallbackOptions.map((key) => {
              const info = SOURCE_LABELS[key] || {
                name: key,
                description: "Alternative data provider",
                icon: "🔄",
              };
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-150 group"
                  style={{
                    background: "var(--bg-tertiary, #22252b)",
                    border: "1px solid var(--border-primary, #2d2f36)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.5)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border-primary, #2d2f36)";
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--bg-tertiary, #22252b)";
                  }}
                >
                  <span className="text-xl">{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm font-semibold block"
                      style={{ color: "var(--text-primary, #e5e7eb)" }}
                    >
                      {info.name}
                    </span>
                    <span
                      className="text-xs block mt-0.5 truncate"
                      style={{ color: "var(--text-secondary, #9ca3af)" }}
                    >
                      {info.description}
                    </span>
                  </div>
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--accent-primary, #6366f1)" }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3.5 rounded-b-2xl"
          style={{
            borderTop: "1px solid var(--border-primary, #2d2f36)",
            background: "var(--bg-tertiary, #22252b)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Database size={12} style={{ color: "var(--text-tertiary, #6b7280)" }} />
            <span className="text-[10px]" style={{ color: "var(--text-tertiary, #6b7280)" }}>
              Data quality may vary by source
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              color: "var(--text-secondary, #9ca3af)",
              background: "transparent",
              border: "1px solid var(--border-primary, #2d2f36)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            Continue with Current
          </button>
        </div>
      </div>
    </div>
  );
}
