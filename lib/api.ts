// API client — communicates with FastAPI backend

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

export interface QuoteData {
  ticker: string;
  name: string;
  price: number;
  prev_close: number | null;
  open: number | null;
  day_high: number | null;
  day_low: number | null;
  volume: number | null;
  market_cap: number | null;
  change: number;
  change_pct: number;
  currency: string;
  exchange: string;
  source: string;
}

export interface OHLCVBar {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorData {
  ticker: string;
  period: string;
  rsi: {
    current: number | null;
    signal: string;
    history: (number | null)[];
    dates: string[];
  };
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    crossover: string;
    macd_history: (number | null)[];
    signal_history: (number | null)[];
    histogram_history: (number | null)[];
    dates: string[];
  };
  moving_averages: {
    sma_20: number | null;
    sma_50: number | null;
    sma_200: number | null;
    ema_12: number | null;
    ema_26: number | null;
    price_vs_sma50: number | null;
    price_vs_sma200: number | null;
    golden_cross: string | null;
  };
  bollinger_bands: {
    upper: number | null;
    middle: number | null;
    lower: number | null;
    bandwidth: number | null;
    percent_b: number | null;
  };
  volume: {
    current: number | null;
    avg_20d: number | null;
    relative: number | null;
  };
  trend: string;
  current_price: number;
}

export interface AdviceReason {
  icon: string;
  text: string;
  sentiment: "bullish" | "bearish" | "neutral";
}

export interface AdviceData {
  ticker: string;
  signal: "BUY" | "HOLD" | "SELL";
  confidence: number;
  score: number;
  trend: string;
  reasons: AdviceReason[];
  risk_factors: string[];
  entry_range: { low: number; high: number };
  exit_target: number;
  stop_loss: number;
  disclaimer: string;
  quote: QuoteData;
}

export interface ForecastData {
  ticker: string;
  method: string;
  history: { dates: string[]; prices: number[] };
  forecast: {
    dates: string[];
    prices: number[];
    upper_band: number[];
    lower_band: number[];
  };
  summary: {
    current_price: number;
    projected_price: number;
    projected_change_pct: number;
    direction: string;
    outlook: string;
  };
  disclaimer: string;
}

export interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export interface CompanyInfo {
  name: string;
  sector: string;
  industry: string;
  description: string;
  market_cap: number | null;
  pe_ratio: number | null;
  eps: number | null;
  dividend_yield: number | null;
  beta: number | null;
  "52w_high": number | null;
  "52w_low": number | null;
  avg_volume: number | null;
  website: string;
  country: string;
}

export const api = {
  searchTickers: (q: string) =>
    fetchApi<{ results: SearchResult[] }>(`/api/stocks/search?q=${encodeURIComponent(q)}`),

  getQuote: (ticker: string) =>
    fetchApi<QuoteData>(`/api/stocks/${ticker}/quote`),

  getHistory: (ticker: string, period: string) =>
    fetchApi<{ ticker: string; period: string; data: OHLCVBar[] }>(
      `/api/stocks/${ticker}/history?period=${period}`
    ),

  getCompanyInfo: (ticker: string) =>
    fetchApi<CompanyInfo>(`/api/stocks/${ticker}/info`),

  getIndicators: (ticker: string) =>
    fetchApi<IndicatorData>(`/api/indicators/${ticker}?period=3M`),

  getAdvice: (ticker: string) =>
    fetchApi<AdviceData>(`/api/advice/${ticker}`),

  getForecast: (ticker: string) =>
    fetchApi<ForecastData>(`/api/forecast/${ticker}`),

  getNews: (ticker: string) =>
    fetchApi<{ ticker: string; news: NewsItem[] }>(`/api/news/${ticker}`),
};

// ── Formatting helpers ────────────────────────
export function formatPrice(n: number | null | undefined, decimals = 2): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatLargeNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatVolume(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}
