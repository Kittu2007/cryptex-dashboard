import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { coins } from "../mockData";
import Sparkline from "../components/Sparkline";
import { useApp } from "../context/AppContext";
import { useCoinNav } from "../context/CoinNavContext";

const categories = ["All", "Layer 1", "DeFi", "Layer 2", "Gaming", "AI", "Stablecoin"];
const timeFilters = ["1H", "24H", "7D", "30D", "1Y"];

const COIN_CATS: Record<string, string> = {
  btc: "Layer 1", eth: "Layer 1", sol: "Layer 1", bnb: "Layer 1",
  matic: "Layer 2", ada: "Layer 1", dot: "Layer 1", link: "DeFi",
};

function generateSparkData(base: number, trend: number): number[] {
  const pts = [base];
  for (let i = 1; i < 12; i++) {
    const delta = (Math.random() - 0.47 + trend * 0.01) * base * 0.025;
    pts.push(pts[pts.length - 1] + delta);
  }
  return pts;
}

// Stable 1H changes seeded once at module load — no flicker on re-render
const fake1hByCoin: Record<string, number> = {};
for (const c of coins) {
  fake1hByCoin[c.id] = parseFloat(((Math.random() - 0.48) * 0.8).toFixed(2));
}

type SortKey = "price" | "change24h" | "change7d" | "marketCap" | "volume";
type SortDir = "asc" | "desc";

export default function MarketsView() {
  const { livePrices, liveMarket, formatPrice } = useApp();
  const { navigateToCoin } = useCoinNav();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [timeFilter, setTimeFilter] = useState("24H");
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(true);
  const rowsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const prevPrices = useRef<Record<string, number>>({});
  const flashRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const sparkData = useMemo(() => coins.reduce((acc, c) => {
    acc[c.id] = generateSparkData(c.price, c.change7d);
    return acc;
  }, {} as Record<string, number[]>), []);

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
    const t = setTimeout(() => setLoading(false), 750);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && rowsRef.current) {
      gsap.from(rowsRef.current.querySelectorAll(".mkt-row"), {
        opacity: 0, y: 8, stagger: 0.04, duration: 0.5, ease: "power2.out"
      });
    }
  }, [loading]);

  useEffect(() => {
    for (const sym of Object.keys(livePrices)) {
      const lp = livePrices[sym];
      const prev = prevPrices.current[sym];
      if (prev !== undefined && prev !== lp.price) {
        const el = flashRefs.current[sym];
        if (el) {
          const isUp = lp.price > prev;
          gsap.fromTo(el,
            { backgroundColor: isUp ? "rgba(52,211,153,0.07)" : "rgba(248,113,113,0.07)" },
            { backgroundColor: "transparent", duration: 1.0, ease: "power2.out" }
          );
        }
      }
      prevPrices.current[sym] = lp.price;
    }
  }, [livePrices]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const filtered = coins
    .filter(c => {
      const nameMatch = c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase());
      const catMatch = category === "All" || COIN_CATS[c.id] === category;
      return nameMatch && catMatch;
    })
    .sort((a, b) => {
      const lpa = livePrices[a.symbol];
      const lpb = livePrices[b.symbol];
      let av: number, bv: number;
      if (sortKey === "price") { av = lpa?.price ?? a.price; bv = lpb?.price ?? b.price; }
      else if (sortKey === "change24h") { av = lpa?.change24h ?? a.change24h; bv = lpb?.change24h ?? b.change24h; }
      else if (sortKey === "change7d") { av = lpa?.change7d ?? a.change7d; bv = lpb?.change7d ?? b.change7d; }
      else if (sortKey === "marketCap") { av = lpa?.marketCapB ?? 0; bv = lpb?.marketCapB ?? 0; }
      else { av = lpa?.volumeB ?? 0; bv = lpb?.volumeB ?? 0; }
      return sortDir === "desc" ? bv - av : av - bv;
    });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span style={{ marginLeft: 3 }}>
      {sortKey === col
        ? sortDir === "desc"
          ? <ChevronDown size={10} style={{ color: "var(--accent)" }} />
          : <ChevronUp size={10} style={{ color: "var(--accent)" }} />
        : <ChevronDown size={10} style={{ color: "var(--text-3)", opacity: 0.4 }} />}
    </span>
  );

  const btcDom = liveMarket.btcDominance;
  const ethDom = livePrices["ETH"]
    ? Math.min(35, (livePrices["ETH"].marketCapB / (liveMarket.marketCap * 1000)) * 100)
    : 16;
  const otherDom = Math.max(0, 100 - btcDom - ethDom);

  const marketSummary = [
    { label: "Total Market Cap",  value: `$${liveMarket.marketCap.toFixed(2)}T`,   change: "+1.2%", up: true  },
    { label: "24H Volume",        value: `$${liveMarket.volume24h.toFixed(1)}B`,    change: "+8.4%", up: true  },
    { label: "BTC Dominance",     value: `${liveMarket.btcDominance.toFixed(1)}%`,  change: "-0.3%", up: false },
    { label: "Fear & Greed",      value: `${liveMarket.fearGreed}`,                 change: "Greed",  up: liveMarket.fearGreed >= 50 },
  ];

  const gainersCount = filtered.filter(c => (livePrices[c.symbol]?.change24h ?? c.change24h) > 0).length;
  const losersCount  = filtered.length - gainersCount;

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              Markets
            </h1>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
              Live cryptocurrency market data · Updated every 3s
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 4 }}>TODAY</div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--bull)" }}>▲ {gainersCount}</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--bear)" }}>▼ {losersCount}</span>
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: "var(--border)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div className="live-dot" />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--bull)", letterSpacing: "0.12em" }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
          {marketSummary.map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "14px 16px", transition: "border-color 0.15s"
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
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

        {/* Dominance bar */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "11px 16px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 14
        }}>
          <span className="section-label" style={{ flexShrink: 0 }}>DOMINANCE</span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, overflow: "hidden", display: "flex", gap: 1 }}>
            <div style={{ width: `${btcDom}%`, height: "100%", background: "#A78BFA", transition: "width 0.5s" }} />
            <div style={{ width: `${ethDom.toFixed(1)}%`, height: "100%", background: "#6B7280", transition: "width 0.5s" }} />
            <div style={{ flex: 1, height: "100%", background: "var(--bg-raised)" }} />
          </div>
          <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
            {[
              { label: "BTC", pct: btcDom.toFixed(1),       color: "#A78BFA" },
              { label: "ETH", pct: ethDom.toFixed(1),        color: "#6B7280" },
              { label: "Others", pct: otherDom.toFixed(1),   color: "var(--text-3)" },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: 1, background: d.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: d.color }}>{d.label}</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "0 0 200px" }}>
            <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coins..."
              style={{
                width: "100%", padding: "7px 10px 7px 28px",
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-1)", fontFamily: "var(--font-ui)", fontSize: 12, outline: "none"
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>
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
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <table className="market-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                { label: "#",           key: null,         align: "left"   },
                { label: "Asset",       key: null,         align: "left"   },
                { label: "Price",       key: "price",      align: "right"  },
                { label: timeFilter,    key: timeFilter === "24H" ? "change24h" : timeFilter === "7D" ? "change7d" : null, align: "right" },
                { label: "24H",         key: "change24h",  align: "right"  },
                { label: "7D",          key: "change7d",   align: "right"  },
                { label: "Mkt Cap",     key: "marketCap",  align: "right"  },
                { label: "Volume",      key: "volume",     align: "right"  },
                { label: "7D Chart",    key: null,         align: "center" },
                { label: "Signal",      key: null,         align: "center" },
              ].map((col, i) => (
                <th key={i} align={col.align as any}
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
                    <div className="skeleton" style={{ height: 16, borderRadius: 3 }} />
                  </td></tr>
                ))
              : filtered.length === 0
                ? (
                  <tr><td colSpan={10} style={{ padding: "40px 14px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--text-2)", marginBottom: 6 }}>
                      No coins in "{category}"
                    </div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)" }}>
                      Try a different category filter
                    </div>
                  </td></tr>
                )
                : filtered.map((coin, i) => {
                    const lp = livePrices[coin.symbol];
                    const price     = lp?.price      ?? coin.price;
                    const change24h = lp?.change24h   ?? coin.change24h;
                    const change7d  = lp?.change7d    ?? coin.change7d;
                    const change1h  = fake1hByCoin[coin.id];
                    const mktCapB   = lp?.marketCapB  ?? 0;
                    const volumeB   = lp?.volumeB     ?? 0;
                    const changeMain = timeFilter === "1H" ? change1h : timeFilter === "7D" ? change7d : change24h;
                    const isMainUp  = changeMain >= 0;
                    const is24Up    = change24h >= 0;
                    const is7Up     = change7d  >= 0;
                    const fmtMktCap = mktCapB >= 1000 ? `$${(mktCapB / 1000).toFixed(2)}T` : `$${mktCapB.toFixed(1)}B`;
                    const fmtVol    = volumeB >= 1 ? `$${volumeB.toFixed(1)}B` : `$${(volumeB * 1000).toFixed(0)}M`;
                    return (
                      <tr key={coin.id} className="mkt-row market-row"
                        ref={el => { flashRefs.current[coin.symbol] = el; }}
                        onClick={() => navigateToCoin(coin.symbol)}
                        style={{ borderBottom: "1px solid rgba(31,31,46,0.5)", cursor: "pointer" }}>
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
                              <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>
                                {coin.symbol} · {COIN_CATS[coin.id] ?? "Other"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>
                          {price < 1 ? `$${price.toFixed(3)}` : `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: isMainUp ? "var(--bull)" : "var(--bear)" }}>
                          {isMainUp ? "+" : ""}{changeMain.toFixed(2)}%
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: is24Up ? "var(--bull)" : "var(--bear)" }}>
                          {is24Up ? "+" : ""}{change24h.toFixed(2)}%
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: is7Up ? "var(--bull)" : "var(--bear)" }}>
                          {is7Up ? "+" : ""}{change7d.toFixed(1)}%
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                          {fmtMktCap}
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                          {fmtVol}
                        </td>
                        <td align="center" style={{ padding: "11px 14px" }}>
                          <Sparkline data={sparkData[coin.id]} width={70} height={26} />
                        </td>
                        <td align="center" style={{ padding: "11px 14px" }}>
                          <span style={{
                            fontFamily: "var(--font-ui)", fontSize: 9,
                            color: coin.signal === "Bullish" ? "var(--bull)" : coin.signal === "Bearish" ? "var(--bear)" : "var(--text-2)",
                            background: coin.signal === "Bullish" ? "var(--bull-bg)" : coin.signal === "Bearish" ? "var(--bear-bg)" : "var(--bg-raised)",
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
