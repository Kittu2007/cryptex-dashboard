export const coins = [
  { id: "btc",  name: "Bitcoin",  symbol: "BTC",  price: 67432.50, change24h: 2.4,  change7d: 8.1,  volume: "38.2B", marketCap: "1.32T", signal: "Bullish" as const, avatar: "#A78BFA" },
  { id: "eth",  name: "Ethereum", symbol: "ETH",  price: 3891.20,  change24h: 1.8,  change7d: -2.3, volume: "18.4B", marketCap: "468B",  signal: "Neutral" as const, avatar: "#6B7280" },
  { id: "sol",  name: "Solana",   symbol: "SOL",  price: 182.40,   change24h: -0.6, change7d: 12.4, volume: "4.2B",  marketCap: "82B",   signal: "Bullish" as const, avatar: "#34D399" },
  { id: "bnb",  name: "BNB",      symbol: "BNB",  price: 601.20,   change24h: 3.1,  change7d: 5.6,  volume: "2.8B",  marketCap: "91B",   signal: "Bullish" as const, avatar: "#EAB308" },
  { id: "matic",name: "Polygon",  symbol: "MATIC",price: 0.892,    change24h: -1.2, change7d: -4.8, volume: "0.8B",  marketCap: "8.9B",  signal: "Bearish" as const, avatar: "#8B5CF6" },
  { id: "ada",  name: "Cardano",  symbol: "ADA",  price: 0.612,    change24h: 0.4,  change7d: 2.1,  volume: "0.5B",  marketCap: "21.4B", signal: "Neutral" as const, avatar: "#6B7280" },
  { id: "dot",  name: "Polkadot", symbol: "DOT",  price: 9.82,     change24h: -2.1, change7d: -6.3, volume: "0.4B",  marketCap: "14.2B", signal: "Bearish" as const, avatar: "#F87171" },
  { id: "link", name: "Chainlink",symbol: "LINK", price: 18.40,    change24h: 4.2,  change7d: 11.8, volume: "0.9B",  marketCap: "11.8B", signal: "Bullish" as const, avatar: "#60A5FA" },
];

export const portfolio = {
  totalValue: 42820.40,
  totalGain: 11820,
  totalGainPct: 38.2,
  holdings: [
    { symbol: "BTC",   name: "Bitcoin",  allocation: 48, value: 20554, gain: 8200,  gainPct: 66.4,  color: "#A78BFA" },
    { symbol: "ETH",   name: "Ethereum", allocation: 30, value: 12846, gain: 4100,  gainPct: 46.9,  color: "#6B7280" },
    { symbol: "SOL",   name: "Solana",   allocation: 14, value: 5995,  gain: -800,  gainPct: -11.8, color: "#34D399" },
    { symbol: "Other", name: "Other",    allocation: 8,  value: 3425,  gain: 320,   gainPct: 10.3,  color: "#38364A" },
  ]
};

export const transactions = [
  { type: "BUY"  as const, asset: "Bitcoin",   symbol: "BTC",  amount: 0.05, price: 64200, total: 3210,  date: "2h ago",  status: "Completed" as const },
  { type: "SELL" as const, asset: "Ethereum",  symbol: "ETH",  amount: 1.2,  price: 3850,  total: 4620,  date: "1d ago",  status: "Completed" as const },
  { type: "BUY"  as const, asset: "Solana",    symbol: "SOL",  amount: 10,   price: 185,   total: 1850,  date: "2d ago",  status: "Pending"   as const },
  { type: "SELL" as const, asset: "BNB",       symbol: "BNB",  amount: 2.5,  price: 595,   total: 1487,  date: "3d ago",  status: "Completed" as const },
  { type: "BUY"  as const, asset: "Chainlink", symbol: "LINK", amount: 50,   price: 17.8,  total: 890,   date: "5d ago",  status: "Completed" as const },
];

export const watchlist = [
  { symbol: "BTC",  name: "Bitcoin",   price: 67432.50, change24h: 2.4,  sparkData: [62000, 63500, 64200, 63800, 65100, 66300, 67432] },
  { symbol: "ETH",  name: "Ethereum",  price: 3891.20,  change24h: 1.8,  sparkData: [3700, 3750, 3820, 3780, 3850, 3870, 3891] },
  { symbol: "SOL",  name: "Solana",    price: 182.40,   change24h: -0.6, sparkData: [190, 188, 185, 187, 184, 183, 182] },
  { symbol: "AVAX", name: "Avalanche", price: 42.80,    change24h: 5.2,  sparkData: [38, 39, 40, 39.5, 41, 42, 42.8] },
];

export const trending = [
  { symbol: "INJ",  name: "Injective", change: "+18.4%" },
  { symbol: "TIA",  name: "Celestia",  change: "+12.1%" },
  { symbol: "ONDO", name: "Ondo",      change: "+9.8%" },
];

export const news = [
  { source: "CoinDesk", category: "Markets",  title: "Bitcoin breaks $68K resistance as institutional demand surges ahead of halving", sentiment: 78, time: "2h ago" },
  { source: "The Block", category: "Ethereum", title: "ETH staking yields compress as validator count hits new all-time high",            sentiment: 42, time: "4h ago" },
  { source: "Decrypt",   category: "DeFi",     title: "Solana ecosystem records all-time DEX volume in Q1 2026, surpassing Ethereum",    sentiment: 65, time: "6h ago" },
];

export const indicators = [
  { label: "RSI(14)",    value: "62.4" },
  { label: "MACD",       value: "+124.8" },
  { label: "BBands",     value: "67,890" },
  { label: "ATR(14)",    value: "1,240" },
  { label: "Fear/Greed", value: "72 Greed" },
];

// Per-coin volatility and trend bias for realistic chart shapes
export const COIN_META: Record<string, { vol: number; trend: number; name: string }> = {
  BTC:  { vol: 0.022, trend: 0.003, name: "Bitcoin" },
  ETH:  { vol: 0.028, trend: 0.001, name: "Ethereum" },
  SOL:  { vol: 0.038, trend: 0.005, name: "Solana" },
  BNB:  { vol: 0.024, trend: 0.002, name: "BNB" },
  MATIC:{ vol: 0.042, trend: -0.001, name: "Polygon" },
};

export const COIN_BASE_PRICES: Record<string, number> = {
  BTC: 67432.50, ETH: 3891.20, SOL: 182.40, BNB: 601.20, MATIC: 0.892,
};

// Time range → { barCount, intervalSeconds }
export const RANGE_CONFIG: Record<string, { count: number; interval: number }> = {
  "15m": { count: 192, interval: 60 * 15 },
  "1h":  { count: 168, interval: 60 * 60 },
  "4h":  { count: 180, interval: 60 * 60 * 4 },
  "1D":  { count: 365, interval: 60 * 60 * 24 },
  "1W":  { count: 104, interval: 60 * 60 * 24 * 7 },
  "1M":  { count: 36,  interval: 60 * 60 * 24 * 30 },
};

// Seeded pseudo-random so same coin+range always yields the same chart shape
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateCandles(
  coin = "BTC",
  range = "1D",
) {
  const { count, interval } = RANGE_CONFIG[range] ?? RANGE_CONFIG["1D"];
  const meta = COIN_META[coin] ?? { vol: 0.025, trend: 0, name: coin };
  const basePrice = COIN_BASE_PRICES[coin] ?? 60000;

  // Seed based on coin + range so charts are deterministic but unique per pair
  const seed = coin.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 31 +
               range.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRand(seed);

  const raw: { open: number; high: number; low: number; close: number; value: number }[] = [];
  const now = Math.floor(Date.now() / 1000);
  let price = basePrice * (0.72 + rand() * 0.18);

  for (let i = count; i >= 0; i--) {
    const open = price;
    const drift = meta.trend * open;
    const change = (rand() - 0.49 + drift / open) * open * meta.vol;
    const close = Math.max(open + change, open * 0.01);
    const wickMult = meta.vol * 0.5;
    const high = Math.max(open, close) + rand() * open * wickMult;
    const low  = Math.min(open, close) - rand() * open * wickMult;
    const volume = (rand() * 800 + 200) * (open > 1000 ? 1 : open > 10 ? 5 : 50);
    raw.push({ open, high, low, close, value: volume });
    price = close;
  }

  // Normalize so the final candle's close always equals basePrice,
  // keeping the shape of the path intact — this ensures switching
  // timeframes never jumps to a wildly different price level.
  const lastClose = raw[raw.length - 1].close;
  const scale = basePrice / lastClose;

  return raw.map((c, i) => ({
    time: now - (raw.length - 1 - i) * interval,
    open:  c.open  * scale,
    high:  c.high  * scale,
    low:   c.low   * scale,
    close: c.close * scale,
    value: c.value,
  }));
}

// Compute Simple MA from candles
export function computeMA(candles: { close: number }[], period: number): number {
  const slice = candles.slice(-period);
  if (slice.length < period) return 0;
  return slice.reduce((s, c) => s + c.close, 0) / period;
}

// Compute EMA (exponential moving average) over a price array
function computeEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((s, p) => s + p, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

export interface TechIndicators {
  rsi: number;       // 0–100
  macd: number;      // macd line value
  macdSignal: number;
  macdHist: number;
  bbUpper: number;
  bbMid: number;
  bbLower: number;
  atr: number;
  volume24h: number; // sum of last N bars' volume
}

export function computeIndicators(
  candles: { open: number; high: number; low: number; close: number; value: number }[]
): TechIndicators {
  const closes = candles.map(c => c.close);
  const n = closes.length;

  // ── RSI(14) ──
  let gains = 0, losses = 0;
  const rsiPeriod = 14;
  for (let i = n - rsiPeriod; i < n; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff; else losses += Math.abs(diff);
  }
  const avgGain = gains / rsiPeriod;
  const avgLoss = losses / rsiPeriod;
  const rs  = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = parseFloat((100 - 100 / (1 + rs)).toFixed(1));

  // ── MACD(12,26,9) ──
  const ema12 = computeEMA(closes, 12);
  const ema26 = computeEMA(closes, 26);
  const macd  = parseFloat((ema12 - ema26).toFixed(2));

  // Build a signal line from the last 26 macd values
  const macdLine: number[] = [];
  for (let i = 26; i <= n; i++) {
    const e12 = computeEMA(closes.slice(0, i), 12);
    const e26 = computeEMA(closes.slice(0, i), 26);
    macdLine.push(e12 - e26);
  }
  const macdSignal = parseFloat(computeEMA(macdLine, 9).toFixed(2));
  const macdHist   = parseFloat((macd - macdSignal).toFixed(2));

  // ── Bollinger Bands(20, 2) ──
  const bbPeriod = 20;
  const bbSlice  = closes.slice(-bbPeriod);
  const bbMid    = bbSlice.reduce((s, p) => s + p, 0) / bbPeriod;
  const variance = bbSlice.reduce((s, p) => s + Math.pow(p - bbMid, 2), 0) / bbPeriod;
  const bbStd    = Math.sqrt(variance);
  const bbUpper  = parseFloat((bbMid + 2 * bbStd).toFixed(2));
  const bbLower  = parseFloat((bbMid - 2 * bbStd).toFixed(2));

  // ── ATR(14) ──
  const atrPeriod = 14;
  let atrSum = 0;
  for (let i = n - atrPeriod; i < n; i++) {
    const prev = candles[i - 1]?.close ?? candles[i].open;
    const tr   = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - prev),
      Math.abs(candles[i].low  - prev),
    );
    atrSum += tr;
  }
  const atr = parseFloat((atrSum / atrPeriod).toFixed(2));

  // ── Volume (sum of all bars) ──
  const volume24h = candles.reduce((s, c) => s + c.value, 0);

  return { rsi, macd, macdSignal, macdHist, bbUpper, bbMid: parseFloat(bbMid.toFixed(2)), bbLower, atr, volume24h };
}

export const coinTabs = ["BTC", "ETH", "SOL", "BNB", "MATIC"];
export const timeRanges = ["15m", "1h", "4h", "1D", "1W", "1M"];

// ── Chart series helpers ──────────────────────────────────────────────────────

type C = { time: number; open: number; high: number; low: number; close: number; value: number };

export function smaSeries(candles: C[], period: number): { time: number; value: number }[] {
  const out: { time: number; value: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) s += candles[j].close;
    out.push({ time: candles[i].time, value: s / period });
  }
  return out;
}

export function emaSeries(candles: C[], period: number): { time: number; value: number }[] {
  if (candles.length < period) return [];
  const k = 2 / (period + 1);
  let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  const out = [{ time: candles[period - 1].time, value: ema }];
  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    out.push({ time: candles[i].time, value: ema });
  }
  return out;
}

export function bbSeries(
  candles: C[], period = 20, mult = 2
): { time: number; upper: number; mid: number; lower: number }[] {
  const out: { time: number; upper: number; mid: number; lower: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) s += candles[j].close;
    const mid = s / period;
    let v = 0;
    for (let j = i - period + 1; j <= i; j++) v += (candles[j].close - mid) ** 2;
    const std = Math.sqrt(v / period);
    out.push({ time: candles[i].time, upper: mid + mult * std, mid, lower: mid - mult * std });
  }
  return out;
}

export function vwapSeries(candles: C[]): { time: number; value: number }[] {
  let cumPV = 0, cumV = 0;
  return candles.map(c => {
    const tp = (c.high + c.low + c.close) / 3;
    cumPV += tp * c.value;
    cumV  += c.value;
    return { time: c.time, value: cumV > 0 ? cumPV / cumV : c.close };
  });
}

export function rsiSeries(candles: C[], period = 14): { time: number; value: number }[] {
  if (candles.length < period + 1) return [];
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = candles[i].close - candles[i - 1].close;
    if (d > 0) avgGain += d; else avgLoss += Math.abs(d);
  }
  avgGain /= period; avgLoss /= period;
  const toRSI = (g: number, l: number) => l === 0 ? 100 : parseFloat((100 - 100 / (1 + g / l)).toFixed(2));
  const out = [{ time: candles[period].time, value: toRSI(avgGain, avgLoss) }];
  for (let i = period + 1; i < candles.length; i++) {
    const d = candles[i].close - candles[i - 1].close;
    avgGain = (avgGain * (period - 1) + (d > 0 ? d : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (d < 0 ? Math.abs(d) : 0)) / period;
    out.push({ time: candles[i].time, value: toRSI(avgGain, avgLoss) });
  }
  return out;
}

export function macdSeries(candles: C[], fast = 12, slow = 26, sig = 9) {
  if (candles.length < slow + sig) return { line: [] as {time:number;value:number}[], signalLine: [] as {time:number;value:number}[], hist: [] as {time:number;value:number;color:string}[] };
  const kf = 2 / (fast + 1), ks = 2 / (slow + 1);
  let ef = candles.slice(0, fast).reduce((s, c) => s + c.close, 0) / fast;
  let es = candles.slice(0, slow).reduce((s, c) => s + c.close, 0) / slow;
  // Advance fast EMA to bar slow-2
  for (let i = fast; i < slow - 1; i++) ef = candles[i].close * kf + ef * (1 - kf);
  const line: { time: number; value: number }[] = [];
  for (let i = slow - 1; i < candles.length; i++) {
    ef = candles[i].close * kf + ef * (1 - kf);
    if (i > slow - 1) es = candles[i].close * ks + es * (1 - ks);
    line.push({ time: candles[i].time, value: parseFloat((ef - es).toFixed(4)) });
  }
  if (line.length < sig) return { line, signalLine: [], hist: [] };
  const ksig = 2 / (sig + 1);
  let sigEma = line.slice(0, sig).reduce((s, m) => s + m.value, 0) / sig;
  const signalLine: { time: number; value: number }[] = [];
  const hist: { time: number; value: number; color: string }[] = [];
  for (let i = sig - 1; i < line.length; i++) {
    if (i > sig - 1) sigEma = line[i].value * ksig + sigEma * (1 - ksig);
    const h = line[i].value - sigEma;
    signalLine.push({ time: line[i].time, value: parseFloat(sigEma.toFixed(4)) });
    hist.push({ time: line[i].time, value: parseFloat(h.toFixed(4)), color: h >= 0 ? "rgba(52,211,153,0.75)" : "rgba(248,113,113,0.75)" });
  }
  return { line, signalLine, hist };
}

export function stochSeries(candles: C[], kPeriod = 14, dPeriod = 3) {
  const kLine: { time: number; value: number }[] = [];
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const sl = candles.slice(i - kPeriod + 1, i + 1);
    const hi = Math.max(...sl.map(c => c.high));
    const lo = Math.min(...sl.map(c => c.low));
    const k  = hi === lo ? 50 : ((candles[i].close - lo) / (hi - lo)) * 100;
    kLine.push({ time: candles[i].time, value: parseFloat(k.toFixed(2)) });
  }
  const dLine: { time: number; value: number }[] = [];
  for (let i = dPeriod - 1; i < kLine.length; i++) {
    const s = kLine.slice(i - dPeriod + 1, i + 1).reduce((a, v) => a + v.value, 0);
    dLine.push({ time: kLine[i].time, value: parseFloat((s / dPeriod).toFixed(2)) });
  }
  return { k: kLine, d: dLine };
}
