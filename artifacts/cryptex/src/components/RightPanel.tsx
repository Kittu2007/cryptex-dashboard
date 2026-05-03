import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolio, marketStats } from "../mockData";
import { useApp } from "../context/AppContext";

gsap.registerPlugin(ScrollTrigger);

export default function RightPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useApp();

  useEffect(() => {
    gsap.from(panelRef.current, { x: 20, opacity: 0, duration: 0.6, ease: "expo.out", delay: 0.6 });

    const els = statsRef.current?.querySelectorAll("[data-count]");
    els?.forEach(el => {
      const target = parseFloat(el.getAttribute("data-count") || "0");
      const snap = parseFloat(el.getAttribute("data-snap") || "1");
      const suffix = el.getAttribute("data-suffix") || "";
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 1.6, ease: "power2.out",
            onUpdate: function () {
              const v = this.targets()[0].val;
              const rounded = snap >= 1 ? Math.round(v) : v.toFixed(String(snap).split(".")[1]?.length || 2);
              el.textContent = (snap >= 1 ? Number(rounded).toLocaleString() : rounded) + suffix;
            }
          });
        }
      });
    });
  }, []);

  const size = 120, cx = 60, cy = 60, r = 42;
  const circumference = 2 * Math.PI * r;
  let accumulated = 0;
  const segments = portfolio.holdings.map(h => {
    const dashArray = (h.allocation / 100) * circumference;
    const dashOffset = circumference - accumulated * circumference / 100;
    accumulated += h.allocation;
    return { ...h, dashArray, dashOffset };
  });

  return (
    <div ref={panelRef} className="right-panel" style={{
      width: 280, background: "var(--bg-surface)", borderLeft: "1px solid var(--border)",
      padding: "20px 16px", overflowY: "auto", flexShrink: 0,
      transition: "background-color 0.3s ease"
    }}>
      <div ref={statsRef}>
        <span className="section-label" style={{ display: "block", marginBottom: 2 }}>MARKET STATS</span>
        {marketStats.map((stat, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <span className="section-label">{stat.label}</span>
            <div style={{ marginTop: 4 }}>
              <span data-count={stat.count} data-snap={stat.snap} data-suffix={stat.suffix} style={{
                fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-1)", fontWeight: 600
              }}>
                {stat.value}{stat.suffix}
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>{stat.sub}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>YOUR PORTFOLIO</span>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--text-1)" }}>
            {formatPrice(portfolio.totalValue)}
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--bull)" }}>
          +{formatPrice(portfolio.totalGain)} (+{portfolio.totalGainPct}%)
        </span>

        <div style={{ display: "flex", justifyContent: "center", margin: "16px 0 12px" }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-raised)" strokeWidth="14" />
            {segments.map((seg, i) => (
              <circle key={i} className="donut-ring" cx={cx} cy={cy} r={r}
                fill="none" stroke={seg.color} strokeWidth="14"
                strokeDasharray={`${seg.dashArray} ${circumference - seg.dashArray}`}
                strokeDashoffset={seg.dashOffset * -1}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            ))}
            <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-2)" fontSize="8" fontFamily="var(--font-ui)">PORTFOLIO</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--text-1)" fontSize="10" fontFamily="var(--font-display)" fontWeight="600">
              ${Math.round(portfolio.totalValue / 1000)}K
            </text>
          </svg>
        </div>

        {portfolio.holdings.map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: h.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)" }}>{h.symbol}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>{h.allocation}%</span>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: h.gainPct >= 0 ? "var(--bull)" : "var(--bear)" }}>
                {h.gainPct >= 0 ? "+" : ""}{h.gainPct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
