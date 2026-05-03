import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import { coins } from "../mockData";
import Sparkline from "../components/Sparkline";

gsap.registerPlugin(ScrollTrigger);

const categories = ["All", "Layer 1", "DeFi", "Layer 2", "Gaming", "AI", "Stablecoin"];
const timeFilters = ["1H", "24H", "7D", "30D", "1Y"];

function generateSparkData(base: number, trend: number): number[] {
  const pts = [base];
  for (let i = 1; i < 12; i++) {
    const delta = (Math.random() - 0.47 + trend * 0.01) * base * 0.025;
    pts.push(pts[pts.length - 1] + delta);
  }
  return pts;
}
const sparkData = coins.reduce((acc, c) => {
  acc[c.id] = generateSparkData(c.price, c.change7d);
  return acc;
}, {} as Record<string, number[]>);

type SortKey = "price" | "change24h" | "change7d" | "marketCap" | "volume";
type SortDir = "asc" | "desc";

export default function MarketsView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [timeFilter, setTimeFilter] = useState("24H");
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(true);
  const rowsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && rowsRef.current) {
      gsap.from(rowsRef.current.querySelectorAll(".mkt-row"), {
        opacity: 0, y: 8, stagger: 0.04, duration: 0.5, ease: "power2.out"
      });
    }
  }, [loading]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const parseNum = (v: string) => parseFloat(v.replace(/[TBMK]/g, ""));
  const filtered = coins
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "price") { av = a.price; bv = b.price; }
      else if (sortKey === "change24h") { av = a.change24h; bv = b.change24h; }
      else if (sortKey === "change7d") { av = a.change7d; bv = b.change7d; }
      else if (sortKey === "marketCap") { av = parseNum(a.marketCap); bv = parseNum(b.marketCap); }
      else { av = parseNum(a.volume); bv = parseNum(b.volume); }
      return sortDir === "desc" ? bv - av : av - bv;
    });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span style={{ marginLeft: 3 }}>
      {sortKey === col
        ? sortDir === "desc" ? <ChevronDown size={10} style={{ color: "var(--accent)" }} /> : <ChevronUp size={10} style={{ color: "var(--accent)" }} />
        : <ChevronDown size={10} style={{ color: "var(--text-3)", opacity: 0.4 }} />}
    </span>
  );

  const marketSummary = [
    { label: "Total Market Cap", value: "$2.84T", change: "+1.2%", up: true },
    { label: "24H Volume", value: "$98.4B", change: "+8.4%", up: true },
    { label: "BTC Dominance", value: "52.4%", change: "-0.3%", up: false },
    { label: "Active Coins", value: "23,841", change: "+124", up: true },
  ];

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef}>
        {/* Page Title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
            Markets
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
            Live cryptocurrency market data · Updated every 3s
          </p>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {marketSummary.map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "14px 16px"
            }}>
              <div className="section-label" style={{ marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: s.up ? "var(--bull)" : "var(--bear)" }}>
                {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* Filters row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "0 0 220px" }}>
            <Search size={13} style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              color: "var(--text-3)"
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search coins..."
              style={{
                width: "100%", padding: "7px 10px 7px 30px",
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-1)",
                fontFamily: "var(--font-ui)", fontSize: 12,
                outline: "none"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--border-2)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                fontFamily: "var(--font-ui)", fontSize: 11,
                background: category === c ? "var(--accent-dim)" : "var(--bg-surface)",
                color: category === c ? "var(--accent)" : "var(--text-2)",
                border: `1px solid ${category === c ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 4, padding: "5px 10px", cursor: "pointer", transition: "all 0.15s"
              }}>{c}</button>
            ))}
          </div>

          {/* Time filter */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
            {timeFilters.map(t => (
              <button key={t} onClick={() => setTimeFilter(t)} style={{
                fontFamily: "var(--font-data)", fontSize: 10,
                background: timeFilter === t ? "var(--bg-raised)" : "none",
                color: timeFilter === t ? "var(--text-1)" : "var(--text-2)",
                border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer"
              }}>{t}</button>
            ))}
          </div>

          <button style={{
            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 6, cursor: "pointer", color: "var(--text-2)"
          }}>
            <SlidersHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                { label: "#", key: null, align: "left" },
                { label: "Asset", key: null, align: "left" },
                { label: "Price", key: "price", align: "right" },
                { label: "1H", key: null, align: "right" },
                { label: "24H", key: "change24h", align: "right" },
                { label: "7D", key: "change7d", align: "right" },
                { label: "Mkt Cap", key: "marketCap", align: "right" },
                { label: "Volume", key: "volume", align: "right" },
                { label: "7D Chart", key: null, align: "center" },
                { label: "Signal", key: null, align: "center" },
              ].map((col, i) => (
                <th key={i}
                  align={col.align as any}
                  onClick={() => col.key && handleSort(col.key as SortKey)}
                  style={{
                    padding: "11px 14px",
                    fontFamily: "var(--font-ui)", fontSize: 8, fontWeight: 600,
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    color: sortKey === col.key ? "var(--text-2)" : "var(--text-3)",
                    cursor: col.key ? "pointer" : "default",
                    userSelect: "none", whiteSpace: "nowrap"
                  }}>
                  {col.label}
                  {col.key && <SortIcon col={col.key as SortKey} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={rowsRef as any}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={10} style={{ padding: "12px 14px" }}>
                    <div className="skeleton" style={{ height: 16 }} />
                  </td></tr>
                ))
              : filtered.map((coin, i) => {
                  const is24Up = coin.change24h >= 0;
                  const is7Up = coin.change7d >= 0;
                  const fake1h = ((Math.random() - 0.48) * 0.8).toFixed(2);
                  const is1Up = parseFloat(fake1h) >= 0;
                  return (
                    <tr key={coin.id} className="mkt-row market-row" style={{ borderBottom: "1px solid rgba(31,31,46,0.5)" }}>
                      <td style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>{i + 1}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: coin.avatar + "20", border: `1px solid ${coin.avatar}40`,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                          }}>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: coin.avatar }}>
                              {coin.symbol[0]}
                            </span>
                          </div>
                          <div>
                            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{coin.name}</div>
                            <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{coin.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>
                        ${coin.price < 1 ? coin.price.toFixed(3) : coin.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: is1Up ? "var(--bull)" : "var(--bear)" }}>
                        {is1Up ? "+" : ""}{fake1h}%
                      </td>
                      <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: is24Up ? "var(--bull)" : "var(--bear)" }}>
                        {is24Up ? "+" : ""}{coin.change24h.toFixed(1)}%
                      </td>
                      <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: is7Up ? "var(--bull)" : "var(--bear)" }}>
                        {is7Up ? "+" : ""}{coin.change7d.toFixed(1)}%
                      </td>
                      <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                        ${coin.marketCap}
                      </td>
                      <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                        ${coin.volume}
                      </td>
                      <td align="center" style={{ padding: "11px 14px" }}>
                        <Sparkline data={sparkData[coin.id]} width={70} height={26} />
                      </td>
                      <td align="center" style={{ padding: "11px 14px" }}>
                        <span style={{
                          fontFamily: "var(--font-ui)", fontSize: 9,
                          color: coin.signal === "Bullish" ? "var(--bull)" : coin.signal === "Bearish" ? "var(--bear)" : "var(--text-2)",
                          background: coin.signal === "Bullish" ? "var(--bull-bg)" : coin.signal === "Bearish" ? "var(--bear-bg)" : "transparent",
                          padding: "2px 7px", borderRadius: 3
                        }}>{coin.signal}</span>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
