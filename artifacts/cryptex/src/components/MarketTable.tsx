import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { coins } from "../mockData";
import Sparkline from "./Sparkline";
import CoinIcon from "./CoinIcon";
import { useApp } from "../context/AppContext";
import { useCoinNav } from "../context/CoinNavContext";

gsap.registerPlugin(ScrollTrigger);

type SortKey = "price" | "change24h" | "change7d" | "marketCap" | "volume" | "signal";
type SortDir = "asc" | "desc";

function generateSparkData(base: number, trend: number): number[] {
  const pts = [base];
  for (let i = 1; i < 7; i++) {
    const delta = (Math.random() - 0.48 + trend * 0.02) * base * 0.03;
    pts.push(pts[pts.length - 1] + delta);
  }
  return pts;
}

const sparkData = coins.reduce((acc, c) => {
  acc[c.id] = generateSparkData(c.price, c.change7d);
  return acc;
}, {} as Record<string, number[]>);

function parseBillions(s: string): number {
  const v = parseFloat(s);
  if (s.endsWith("T")) return v * 1000;
  if (s.endsWith("B")) return v;
  if (s.endsWith("M")) return v / 1000;
  return v;
}

function formatBillions(b: number): string {
  if (b >= 1000) return `${(b / 1000).toFixed(2)}T`;
  if (b >= 1)    return `${b.toFixed(1)}B`;
  return `${(b * 1000).toFixed(0)}M`;
}

export default function MarketTable() {
  const tableRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLTableSectionElement>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const priceRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  const { formatPrice, livePrices } = useApp();
  const { navigateToCoin } = useCoinNav();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && rowsRef.current) {
      const rows = rowsRef.current.querySelectorAll(".mkt-row");
      gsap.from(rows, {
        opacity: 0, y: 6, stagger: 0.04, duration: 0.45, ease: "power2.out",
        delay: 0.05,
      });
    }
  }, [loading]);

  // Flash price cells on live update
  useEffect(() => {
    if (loading) return;
    for (const coin of coins) {
      const lp = livePrices[coin.symbol];
      if (!lp) continue;
      const el = priceRefs.current[coin.symbol];
      if (!el) continue;
      const up = lp.price >= lp.prevPrice;
      gsap.to(el, {
        color: up ? "#34D399" : "#F87171", duration: 0.08,
        onComplete: () => gsap.to(el, { color: "var(--text-1)", duration: 1.2 })
      });
    }
  }, [livePrices, loading]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function resolveSignal(change: number): "Bullish" | "Neutral" | "Bearish" {
    if (change > 1.0) return "Bullish";
    if (change < -1.0) return "Bearish";
    return "Neutral";
  }
  const signalRank: Record<string, number> = { Bullish: 2, Neutral: 1, Bearish: 0 };

  const sorted = [...coins].sort((a, b) => {
    const lpa = livePrices[a.symbol];
    const lpb = livePrices[b.symbol];
    const aPrice = lpa?.price ?? a.price;
    const bPrice = lpb?.price ?? b.price;
    const aChange = lpa?.change24h ?? a.change24h;
    const bChange = lpb?.change24h ?? b.change24h;
    const a7d = lpa?.change7d ?? a.change7d;
    const b7d = lpb?.change7d ?? b.change7d;
    const aMktCap = lpa?.marketCapB ?? parseBillions(a.marketCap);
    const bMktCap = lpb?.marketCapB ?? parseBillions(b.marketCap);
    const aVol = lpa?.volumeB ?? parseBillions(a.volume);
    const bVol = lpb?.volumeB ?? parseBillions(b.volume);
    let aVal: number, bVal: number;
    if (sortKey === "price")     { aVal = aPrice; bVal = bPrice; }
    else if (sortKey === "change24h") { aVal = aChange; bVal = bChange; }
    else if (sortKey === "change7d")  { aVal = a7d; bVal = b7d; }
    else if (sortKey === "marketCap") { aVal = aMktCap; bVal = bMktCap; }
    else if (sortKey === "volume")    { aVal = aVol; bVal = bVol; }
    else { aVal = signalRank[resolveSignal(aChange)]; bVal = signalRank[resolveSignal(bChange)]; }
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span style={{ marginLeft: 4, display: "inline-flex", alignItems: "center" }}>
      {sortKey === col
        ? sortDir === "desc"
          ? <ChevronDown size={10} style={{ color: "var(--accent)" }} />
          : <ChevronUp size={10} style={{ color: "var(--accent)" }} />
        : <ChevronDown size={10} style={{ color: "var(--text-3)", opacity: 0.4 }} />}
    </span>
  );

  const thStyle = (key?: SortKey): React.CSSProperties => ({
    fontFamily: "var(--font-ui)", fontSize: 8, fontWeight: 600,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: sortKey === key ? "var(--text-2)" : "var(--text-3)",
    padding: "10px 0", cursor: key ? "pointer" : "default",
    userSelect: "none", whiteSpace: "nowrap"
  });

  const SignalPill = ({ change }: { change: number }) => {
    const resolved = resolveSignal(change);
    const isBull = resolved === "Bullish", isBear = resolved === "Bearish";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {isBull ? <TrendingUp size={9} style={{ color: "var(--bull)" }} /> : isBear ? <TrendingDown size={9} style={{ color: "var(--bear)" }} /> : null}
        <span style={{
          fontFamily: "var(--font-ui)", fontSize: 9,
          color: isBull ? "var(--bull)" : isBear ? "var(--bear)" : "var(--text-2)",
          background: isBull ? "var(--bull-bg)" : isBear ? "var(--bear-bg)" : "transparent",
          padding: "2px 6px", borderRadius: 3
        }}>{resolved}</span>
      </div>
    );
  };

  return (
    <div ref={tableRef} style={{ padding: "0 24px", borderBottom: "1px solid var(--border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }} className="market-table">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={thStyle()} align="left">#</th>
            <th style={thStyle()} align="left">Asset</th>
            <th style={{ ...thStyle("price"), textAlign: "right" }} onClick={() => handleSort("price")}>
              Price <SortIcon col="price" />
            </th>
            <th style={{ ...thStyle("change24h"), textAlign: "right" }} onClick={() => handleSort("change24h")}>
              24H <SortIcon col="change24h" />
            </th>
            <th style={{ ...thStyle("change7d"), textAlign: "right" }} onClick={() => handleSort("change7d")}>
              7D Chart <SortIcon col="change7d" />
            </th>
            <th style={{ ...thStyle("marketCap"), textAlign: "right" }} onClick={() => handleSort("marketCap")}>
              Mkt Cap <SortIcon col="marketCap" />
            </th>
            <th style={{ ...thStyle("volume"), textAlign: "right" }} onClick={() => handleSort("volume")}>
              Volume <SortIcon col="volume" />
            </th>
            <th style={{ ...thStyle("signal"), textAlign: "right" }} onClick={() => handleSort("signal")}>
              Signal <SortIcon col="signal" />
            </th>
          </tr>
        </thead>
        <tbody ref={rowsRef}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(31,31,46,0.4)" }}>
                  <td colSpan={8} style={{ padding: "12px 0" }}>
                    <div className="skeleton" style={{ height: 16, borderRadius: 3 }} />
                  </td>
                </tr>
              ))
            : sorted.map((coin, i) => {
                const lp = livePrices[coin.symbol];
                const livePrice   = lp?.price      ?? coin.price;
                const liveChange  = lp?.change24h  ?? coin.change24h;
                const liveChange7d = lp?.change7d  ?? coin.change7d;
                const liveMktCapB  = lp?.marketCapB ?? parseBillions(coin.marketCap);
                const liveVolumeB  = lp?.volumeB    ?? parseBillions(coin.volume);
                const is24Up = liveChange   >= 0;
                const is7Up  = liveChange7d >= 0;
                return (
                  <tr key={coin.id} className="mkt-row" style={{
                    borderBottom: "1px solid rgba(31,31,46,0.4)",
                    transition: "background 0.1s", cursor: "pointer"
                  }}
                    onClick={() => navigateToCoin(coin.symbol)}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 0", fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)", paddingRight: 16 }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "10px 16px 10px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CoinIcon symbol={coin.symbol} size={28} fallbackColor={coin.avatar} />
                        <div>
                          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{coin.name}</div>
                          <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-2)" }}>{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td
                      ref={el => { priceRefs.current[coin.symbol] = el; }}
                      align="right"
                      style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)", paddingRight: 16, transition: "color 0.15s" }}
                    >
                      {formatPrice(livePrice)}
                    </td>
                    <td align="right" style={{ fontFamily: "var(--font-data)", fontSize: 11, color: is24Up ? "var(--bull)" : "var(--bear)", paddingRight: 16 }}>
                      <span style={{
                        padding: "1px 5px", borderRadius: 3,
                        background: is24Up ? "var(--bull-bg)" : "var(--bear-bg)"
                      }}>
                        {is24Up ? "+" : "−"}{Math.abs(liveChange).toFixed(1)}%
                      </span>
                    </td>
                    <td align="right" style={{ paddingRight: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <Sparkline data={sparkData[coin.id]} width={50} height={22} />
                        <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: is7Up ? "var(--bull)" : "var(--bear)", minWidth: 42, textAlign: "right" }}>
                          {is7Up ? "+" : "−"}{Math.abs(liveChange7d).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td align="right" style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)", paddingRight: 16 }}>
                      ${formatBillions(liveMktCapB)}
                    </td>
                    <td align="right" style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)", paddingRight: 16 }}>
                      ${formatBillions(liveVolumeB)}
                    </td>
                    <td align="right"><SignalPill change={liveChange} /></td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
