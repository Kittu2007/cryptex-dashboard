import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrendingUp, TrendingDown } from "lucide-react";
import { portfolio } from "../mockData";
import { useApp } from "../context/AppContext";

gsap.registerPlugin(ScrollTrigger);

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 2 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const elRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);
  const flashRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (!elRef.current) return;

    const isUp = value >= prev;
    const diff = Math.abs(value - prev);
    if (diff < 0.0001) return; // skip tiny jitter

    gsap.to({ v: prev }, {
      v: value, duration: 0.6, ease: "power2.out",
      onUpdate: function () {
        if (elRef.current) {
          const v = this.targets()[0].v;
          elRef.current.textContent = prefix + v.toFixed(decimals) + suffix;
        }
      }
    });

    if (flashRef.current) {
      gsap.fromTo(flashRef.current,
        { opacity: 0.9, color: isUp ? "#34D399" : "#F87171" },
        { opacity: 0, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [value]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <span ref={flashRef} style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600
      }}>{prefix}{value.toFixed(decimals)}{suffix}</span>
      <span ref={elRef} style={{
        fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-1)", fontWeight: 600
      }}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    </div>
  );
}

export default function RightPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const { formatPrice, liveMarket, livePrices } = useApp();

  const btc = livePrices["BTC"];

  useEffect(() => {
    gsap.from(panelRef.current, { x: 20, opacity: 0, duration: 0.6, ease: "expo.out", delay: 0.6 });
  }, []);

  const dynamicStats = [
    {
      label: "MARKET CAP",
      node: <AnimatedNumber value={liveMarket.marketCap} suffix="T" decimals={2} />,
      sub: `+$${(liveMarket.marketCap * 0.037).toFixed(1)}B today`,
      trend: true,
    },
    {
      label: "24H VOLUME",
      node: <AnimatedNumber value={liveMarket.volume24h} suffix="B" decimals={1} />,
      sub: "Across all pairs",
      trend: null,
    },
    {
      label: "CIRCULATING",
      node: <AnimatedNumber value={19.67} suffix="M" decimals={2} />,
      sub: "of 21M max supply",
      trend: null,
    },
    {
      label: "ALL TIME HIGH",
      node: (
        <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-1)", fontWeight: 600 }}>
          {btc ? formatPrice(73750) : "$73,750"}
        </span>
      ),
      sub: "Mar 14, 2024",
      trend: false,
    },
  ];

  // Donut
  const size = 120, cx = 60, cy = 60, r = 42;
  const circumference = 2 * Math.PI * r;
  let accumulated = 0;
  const segments = portfolio.holdings.map(h => {
    const dashArray = (h.allocation / 100) * circumference;
    const dashOffset = circumference - accumulated * circumference / 100;
    accumulated += h.allocation;
    return { ...h, dashArray, dashOffset };
  });

  // Live portfolio value
  const btcPrice = btc?.price ?? 67432.5;
  const livePortfolio = btcPrice * (portfolio.totalValue / 67432.5);

  return (
    <div ref={panelRef} className="right-panel" style={{
      width: 280, background: "var(--bg-surface)", borderLeft: "1px solid var(--border)",
      padding: "20px 16px", overflowY: "auto", flexShrink: 0,
      transition: "background-color 0.3s ease"
    }}>
      {/* Market Stats */}
      <span className="section-label" style={{ display: "block", marginBottom: 2 }}>MARKET STATS</span>
      {dynamicStats.map((stat, i) => (
        <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span className="section-label">{stat.label}</span>
            {stat.trend === true && (
              <span style={{
                display: "flex", alignItems: "center", gap: 2,
                fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bull)"
              }}>
                <TrendingUp size={9} /> Live
              </span>
            )}
          </div>
          {stat.node}
          <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>
            {stat.sub}
          </div>
        </div>
      ))}

      {/* BTC Dominance live bar */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="section-label">BTC DOMINANCE</span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-1)" }}>
            {liveMarket.btcDominance.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: 3, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${liveMarket.btcDominance}%`,
            background: "var(--accent)", borderRadius: 2,
            transition: "width 0.6s ease"
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>BTC</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>ALTs</span>
        </div>
      </div>

      {/* Fear & Greed */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="section-label">FEAR & GREED</span>
          <span style={{
            fontFamily: "var(--font-data)", fontSize: 9,
            color: liveMarket.fearGreed > 60 ? "var(--bull)" : liveMarket.fearGreed < 40 ? "var(--bear)" : "var(--text-2)",
            background: liveMarket.fearGreed > 60 ? "var(--bull-bg)" : liveMarket.fearGreed < 40 ? "var(--bear-bg)" : "transparent",
            padding: "1px 6px", borderRadius: 3
          }}>
            {liveMarket.fearGreed > 60 ? "Greed" : liveMarket.fearGreed < 40 ? "Fear" : "Neutral"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: liveMarket.fearGreed > 60 ? "var(--bull)" : liveMarket.fearGreed < 40 ? "var(--bear)" : "var(--text-2)", transition: "color 0.4s" }}>
            {liveMarket.fearGreed}
          </span>
          <div style={{ flex: 1, height: 4, borderRadius: 2, overflow: "hidden", background: "linear-gradient(to right, #F87171, #EAB308, #34D399)" }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "var(--text-1)",
              marginTop: -2, border: "1px solid var(--bg-surface)",
              marginLeft: `calc(${liveMarket.fearGreed}% - 4px)`,
              transition: "margin-left 0.6s ease"
            }} />
          </div>
        </div>
      </div>

      {/* Portfolio Snapshot */}
      <div style={{ marginTop: 16 }}>
        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>YOUR PORTFOLIO</span>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", transition: "all 0.3s" }}>
            {formatPrice(livePortfolio)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <TrendingUp size={11} style={{ color: "var(--bull)" }} />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--bull)" }}>
            +{formatPrice(portfolio.totalGain)} (+{portfolio.totalGainPct}%)
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", margin: "14px 0 10px" }}>
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
            <text x={cx} y={cy + 9} textAnchor="middle" fill="var(--text-1)" fontSize="10" fontFamily="var(--font-display)" fontWeight="600">
              {formatPrice(livePortfolio, true)}
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
