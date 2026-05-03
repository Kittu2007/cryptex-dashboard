import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { portfolio, coins, generateCandles } from "../mockData";

gsap.registerPlugin(ScrollTrigger);

const timeRanges = ["1W", "1M", "3M", "6M", "1Y", "All"];

function PortfolioChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState("1M");

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
    // Map portfolio range to coin+timeRange format
    const rangeMap: Record<string, string> = { "1W": "1W", "1M": "1M", "3M": "1M", "6M": "1M", "1Y": "1M", "All": "1M" };
    const candles = generateCandles("BTC", rangeMap[range] ?? "1M");
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#A78BFA", topColor: "rgba(167,139,250,0.2)", bottomColor: "rgba(167,139,250,0)",
      lineWidth: 2, priceLineColor: "#A78BFA",
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

function AllocationBar({ symbol, allocation, color, value, gain, gainPct }: any) {
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
          <div style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)" }}>
            ${value.toLocaleString()}
          </div>
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
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
    const els = statsRef.current?.querySelectorAll("[data-count]");
    els?.forEach(el => {
      const target = parseFloat(el.getAttribute("data-count") || "0");
      ScrollTrigger.create({
        trigger: el, start: "top 95%", once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 1.4, ease: "power2.out",
            onUpdate: function () {
              el.textContent = "$" + Math.round(this.targets()[0].val).toLocaleString();
            }
          });
        }
      });
    });
  }, []);

  const tabs = ["Overview", "History", "Analytics"];

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef} style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
          Portfolio
        </h1>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
          Track your holdings, performance & allocation
        </p>
      </div>

      {/* Top stat cards */}
      <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Value", val: portfolio.totalValue, color: "var(--text-1)", bg: "" },
          { label: "Total P&L", val: portfolio.totalGain, color: "var(--bull)", bg: "var(--bull-bg)" },
          { label: "Invested", val: portfolio.totalValue - portfolio.totalGain, color: "var(--text-1)", bg: "" },
          { label: "Today's Change", val: 820, color: "var(--bull)", bg: "var(--bull-bg)" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "16px"
          }}>
            <div className="section-label" style={{ marginBottom: 8 }}>{s.label}</div>
            <div
              data-count={s.val}
              style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: s.color }}>
              ${s.val.toLocaleString()}
            </div>
            {i === 1 && <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--bull)", marginTop: 4 }}>+{portfolio.totalGainPct}% all time</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            fontFamily: "var(--font-ui)", fontSize: 12,
            color: activeTab === t ? "var(--text-1)" : "var(--text-2)",
            background: "none", border: "none",
            borderBottom: activeTab === t ? "2px solid var(--accent)" : "2px solid transparent",
            padding: "8px 16px", cursor: "pointer", marginBottom: -1
          }}>{t}</button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          <div>
            <PortfolioChart />

            {/* Holdings table */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span className="section-label">HOLDINGS</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Asset", "Holdings", "Avg Buy", "Current", "P&L", "24H"].map((h, i) => (
                      <th key={i} align={i === 0 ? "left" : "right"} style={{
                        padding: "9px 14px",
                        fontFamily: "var(--font-ui)", fontSize: 8, fontWeight: 600,
                        letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-3)"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.filter(h => h.symbol !== "Other").map((h, i) => {
                    const coin = coins.find(c => c.symbol === h.symbol);
                    const avgBuy = coin ? coin.price * (1 - h.gainPct / 100 / 1.5) : 0;
                    const coinChange = coin?.change24h || 0;
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
                          {(h.value / (coin?.price || 1)).toFixed(4)} {h.symbol}
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                          ${avgBuy.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </td>
                        <td align="right" style={{ padding: "11px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>
                          ${coin?.price.toLocaleString("en-US", { maximumFractionDigits: 2 }) || "—"}
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

          {/* Right: donut + allocation bars */}
          <div>
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px", marginBottom: 16 }}>
              <span className="section-label" style={{ display: "block", marginBottom: 12 }}>ALLOCATION</span>
              {/* Donut */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                {(() => {
                  const size = 150, cx = 75, cy = 75, r = 52, circ = 2 * Math.PI * r;
                  let acc = 0;
                  return (
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-raised)" strokeWidth="18" />
                      {portfolio.holdings.map((h, i) => {
                        const da = (h.allocation / 100) * circ;
                        const off = circ - acc * circ / 100;
                        acc += h.allocation;
                        return (
                          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={h.color}
                            strokeWidth="18" strokeDasharray={`${da} ${circ - da}`}
                            strokeDashoffset={off * -1}
                            style={{ transformOrigin: `${cx}px ${cy}px`, transform: "rotate(-90deg)" }} />
                        );
                      })}
                      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-2)" fontSize="9" fontFamily="var(--font-ui)">Portfolio</text>
                      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-1)" fontSize="13" fontFamily="var(--font-display)" fontWeight="600">$43K</text>
                    </svg>
                  );
                })()}
              </div>
              {portfolio.holdings.map((h, i) => (
                <AllocationBar key={i} {...h} />
              ))}
            </div>

            {/* Quick stats */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px" }}>
              <span className="section-label" style={{ display: "block", marginBottom: 12 }}>QUICK STATS</span>
              {[
                { label: "Best Performer", value: "BTC +66.4%", color: "var(--bull)" },
                { label: "Worst Performer", value: "SOL -11.8%", color: "var(--bear)" },
                { label: "Total Assets", value: "4 coins", color: "var(--text-1)" },
                { label: "Avg ROI", value: "+27.1%", color: "var(--bull)" },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0",
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

      {(activeTab === "History" || activeTab === "Analytics") && (
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "40px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-2)" }}>
            {activeTab} — Coming Soon
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-3)" }}>
            Advanced {activeTab.toLowerCase()} features are in development.
          </div>
        </div>
      )}
    </div>
  );
}
