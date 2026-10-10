import { getUserId } from "./user";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-User-ID": getUserId(),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers,
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
    buyer_inflow_pct?: number;
    seller_outflow_pct?: number;
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

export interface LLMInsight {
  summary: string;
  trend_explanation: string[];
  divergence_warning: {
    detected: boolean;
    explanation: string;
  };
  key_risks: string[];
  disclaimer: string;
}

export interface MarketRibbonItem {
  symbol: string;
  label: string;
  price: number;
  change_pct: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  subtitle: string;
  details: string;
  badge: string;
  badge_color: "green" | "blue" | "cyan";
}

export interface ModelDetail {
  name: string;
  rating: string;
  thesis: string;
  target: string;
  stop: string;
}

export interface ConsensusData {
  verdict: string;
  consensus_score: string;
  allocation: { hold: number; accumulate: number; trim: number };
  target_levels: {
    accumulation_zone: string;
    fair_target_12m: string;
    stop_loss: string;
  };
  synthesis_thesis: string;
  models: {
    gpt4o: ModelDetail;
    gemini: ModelDetail;
  };
}

export interface InsightData {
  ticker: string;
  signal: "BUY" | "HOLD" | "SELL";
  confidence: number;
  risk_profile: string;
  selected_model?: string;
  llm_insight: LLMInsight;
  data_source?: string;
  tradingview_unavailable?: boolean;
  fallback_options?: string[];
  consensus?: ConsensusData;
  pipeline_stages?: PipelineStage[];
  risk_tags?: string[];
  quote: {
    price: number;
    change: number;
    change_pct: number;
  };
  indicators_snapshot: Record<string, unknown>;
  forecast_snapshot: Record<string, unknown>;
}

export interface ForecastData {
  ticker: string;
  method: string;
  order?: string;
  econometric_specification?: string;
  aic_score?: number;
  rmse?: number;
  drift_term?: string;
  p_value?: string;
  confidence_corridor?: { lower_95: number; spot: number; upper_95: number };
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
    autoregressive_confidence?: number;
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

export interface MemoData {
  ticker: string;
  generated_at: string;
  risk_profile: string;
  time_horizon: string;
  is_fallback: boolean;
  market_snapshot: {
    current_price: number;
    day_range: string;
    market_cap: number | null;
    volume: number | null;
    change: number;
    change_pct: number;
    exchange: string;
    currency: string;
  };
  technical_snapshot: {
    price: number;
    sma_50: number | null;
    sma_200: number | null;
    rsi: number | null;
    rsi_signal: string | null;
    macd_crossover: string | null;
    golden_cross: string | null;
    bb_upper: number | null;
    bb_lower: number | null;
    price_vs_sma50: number | null;
    price_vs_sma200: number | null;
  };
  forecast_snapshot: {
    projected_price: number | null;
    projected_change_pct: number;
    direction: string;
    outlook: string;
    confidence_corridor: { lower_95?: number; spot?: number; upper_95?: number };
    method: string;
  };
  memo: {
    consensus_rating: string;
    recommended_action: string;
    entry_zone_low: number;
    entry_zone_high: number;
    target_12m_low: number;
    target_12m_high: number;
    stop_loss: number;
    technical_context: string;
    fundamental_summary: string;
    revenue_margin_growth?: string;
    free_cash_flow_leverage?: string;
    key_risks_disclosures?: string[];
    valuation_summary: string;
    multiples_analysis?: string;
    fair_value_estimate?: string;
    moat_and_catalysts: string;
    key_risks: string[];
    final_thesis: string;
    disclaimer: string;
    llm_provider: string;
    is_fallback?: boolean;
  };
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

export interface WatchlistItem {
  id: number;
  ticker: string;
  added_at: string;
}

export const api = {
  searchTickers: (q: string) =>
    fetchApi<{ results: SearchResult[] }>(`/api/stocks/search?q=${encodeURIComponent(q)}`),

  getMarketRibbon: () =>
    fetchApi<MarketRibbonItem[]>(`/api/stocks/market-ribbon`),

  getQuote: (ticker: string) =>
    fetchApi<QuoteData>(`/api/stocks/${ticker}/quote`),

  getHistory: (ticker: string, period: string, source: string = "yfinance") =>
    fetchApi<{ ticker: string; period: string; source?: string; data: OHLCVBar[] }>(
      `/api/stocks/${ticker}/history?period=${period}&source=${source}`
    ),

  getCompanyInfo: (ticker: string) =>
    fetchApi<CompanyInfo>(`/api/stocks/${ticker}/info`),

  getIndicators: (ticker: string, period: string = "3M", source: string = "tradingview") =>
    fetchApi<IndicatorData>(`/api/indicators/${ticker}?period=${period}&source=${source}`),

  getAdvice: (ticker: string) =>
    fetchApi<AdviceData>(`/api/advice/${ticker}`),

  getForecast: (ticker: string) =>
    fetchApi<ForecastData>(`/api/forecast/${ticker}`),

  getNews: (ticker: string) =>
    fetchApi<{ ticker: string; news: NewsItem[] }>(`/api/news/${ticker}`),

  getMemo: (
    ticker: string,
    riskProfile: string = "Moderate",
    timeHorizon: string = "12-Month",
    source: string = "yfinance"
  ) =>
    fetchApi<MemoData>(
      `/api/memo/${ticker}?risk_profile=${encodeURIComponent(riskProfile)}&time_horizon=${encodeURIComponent(timeHorizon)}&source=${encodeURIComponent(source)}`
    ),

  getInsight: (ticker: string, riskProfile: string = "Moderate", model: string = "dual", source: string = "tradingview") =>
    fetchApi<InsightData>(
      `/api/insight/${ticker}?risk_profile=${encodeURIComponent(riskProfile)}&model=${encodeURIComponent(model)}&source=${encodeURIComponent(source)}`
    ),

  getWatchlist: () => 
    fetchApi<WatchlistItem[]>('/api/watchlist'),
    
  addToWatchlist: (ticker: string) => {
    // Dynamically require to avoid circular dependencies if any
    const { getStoredUser } = require('./auth');
    const user = getStoredUser();
    return fetchApi<{ message: string }>(`/api/watchlist/${ticker}`, { 
      method: 'POST',
      body: JSON.stringify({
        user_name: user?.name || null,
        user_email: user?.email || null
      })
    });
  },
    
  removeFromWatchlist: (ticker: string) => 
    fetchApi<{ message: string }>(`/api/watchlist/${ticker}`, { method: 'DELETE' }),
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
