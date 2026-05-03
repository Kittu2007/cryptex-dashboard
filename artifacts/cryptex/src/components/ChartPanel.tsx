import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import {
  createChart, ColorType,
  CandlestickSeries, HistogramSeries, LineSeries, AreaSeries, BarSeries,
} from "lightweight-charts";
import { BarChart2, TrendingUp, AlignLeft, AreaChart, Activity } from "lucide-react";
import {
  generateCandles, computeMA, coinTabs, timeRanges,
  COIN_BASE_PRICES, COIN_META,
} from "../mockData";
import { useApp } from "../context/AppContext";

interface ChartPanelProps {
  livePrice: number;
  priceChange: number;
}

type ChartType = "Candlestick" | "Line" | "Bar" | "Area";

const CHART_BUTTONS: { type: ChartType; icon: React.ElementType; label: string }[] = [
  { type: "Candlestick", icon: BarChart2,  label: "Candle" },
  { type: "Line",        icon: TrendingUp, label: "Line"   },
  { type: "Area",        icon: AreaChart,  label: "Area"   },
  { type: "Bar",         icon: AlignLeft,  label: "Bar"    },
];

export default function ChartPanel({ livePrice, priceChange }: ChartPanelProps) {
  const chartRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstRef = useRef<ReturnType<typeof createChart> | null>(null);

  const [activeRange,     setActiveRange]     = useState("1D");
  const [activeChartType, setActiveChartType] = useState<ChartType>("Candlestick");
  const [maValues,        setMaValues]        = useState({ ma7: 0, ma25: 0, ma99: 0 });

  const { settings, formatPrice, livePrices, activePair, setActivePair } = useApp();

  // Coin price + change come directly from shared live state
  const coinLive   = livePrices[activePair];
  const coinPrice  = coinLive?.price     ?? COIN_BASE_PRICES[activePair] ?? 60000;
  const coinChange = coinLive?.change24h ?? 0;

  // Sync chart type when Settings default changes
  useEffect(() => {
    setActiveChartType(settings.chartType as ChartType);
  }, [settings.chartType]);

  // Build / rebuild the chart
  const buildChart = useCallback(() => {
    if (!chartRef.current) return;

    // Destroy previous instance
    if (chartInstRef.current) {
      try { chartInstRef.current.remove(); } catch { /* already removed */ }
      chartInstRef.current = null;
    }
    chartRef.current.innerHTML = "";

    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    const h = chartRef.current.clientHeight || 220;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: h,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? "#0A0A0E" : "#F8F8FC" },
        textColor:  isDark ? "#4A4860" : "#A09CB8",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: isDark ? "#111118" : "#EBEBF5" },
        horzLines: { color: isDark ? "#111118" : "#EBEBF5" },
      },
      crosshair: {
        vertLine: { color: "#3A3860", labelBackgroundColor: isDark ? "#1A1A28" : "#EEEEF8" },
        horzLine: { color: "#3A3860", labelBackgroundColor: isDark ? "#1A1A28" : "#EEEEF8" },
      },
      rightPriceScale: { borderColor: isDark ? "#1F1F2E" : "#E0DFF0" },
      timeScale: {
        borderColor: isDark ? "#1F1F2E" : "#E0DFF0",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });
    chartInstRef.current = chart;

    const candles = generateCandles(activePair, activeRange);

    // Compute MAs and update display
    const ma7  = computeMA(candles, 7);
    const ma25 = computeMA(candles, 25);
    const ma99 = computeMA(candles, 99);
    setMaValues({ ma7, ma25, ma99 });

    // Add price series based on chart type
    if (activeChartType === "Candlestick") {
      const s = chart.addSeries(CandlestickSeries, {
        upColor: "#34D399", downColor: "#F87171",
        borderUpColor: "#34D399", borderDownColor: "#F87171",
        wickUpColor: "#34D399", wickDownColor: "#F87171",
      });
      s.setData(candles.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));
    } else if (activeChartType === "Bar") {
      const s = chart.addSeries(BarSeries, { upColor: "#34D399", downColor: "#F87171" });
      s.setData(candles.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));
    } else if (activeChartType === "Line") {
      const s = chart.addSeries(LineSeries, { color: "#A78BFA", lineWidth: 2 });
      s.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
    } else if (activeChartType === "Area") {
      const s = chart.addSeries(AreaSeries, {
        lineColor: "#A78BFA", lineWidth: 2,
        topColor: "rgba(167,139,250,0.25)", bottomColor: "rgba(167,139,250,0.01)",
      });
      s.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
    }

    // Volume histogram
    const vol = chart.addSeries(HistogramSeries, {
      color: "rgba(52,211,153,0.3)",
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    vol.setData(candles.map(c => ({
      time: c.time as any, value: c.value,
      color: c.close >= c.open ? "rgba(52,211,153,0.28)" : "rgba(248,113,113,0.28)",
    })));

    chart.timeScale().fitContent();

    // Responsive width
    const ro = new ResizeObserver(() => {
      if (chartRef.current && chartInstRef.current) {
        chartInstRef.current.applyOptions({ width: chartRef.current.clientWidth });
      }
    });
    chartRef.current && ro.observe(chartRef.current);

    return () => { ro.disconnect(); };
  }, [activePair, activeRange, activeChartType, settings.theme]);

  useEffect(() => {
    const cleanup = buildChart();
    return () => {
      cleanup?.();
      if (chartInstRef.current) {
        try { chartInstRef.current.remove(); } catch { /* */ }
        chartInstRef.current = null;
      }
    };
  }, [buildChart]);

  // Animate coin switch — flash price
  const priceEl = useRef<HTMLSpanElement>(null);
  const prevCoin = useRef(activePair);
  useEffect(() => {
    if (prevCoin.current !== activePair && priceEl.current) {
      prevCoin.current = activePair;
      gsap.fromTo(priceEl.current,
        { opacity: 0.3, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [activePair, coinPrice]);

  const isUp   = coinChange >= 0;
  const meta   = COIN_META[activePair] ?? { name: activePair };
  const maColors = ["#EAB308", "#6B7280", "#60A5FA"];
  const fmtMA = (v: number) => v > 0
    ? v < 1 ? v.toFixed(4) : v.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : "—";

  return (
    <div ref={containerRef} style={{
      display: "flex", flexDirection: "column",
      flex: 1, minWidth: 0, height: "100%", overflow: "hidden",
    }}>
      {/* ── Top control bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px 0",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        {/* Coin tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {coinTabs.map(coin => {
            const lp   = livePrices[coin];
            const p    = lp?.price ?? COIN_BASE_PRICES[coin] ?? 0;
            const chg  = lp?.change24h ?? 0;
            const active = activePair === coin;
            return (
              <button key={coin} onClick={() => setActivePair(coin)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0 14px 10px",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1,
                textAlign: "left",
              }}>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600,
                  color: active ? "var(--text-1)" : "var(--text-2)",
                  marginBottom: 1,
                }}>{coin}</div>
                <div style={{
                  fontFamily: "var(--font-data)", fontSize: 9,
                  color: chg >= 0 ? "var(--bull)" : "var(--bear)",
                  opacity: active ? 1 : 0.6,
                }}>
                  {chg >= 0 ? "+" : ""}{chg.toFixed(1)}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Right controls: time ranges + chart type */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 10 }}>
          {/* Time ranges */}
          <div style={{
            display: "flex", gap: 1,
            background: "var(--bg-raised)", borderRadius: 5, padding: 2,
          }}>
            {timeRanges.map(r => (
              <button key={r} onClick={() => setActiveRange(r)} style={{
                background: activeRange === r ? "var(--bg-surface)" : "none",
                border: activeRange === r ? "1px solid var(--border-2)" : "1px solid transparent",
                borderRadius: 4, cursor: "pointer",
                fontFamily: "var(--font-data)", fontSize: 10,
                color: activeRange === r ? "var(--accent)" : "var(--text-3)",
                padding: "3px 9px", transition: "all 0.12s",
                fontWeight: activeRange === r ? 600 : 400,
              }}>{r}</button>
            ))}
          </div>

          <div style={{ width: 1, height: 18, background: "var(--border)" }} />

          {/* Chart type */}
          <div style={{ display: "flex", gap: 1, background: "var(--bg-raised)", borderRadius: 5, padding: 2 }}>
            {CHART_BUTTONS.map(({ type, icon: Icon, label }) => (
              <button key={type} onClick={() => setActiveChartType(type)} title={label} style={{
                width: 28, height: 26,
                background: activeChartType === type ? "var(--bg-surface)" : "none",
                border: activeChartType === type ? "1px solid var(--border-2)" : "1px solid transparent",
                borderRadius: 4, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: activeChartType === type ? "var(--accent)" : "var(--text-3)",
                transition: "all 0.12s",
              }}><Icon size={12} /></button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Price display ── */}
      <div style={{ padding: "8px 20px 6px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span ref={priceEl} style={{
            fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700,
            color: "var(--text-1)", lineHeight: 1,
          }}>
            {formatPrice(coinPrice)}
          </span>
          <span style={{
            fontFamily: "var(--font-data)", fontSize: 12,
            color: isUp ? "var(--bull)" : "var(--bear)",
          }}>
            {isUp ? "+" : "−"}{formatPrice(Math.abs(coinChange * coinPrice * 0.01))}
          </span>
          <span style={{
            fontFamily: "var(--font-data)", fontSize: 11,
            color: isUp ? "var(--bull)" : "var(--bear)",
            background: isUp ? "var(--bull-bg)" : "var(--bear-bg)",
            padding: "1px 6px", borderRadius: 3,
          }}>
            {isUp ? "+" : ""}{coinChange.toFixed(2)}%
          </span>
          <span style={{
            fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)",
            marginLeft: 4,
          }}>{meta.name} · {activeRange}</span>
        </div>

        {/* MA values computed from chart data */}
        <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
          {[
            { label: "MA(7)",  val: maValues.ma7,  color: maColors[0] },
            { label: "MA(25)", val: maValues.ma25, color: maColors[1] },
            { label: "MA(99)", val: maValues.ma99, color: maColors[2] },
          ].map(({ label, val, color }) => (
            <span key={label} style={{ fontFamily: "var(--font-data)", fontSize: 9, color }}>
              {label} {fmtMA(val)}
            </span>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div ref={chartRef} style={{
        flex: 1, minHeight: 0,
        background: "var(--chart-bg)",
        overflow: "hidden",
      }} />

      {/* ── Indicator strip ── */}
      <div style={{
        display: "flex", gap: 20, flexWrap: "wrap",
        padding: "7px 20px",
        borderTop: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        {[
          { label: "RSI(14)",    value: "62.4",      color: "var(--accent)" },
          { label: "MACD",       value: "+124.8",    color: "var(--bull)" },
          { label: "BBands",     value: fmtMA(maValues.ma25 * 1.02), color: "var(--text-1)" },
          { label: "ATR(14)",    value: (coinPrice * 0.018).toFixed(coinPrice < 10 ? 4 : 0), color: "var(--text-1)" },
          { label: "Fear/Greed", value: "72 Greed",  color: "#EAB308" },
          { label: "Vol",        value: activeRange === "1D" ? "38.2B" : activeRange === "1W" ? "267B" : "12.4B", color: "var(--text-2)" },
        ].map((ind, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: 8, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)"
            }}>{ind.label}</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: ind.color }}>{ind.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
