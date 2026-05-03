import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronUp, ChevronDown } from "lucide-react";
import { coins } from "../mockData";
import Sparkline from "./Sparkline";

gsap.registerPlugin(ScrollTrigger);

type SortKey = "price" | "change24h" | "change7d" | "marketCap" | "volume";
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

export default function MarketTable() {
  const tableRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLTableSectionElement>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && rowsRef.current) {
      const rows = rowsRef.current.querySelectorAll(".mkt-row");
      gsap.from(rows, {
        opacity: 0, y: 8, stagger: 0.04, duration: 0.5, ease: "power2.out",
        scrollTrigger: { trigger: tableRef.current, start: "top 85%" }
      });
    }
  }, [loading]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...coins].sort((a, b) => {
    const parseNum = (v: string) => parseFloat(v.replace(/[TBMK]/g, ""));
    let aVal: number, bVal: number;
    if (sortKey === "price") { aVal = a.price; bVal = b.price; }
    else if (sortKey === "change24h") { aVal = a.change24h; bVal = b.change24h; }
    else if (sortKey === "change7d") { aVal = a.change7d; bVal = b.change7d; }
    else if (sortKey === "marketCap") { aVal = parseNum(a.marketCap); bVal = parseNum(b.marketCap); }
    else { aVal = parseNum(a.volume); bVal = parseNum(b.volume); }
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span style={{ marginLeft: 4, display: "inline-flex", alignItems: "center" }}>
      {sortKey === col
        ? sortDir === "desc"
          ? <ChevronDown size={10} style={{ color: "var(--accent)" }} />
          : <ChevronUp size={10} style={{ color: "var(--accent)" }} />
        : <ChevronDown size={10} style={{ color: "var(--text-3)", opacity: 0.4 }} />
      }
    </span>
  );

  const thStyle = (key?: SortKey): React.CSSProperties => ({
    fontFamily: "var(--font-ui)",
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: sortKey === key ? "var(--text-2)" : "var(--text-3)",
    padding: "10px 0",
    cursor: key ? "pointer" : "default",
    userSelect: "none",
    whiteSpace: "nowrap" as const
  });

  const SignalPill = ({ signal }: { signal: string }) => {
    const isBull = signal === "Bullish";
    const isBear = signal === "Bearish";
    return (
      <span style={{
        fontFamily: "var(--font-ui)", fontSize: 9,
        color: isBull ? "var(--bull)" : isBear ? "var(--bear)" : "var(--text-2)",
        background: isBull ? "var(--bull-bg)" : isBear ? "var(--bear-bg)" : "transparent",
        padding: "2px 6px", borderRadius: 3
      }}>{signal}</span>
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
              7D <SortIcon col="change7d" />
            </th>
            <th style={{ ...thStyle("marketCap"), textAlign: "right" }} onClick={() => handleSort("marketCap")}>
              Mkt Cap <SortIcon col="marketCap" />
            </th>
            <th style={{ ...thStyle("volume"), textAlign: "right" }} onClick={() => handleSort("volume")}>
              Vol <SortIcon col="volume" />
            </th>
            <th style={thStyle()} align="right">Signal</th>
          </tr>
        </thead>
        <tbody ref={rowsRef}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(31,31,46,0.4)" }}>
                  <td colSpan={8} style={{ padding: "10px 0" }}>
                    <div className="skeleton" style={{ height: 14, borderRadius: 3 }} />
                  </td>
                </tr>
              ))
            : sorted.map((coin, i) => {
                const is24Up = coin.change24h >= 0;
                const is7Up = coin.change7d >= 0;
                return (
                  <tr key={coin.id} className="mkt-row" style={{ borderBottom: "1px solid rgba(31,31,46,0.4)" }}>
                    <td style={{ padding: "10px 0 10px", fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)", paddingRight: 16 }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "10px 16px 10px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: coin.avatar + "20",
                          border: `1px solid ${coin.avatar}40`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 600, color: coin.avatar }}>
                            {coin.symbol[0]}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>
                            {coin.name}
                          </div>
                          <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-2)" }}>
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td align="right" style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)", paddingRight: 16 }}>
                      ${coin.price < 1 ? coin.price.toFixed(3) : coin.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td align="right" style={{ fontFamily: "var(--font-data)", fontSize: 11, color: is24Up ? "var(--bull)" : "var(--bear)", paddingRight: 16 }}>
                      {is24Up ? "+" : "−"}{Math.abs(coin.change24h).toFixed(1)}%
                    </td>
                    <td align="right" style={{ paddingRight: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        <Sparkline data={sparkData[coin.id]} width={44} height={20} />
                        <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: is7Up ? "var(--bull)" : "var(--bear)", minWidth: 42, textAlign: "right" }}>
                          {is7Up ? "+" : "−"}{Math.abs(coin.change7d).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td align="right" style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)", paddingRight: 16 }}>
                      ${coin.marketCap}
                    </td>
                    <td align="right" style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)", paddingRight: 16 }}>
                      ${coin.volume}
                    </td>
                    <td align="right">
                      <SignalPill signal={coin.signal} />
                    </td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    </div>
  );
}
