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

  const candles = [];
  const now = Math.floor(Date.now() / 1000);
  // Start from a price that will end up near basePrice
  let price = basePrice * (0.80 + rand() * 0.15);

  for (let i = count; i >= 0; i--) {
    const open = price;
    const drift = meta.trend * open;
    const change = (rand() - 0.49 + drift / open) * open * meta.vol;
    const close = Math.max(open + change, open * 0.01);
    const wickMult = meta.vol * 0.5;
    const high = Math.max(open, close) + rand() * open * wickMult;
    const low  = Math.min(open, close) - rand() * open * wickMult;
    const volume = (rand() * 800 + 200) * (open > 1000 ? 1 : open > 10 ? 5 : 50);
    candles.push({
      time: now - i * interval,
      open, high, low, close,
      value: volume,
    });
    price = close;
  }
  return candles;
}

// Compute MA from candles
export function computeMA(candles: { close: number }[], period: number): number {
  const slice = candles.slice(-period);
  if (slice.length < period) return 0;
  return slice.reduce((s, c) => s + c.close, 0) / period;
}

export const coinTabs = ["BTC", "ETH", "SOL", "BNB", "MATIC"];
export const timeRanges = ["15m", "1h", "4h", "1D", "1W", "1M"];
