import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronDown, Wallet, Check, X, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

// Per-coin 24H stat anchors (% offsets from current price)
const COIN_STATS: Record<string, {
  highPct: number; lowPct: number;
  vol: string; marketCap: string; dominance: string;
}> = {
  BTC:  { highPct: 0.021, lowPct: -0.032, vol: "38.2B", marketCap: "1.32T", dominance: "52.4%" },
  ETH:  { highPct: 0.028, lowPct: -0.018, vol: "18.4B", marketCap: "468B",  dominance: "17.1%" },
  SOL:  { highPct: 0.041, lowPct: -0.035, vol: "4.2B",  marketCap: "82B",   dominance: "3.2%"  },
  BNB:  { highPct: 0.019, lowPct: -0.022, vol: "2.8B",  marketCap: "91B",   dominance: "3.5%"  },
  MATIC:{ highPct: 0.052, lowPct: -0.048, vol: "0.8B",  marketCap: "8.9B",  dominance: "0.4%"  },
};

const PAIR_LIST = ["BTC", "ETH", "SOL", "BNB", "MATIC"];
const MOCK_ADDRESS = "0x3f5C...8aD1";

export default function TopRibbon() {
  const ribbonRef  = useRef<HTMLDivElement>(null);
  const dropRef    = useRef<HTMLDivElement>(null);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [connected,  setConnected]  = useState(false);
  const [walletMenu, setWalletMenu] = useState(false);
  const priceRef = useRef<HTMLSpanElement>(null);
  const prevPrice = useRef(0);

  const {
    formatPrice, currencySymbol, settings,
    livePrices, liveMarket,
    activePair, setActivePair,
  } = useApp();

  const coin   = livePrices[activePair];
  const price  = coin?.price  ?? 0;
  const change = coin?.change24h ?? 0;
  const isUp   = change >= 0;
  const stats  = COIN_STATS[activePair] ?? COIN_STATS["BTC"];

  const high24h = price * (1 + stats.highPct);
  const low24h  = price * (1 + stats.lowPct);

  // Entry animation
  useEffect(() => {
    gsap.from(ribbonRef.current, { y: -40, opacity: 0, duration: 0.4, ease: "expo.out", delay: 0.3 });
  }, []);

  // Flash price on tick
  useEffect(() => {
    if (!priceRef.current || prevPrice.current === 0) { prevPrice.current = price; return; }
    const up = price > prevPrice.current;
    prevPrice.current = price;
    gsap.fromTo(priceRef.current,
      { color: up ? "#34D399" : "#F87171" },
      { color: "var(--text-1)", duration: 0.8, ease: "power2.out" }
    );
  }, [price]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropOpen && !walletMenu) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
        setWalletMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropOpen, walletMenu]);

  const ribbonStats = [
    { label: "24H HIGH", value: formatPrice(high24h) },
    { label: "24H LOW",  value: formatPrice(low24h)  },
    { label: "24H VOL",  value: `${currencySymbol}${stats.vol}` },
    { label: "MKT CAP",  value: `${currencySymbol}${stats.marketCap}` },
    { label: "DOMINANCE",value: stats.dominance },
  ];

  return (
    <div className="top-ribbon" ref={ribbonRef} style={{ paddingLeft: 20, paddingRight: 16, gap: 0, position: "relative" }}>

      {/* ── Pair selector + price ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }} ref={dropRef}>

        {/* Pair button */}
        <button
          onClick={() => { setDropOpen(v => !v); setWalletMenu(false); }}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: dropOpen ? "var(--bg-raised)" : "none",
            border: dropOpen ? "1px solid var(--border-2)" : "1px solid transparent",
            borderRadius: 5, cursor: "pointer", padding: "3px 8px 3px 6px",
            transition: "all 0.15s",
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
            {activePair} / {settings.currency}
          </span>
          <ChevronDown size={11} style={{
            color: "var(--text-3)",
            transform: dropOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }} />
        </button>

        {/* Pair dropdown */}
        {dropOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200,
            background: "var(--bg-surface)", border: "1px solid var(--border-2)",
            borderRadius: 8, overflow: "hidden", minWidth: 220,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}>
            <div style={{ padding: "6px 10px 4px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.12em" }}>
                SELECT PAIR
              </span>
            </div>
            {PAIR_LIST.map(sym => {
              const lp     = livePrices[sym];
              const p      = lp?.price ?? 0;
              const chg    = lp?.change24h ?? 0;
              const active = sym === activePair;
              return (
                <button key={sym} onClick={() => { setActivePair(sym); setDropOpen(false); }} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "8px 12px",
                  background: active ? "var(--bg-raised)" : "none",
                  border: "none", cursor: "pointer",
                  borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                  transition: "background 0.12s",
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-raised)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: chg >= 0 ? "var(--bull)" : "var(--bear)",
                    }} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>
                      {sym} / {settings.currency}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>
                      {formatPrice(p)}
                    </span>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: chg >= 0 ? "var(--bull)" : "var(--bear)" }}>
                      {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Live price */}
        <span ref={priceRef} style={{
          fontFamily: "var(--font-data)", fontSize: 15, color: "var(--text-1)", fontWeight: 500,
          borderLeft: "1px solid var(--border)", paddingLeft: 10,
        }}>
          {formatPrice(price)}
        </span>

        {/* Change badge */}
        <span style={{
          fontFamily: "var(--font-data)", fontSize: 11,
          color: isUp ? "var(--bull)" : "var(--bear)",
          background: isUp ? "var(--bull-bg)" : "var(--bear-bg)",
          padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap",
        }}>
          {isUp ? "+" : ""}{change.toFixed(2)}%
          {" "}({isUp ? "+" : "−"}{formatPrice(Math.abs(change * price * 0.01))})
        </span>

        {!settings.autoRefresh && (
          <span style={{
            fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--bear)",
            background: "var(--bear-bg)", padding: "1px 6px", borderRadius: 3,
          }}>PAUSED</span>
        )}
      </div>

      {/* ── Per-coin stats ── */}
      <div className="ribbon-mid" style={{ display: "flex", alignItems: "center", marginLeft: 16, flex: 1 }}>
        {ribbonStats.map((stat, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && <div className="v-divider" style={{ margin: "0 14px" }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span className="section-label" style={{ fontSize: 8 }}>{stat.label}</span>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Connect Wallet ── */}
      <div style={{ marginLeft: "auto", position: "relative" }}>
        {connected ? (
          <button
            onClick={() => { setWalletMenu(v => !v); setDropOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--bull)",
              background: "var(--bull-bg)", border: "1px solid rgba(52,211,153,0.35)",
              borderRadius: 4, padding: "5px 10px", cursor: "pointer",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--bull)", display: "inline-block" }} />
            {MOCK_ADDRESS}
            <ChevronDown size={10} style={{ transform: walletMenu ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </button>
        ) : (
          <button
            onClick={() => setConnected(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)",
              background: "var(--bg-raised)", border: "1px solid var(--border-2)",
              borderRadius: 4, padding: "5px 10px", cursor: "pointer", transition: "border-color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
          >
            <Wallet size={11} />
            Connect Wallet
          </button>
        )}

        {/* Wallet dropdown */}
        {walletMenu && connected && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 200,
            background: "var(--bg-surface)", border: "1px solid var(--border-2)",
            borderRadius: 8, overflow: "hidden", minWidth: 200,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}>
            <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--bull)", display: "inline-block" }} />
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--bull)", fontWeight: 600 }}>Connected</span>
              </div>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>{MOCK_ADDRESS}</span>
            </div>
            <button style={{
              display: "flex", alignItems: "center", gap: 6, width: "100%",
              padding: "8px 14px", background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)",
              transition: "background 0.12s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <Zap size={12} />
              View Portfolio
            </button>
            <button
              onClick={() => { setConnected(false); setWalletMenu(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 6, width: "100%",
                padding: "8px 14px", background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bear)",
                borderTop: "1px solid var(--border)", transition: "background 0.12s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bear-bg)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <X size={12} />
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
