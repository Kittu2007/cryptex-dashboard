import { useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import CoinIcon from "./CoinIcon";
import gsap from "gsap";

const TICKER_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "ADA", "DOT", "LINK", "MATIC", "AVAX", "INJ"];

export default function TickerTape() {
  const { livePrices, formatPrice, settings } = useApp();
  const itemRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // Flash price color on update
  useEffect(() => {
    for (const sym of TICKER_SYMBOLS) {
      const lp = livePrices[sym];
      if (!lp) continue;
      const el = itemRefs.current[sym];
      if (!el) continue;
      const up = lp.price >= lp.prevPrice;
      gsap.to(el, {
        color: up ? "#34D399" : "#F87171", duration: 0.08,
        onComplete: () => gsap.to(el, { color: "var(--text-1)", duration: 1 })
      });
    }
  }, [livePrices]);

  const doubled = [...TICKER_SYMBOLS, ...TICKER_SYMBOLS];

  return (
    <div className="ticker-wrapper" style={{
      background: "var(--bg-void)", borderBottom: "1px solid var(--border)",
      height: 28, display: "flex", alignItems: "center", overflow: "hidden"
    }}>
      <div className="ticker-track" style={{ animationPlayState: settings.autoRefresh ? "running" : "paused" }}>
        {doubled.map((sym, i) => {
          const lp = livePrices[sym];
          if (!lp) return null;
          const isUp = lp.change24h >= 0;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 20px", borderRight: "1px solid var(--border)",
              whiteSpace: "nowrap", height: 28
            }}>
              <CoinIcon symbol={sym} size={14} fallbackColor="#A78BFA" />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", fontWeight: 600 }}>{sym}</span>
              <span
                ref={el => { if (i < TICKER_SYMBOLS.length) itemRefs.current[sym] = el; }}
                style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-1)" }}
              >
                {formatPrice(lp.price)}
              </span>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: isUp ? "var(--bull)" : "var(--bear)" }}>
                {isUp ? "+" : ""}{lp.change24h.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
