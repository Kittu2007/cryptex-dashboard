import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

interface AppContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  profile: Profile;
  updateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  formatPrice: (usdPrice: number, compact?: boolean) => string;
  currencySymbol: string;
  currencyRate: number;
}

const defaults: Settings = {
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

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [profile, setProfile] = useState<Profile>(profileDefaults);

  // Apply theme to document
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
    if (converted < 1) return `${currencySymbol}${converted.toFixed(4)}`;
    return `${currencySymbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <AppContext.Provider value={{ settings, updateSetting, profile, updateProfile, formatPrice, currencySymbol, currencyRate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
