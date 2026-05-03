import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";
import { Wallet, Clock, BarChart3, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import { portfolio, coins, generateCandles, transactions } from "../mockData";
import CoinIcon from "../components/CoinIcon";

gsap.registerPlugin(ScrollTrigger);

const TIME_RANGES = ["1W", "1M", "3M", "6M", "1Y", "All"];
const TABS = ["Overview", "History", "Analytics"] as const;
type Tab = typeof TABS[number];

const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#9945FF",
  Other: "#374151",
};

/* ── Seed holdings with actual coin quantities ─────────────────────────── */
const HOLDINGS_QTY = portfolio.holdings.map(h => {
  const coin = coins.find(c => c.symbol === h.symbol);
  const seedPrice = coin?.price ?? 1;
  const qty        = h.value / seedPrice;
  const avgBuy     = coin ? coin.price * (1 - h.gainPct / 150) : 0;
  const color      = COIN_COLORS[h.symbol] ?? h.color;
  return { ...h, qty, seedPrice, avgBuy, color };
});

/* ── Portfolio Performance Chart ─────────────────────────────────────────── */
function PortfolioChart({ range, setRange }: { range: string; setRange: (r: string) => void }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = "";
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 230,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(156,163,175,0.7)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "rgba(55,65,81,0.35)" },
        horzLines: { color: "rgba(55,65,81,0.35)" },
      },
      crosshair: {
        vertLine: { color: "rgba(59,130,246,0.5)", labelBackgroundColor: "#1F2937" },
        horzLine: { color: "rgba(59,130,246,0.5)", labelBackgroundColor: "#1F2937" },
      },
      rightPriceScale: { borderColor: "rgba(55,65,81,0.4)" },
      timeScale: { borderColor: "rgba(55,65,81,0.4)" },
      handleScroll: true,
      handleScale: true,
    });
    const candles = generateCandles("BTC", "1M");
    const scaleFactor = 42820 / candles[candles.length - 1].close;
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#3B82F6",
      topColor:  "rgba(59,130,246,0.20)",
      bottomColor: "rgba(59,130,246,0.01)",
      lineWidth: 2,
      priceLineColor: "rgba(59,130,246,0.4)",
      crosshairMarkerRadius: 4,
      crosshairMarkerBackgroundColor: "#3B82F6",
    });
    series.setData(candles.map(c => ({
      time:  c.time as any,
      value: Math.max(22000, c.close * scaleFactor),
    })));
    chart.timeScale().fitContent();
    const obs = new ResizeObserver(() => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth });
    });
    obs.observe(chartRef.current);
    return () => { chart.remove(); obs.disconnect(); };
  }, [range]);

  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "16px 20px", marginBottom: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span className="section-label">PORTFOLIO PERFORMANCE</span>
        <div style={{ display: "flex", gap: 1, background: "var(--bg-raised)", borderRadius: 6, padding: 3 }}>
          {TIME_RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              fontFamily: "var(--font-data)", fontSize: 10,
              background: range === r ? "var(--accent)" : "transparent",
              color: range === r ? "#fff" : "var(--text-2)",
              border: "none", borderRadius: 4, padding: "3px 9px", cursor: "pointer", transition: "all 0.15s",
            }}>{r}</button>
          ))}
        </div>
      </div>
      <div ref={chartRef} />
    </div>
  );
}

/* ── Fixed Donut Chart ───────────────────────────────────────────────────── */
function DonutChart({
  slices,
  totalValue,
  formatPrice,
  gainPct,
}: {
  slices: Array<{ label: string; value: number; color: string }>;
  totalValue: number;
  formatPrice: (n: number, compact?: boolean) => string;
  gainPct: number;
}) {
  const size = 190, cx = 95, cy = 95, r = 68, strokeW = 22;
  const circ  = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0);
  const GAP   = 3;
  let cumulative = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-raised)" strokeWidth={strokeW + 2} />
      {/* Segments — fixed math: strokeDashoffset = circ - cumulative (positive) */}
      {slices.map((s, i) => {
        const pct    = s.value / total;
        const segLen = pct * circ;
        const offset = circ - cumulative;
        cumulative  += segLen;
        return (
          <circle key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeW}
            strokeLinecap="butt"
            strokeDasharray={`${Math.max(0, segLen - GAP)} ${circ}`}
            strokeDashoffset={offset}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: "rotate(-90deg)",
              transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)",
            }}
          />
        );
      })}
      {/* Inner highlight ring */}
      <circle cx={cx} cy={cy} r={r - strokeW / 2 - 3} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
      {/* Center text */}
      <text x={cx} y={cy - 14} textAnchor="middle" fill="var(--text-3)" fontSize="8" fontFamily="var(--font-ui)" letterSpacing="0.12em">
        TOTAL
      </text>
      <text x={cx} y={cy + 4} textAnchor="middle" fill="var(--text-1)" fontSize="15" fontFamily="var(--font-display)" fontWeight="700">
        {formatPrice(totalValue, true)}
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill={gainPct >= 0 ? "var(--bull)" : "var(--bear)"} fontSize="9" fontFamily="var(--font-data)" fontWeight="600">
        {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}% all time
      </text>
    </svg>
  );
}

/* ── Allocation Bar ─────────────────────────────────────────────────────── */
function AllocationBar({ symbol, pct, value, gainPct, color }: {
  symbol: string; pct: number; value: number; gainPct: number; color: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useApp();
  useEffect(() => {
    gsap.from(barRef.current, {
      scaleX: 0, transformOrigin: "left", duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: barRef.current, start: "top 95%", once: true },
    });
  }, []);
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {symbol !== "Other"
            ? <CoinIcon symbol={symbol} size={16} />
            : <div style={{ width: 16, height: 16, borderRadius: "50%", background: color, flexShrink: 0 }} />
          }
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)", fontWeight: 500 }}>{symbol}</span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)" }}>{pct.toFixed(1)}%</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>
            {formatPrice(value)}
          </div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: gainPct >= 0 ? "var(--bull)" : "var(--bear)" }}>
            {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
          </div>
        </div>
      </div>
      <div style={{ height: 5, background: "var(--bg-raised)", borderRadius: 3, overflow: "hidden" }}>
        <div ref={barRef} style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function PortfolioView() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { livePrices, formatPrice } = useApp();
  const [activeTab, setActiveTab]   = useState<Tab>("Overview");
  const [chartRange, setChartRange] = useState("1M");
  const [txFilter, setTxFilter]     = useState<"All" | "BUY" | "SELL">("All");
  const [txPage, setTxPage]         = useState(0);
  const TX_PER_PAGE = 8;

  const holdingCellRefs   = useRef<Record<string, HTMLTableCellElement | null>>({});
  const prevHoldingValues = useRef<Record<string, number>>({});

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
    gsap.from(".portfolio-card", { y: 16, opacity: 0, stagger: 0.06, duration: 0.45, ease: "power2.out", delay: 0.1 });
  }, []);

  /* Live holding values (qty × live price) */
  const liveHoldings = useMemo(() =>
    HOLDINGS_QTY.map(h => {
      if (h.symbol === "Other") {
        return { ...h, livePrice: 1, liveValue: h.value, livePct: h.gainPct, change24h: 0 };
      }
      const lp       = livePrices[h.symbol];
      const livePrice = lp?.price ?? h.seedPrice;
      const liveValue = h.qty * livePrice;
      const livePct   = ((livePrice - h.avgBuy) / h.avgBuy) * 100;
      const change24h = lp?.change24h ?? 0;
      return { ...h, livePrice, liveValue, livePct, change24h };
    }),
    [livePrices]
  );

  /* Flash holding rows on price change */
  useEffect(() => {
    liveHoldings.forEach(h => {
      if (h.symbol === "Other") return;
      const el   = holdingCellRefs.current[h.symbol];
      const prev = prevHoldingValues.current[h.symbol];
      if (el && prev !== undefined && Math.abs(h.liveValue - prev) > 0.01) {
        const up = h.liveValue > prev;
        gsap.killTweensOf(el);
        gsap.to(el, {
          color: up ? "#22C55E" : "#EF4444", duration: 0.12,
          onComplete: () => gsap.to(el, { color: "var(--text-1)", duration: 1 }),
        });
      }
      prevHoldingValues.current[h.symbol] = h.liveValue;
    });
  }, [liveHoldings]);

  const otherHolding   = portfolio.holdings.find(h => h.symbol === "Other")!;
  const activeHoldings = liveHoldings.filter(h => h.symbol !== "Other");
  const liveTotal      = liveHoldings.reduce((s, h) => s + h.liveValue, 0);
  const invested       = portfolio.totalValue - portfolio.totalGain;
  const liveGain       = liveTotal - invested;
  const liveGainPct    = (liveGain / invested) * 100;
  const todayChange    = liveTotal - portfolio.totalValue;
  const todayChangePct = (todayChange / portfolio.totalValue) * 100;

  const donutSlices = [
    ...activeHoldings.map(h => ({ label: h.symbol, value: h.liveValue, color: h.color })),
    { label: "Other", value: otherHolding.value, color: COIN_COLORS.Other },
  ];

  /* Transaction logic */
  const filteredTx = transactions.filter(tx => txFilter === "All" || tx.type === txFilter);
  const txPages    = Math.ceil(filteredTx.length / TX_PER_PAGE);
  const txSlice    = filteredTx.slice(txPage * TX_PER_PAGE, (txPage + 1) * TX_PER_PAGE);

  /* Analytics */
  const completedTx  = transactions.filter(t => t.status === "Completed");
  const buys         = completedTx.filter(t => t.type === "BUY");
  const sells        = completedTx.filter(t => t.type === "SELL");
  const wins         = sells.filter(t => { const c = coins.find(x => x.symbol === t.symbol); return c ? t.price < c.price : false; });
  const winRate      = sells.length > 0 ? Math.round(wins.length / sells.length * 100) : 0;
  const bestTrade    = completedTx.reduce((b, t) => t.total > (b?.total ?? 0) ? t : b, completedTx[0]);
  const totalBought  = buys.reduce((s, t) => s + t.total, 0);
  const totalSold    = sells.reduce((s, t) => s + t.total, 0);
  const monthlyPerf  = [
    { month: "Feb", pct: 4.2,  up: true  },
    { month: "Mar", pct: -2.1, up: false },
    { month: "Apr", pct: 8.7,  up: true  },
    { month: "May", pct: 3.4,  up: true  },
  ];

  /* Stat cards */
  const statCards = [
    {
      label: "Total Value",
      displayVal: formatPrice(liveTotal),
      sub: `${todayChange >= 0 ? "+" : ""}${formatPrice(Math.abs(todayChange))} today`,
      subColor: todayChange >= 0 ? "var(--bull)" : "var(--bear)",
      valColor: "var(--text-1)",
      Icon: Wallet, iconColor: "var(--accent)",
    },
    {
      label: "Total P&L",
      displayVal: `${liveGain >= 0 ? "+" : ""}${formatPrice(Math.abs(liveGain))}`,
      sub: `${liveGainPct >= 0 ? "+" : ""}${liveGainPct.toFixed(1)}% all time`,
      subColor: "var(--bull)",
      valColor: "var(--bull)",
      Icon: TrendingUp, iconColor: "var(--bull)",
    },
    {
      label: "Invested Capital",
      displayVal: formatPrice(invested),
      sub: `${activeHoldings.length + 1} assets held`,
      subColor: "var(--text-3)",
      valColor: "var(--text-1)",
      Icon: BarChart3, iconColor: "var(--text-2)",
    },
    {
      label: "Today's Change",
      displayVal: `${todayChange >= 0 ? "+" : ""}${formatPrice(Math.abs(todayChange))}`,
      sub: `${todayChangePct >= 0 ? "+" : ""}${todayChangePct.toFixed(2)}%`,
      subColor: todayChange >= 0 ? "var(--bull)" : "var(--bear)",
      valColor: todayChange >= 0 ? "var(--bull)" : "var(--bear)",
      Icon: Clock, iconColor: todayChange >= 0 ? "var(--bull)" : "var(--bear)",
    },
  ];

  return (
    <div className="page-wrap" style={{ padding: "24px 28px" }}>

      {/* ── Header ── */}
      <div ref={headerRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
            My Portfolio
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
            Holdings, P&amp;L and risk metrics — updated live
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="live-dot" />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bull)", letterSpacing: "0.1em" }}>LIVE</span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="portfolio-card pf-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "16px 18px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 12, right: 12, opacity: 0.1 }}>
              <s.Icon size={30} color={s.iconColor} />
            </div>
            <div className="section-label" style={{ marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: s.valColor, marginBottom: 5 }}>
              {s.displayVal}
            </div>
            <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 18 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: activeTab === t ? 600 : 400,
            color: activeTab === t ? "var(--text-1)" : "var(--text-2)",
            background: "none", border: "none",
            borderBottom: activeTab === t ? "2px solid var(--accent)" : "2px solid transparent",
            padding: "8px 20px", cursor: "pointer", marginBottom: -1, transition: "color 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {/* ──────────── OVERVIEW ──────────── */}
      {activeTab === "Overview" && (
        <div className="pf-overview-grid" style={{ display: "grid", gridTemplateColumns: "1fr 296px", gap: 16, alignItems: "start" }}>
          {/* Left: chart + holdings */}
          <div>
            <PortfolioChart range={chartRange} setRange={setChartRange} />

            <div className="portfolio-card" style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 10, overflow: "hidden",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="section-label">HOLDINGS</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div className="live-dot" />
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--bull)", letterSpacing: "0.1em" }}>LIVE PRICES</span>
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Asset", "Amount", "Avg Buy", "Current Price", "Value", "P&L", "24H"].map((h, i) => (
                        <th key={i} align={i === 0 ? "left" : "right"} style={{
                          padding: "9px 14px", fontFamily: "var(--font-ui)", fontSize: 8,
                          fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeHoldings.map((h, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <CoinIcon symbol={h.symbol} size={26} />
                            <div>
                              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>{h.name}</div>
                              <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{h.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                          {h.qty.toFixed(4)} {h.symbol}
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                          {formatPrice(h.avgBuy)}
                        </td>
                        <td align="right"
                          ref={el => { holdingCellRefs.current[h.symbol] = el; }}
                          style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)", fontWeight: 500, transition: "color 0.1s" }}
                        >
                          {formatPrice(h.livePrice)}
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>
                          {formatPrice(h.liveValue)}
                        </td>
                        <td align="right" style={{ padding: "11px 14px" }}>
                          <span style={{
                            fontFamily: "var(--font-data)", fontSize: 11,
                            color: h.livePct >= 0 ? "var(--bull)" : "var(--bear)",
                            background: h.livePct >= 0 ? "var(--bull-bg)" : "var(--bear-bg)",
                            padding: "2px 7px", borderRadius: 4,
                          }}>
                            {h.livePct >= 0 ? "+" : ""}{h.livePct.toFixed(1)}%
                          </span>
                        </td>
                        <td align="right" style={{
                          padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11,
                          color: h.change24h >= 0 ? "var(--bull)" : "var(--bear)",
                        }}>
                          {h.change24h >= 0 ? "+" : ""}{h.change24h.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: donut + allocation + quick stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Donut + allocation */}
            <div className="portfolio-card" style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "18px",
            }}>
              <span className="section-label" style={{ display: "block", marginBottom: 14 }}>ALLOCATION</span>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                <DonutChart
                  slices={donutSlices}
                  totalValue={liveTotal}
                  formatPrice={formatPrice}
                  gainPct={liveGainPct}
                />
              </div>
              {[
                ...activeHoldings.map(h => ({
                  symbol: h.symbol, color: h.color,
                  pct: (h.liveValue / liveTotal) * 100,
                  value: h.liveValue, gainPct: h.livePct,
                })),
                {
                  symbol: "Other", color: COIN_COLORS.Other,
                  pct: (otherHolding.value / liveTotal) * 100,
                  value: otherHolding.value, gainPct: otherHolding.gainPct,
                },
              ].map((h, i) => (
                <AllocationBar key={i} {...h} />
              ))}
            </div>

            {/* Quick stats */}
            <div className="portfolio-card" style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "16px",
            }}>
              <span className="section-label" style={{ display: "block", marginBottom: 12 }}>QUICK STATS</span>
              {[
                { label: "Best Performer",  value: "BTC +66.4%",              color: "var(--bull)"   },
                { label: "Worst Performer", value: "SOL −11.8%",              color: "var(--bear)"   },
                { label: "Portfolio Beta",  value: "1.24",                    color: "var(--accent)" },
                { label: "Avg ROI",         value: `+${liveGainPct.toFixed(1)}%`, color: "var(--bull)" },
                { label: "Win Rate",        value: `${winRate}%`,             color: winRate >= 50 ? "var(--bull)" : "var(--bear)" },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none",
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)" }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: s.color, fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────── HISTORY ──────────── */}
      {activeTab === "History" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {(["All", "BUY", "SELL"] as const).map(f => (
              <button key={f} onClick={() => { setTxFilter(f); setTxPage(0); }} style={{
                fontFamily: "var(--font-ui)", fontSize: 11,
                background: txFilter === f
                  ? f === "BUY" ? "rgba(34,197,94,0.12)" : f === "SELL" ? "rgba(239,68,68,0.12)" : "var(--accent-dim)"
                  : "var(--bg-surface)",
                color: txFilter === f
                  ? f === "BUY" ? "var(--bull)" : f === "SELL" ? "var(--bear)" : "var(--accent)"
                  : "var(--text-2)",
                border: `1px solid ${txFilter === f ? (f === "BUY" ? "rgba(34,197,94,0.4)" : f === "SELL" ? "rgba(239,68,68,0.4)" : "var(--accent)") : "var(--border)"}`,
                borderRadius: 6, padding: "6px 14px", cursor: "pointer", transition: "all 0.15s",
              }}>
                {f === "All" ? `All (${transactions.length})` : `${f} (${transactions.filter(t => t.type === f).length})`}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)" }}>
              {filteredTx.length} transactions
            </span>
          </div>

          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Type", "Asset", "Amount", "Price", "Total", "Date", "Status"].map((h, i) => (
                      <th key={i} align={i < 2 ? "left" : "right"} style={{
                        padding: "10px 16px", fontFamily: "var(--font-ui)", fontSize: 8,
                        fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txSlice.map((tx, i) => {
                    const isBuy       = tx.type === "BUY";
                    const isCompleted = tx.status === "Completed";
                    const isFailed    = tx.status === "Failed";
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700,
                            color: isBuy ? "var(--bull)" : "var(--bear)",
                            background: isBuy ? "var(--bull-bg)" : "var(--bear-bg)",
                            padding: "2px 9px", borderRadius: 4,
                          }}>{tx.type}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <CoinIcon symbol={tx.symbol} size={24} />
                            <div>
                              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>{tx.asset}</div>
                              <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{tx.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td align="right" style={{ padding: "12px 16px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>
                          {tx.amount} {tx.symbol}
                        </td>
                        <td align="right" style={{ padding: "12px 16px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                          ${tx.price.toLocaleString()}
                        </td>
                        <td align="right" style={{ padding: "12px 16px", fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>
                          ${tx.total.toLocaleString()}
                        </td>
                        <td align="right" style={{ padding: "12px 16px", fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>
                          {tx.date}
                        </td>
                        <td align="right" style={{ padding: "12px 16px" }}>
                          <span style={{
                            fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 600,
                            color: isCompleted ? "var(--bull)" : isFailed ? "var(--bear)" : "var(--accent)",
                            background: isCompleted ? "var(--bull-bg)" : isFailed ? "var(--bear-bg)" : "var(--accent-dim)",
                            padding: "2px 8px", borderRadius: 4,
                          }}>{tx.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {txPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14, alignItems: "center" }}>
              {Array.from({ length: txPages }).map((_, i) => (
                <button key={i} onClick={() => setTxPage(i)} style={{
                  width: i === txPage ? 22 : 7, height: 7, borderRadius: 4,
                  background: i === txPage ? "var(--accent)" : "var(--border-2)",
                  border: "none", cursor: "pointer", transition: "all 0.2s", padding: 0,
                }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────── ANALYTICS ──────────── */}
      {activeTab === "Analytics" && (
        <div className="pf-analytics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Trading stats */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px" }}>
            <span className="section-label" style={{ display: "block", marginBottom: 14 }}>TRADING STATS</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Win Rate",     value: `${winRate}%`,                     color: winRate >= 50 ? "var(--bull)" : "var(--bear)" },
                { label: "Total Trades", value: `${completedTx.length}`,           color: "var(--text-1)" },
                { label: "Total Bought", value: `$${totalBought.toLocaleString()}`, color: "var(--bull)" },
                { label: "Total Sold",   value: `$${totalSold.toLocaleString()}`,   color: "var(--bear)" },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--bg-raised)", borderRadius: 8, padding: "14px" }}>
                  <div className="section-label" style={{ marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Win/loss bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="section-label">WIN / LOSS</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>{winRate}% win rate</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${winRate}%`, background: "var(--bull)", transition: "width 0.8s ease" }} />
                <div style={{ flex: 1, background: "var(--bear)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--bull)" }}>Wins: {wins.length}</span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--bear)" }}>Losses: {sells.length - wins.length}</span>
              </div>
            </div>

            {/* Best trade */}
            {bestTrade && (
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>BEST TRADE</div>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", background: "var(--bull-bg)",
                  borderRadius: 8, border: "1px solid rgba(34,197,94,0.2)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CoinIcon symbol={bestTrade.symbol} size={28} />
                    <div>
                      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>{bestTrade.asset}</div>
                      <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{bestTrade.type} · {bestTrade.date}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--bull)" }}>
                    ${bestTrade.total.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Asset performance */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px" }}>
            <span className="section-label" style={{ display: "block", marginBottom: 14 }}>ASSET PERFORMANCE</span>
            {activeHoldings.map((h, i) => (
              <div key={i} style={{ marginBottom: 15 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CoinIcon symbol={h.symbol} size={20} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{h.symbol}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>
                      {(h.liveValue / liveTotal * 100).toFixed(1)}% alloc
                    </span>
                    <span style={{
                      fontFamily: "var(--font-data)", fontSize: 12, fontWeight: 600,
                      color: h.livePct >= 0 ? "var(--bull)" : "var(--bear)",
                    }}>
                      {h.livePct >= 0 ? "+" : ""}{h.livePct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style={{ height: 7, background: "var(--bg-raised)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(100, Math.abs(h.livePct) * 0.75)}%`,
                    background: h.livePct >= 0 ? h.color : "var(--bear)",
                    borderRadius: 4, transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}

            {/* Monthly bars */}
            <div style={{ marginTop: 22 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>MONTHLY PERFORMANCE</div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 88 }}>
                {monthlyPerf.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 9, fontWeight: 600, color: m.up ? "var(--bull)" : "var(--bear)" }}>
                      {m.up ? "+" : ""}{m.pct}%
                    </span>
                    <div style={{
                      width: "100%", height: `${Math.abs(m.pct) * 6}px`,
                      background: m.up ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)",
                      borderRadius: 4,
                      border: `1px solid ${m.up ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"}`,
                    }} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk metrics — full width */}
          <div className="pf-risk-span" style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "18px", gridColumn: "span 2",
          }}>
            <span className="section-label" style={{ display: "block", marginBottom: 14 }}>RISK METRICS</span>
            <div className="pf-risk-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {[
                { label: "Portfolio Beta",  value: "1.24",   desc: "Market sensitivity",   color: "var(--accent)", bar: 62 },
                { label: "Sharpe Ratio",    value: "1.82",   desc: "Risk-adjusted return", color: "var(--bull)",   bar: 73 },
                { label: "Max Drawdown",    value: "−18.4%", desc: "Worst peak-to-trough", color: "var(--bear)",   bar: 37 },
                { label: "Volatility",      value: "28.6%",  desc: "Annualized std dev",   color: "var(--text-2)", bar: 57 },
                { label: "Sortino Ratio",   value: "2.14",   desc: "Downside risk ratio",  color: "var(--bull)",   bar: 85 },
              ].map((m, i) => (
                <div key={i} style={{ background: "var(--bg-raised)", borderRadius: 8, padding: "14px" }}>
                  <div className="section-label" style={{ marginBottom: 8 }}>{m.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: m.color, marginBottom: 6 }}>{m.value}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)", marginBottom: 10 }}>{m.desc}</div>
                  <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${m.bar}%`, background: m.color, borderRadius: 2, opacity: 0.65 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
