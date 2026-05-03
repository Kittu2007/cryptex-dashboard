import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronDown, Wallet } from "lucide-react";
import { ribbonStats } from "../mockData";
import { useApp } from "../context/AppContext";

interface TopRibbonProps {
  livePrice: number;
  priceChange: number;
}

export default function TopRibbon({ livePrice, priceChange }: TopRibbonProps) {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const { formatPrice, settings } = useApp();

  useEffect(() => {
    gsap.from(ribbonRef.current, {
      y: -40, opacity: 0, duration: 0.4, ease: "expo.out", delay: 0.3
    });
  }, []);

  const isUp = priceChange >= 0;

  return (
    <div className="top-ribbon" ref={ribbonRef} style={{ paddingLeft: 20, paddingRight: 16, gap: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "none", border: "none", cursor: "pointer", padding: "0 8px 0 0",
          borderRight: "1px solid var(--border)"
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
            BTC / {settings.currency}
          </span>
          <ChevronDown size={12} style={{ color: "var(--text-3)" }} />
        </button>

        <span className="ribbon-live-price" style={{
          fontFamily: "var(--font-data)", fontSize: 15, color: "var(--text-1)", fontWeight: 500
        }}>
          {formatPrice(livePrice)}
        </span>

        <span style={{
          fontFamily: "var(--font-data)", fontSize: 12,
          color: isUp ? "var(--bull)" : "var(--bear)",
          background: isUp ? "var(--bull-bg)" : "var(--bear-bg)",
          padding: "2px 6px", borderRadius: 4
        }}>
          {isUp ? "+" : ""}{priceChange.toFixed(1)}% ({isUp ? "+" : ""}$1,840)
        </span>

        {!settings.autoRefresh && (
          <span style={{
            fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--bear)",
            background: "var(--bear-bg)", padding: "1px 6px", borderRadius: 3
          }}>PAUSED</span>
        )}
      </div>

      <div className="ribbon-mid" style={{ display: "flex", alignItems: "center", gap: 0, marginLeft: 16, flex: 1 }}>
        {ribbonStats.map((stat, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && <div className="v-divider" style={{ margin: "0 16px" }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span className="section-label" style={{ fontSize: 8 }}>{stat.label}</span>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginLeft: "auto" }}>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)",
          background: "var(--bg-raised)",
          border: "1px solid var(--border-2)",
          borderRadius: 4, padding: "5px 10px", cursor: "pointer",
          transition: "border-color 0.15s"
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
        >
          <Wallet size={11} />
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
