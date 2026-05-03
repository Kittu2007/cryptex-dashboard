import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronDown, Wallet, X, Zap, Sun, Moon } from "lucide-react";
import CoinIcon from "./CoinIcon";
import { useApp, CURRENCY_SYMBOLS } from "../context/AppContext";
import type { Currency } from "../context/AppContext";

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "JPY", "INR"];

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

export default function TopRibbon({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const ribbonRef   = useRef<HTMLDivElement>(null);
  const pairRef     = useRef<HTMLDivElement>(null);
  const walletRef   = useRef<HTMLDivElement>(null);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [connected,  setConnected]  = useState(false);
  const [walletMenu, setWalletMenu] = useState(false);
  const priceRef  = useRef<HTMLSpanElement>(null);
  const prevPrice = useRef(0);

  const {
    formatPrice, currencySymbol, settings, updateSetting,
    livePrices, liveMarket,
    activePair, setActivePair,
  } = useApp();

  const isDark = settings.theme !== "Light";
  const toggleTheme = () => updateSetting("theme", isDark ? "Light" : "Dark");

  const currIdx      = CURRENCIES.indexOf(settings.currency);
  const cycleCurrency = () => updateSetting("currency", CURRENCIES[(currIdx + 1) % CURRENCIES.length]);

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
      { color: up ? "#22C55E" : "#EF4444" },
      { color: "var(--text-1)", duration: 0.8, ease: "power2.out" }
    );
  }, [price]);

  // Close pair dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e: MouseEvent) => {
      if (pairRef.current && !pairRef.current.contains(e.target as Node))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropOpen]);

  // Close wallet menu on outside click
  useEffect(() => {
    if (!walletMenu) return;
    const handler = (e: MouseEvent) => {
      if (walletRef.current && !walletRef.current.contains(e.target as Node))
        setWalletMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [walletMenu]);

  const ribbonStats = [
    { label: "24H HIGH", value: formatPrice(high24h) },
    { label: "24H LOW",  value: formatPrice(low24h)  },
    { label: "24H VOL",  value: `${currencySymbol}${stats.vol}` },
    { label: "MKT CAP",  value: `${currencySymbol}${stats.marketCap}` },
    { label: "DOMINANCE",value: stats.dominance },
  ];

  return (
    <div className="top-ribbon" ref={ribbonRef} style={{ paddingLeft: 20, paddingRight: 16, gap: 0, position: "relative", overflow: "visible" }}>

      {/* ── Hamburger — mobile only ── */}
      {onMenuOpen && (
        <button
          className="show-mobile"
          onClick={onMenuOpen}
          aria-label="Open menu"
          style={{
            display: "none", // overridden to flex by .show-mobile on mobile
            alignItems: "center", justifyContent: "center",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-2)", padding: "4px 8px 4px 0", marginRight: 4, flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect y="3"  width="18" height="1.8" rx="0.9" fill="currentColor"/>
            <rect y="8"  width="18" height="1.8" rx="0.9" fill="currentColor"/>
            <rect y="13" width="18" height="1.8" rx="0.9" fill="currentColor"/>
          </svg>
        </button>
      )}

      {/* ── Pair selector + price ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", flexShrink: 0 }} ref={pairRef}>

        {/* Pair button */}
        <button
          className="ribbon-pair-btn"
          onClick={() => { setDropOpen(v => !v); setWalletMenu(false); }}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: dropOpen ? "var(--bg-raised)" : "none",
            border: dropOpen ? "1px solid var(--border-2)" : "1px solid transparent",
            borderRadius: 5, cursor: "pointer", padding: "3px 8px 3px 6px",
            transition: "all 0.15s",
          }}
        >
          <span className="ribbon-pair-text" style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
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
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.10em" }}>
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
                    <CoinIcon symbol={sym} size={20} fallbackColor={chg >= 0 ? "var(--bull)" : "var(--bear)"} />
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
        <span ref={priceRef} className="ribbon-live-price" style={{
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
          <span className="ribbon-change-detail">{" "}({isUp ? "+" : "−"}{formatPrice(Math.abs(change * price * 0.01))})</span>
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
              <span className="section-label" style={{ fontSize: 10 }}>{stat.label}</span>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)" }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Currency + Theme toggles ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 14, flexShrink: 0 }}>

        {/* Currency cycle button */}
        <button
          onClick={cycleCurrency}
          title={`Switch currency (${CURRENCIES.map(c => CURRENCY_SYMBOLS[c] + c).join(" → ")})`}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontFamily: "var(--font-data)", fontSize: 10, fontWeight: 600,
            color: "var(--accent)",
            background: "var(--accent-dim)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 5, padding: "4px 9px", cursor: "pointer",
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.18)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--accent-dim)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"; }}
        >
          <span style={{ fontSize: 11 }}>{CURRENCY_SYMBOLS[settings.currency]}</span>
          <span className="ribbon-currency-text">{settings.currency}</span>
        </button>

        {/* Theme toggle */}
        <button
          className="ribbon-theme-toggle"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28,
            background: isDark ? "var(--bg-raised)" : "rgba(251,191,36,0.12)",
            border: isDark ? "1px solid var(--border-2)" : "1px solid rgba(251,191,36,0.4)",
            borderRadius: 5, cursor: "pointer",
            color: isDark ? "var(--text-2)" : "#FBBF24",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isDark ? "var(--bg-hover)" : "rgba(251,191,36,0.22)";
            e.currentTarget.style.borderColor = isDark ? "var(--accent)" : "rgba(251,191,36,0.7)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isDark ? "var(--bg-raised)" : "rgba(251,191,36,0.12)";
            e.currentTarget.style.borderColor = isDark ? "var(--border-2)" : "rgba(251,191,36,0.4)";
          }}
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>

      {/* ── Connect Wallet ── */}
      <div ref={walletRef} className="ribbon-wallet-wrap" style={{ marginLeft: 10, position: "relative" }}>
        {connected ? (
          <button
            onClick={() => { setWalletMenu(v => !v); setDropOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--bull)",
              background: "var(--bull-bg)", border: "1px solid rgba(34,197,94,0.35)",
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
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
          >
            <Wallet size={11} />
            <span className="wallet-btn-text">Connect Wallet</span>
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
