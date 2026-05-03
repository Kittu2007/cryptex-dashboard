import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrendingUp } from "lucide-react";
import { portfolio } from "../mockData";
import { useApp } from "../context/AppContext";

gsap.registerPlugin(ScrollTrigger);

// ── AnimatedNumber: GSAP-tweened numeric display ──────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 2, fontSize = 18 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; fontSize?: number;
}) {
  const elRef    = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);
  const prevRef  = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (!elRef.current) return;
    const diff = Math.abs(value - prev);
    if (diff < 0.0001) return;

    const isUp = value >= prev;
    gsap.to({ v: prev }, {
      v: value, duration: 0.65, ease: "power2.out",
      onUpdate: function () {
        if (elRef.current)
          elRef.current.textContent = prefix + (this.targets()[0].v as number).toFixed(decimals) + suffix;
      },
    });

    if (flashRef.current) {
      gsap.fromTo(flashRef.current,
        { opacity: 0.85, color: isUp ? "#34D399" : "#F87171" },
        { opacity: 0, duration: 0.9, ease: "power2.out" }
      );
    }
  }, [value]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <span ref={flashRef} style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        fontFamily: "var(--font-display)", fontSize, fontWeight: 600,
      }}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
      <span ref={elRef} style={{
        fontFamily: "var(--font-display)", fontSize, fontWeight: 600, color: "var(--text-1)",
      }}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    </div>
  );
}

// ── LiveBar: GSAP-animated horizontal bar ────────────────────────────────────
function LiveBar({ pct, color = "var(--accent)" }: { pct: number; color?: string }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const prevPct = useRef(pct);

  useEffect(() => {
    if (!fillRef.current) return;
    gsap.to(fillRef.current, {
      width: `${Math.min(100, Math.max(0, pct))}%`,
      duration: 0.8, ease: "power2.out",
    });
    prevPct.current = pct;
  }, [pct]);

  return (
    <div style={{ height: 3, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
      <div
        ref={fillRef}
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, prevPct.current))}%`,
          background: color, borderRadius: 2,
        }}
      />
    </div>
  );
}

// ── FearGreedGauge: animated dial + number ───────────────────────────────────
function FearGreedGauge({ value }: { value: number }) {
  const dotRef  = useRef<HTMLDivElement>(null);
  const numRef  = useRef<HTMLSpanElement>(null);
  const prevVal = useRef(value);

  useEffect(() => {
    const prev = prevVal.current;
    prevVal.current = value;
    const diff = Math.abs(value - prev);
    if (diff < 0.5) return;

    // Tween the dot position
    if (dotRef.current) {
      gsap.to(dotRef.current, {
        left: `calc(${value}% - 4px)`,
        duration: 0.8, ease: "power2.out",
      });
    }

    // Count the number
    if (numRef.current) {
      const obj = { v: prev };
      gsap.to(obj, {
        v: value, duration: 0.7, ease: "power2.out",
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = String(Math.round(obj.v));
        },
      });

      // Flash color
      const color = value > 60 ? "var(--bull)" : value < 40 ? "var(--bear)" : "var(--text-2)";
      gsap.fromTo(numRef.current,
        { opacity: 0.5 },
        { opacity: 1, color, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [value]);

  const labelColor = value > 60 ? "var(--bull)" : value < 40 ? "var(--bear)" : "var(--text-2)";
  const label      = value > 75 ? "Extreme Greed" : value > 60 ? "Greed" : value < 25 ? "Extreme Fear" : value < 40 ? "Fear" : "Neutral";

  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span className="section-label">FEAR &amp; GREED</span>
        <span style={{
          fontFamily: "var(--font-data)", fontSize: 9,
          color: labelColor,
          background: value > 60 ? "var(--bull-bg)" : value < 40 ? "var(--bear-bg)" : "transparent",
          padding: "1px 6px", borderRadius: 3,
          transition: "color 0.4s, background 0.4s",
        }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          ref={numRef}
          style={{
            fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
            color: labelColor, transition: "color 0.4s", minWidth: 34, display: "inline-block",
          }}
        >
          {value}
        </span>
        {/* Gradient track + dot */}
        <div style={{ flex: 1, position: "relative", height: 4 }}>
          <div style={{
            height: 4, borderRadius: 2, overflow: "visible",
            background: "linear-gradient(to right, #F87171, #EAB308, #34D399)",
          }} />
          <div
            ref={dotRef}
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--text-1)",
              border: "1.5px solid var(--bg-surface)",
              boxShadow: `0 0 6px ${labelColor}80`,
              position: "absolute",
              top: -2,
              left: `calc(${value}% - 4px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RightPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const portRef  = useRef<HTMLSpanElement>(null);
  const portPrev = useRef(0);

  const { formatPrice, liveMarket, livePrices } = useApp();
  const btc = livePrices["BTC"];

  useEffect(() => {
    gsap.from(panelRef.current, { x: 20, opacity: 0, duration: 0.6, ease: "expo.out", delay: 0.6 });
  }, []);

  // Live portfolio value (scales with BTC price)
  const btcPrice     = btc?.price ?? 67432.5;
  const livePortfolio = btcPrice * (portfolio.totalValue / 67432.5);

  // Animate portfolio value on every BTC tick
  useEffect(() => {
    if (!portRef.current) return;
    const prev = portPrev.current || livePortfolio;
    portPrev.current = livePortfolio;
    if (Math.abs(livePortfolio - prev) < 0.01) return;

    const obj = { v: prev };
    gsap.to(obj, {
      v: livePortfolio, duration: 0.7, ease: "power2.out",
      onUpdate: () => {
        if (portRef.current) portRef.current.textContent = formatPrice(obj.v);
      },
    });

    const isUp = livePortfolio > prev;
    gsap.fromTo(portRef.current,
      { color: isUp ? "#34D399" : "#F87171" },
      { color: "var(--text-1)", duration: 1, ease: "power2.out" }
    );
  }, [livePortfolio]);

  // Donut
  const size = 120, cx = 60, cy = 60, r = 42;
  const circumference = 2 * Math.PI * r;
  let accumulated = 0;
  const segments = portfolio.holdings.map(h => {
    const dashArray  = (h.allocation / 100) * circumference;
    const dashOffset = circumference - accumulated * circumference / 100;
    accumulated += h.allocation;
    return { ...h, dashArray, dashOffset };
  });

  const dominanceColor = liveMarket.btcDominance > 55
    ? "var(--accent)"
    : liveMarket.btcDominance < 45
    ? "var(--bear)"
    : "var(--accent)";

  return (
    <div ref={panelRef} className="right-panel" style={{
      width: 280, background: "var(--bg-surface)", borderLeft: "1px solid var(--border)",
      padding: "20px 16px", overflowY: "auto", flexShrink: 0,
      transition: "background-color 0.3s ease",
    }}>

      {/* ── Market Stats ── */}
      <span className="section-label" style={{ display: "block", marginBottom: 2 }}>MARKET STATS</span>

      {/* Market Cap */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span className="section-label">MARKET CAP</span>
          <span style={{ display: "flex", alignItems: "center", gap: 2, fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bull)" }}>
            <TrendingUp size={9} /> Live
          </span>
        </div>
        <AnimatedNumber value={liveMarket.marketCap} suffix="T" decimals={2} />
        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>
          +${(liveMarket.marketCap * 0.037).toFixed(1)}B today
        </div>
      </div>

      {/* 24H Volume */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span className="section-label">24H VOLUME</span>
          <span style={{ display: "flex", alignItems: "center", gap: 2, fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bull)" }}>
            <TrendingUp size={9} /> Live
          </span>
        </div>
        <AnimatedNumber value={liveMarket.volume24h} suffix="B" decimals={1} />
        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>
          Across all pairs
        </div>
      </div>

      {/* Circulating */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ marginBottom: 4 }}>
          <span className="section-label">CIRCULATING</span>
        </div>
        <AnimatedNumber value={19.67} suffix="M" decimals={2} />
        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>
          of 21M max supply
        </div>
      </div>

      {/* All Time High */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ marginBottom: 4 }}>
          <span className="section-label">ALL TIME HIGH</span>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-1)", fontWeight: 600 }}>
          {formatPrice(73750)}
        </span>
        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>
          Mar 14, 2024
        </div>
      </div>

      {/* ── BTC Dominance (GSAP bar) ── */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span className="section-label">BTC DOMINANCE</span>
          <AnimatedNumber
            value={liveMarket.btcDominance}
            suffix="%"
            decimals={1}
            fontSize={11}
          />
        </div>
        <LiveBar pct={liveMarket.btcDominance} color={dominanceColor} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>BTC</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>ALTs</span>
        </div>
      </div>

      {/* ── Fear & Greed (GSAP gauge) ── */}
      <FearGreedGauge value={liveMarket.fearGreed} />

      {/* ── Portfolio Snapshot ── */}
      <div style={{ marginTop: 16 }}>
        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>YOUR PORTFOLIO</span>

        <div style={{ marginBottom: 4 }}>
          <span
            ref={portRef}
            style={{
              fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600,
              color: "var(--text-1)", display: "inline-block",
            }}
          >
            {formatPrice(livePortfolio)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <TrendingUp size={11} style={{ color: "var(--bull)" }} />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--bull)" }}>
            +{formatPrice(portfolio.totalGain)} (+{portfolio.totalGainPct}%)
          </span>
        </div>

        {/* Donut */}
        <div style={{ display: "flex", justifyContent: "center", margin: "14px 0 10px" }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-raised)" strokeWidth="14" />
            {segments.map((seg, i) => (
              <circle
                key={i} className="donut-ring" cx={cx} cy={cy} r={r}
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

        {/* Holdings breakdown */}
        {portfolio.holdings.map((h, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0",
            borderBottom: i < portfolio.holdings.length - 1 ? "1px solid rgba(31,31,46,0.35)" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: h.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)" }}>{h.symbol}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>{h.allocation}%</span>
              <span style={{
                fontFamily: "var(--font-data)", fontSize: 10,
                color: h.gainPct >= 0 ? "var(--bull)" : "var(--bear)",
              }}>
                {h.gainPct >= 0 ? "+" : ""}{h.gainPct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
