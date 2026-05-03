import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";

gsap.registerPlugin(ScrollTrigger);

// ── Coin position constants (fixed unit quantities at seed prices) ─────────────
// Seed prices = initial mock prices; units = seeded value / seed price
const SEED = { BTC: 67432.5, ETH: 3891.20, SOL: 182.40 };
const UNITS = { BTC: 20554 / SEED.BTC, ETH: 12846 / SEED.ETH, SOL: 5995 / SEED.SOL };
const COST  = { BTC: 20554 / 1.664, ETH: 12846 / 1.469, SOL: 5995 / 0.882 };
const OTHER_VAL  = 3425;
const OTHER_COST = OTHER_VAL / 1.103;

// Four vivid, clearly distinguishable colors (no grey/black)
const HOLD_COLORS = {
  BTC:   "#F59E0B",   // amber/gold
  ETH:   "#60A5FA",   // electric blue
  SOL:   "#22C55E",   // emerald
  Other: "#3B82F6",   // violet/purple
};

// ── AnimatedNumber ─────────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 2, fontSize = 18 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; fontSize?: number;
}) {
  const elRef   = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (!elRef.current || Math.abs(value - prev) < 0.0001) return;
    const isUp = value >= prev;

    // Flash the span's own color then roll back to text-1
    gsap.fromTo(elRef.current,
      { color: isUp ? "#22C55E" : "#EF4444" },
      { color: "var(--text-1)", duration: 0.9, ease: "power2.out" }
    );
    // Count up / down to new value
    const obj = { v: prev };
    gsap.to(obj, {
      v: value, duration: 0.65, ease: "power2.out",
      onUpdate: () => {
        if (elRef.current)
          elRef.current.textContent = prefix + obj.v.toFixed(decimals) + suffix;
      },
    });
  }, [value]);

  return (
    <span ref={elRef} style={{
      fontFamily: "var(--font-display)", fontSize, fontWeight: 600,
      color: "var(--text-1)", display: "inline-block",
    }}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}

// ── LiveBar ────────────────────────────────────────────────────────────────────
function LiveBar({ pct, color = "var(--accent)" }: { pct: number; color?: string }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const initPct = useRef(pct);

  useEffect(() => {
    if (!fillRef.current) return;
    gsap.to(fillRef.current, { width: `${Math.min(100, Math.max(0, pct))}%`, duration: 0.8, ease: "power2.out" });
  }, [pct]);

  return (
    <div style={{ height: 3, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
      <div ref={fillRef} style={{ height: "100%", width: `${Math.min(100, Math.max(0, initPct.current))}%`, background: color, borderRadius: 2 }} />
    </div>
  );
}

// ── FearGreedGauge ─────────────────────────────────────────────────────────────
function FearGreedGauge({ value }: { value: number }) {
  const dotRef  = useRef<HTMLDivElement>(null);
  const numRef  = useRef<HTMLSpanElement>(null);
  const prevVal = useRef(value);

  useEffect(() => {
    const prev = prevVal.current;
    prevVal.current = value;
    if (Math.abs(value - prev) < 0.5) return;
    if (dotRef.current)
      gsap.to(dotRef.current, { left: `calc(${value}% - 4px)`, duration: 0.8, ease: "power2.out" });
    if (numRef.current) {
      const obj = { v: prev };
      gsap.to(obj, {
        v: value, duration: 0.7, ease: "power2.out",
        onUpdate: () => { if (numRef.current) numRef.current.textContent = String(Math.round(obj.v)); },
      });
      const c = value > 60 ? "var(--bull)" : value < 40 ? "var(--bear)" : "var(--text-2)";
      gsap.fromTo(numRef.current, { opacity: 0.5 }, { opacity: 1, color: c, duration: 0.5 });
    }
  }, [value]);

  const labelColor = value > 60 ? "var(--bull)" : value < 40 ? "var(--bear)" : "var(--text-2)";
  const label = value > 75 ? "Extreme Greed" : value > 60 ? "Greed" : value < 25 ? "Extreme Fear" : value < 40 ? "Fear" : "Neutral";

  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span className="section-label">FEAR &amp; GREED</span>
        <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: labelColor, background: value > 60 ? "var(--bull-bg)" : value < 40 ? "var(--bear-bg)" : "transparent", padding: "1px 6px", borderRadius: 3, transition: "color 0.4s, background 0.4s" }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span ref={numRef} style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: labelColor, transition: "color 0.4s", minWidth: 34, display: "inline-block" }}>
          {value}
        </span>
        <div style={{ flex: 1, position: "relative", height: 4 }}>
          <div style={{ height: 4, borderRadius: 2, background: "linear-gradient(to right, #EF4444, #EAB308, #22C55E)" }} />
          <div ref={dotRef} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-1)", border: "1.5px solid var(--bg-surface)", boxShadow: `0 0 6px ${labelColor}80`, position: "absolute", top: -2, left: `calc(${value}% - 4px)` }} />
        </div>
      </div>
    </div>
  );
}

// ── HoldingRow — animated gainPct per tick ─────────────────────────────────────
function HoldingRow({ symbol, color, allocation, gainPct }: {
  symbol: string; color: string; allocation: number; gainPct: number;
}) {
  const gainRef = useRef<HTMLSpanElement>(null);
  const allocRef = useRef<HTMLSpanElement>(null);
  const prevGain  = useRef(gainPct);
  const prevAlloc = useRef(allocation);

  useEffect(() => {
    const prev = prevGain.current;
    prevGain.current = gainPct;
    if (!gainRef.current || Math.abs(gainPct - prev) < 0.01) return;
    const obj = { v: prev };
    gsap.to(obj, {
      v: gainPct, duration: 0.6, ease: "power2.out",
      onUpdate: () => {
        if (!gainRef.current) return;
        const v = obj.v;
        gainRef.current.textContent = `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
        gainRef.current.style.color = v >= 0 ? "var(--bull)" : "var(--bear)";
      },
    });
  }, [gainPct]);

  useEffect(() => {
    const prev = prevAlloc.current;
    prevAlloc.current = allocation;
    if (!allocRef.current || Math.abs(allocation - prev) < 0.05) return;
    const obj = { v: prev };
    gsap.to(obj, {
      v: allocation, duration: 0.7, ease: "power2.out",
      onUpdate: () => { if (allocRef.current) allocRef.current.textContent = `${obj.v.toFixed(1)}%`; },
    });
  }, [allocation]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(31,31,46,0.4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}60` }} />
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{symbol}</span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span ref={allocRef} style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-3)", minWidth: 36, textAlign: "right" }}>
          {allocation.toFixed(1)}%
        </span>
        <span ref={gainRef} style={{ fontFamily: "var(--font-data)", fontSize: 11, color: gainPct >= 0 ? "var(--bull)" : "var(--bear)", minWidth: 52, textAlign: "right" }}>
          {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RightPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const portRef  = useRef<HTMLSpanElement>(null);
  const gainRef  = useRef<HTMLSpanElement>(null);
  const portPrev = useRef(0);
  const gainPrev = useRef(0);

  const { formatPrice, liveMarket, livePrices, currencySymbol } = useApp();

  useEffect(() => {
    gsap.from(panelRef.current, { x: 20, opacity: 0, duration: 0.6, ease: "expo.out", delay: 0.6 });
  }, []);

  // ── Compute live holdings from live prices ───────────────────────────────────
  const btcPrice = livePrices["BTC"]?.price ?? SEED.BTC;
  const ethPrice = livePrices["ETH"]?.price ?? SEED.ETH;
  const solPrice = livePrices["SOL"]?.price ?? SEED.SOL;

  const btcVal   = UNITS.BTC * btcPrice;
  const ethVal   = UNITS.ETH * ethPrice;
  const solVal   = UNITS.SOL * solPrice;
  const totalVal = btcVal + ethVal + solVal + OTHER_VAL;

  const btcAlloc   = (btcVal   / totalVal) * 100;
  const ethAlloc   = (ethVal   / totalVal) * 100;
  const solAlloc   = (solVal   / totalVal) * 100;
  const otherAlloc = (OTHER_VAL / totalVal) * 100;

  const btcGainPct   = ((btcVal   - COST.BTC)  / COST.BTC)  * 100;
  const ethGainPct   = ((ethVal   - COST.ETH)  / COST.ETH)  * 100;
  const solGainPct   = ((solVal   - COST.SOL)  / COST.SOL)  * 100;
  const otherGainPct = ((OTHER_VAL - OTHER_COST) / OTHER_COST) * 100;

  const totalCost    = COST.BTC + COST.ETH + COST.SOL + OTHER_COST;
  const totalGain    = totalVal - totalCost;
  const totalGainPct = (totalGain / totalCost) * 100;

  // ── Animate portfolio total ──────────────────────────────────────────────────
  useEffect(() => {
    if (!portRef.current) return;
    const prev = portPrev.current || totalVal;
    portPrev.current = totalVal;
    if (Math.abs(totalVal - prev) < 0.01) return;
    const obj = { v: prev };
    gsap.to(obj, {
      v: totalVal, duration: 0.7, ease: "power2.out",
      onUpdate: () => { if (portRef.current) portRef.current.textContent = formatPrice(obj.v); },
    });
    gsap.fromTo(portRef.current,
      { color: totalVal > prev ? "#22C55E" : "#EF4444" },
      { color: "var(--text-1)", duration: 1, ease: "power2.out" }
    );
  }, [totalVal]);

  // ── Animate total gain ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!gainRef.current) return;
    const prev = gainPrev.current || totalGainPct;
    gainPrev.current = totalGainPct;
    if (Math.abs(totalGainPct - prev) < 0.001) return;
    const obj = { v: prev };
    gsap.to(obj, {
      v: totalGainPct, duration: 0.7, ease: "power2.out",
      onUpdate: () => {
        if (gainRef.current)
          gainRef.current.textContent = `+${formatPrice(totalGain)} (+${obj.v.toFixed(1)}%)`;
      },
    });
  }, [totalGainPct]);

  // ── Donut segments (reactive to live allocations) ────────────────────────────
  const size = 130, cx = 65, cy = 65, r = 46;
  const circumference = 2 * Math.PI * r;
  const SEG_GAP = 3; // px gap between segments
  const liveHoldings = [
    { symbol: "BTC",   allocation: btcAlloc,   gainPct: btcGainPct,   color: HOLD_COLORS.BTC },
    { symbol: "ETH",   allocation: ethAlloc,   gainPct: ethGainPct,   color: HOLD_COLORS.ETH },
    { symbol: "SOL",   allocation: solAlloc,   gainPct: solGainPct,   color: HOLD_COLORS.SOL },
    { symbol: "Other", allocation: otherAlloc, gainPct: otherGainPct, color: HOLD_COLORS.Other },
  ];
  let accumulated = 0;
  const segments = liveHoldings.map(h => {
    // dashLen shrunk by gap so segments have visible separation
    const dashLen    = Math.max(0, (h.allocation / 100) * circumference - SEG_GAP);
    // positive offset pushes the dash start clockwise to the accumulated position
    const dashOffset = circumference - (accumulated / 100) * circumference;
    accumulated += h.allocation;
    return { ...h, dashLen, dashOffset };
  });

  const dominanceColor = liveMarket.btcDominance > 55 ? "var(--accent)" : liveMarket.btcDominance < 45 ? "var(--bear)" : "var(--accent)";

  return (
    <div ref={panelRef} className="right-panel" style={{
      width: "100%", background: "var(--bg-surface)",
      padding: "20px 16px", overflowY: "auto",
      transition: "background-color 0.3s ease",
    }}>

      {/* ── Market Stats header ── */}
      <span className="section-label" style={{ display: "block", marginBottom: 2 }}>MARKET STATS</span>

      {/* Market Cap */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span className="section-label">MARKET CAP</span>
          <span style={{ display: "flex", alignItems: "center", gap: 2, fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bull)" }}>
            <TrendingUp size={9} /> Live
          </span>
        </div>
        <AnimatedNumber value={liveMarket.marketCap} prefix={currencySymbol} suffix="T" decimals={2} />
        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>
          +{currencySymbol}{(liveMarket.marketCap * 0.037).toFixed(1)}B today
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
        <AnimatedNumber value={liveMarket.volume24h} prefix={currencySymbol} suffix="B" decimals={1} />
        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>Across all pairs</div>
      </div>

      {/* Circulating */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ marginBottom: 4 }}><span className="section-label">CIRCULATING</span></div>
        <AnimatedNumber value={19.67} suffix="M" decimals={2} />
        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>of 21M max supply</div>
      </div>

      {/* All Time High */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ marginBottom: 4 }}><span className="section-label">ALL TIME HIGH</span></div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-1)", fontWeight: 600 }}>
          {formatPrice(73750)}
        </span>
        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginTop: 2 }}>Mar 14, 2024</div>
      </div>

      {/* BTC Dominance */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span className="section-label">BTC DOMINANCE</span>
          <AnimatedNumber value={liveMarket.btcDominance} suffix="%" decimals={1} fontSize={11} />
        </div>
        <LiveBar pct={liveMarket.btcDominance} color={dominanceColor} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>BTC</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>ALTs</span>
        </div>
      </div>

      {/* Fear & Greed */}
      <FearGreedGauge value={liveMarket.fearGreed} />

      {/* ── Portfolio Snapshot ── */}
      <div style={{ marginTop: 16 }}>
        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>YOUR PORTFOLIO</span>

        <div style={{ marginBottom: 3 }}>
          <span ref={portRef} style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", display: "inline-block" }}>
            {formatPrice(totalVal)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <TrendingUp size={11} style={{ color: "var(--bull)" }} />
          <span ref={gainRef} style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--bull)" }}>
            +{formatPrice(totalGain)} (+{totalGainPct.toFixed(1)}%)
          </span>
        </div>

        {/* Donut — reactive to live allocations */}
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 8px" }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Track ring — semi-transparent so it's visible in any theme */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="13" />
            {/* Segments — rotated -90° so first segment starts at 12 o'clock */}
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="13"
                strokeLinecap="butt"
                strokeDasharray={`${seg.dashLen} ${circumference - seg.dashLen}`}
                strokeDashoffset={seg.dashOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: "stroke-dasharray 0.7s ease, stroke-dashoffset 0.7s ease" }}
              />
            ))}
            {/* Center labels */}
            <text x={cx} y={cy - 6} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="var(--font-ui)" letterSpacing="0.08em">PORTFOLIO</text>
            <text x={cx} y={cy + 9} textAnchor="middle" fill="var(--text-1)" fontSize="11" fontFamily="var(--font-display)" fontWeight="700">
              {formatPrice(totalVal, true)}
            </text>
          </svg>
        </div>

        {/* Color legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {liveHoldings.map(h => (
            <div key={h.symbol} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: h.color, boxShadow: `0 0 5px ${h.color}70` }} />
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{h.symbol}</span>
            </div>
          ))}
        </div>

        {/* Holdings rows — each animates independently */}
        {liveHoldings.map(h => (
          <HoldingRow
            key={h.symbol}
            symbol={h.symbol}
            color={h.color}
            allocation={h.allocation}
            gainPct={h.gainPct}
          />
        ))}
      </div>
    </div>
  );
}
