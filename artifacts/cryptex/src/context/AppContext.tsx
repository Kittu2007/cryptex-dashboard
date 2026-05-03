import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { coins } from "../mockData";

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "INR";
export type Theme = "Dark" | "Light" | "System";
export type FontSize = "Small" | "Medium" | "Large";
export type ChartType = "Candlestick" | "Line" | "Bar" | "Area";
export type RefreshRate = "1s" | "3s" | "5s" | "10s" | "30s";

export const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.2,
};
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹",
};
export const REFRESH_MS: Record<RefreshRate, number> = {
  "1s": 1000, "3s": 3000, "5s": 5000, "10s": 10000, "30s": 30000,
};

interface Settings {
  currency: Currency;
  theme: Theme;
  compactMode: boolean;
  fontSize: FontSize;
  chartType: ChartType;
  priceAlerts: boolean;
  newsAlerts: boolean;
  portfolioUpdates: boolean;
  emailDigest: boolean;
  soundAlerts: boolean;
  refreshRate: RefreshRate;
  historicalRange: string;
  dataProvider: string;
  autoRefresh: boolean;
  analytics: boolean;
  crashReports: boolean;
  twoFactor: boolean;
  sessionTimeout: string;
}

interface Profile {
  displayName: string;
  username: string;
  email: string;
  timezone: string;
}

export interface LiveCoinPrice {
  symbol: string;
  price: number;
  change24h: number;
  prevPrice: number;
}

export interface LiveMarketStats {
  marketCap: number;   // in trillions USD
  volume24h: number;   // in billions USD
  btcDominance: number;
  high24h: number;
  low24h: number;
  fearGreed: number;
}

interface AppContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  profile: Profile;
  updateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  formatPrice: (usdPrice: number, compact?: boolean) => string;
  currencySymbol: string;
  currencyRate: number;
  livePrices: Record<string, LiveCoinPrice>;
  liveMarket: LiveMarketStats;
  activePair: string;
  setActivePair: (pair: string) => void;
}

const settingsDefaults: Settings = {
  currency: "USD",
  theme: "Dark",
  compactMode: false,
  fontSize: "Medium",
  chartType: "Candlestick",
  priceAlerts: true,
  newsAlerts: false,
  portfolioUpdates: true,
  emailDigest: false,
  soundAlerts: true,
  refreshRate: "3s",
  historicalRange: "1Y",
  dataProvider: "CoinGecko",
  autoRefresh: true,
  analytics: true,
  crashReports: true,
  twoFactor: false,
  sessionTimeout: "30 min",
};

const profileDefaults: Profile = {
  displayName: "Alex Trader",
  username: "alex_trader",
  email: "alex@cryptex.io",
  timezone: "UTC+5:30",
};

// Initial live prices seeded from mockData
function seedLivePrices(): Record<string, LiveCoinPrice> {
  const out: Record<string, LiveCoinPrice> = {};
  for (const c of coins) {
    out[c.symbol] = { symbol: c.symbol, price: c.price, change24h: c.change24h, prevPrice: c.price };
  }
  // Extra coins for ticker
  out["AVAX"] = { symbol: "AVAX", price: 42.80, change24h: 5.2, prevPrice: 42.80 };
  out["INJ"] = { symbol: "INJ", price: 28.40, change24h: 18.4, prevPrice: 28.40 };
  return out;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(settingsDefaults);
  const [profile, setProfile] = useState<Profile>(profileDefaults);
  const [activePair, setActivePair] = useState("BTC");
  const [livePrices, setLivePrices] = useState<Record<string, LiveCoinPrice>>(seedLivePrices());
  const [liveMarket, setLiveMarket] = useState<LiveMarketStats>({
    marketCap: 1.32,
    volume24h: 38.2,
    btcDominance: 52.4,
    high24h: 68910,
    low24h: 65230,
    fearGreed: 72,
  });
  const marketRef = useRef(liveMarket);
  marketRef.current = liveMarket;

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = settings.theme === "Dark" || (settings.theme === "System" && prefersDark);
    root.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [settings.theme]);

  // Apply compact mode
  useEffect(() => {
    document.documentElement.setAttribute("data-compact", settings.compactMode ? "true" : "false");
  }, [settings.compactMode]);

  // Apply font size
  useEffect(() => {
    const sizes: Record<FontSize, string> = { Small: "11px", Medium: "13px", Large: "15px" };
    document.documentElement.style.setProperty("--base-font-size", sizes[settings.fontSize]);
  }, [settings.fontSize]);

  // Live price ticker for all coins
  useEffect(() => {
    if (!settings.autoRefresh) return;
    const ms = REFRESH_MS[settings.refreshRate];

    const interval = setInterval(() => {
      setLivePrices(prev => {
        const next = { ...prev };
        for (const sym of Object.keys(next)) {
          const coin = next[sym];
          // Larger coins have less volatility
          const vol = coin.price > 10000 ? 0.006 : coin.price > 100 ? 0.012 : 0.018;
          const delta = (Math.random() - 0.488) * coin.price * vol;
          const newPrice = Math.max(coin.price + delta, coin.price * 0.5);
          const changeUpdate = delta / coin.price * 100;
          next[sym] = {
            ...coin,
            prevPrice: coin.price,
            price: newPrice,
            change24h: parseFloat((coin.change24h + changeUpdate * 0.08).toFixed(2)),
          };
        }
        return next;
      });

      // Update market stats with visible fluctuation
      setLiveMarket(prev => {
        const m = marketRef.current;
        return {
          marketCap:    parseFloat((m.marketCap    + (Math.random() - 0.5) * 0.022).toFixed(3)),
          volume24h:    parseFloat((m.volume24h    + (Math.random() - 0.5) * 1.2).toFixed(1)),
          btcDominance: parseFloat(Math.min(75, Math.max(40,
                          m.btcDominance + (Math.random() - 0.5) * 0.5
                        )).toFixed(1)),
          high24h:  Math.max(m.high24h, prev.high24h),
          low24h:   Math.min(m.low24h,  prev.low24h),
          fearGreed: Math.min(100, Math.max(0,
                      Math.round(m.fearGreed + (Math.random() - 0.5) * 4)
                    )),
        };
      });
    }, ms);

    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshRate]);

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(prev => ({ ...prev, [key]: value }));
  }

  const currencyRate = CURRENCY_RATES[settings.currency];
  const currencySymbol = CURRENCY_SYMBOLS[settings.currency];

  function formatPrice(usdPrice: number, compact = false): string {
    const converted = usdPrice * currencyRate;
    if (compact) {
      if (converted >= 1_000_000_000_000) return `${currencySymbol}${(converted / 1_000_000_000_000).toFixed(2)}T`;
      if (converted >= 1_000_000_000) return `${currencySymbol}${(converted / 1_000_000_000).toFixed(2)}B`;
      if (converted >= 1_000_000) return `${currencySymbol}${(converted / 1_000_000).toFixed(2)}M`;
      if (converted >= 1_000) return `${currencySymbol}${(converted / 1_000).toFixed(2)}K`;
    }
    if (converted < 0.01) return `${currencySymbol}${converted.toFixed(6)}`;
    if (converted < 1) return `${currencySymbol}${converted.toFixed(4)}`;
    return `${currencySymbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <AppContext.Provider value={{
      settings, updateSetting,
      profile, updateProfile,
      formatPrice, currencySymbol, currencyRate,
      livePrices, liveMarket,
      activePair, setActivePair,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
