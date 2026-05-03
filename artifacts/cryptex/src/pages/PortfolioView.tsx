import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";
import { useApp } from "../context/AppContext";
import { portfolio, coins, generateCandles, transactions } from "../mockData";

gsap.registerPlugin(ScrollTrigger);

const timeRanges = ["1W", "1M", "3M", "6M", "1Y", "All"];

function PortfolioChart({ range, setRange }: { range: string; setRange: (r: string) => void }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = "";
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 200,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#38364A", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 },
      grid: { vertLines: { color: "#1F1F2E" }, horzLines: { color: "#1F1F2E" } },
      crosshair: { vertLine: { color: "#2A2A40", labelBackgroundColor: "#1A1A24" }, horzLine: { color: "#2A2A40", labelBackgroundColor: "#1A1A24" } },
      rightPriceScale: { borderColor: "#1F1F2E" },
      timeScale: { borderColor: "#1F1F2E" },
      handleScroll: true, handleScale: true,
    });
    const candles = generateCandles("BTC", "1M");
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#3B82F6", topColor: "rgba(59,130,246,0.2)", bottomColor: "rgba(59,130,246,0)",
      lineWidth: 2, priceLineColor: "#3B82F6",
    });
    series.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
    chart.timeScale().fitContent();
    const obs = new ResizeObserver(() => { if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth }); });
    if (chartRef.current) obs.observe(chartRef.current);
    return () => { chart.remove(); obs.disconnect(); };
  }, [range]);

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span className="section-label">PORTFOLIO PERFORMANCE</span>
        <div style={{ display: "flex", gap: 2 }}>
          {timeRanges.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              fontFamily: "var(--font-data)", fontSize: 10,
              background: range === r ? "var(--bg-raised)" : "none",
              color: range === r ? "var(--text-1)" : "var(--text-2)",
              border: "none", borderRadius: 4, padding: "3px 8px", cursor: "pointer"
            }}>{r}</button>
          ))}
        </div>
      </div>
      <div ref={chartRef} />
    </div>
  );
}

function AllocationBar({ symbol, allocation, color, value, gainPct }: { symbol: string; allocation: number; color: string; value: number; gain: number; gainPct: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.from(barRef.current, {
      scaleX: 0, transformOrigin: "left", duration: 0.9, ease: "power2.out",
      scrollTrigger: { trigger: barRef.current, start: "top 90%", once: true }
    });
  }, []);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{symbol}</span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>{allocation}%</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)" }}>${value.toLocaleString()}</div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: gainPct >= 0 ? "var(--bull)" : "var(--bear)" }}>
            {gainPct >= 0 ? "+" : ""}{gainPct}%
          </div>
        </div>
      </div>
      <div style={{ height: 4, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
        <div ref={barRef} style={{ height: "100%", width: `${allocation}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

export default function PortfolioView() {
  const headerRef   = useRef<HTMLDivElement>(null);
  const { livePrices, formatPrice } = useApp();
  const [activeTab, setActiveTab]   = useState("Overview");
  const [chartRange, setChartRange] = useState("1M");
  const [txFilter, setTxFilter]     = useState<"All" | "BUY" | "SELL">("All");
  const [txPage, setTxPage]         = useState(0);
  const TX_PER_PAGE = 8;

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
    gsap.from(".portfolio-card", { y: 16, opacity: 0, stagger: 0.06, duration: 0.45, ease: "power2.out", delay: 0.1 });
  }, []);

  const livePortfolioValue = useMemo(() => {
    return portfolio.holdings.reduce((sum, h) => {
      const coin = coins.find(c => c.symbol === h.symbol);
      if (!coin) return sum + h.value;
      const lp = livePrices[coin.symbol];
      return lp ? sum + h.value * (lp.price / coin.price) : sum + h.value;
    }, 0);
  }, [livePrices]);

  const invested     = portfolio.totalValue - portfolio.totalGain;
  const liveGain     = livePortfolioValue - invested;
  const liveGainPct  = ((liveGain / invested) * 100).toFixed(1);
  const todayChange  = livePortfolioValue - portfolio.totalValue;

  const filteredTx = transactions.filter(tx => txFilter === "All" || tx.type === txFilter);
  const txPages    = Math.ceil(filteredTx.length / TX_PER_PAGE);
  const txSlice    = filteredTx.slice(txPage * TX_PER_PAGE, (txPage + 1) * TX_PER_PAGE);

  // Analytics
  const completedTx = transactions.filter(t => t.status === "Completed");
  const buys        = completedTx.filter(t => t.type === "BUY");
  const sells       = completedTx.filter(t => t.type === "SELL");
  const winRate     = sells.length > 0
    ? Math.round(sells.filter(t => {
        const coin = coins.find(c => c.symbol === t.symbol);
        return coin ? t.price < coin.price : false;
      }).length / sells.length * 100)
    : 0;
  const bestTrade     = completedTx.reduce((best, t) => t.total > (best?.total ?? 0) ? t : best, completedTx[0]);
  const totalBought   = buys.reduce((s, t) => s + t.total, 0);
  const totalSold     = sells.reduce((s, t) => s + t.total, 0);
  const monthlyPerf   = [
    { month: "Feb", pct: 4.2,  up: true  },
    { month: "Mar", pct: -2.1, up: false },
    { month: "Apr", pct: 8.7,  up: true  },
    { month: "May", pct: 3.4,  up: true  },
  ];

  const tabs = ["Overview", "History", "Analytics"];

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef} style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Portfolio</h1>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>Track your holdings, performance & allocation</p>
      </div>

      {/* Stat cards */}
      <div className="portfolio-card" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Value",      val: livePortfolioValue, color: "var(--text-1)",                              suffix: null },
          { label: "Total P&L",        val: liveGain,           color: "var(--bull)",                                suffix: `+${liveGainPct}% all time` },
          { label: "Invested",         val: invested,           color: "var(--text-1)",                              suffix: null },
          { label: "Today's Change",   val: todayChange,        color: todayChange >= 0 ? "var(--bull)" : "var(--bear)", suffix: null },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px" }}>
            <div className="section-label" style={{ marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: s.color }}>
              {i === 3 && todayChange >= 0 ? "+" : ""}{formatPrice(Math.abs(s.val))}
            </div>
            {s.suffix && <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--bull)", marginTop: 4 }}>{s.suffix}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            fontFamily: "var(--font-ui)", fontSize: 12,
            color: activeTab === t ? "var(--text-1)" : "var(--text-2)",
            background: "none", border: "none",
            borderBottom: activeTab === t ? "2px solid var(--accent)" : "2px solid transparent",
            padding: "8px 18px", cursor: "pointer", marginBottom: -1, transition: "color 0.15s"
          }}>{t}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === "Overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
          <div>
            <PortfolioChart range={chartRange} setRange={setChartRange} />

            <div className="portfolio-card" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="section-label">HOLDINGS</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div className="live-dot" />
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--bull)", letterSpacing: "0.1em" }}>LIVE PRICES</span>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Asset", "Holdings", "Avg Buy", "Current", "P&L", "24H"].map((h, i) => (
                      <th key={i} align={i === 0 ? "left" : "right"} style={{
                        padding: "9px 14px", fontFamily: "var(--font-ui)", fontSize: 8,
                        fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-3)"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.filter(h => h.symbol !== "Other").map((h, i) => {
                    const coin = coins.find(c => c.symbol === h.symbol);
                    const lp   = coin ? livePrices[coin.symbol] : null;
                    const price = lp?.price ?? coin?.price ?? 0;
                    const avgBuy = coin ? coin.price * (1 - h.gainPct / 150) : 0;
                    const coinChange = lp?.change24h ?? coin?.change24h ?? 0;
                    return (
                      <tr key={i} className="market-row" style={{ borderBottom: "1px solid rgba(31,31,46,0.4)" }}>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: h.color }} />
                            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{h.name}</span>
                            <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{h.symbol}</span>
                          </div>
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>
                          {(h.value / price).toFixed(4)} {h.symbol}
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                          ${avgBuy.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>
                          ${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: h.gainPct >= 0 ? "var(--bull)" : "var(--bear)" }}>
                          {h.gainPct >= 0 ? "+" : ""}{h.gainPct}%
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: coinChange >= 0 ? "var(--bull)" : "var(--bear)" }}>
                          {coinChange >= 0 ? "+" : ""}{coinChange.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: donut + allocation + quick stats */}
          <div>
            <div className="portfolio-card" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px", marginBottom: 16 }}>
              <span className="section-label" style={{ display: "block", marginBottom: 12 }}>ALLOCATION</span>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                {(() => {
                  const size = 150, cx = 75, cy = 75, r = 52, circ = 2 * Math.PI * r;
                  let acc = 0;
                  return (
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-raised)" strokeWidth="18" />
                      {portfolio.holdings.map((h, i) => {
                        const da  = (h.allocation / 100) * circ;
                        const off = circ - acc * circ / 100;
                        acc += h.allocation;
                        return (
                          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={h.color}
                            strokeWidth="18" strokeDasharray={`${da} ${circ - da}`}
                            strokeDashoffset={off * -1}
                            style={{ transformOrigin: `${cx}px ${cy}px`, transform: "rotate(-90deg)" }} />
                        );
                      })}
                      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-2)" fontSize="9" fontFamily="var(--font-ui)">Total</text>
                      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-1)" fontSize="13" fontFamily="var(--font-display)" fontWeight="600">
                        {formatPrice(livePortfolioValue, true)}
                      </text>
                    </svg>
                  );
                })()}
              </div>
              {portfolio.holdings.map((h, i) => <AllocationBar key={i} {...h} />)}
            </div>

            <div className="portfolio-card" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px" }}>
              <span className="section-label" style={{ display: "block", marginBottom: 12 }}>QUICK STATS</span>
              {[
                { label: "Best Performer",  value: "BTC +66.4%", color: "var(--bull)" },
                { label: "Worst Performer", value: "SOL -11.8%", color: "var(--bear)" },
                { label: "Total Assets",    value: "4 coins",    color: "var(--text-1)" },
                { label: "Avg ROI",         value: `+${liveGainPct}%`, color: "var(--bull)" },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderBottom: i < 3 ? "1px solid rgba(31,31,46,0.5)" : "none"
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)" }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: s.color, fontWeight: 500 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {activeTab === "History" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
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
                borderRadius: 5, padding: "5px 12px", cursor: "pointer", transition: "all 0.15s"
              }}>
                {f === "All" ? `All (${transactions.length})` : `${f} (${transactions.filter(t => t.type === f).length})`}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)" }}>
              {filteredTx.length} transactions
            </span>
          </div>

          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Type", "Asset", "Amount", "Price", "Total", "Date", "Status"].map((h, i) => (
                    <th key={i} align={i < 2 ? "left" : "right"} style={{
                      padding: "10px 16px", fontFamily: "var(--font-ui)", fontSize: 8,
                      fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-3)"
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
                    <tr key={i} className="market-row" style={{ borderBottom: "1px solid rgba(31,31,46,0.4)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600,
                          color: isBuy ? "var(--bull)" : "var(--bear)",
                          background: isBuy ? "var(--bull-bg)" : "var(--bear-bg)",
                          padding: "2px 8px", borderRadius: 3
                        }}>{tx.type}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{tx.asset}</div>
                        <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{tx.symbol}</div>
                      </td>
                      <td align="right" style={{ padding: "12px 16px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>
                        {tx.amount} {tx.symbol}
                      </td>
                      <td align="right" style={{ padding: "12px 16px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                        ${tx.price.toLocaleString()}
                      </td>
                      <td align="right" style={{ padding: "12px 16px", fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>
                        ${tx.total.toLocaleString()}
                      </td>
                      <td align="right" style={{ padding: "12px 16px", fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>
                        {tx.date}
                      </td>
                      <td align="right" style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontFamily: "var(--font-ui)", fontSize: 9,
                          color: isCompleted ? "var(--bull)" : isFailed ? "var(--bear)" : "var(--accent)",
                          background: isCompleted ? "var(--bull-bg)" : isFailed ? "var(--bear-bg)" : "var(--accent-dim)",
                          padding: "2px 7px", borderRadius: 3
                        }}>{tx.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {txPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14, alignItems: "center" }}>
              {Array.from({ length: txPages }).map((_, i) => (
                <button key={i} onClick={() => setTxPage(i)} style={{
                  width: i === txPage ? 20 : 7, height: 7, borderRadius: 3,
                  background: i === txPage ? "var(--accent)" : "var(--border-2)",
                  border: "none", cursor: "pointer", transition: "all 0.2s", padding: 0
                }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {activeTab === "Analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Trading stats */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "18px" }}>
            <span className="section-label" style={{ display: "block", marginBottom: 14 }}>TRADING STATS</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Win Rate",     value: `${winRate}%`,                color: winRate >= 50 ? "var(--bull)" : "var(--bear)" },
                { label: "Total Trades", value: `${completedTx.length}`,      color: "var(--text-1)" },
                { label: "Total Bought", value: `$${totalBought.toLocaleString()}`, color: "var(--bull)" },
                { label: "Total Sold",   value: `$${totalSold.toLocaleString()}`,   color: "var(--bear)" },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--bg-raised)", borderRadius: 6, padding: "12px" }}>
                  <div className="section-label" style={{ marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="section-label">WIN / LOSS</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>{winRate}% win rate</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${winRate}%`, height: "100%", background: "var(--bull)", transition: "width 0.8s ease" }} />
                <div style={{ flex: 1, height: "100%", background: "var(--bear)" }} />
              </div>
            </div>

            {bestTrade && (
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>BEST TRADE</div>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px", background: "var(--bull-bg)",
                  borderRadius: 6, border: "1px solid rgba(34,197,94,0.2)"
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{bestTrade.asset}</div>
                    <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{bestTrade.type} · {bestTrade.date}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--bull)" }}>
                    ${bestTrade.total.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Asset performance */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "18px" }}>
            <span className="section-label" style={{ display: "block", marginBottom: 14 }}>ASSET PERFORMANCE</span>
            {portfolio.holdings.map((h, i) => {
              const coin = coins.find(c => c.symbol === h.symbol);
              const lp   = coin ? livePrices[coin.symbol] : null;
              const pct  = lp && coin ? ((lp.price - coin.price * (1 - h.gainPct / 150)) / (coin.price * (1 - h.gainPct / 150)) * 100) : h.gainPct;
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: h.color }} />
                      <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)" }}>{h.symbol}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>{h.allocation}% alloc</span>
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: pct >= 0 ? "var(--bull)" : "var(--bear)", fontWeight: 500 }}>
                        {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "var(--bg-raised)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${Math.min(100, Math.abs(pct))}%`,
                      background: pct >= 0 ? h.color : "var(--bear)", borderRadius: 3, transition: "width 0.5s ease"
                    }} />
                  </div>
                </div>
              );
            })}

            {/* Monthly bars */}
            <div style={{ marginTop: 20 }}>
              <div className="section-label" style={{ marginBottom: 10 }}>MONTHLY PERFORMANCE</div>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 72 }}>
                {monthlyPerf.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: m.up ? "var(--bull)" : "var(--bear)" }}>
                      {m.up ? "+" : ""}{m.pct}%
                    </span>
                    <div style={{
                      width: "100%", height: `${Math.abs(m.pct) * 5}px`,
                      background: m.up ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
                      borderRadius: 3, border: `1px solid ${m.up ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"}`
                    }} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)" }}>{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk metrics — full width */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "18px", gridColumn: "span 2" }}>
            <span className="section-label" style={{ display: "block", marginBottom: 14 }}>RISK METRICS</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {[
                { label: "Portfolio Beta",  value: "1.24",   desc: "Market sensitivity",    color: "var(--accent)" },
                { label: "Sharpe Ratio",    value: "1.82",   desc: "Risk-adjusted return",  color: "var(--bull)"   },
                { label: "Max Drawdown",    value: "-18.4%", desc: "Worst peak-to-trough",  color: "var(--bear)"   },
                { label: "Volatility",      value: "28.6%",  desc: "Annualized std dev",    color: "var(--text-2)" },
                { label: "Sortino Ratio",   value: "2.14",   desc: "Downside risk ratio",   color: "var(--bull)"   },
              ].map((m, i) => (
                <div key={i} style={{ background: "var(--bg-raised)", borderRadius: 6, padding: "14px" }}>
                  <div className="section-label" style={{ marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: m.color, marginBottom: 4 }}>{m.value}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)" }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
