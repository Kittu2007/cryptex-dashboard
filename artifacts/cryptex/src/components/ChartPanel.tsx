import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  createChart, ColorType,
  CandlestickSeries, HistogramSeries, LineSeries, AreaSeries, BarSeries,
} from "lightweight-charts";
import { BarChart2, TrendingUp, AlignLeft, AreaChart, Activity, X, ChevronDown } from "lucide-react";
import {
  generateCandles, computeMA, computeIndicators, coinTabs, timeRanges,
  COIN_BASE_PRICES, COIN_META, TechIndicators,
  smaSeries, emaSeries, bbSeries, vwapSeries, rsiSeries, macdSeries, stochSeries,
} from "../mockData";
import { useApp } from "../context/AppContext";

interface ChartPanelProps { livePrice: number; priceChange: number; }
type ChartType = "Candlestick" | "Line" | "Bar" | "Area";

const CHART_BUTTONS: { type: ChartType; icon: React.ElementType; label: string }[] = [
  { type: "Candlestick", icon: BarChart2,  label: "Candle" },
  { type: "Line",        icon: TrendingUp, label: "Line"   },
  { type: "Area",        icon: AreaChart,  label: "Area"   },
  { type: "Bar",         icon: AlignLeft,  label: "Bar"    },
];

const INDICATORS = [
  { id: "sma7",   label: "SMA 7",           cat: "Overlay"    as const, color: "#EAB308" },
  { id: "sma20",  label: "SMA 20",          cat: "Overlay"    as const, color: "#94A3B8" },
  { id: "sma50",  label: "SMA 50",          cat: "Overlay"    as const, color: "#60A5FA" },
  { id: "sma200", label: "SMA 200",         cat: "Overlay"    as const, color: "#F87171" },
  { id: "ema9",   label: "EMA 9",           cat: "Overlay"    as const, color: "#34D399" },
  { id: "ema21",  label: "EMA 21",          cat: "Overlay"    as const, color: "#A78BFA" },
  { id: "bb",     label: "Bollinger Bands", cat: "Overlay"    as const, color: "#818CF8" },
  { id: "vwap",   label: "VWAP",            cat: "Overlay"    as const, color: "#F59E0B" },
  { id: "rsi",    label: "RSI (14)",        cat: "Oscillator" as const, color: "#A78BFA" },
  { id: "macd",   label: "MACD",            cat: "Oscillator" as const, color: "#34D399" },
  { id: "stoch",  label: "Stochastic",      cat: "Oscillator" as const, color: "#60A5FA" },
];

const IND_COLOR: Record<string, string> = Object.fromEntries(INDICATORS.map(i => [i.id, i.color]));

export default function ChartPanel({ livePrice: _lp, priceChange: _pc }: ChartPanelProps) {
  // ── Chart DOM refs ────────────────────────────────────────────────────────
  const chartRef  = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInst = useRef<ReturnType<typeof createChart> | null>(null);
  const rsiRef    = useRef<HTMLDivElement>(null);
  const macdRef   = useRef<HTMLDivElement>(null);
  const stochRef  = useRef<HTMLDivElement>(null);
  const rsiInst   = useRef<ReturnType<typeof createChart> | null>(null);
  const macdInst  = useRef<ReturnType<typeof createChart> | null>(null);
  const stochInst = useRef<ReturnType<typeof createChart> | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const priceEl   = useRef<HTMLSpanElement>(null);
  const prevCoin  = useRef("");

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeRange,      setActiveRange]      = useState("1D");
  const [activeChartType,  setActiveChartType]  = useState<ChartType>("Candlestick");
  const [maValues,         setMaValues]         = useState({ ma7: 0, ma25: 0, ma99: 0 });
  const [techInd,          setTechInd]          = useState<TechIndicators | null>(null);
  const [activeIndicators, setActiveIndicators] = useState(new Set(["sma20", "sma50"]));
  const [indicatorOpen,    setIndicatorOpen]    = useState(false);

  const { settings, formatPrice, livePrices, liveMarket, activePair, setActivePair } = useApp();

  const coinLive   = livePrices[activePair];
  const coinPrice  = coinLive?.price     ?? COIN_BASE_PRICES[activePair] ?? 60000;
  const coinChange = coinLive?.change24h ?? 0;
  const isUp  = coinChange >= 0;
  const meta  = COIN_META[activePair] ?? { name: activePair };
  const hasRSI   = activeIndicators.has("rsi");
  const hasMACD  = activeIndicators.has("macd");
  const hasStoch = activeIndicators.has("stoch");
  const indKey   = [...activeIndicators].sort().join(",");

  const fmtMA = (v: number) =>
    v > 0 ? (v < 1 ? v.toFixed(4) : v.toLocaleString("en-US", { maximumFractionDigits: 0 })) : "—";

  // ── Sync chart type from settings ─────────────────────────────────────────
  useEffect(() => {
    setActiveChartType(settings.chartType as ChartType);
  }, [settings.chartType]);

  // ── Close indicator picker on outside click ───────────────────────────────
  useEffect(() => {
    if (!indicatorOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setIndicatorOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [indicatorOpen]);

  // ── Animate price on coin switch ──────────────────────────────────────────
  useEffect(() => {
    if (prevCoin.current !== activePair && priceEl.current) {
      prevCoin.current = activePair;
      gsap.fromTo(priceEl.current,
        { opacity: 0.3, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [activePair, coinPrice]);

  // ── Sub-chart factory ─────────────────────────────────────────────────────
  function makeSubChart(el: HTMLDivElement, isDark: boolean) {
    return createChart(el, {
      width:  el.clientWidth,
      height: el.clientHeight || 88,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? "#0A0A0E" : "#F8F8FC" },
        textColor:  isDark ? "#4A4860" : "#A09CB8",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
      },
      grid: {
        vertLines: { color: isDark ? "#0F0F18" : "#EBEBF5" },
        horzLines: { color: isDark ? "#0F0F18" : "#EBEBF5" },
      },
      crosshair: {
        vertLine: { color: "#3A3860", labelBackgroundColor: isDark ? "#1A1A28" : "#EEEEF8" },
        horzLine: { color: "#3A3860", labelBackgroundColor: isDark ? "#1A1A28" : "#EEEEF8" },
      },
      rightPriceScale: { borderColor: isDark ? "#1F1F2E" : "#E0DFF0", minimumWidth: 56 },
      timeScale: { visible: false },
      handleScroll: true,
      handleScale: true,
    });
  }

  // ── Build all charts ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing instances
    [chartInst, rsiInst, macdInst, stochInst].forEach(r => {
      if (r.current) { try { r.current.remove(); } catch { /* */ } r.current = null; }
    });
    chartRef.current.innerHTML = "";
    if (rsiRef.current)   rsiRef.current.innerHTML   = "";
    if (macdRef.current)  macdRef.current.innerHTML  = "";
    if (stochRef.current) stochRef.current.innerHTML = "";

    const isDark = document.documentElement.getAttribute("data-theme") !== "light";

    // ── Main chart ───────────────────────────────────────────────────────────
    const chart = createChart(chartRef.current, {
      width:  chartRef.current.clientWidth,
      height: chartRef.current.clientHeight || 220,
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
      timeScale: { borderColor: isDark ? "#1F1F2E" : "#E0DFF0", timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
    });
    chartInst.current = chart;

    const candles = generateCandles(activePair, activeRange);
    setMaValues({ ma7: computeMA(candles, 7), ma25: computeMA(candles, 25), ma99: computeMA(candles, 99) });
    setTechInd(computeIndicators(candles));

    // Price series
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
    } else {
      const s = chart.addSeries(AreaSeries, {
        lineColor: "#A78BFA", lineWidth: 2,
        topColor: "rgba(167,139,250,0.22)", bottomColor: "rgba(167,139,250,0.01)",
      });
      s.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
    }

    // Volume histogram
    const vol = chart.addSeries(HistogramSeries, { color: "rgba(52,211,153,0.3)", priceFormat: { type: "volume" }, priceScaleId: "vol" });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    vol.setData(candles.map(c => ({
      time: c.time as any, value: c.value,
      color: c.close >= c.open ? "rgba(52,211,153,0.28)" : "rgba(248,113,113,0.28)",
    })));

    // ── Overlay indicator series ─────────────────────────────────────────────
    const addLine = (data: { time: number; value: number }[], color: string, width: 1 | 2 = 1) => {
      const s = chart.addSeries(LineSeries, { color, lineWidth: width, lastValueVisible: false, priceLineVisible: false });
      s.setData(data.map(d => ({ time: d.time as any, value: d.value })));
    };

    if (activeIndicators.has("sma7"))   addLine(smaSeries(candles, 7),   IND_COLOR.sma7);
    if (activeIndicators.has("sma20"))  addLine(smaSeries(candles, 20),  IND_COLOR.sma20);
    if (activeIndicators.has("sma50"))  addLine(smaSeries(candles, 50),  IND_COLOR.sma50, 2);
    if (activeIndicators.has("sma200")) addLine(smaSeries(candles, 200), IND_COLOR.sma200, 2);
    if (activeIndicators.has("ema9"))   addLine(emaSeries(candles, 9),   IND_COLOR.ema9);
    if (activeIndicators.has("ema21"))  addLine(emaSeries(candles, 21),  IND_COLOR.ema21, 2);
    if (activeIndicators.has("vwap"))   addLine(vwapSeries(candles),     IND_COLOR.vwap, 2);

    if (activeIndicators.has("bb")) {
      const bb = bbSeries(candles);
      const bbColor = IND_COLOR.bb;
      addLine(bb.map(d => ({ time: d.time, value: d.upper })), bbColor);
      addLine(bb.map(d => ({ time: d.time, value: d.mid   })), bbColor + "88");
      addLine(bb.map(d => ({ time: d.time, value: d.lower })), bbColor);
    }

    chart.timeScale().fitContent();

    // ── Sub-chart helpers ────────────────────────────────────────────────────
    const subCharts: ReturnType<typeof createChart>[] = [];

    // RSI pane
    if (hasRSI && rsiRef.current) {
      const rc = makeSubChart(rsiRef.current, isDark);
      rsiInst.current = rc;
      subCharts.push(rc);

      const data = rsiSeries(candles);
      if (data.length > 0) {
        const rl = rc.addSeries(LineSeries, { color: "#A78BFA", lineWidth: 1, lastValueVisible: true, priceLineVisible: false });
        rl.setData(data.map(d => ({ time: d.time as any, value: d.value })));

        const ob = rc.addSeries(LineSeries, { color: "rgba(248,113,113,0.35)", lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
        const os = rc.addSeries(LineSeries, { color: "rgba(52,211,153,0.35)",  lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
        const ml = rc.addSeries(LineSeries, { color: "rgba(100,100,150,0.3)",  lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
        ob.setData(data.map(d => ({ time: d.time as any, value: 70 })));
        os.setData(data.map(d => ({ time: d.time as any, value: 30 })));
        ml.setData(data.map(d => ({ time: d.time as any, value: 50 })));
      }

      rc.priceScale("right").applyOptions({ autoScale: false, minimum: 0, maximum: 100 });
      rc.timeScale().fitContent();
    }

    // MACD pane
    if (hasMACD && macdRef.current) {
      const mc = makeSubChart(macdRef.current, isDark);
      macdInst.current = mc;
      subCharts.push(mc);

      const { line, signalLine, hist } = macdSeries(candles);
      if (hist.length > 0) {
        const h = mc.addSeries(HistogramSeries, { priceFormat: { type: "price", precision: 4, minMove: 0.0001 } });
        h.setData(hist.map(d => ({ time: d.time as any, value: d.value, color: d.color })));
      }
      if (line.length > 0) {
        const ml = mc.addSeries(LineSeries, { color: "#34D399", lineWidth: 1, lastValueVisible: true, priceLineVisible: false });
        ml.setData(line.map(d => ({ time: d.time as any, value: d.value })));
      }
      if (signalLine.length > 0) {
        const sl = mc.addSeries(LineSeries, { color: "#F87171", lineWidth: 1, lastValueVisible: true, priceLineVisible: false });
        sl.setData(signalLine.map(d => ({ time: d.time as any, value: d.value })));
      }
      mc.timeScale().fitContent();
    }

    // Stochastic pane
    if (hasStoch && stochRef.current) {
      const sc = makeSubChart(stochRef.current, isDark);
      stochInst.current = sc;
      subCharts.push(sc);

      const { k, d } = stochSeries(candles);
      if (k.length > 0) {
        const kl = sc.addSeries(LineSeries, { color: "#60A5FA", lineWidth: 1, lastValueVisible: true, priceLineVisible: false });
        kl.setData(k.map(p => ({ time: p.time as any, value: p.value })));
      }
      if (d.length > 0) {
        const dl = sc.addSeries(LineSeries, { color: "#F59E0B", lineWidth: 1, lastValueVisible: true, priceLineVisible: false });
        dl.setData(d.map(p => ({ time: p.time as any, value: p.value })));
      }
      sc.priceScale("right").applyOptions({ autoScale: false, minimum: 0, maximum: 100 });
      sc.timeScale().fitContent();
    }

    // ── Bidirectional time-scale sync ────────────────────────────────────────
    if (subCharts.length > 0) {
      let lock = false;
      const link = (src: ReturnType<typeof createChart>, targets: ReturnType<typeof createChart>[]) => {
        src.timeScale().subscribeVisibleLogicalRangeChange(range => {
          if (lock || !range) return;
          lock = true;
          targets.forEach(t => t.timeScale().setVisibleLogicalRange(range));
          lock = false;
        });
      };
      link(chart, subCharts);
      subCharts.forEach(sub => link(sub, [chart, ...subCharts.filter(c => c !== sub)]));
    }

    // ── Resize observer ──────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (chartRef.current && chartInst.current)
        chartInst.current.applyOptions({ width: chartRef.current.clientWidth });
      [
        [rsiRef, rsiInst], [macdRef, macdInst], [stochRef, stochInst],
      ].forEach(([ref, inst]) => {
        const el = (ref as typeof rsiRef).current;
        const ch = (inst as typeof rsiInst).current;
        if (el && ch) ch.applyOptions({ width: el.clientWidth });
      });
    });
    if (chartRef.current) ro.observe(chartRef.current);

    return () => {
      ro.disconnect();
      [chartInst, rsiInst, macdInst, stochInst].forEach(r => {
        if (r.current) { try { r.current.remove(); } catch { /* */ } r.current = null; }
      });
    };
  }, [activePair, activeRange, activeChartType, settings.theme, indKey]);

  // ── Toggle indicator helper ───────────────────────────────────────────────
  const toggleInd = (id: string) => {
    setActiveIndicators(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Indicator strip values ────────────────────────────────────────────────
  const fg      = liveMarket.fearGreed;
  const fgLabel = fg >= 75 ? "Extreme Greed" : fg >= 55 ? "Greed" : fg >= 45 ? "Neutral" : fg >= 25 ? "Fear" : "Extreme Fear";
  const fgColor = fg >= 55 ? "#EAB308" : fg >= 45 ? "var(--text-2)" : "var(--bear)";
  const rsiVal  = techInd?.rsi ?? 0;
  const rsiClr  = rsiVal >= 70 ? "var(--bear)" : rsiVal <= 30 ? "var(--bull)" : "var(--accent)";
  const macdVal = techInd?.macd ?? 0;
  const macdClr = macdVal >= 0 ? "var(--bull)" : "var(--bear)";
  const rawVol  = techInd?.volume24h ?? 0;
  const volB    = rawVol / 1_000_000;
  const volStr  = volB >= 1000 ? `${(volB/1000).toFixed(1)}T` : volB >= 1 ? `${volB.toFixed(1)}B` : `${(rawVol/1000).toFixed(0)}M`;

  const strip = [
    { label: "RSI(14)",    value: rsiVal.toFixed(1),                                      color: rsiClr },
    { label: "MACD",       value: `${macdVal >= 0 ? "+" : ""}${macdVal.toFixed(2)}`,      color: macdClr },
    { label: "BB Upper",   value: fmtMA(techInd?.bbUpper ?? 0),                           color: "var(--text-1)" },
    { label: "ATR(14)",    value: fmtMA(techInd?.atr ?? 0),                               color: "var(--text-1)" },
    { label: "Fear/Greed", value: `${fg} ${fgLabel}`,                                     color: fgColor },
    { label: "Vol",        value: volStr,                                                  color: "var(--text-2)" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{
      display: "flex", flexDirection: "column",
      flex: 1, minWidth: 0, overflow: "hidden",
    }}>
      {/* ── Controls toolbar ── */}
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
            const chg  = lp?.change24h ?? 0;
            const active = activePair === coin;
            return (
              <button key={coin} onClick={() => setActivePair(coin)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0 14px 10px",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1, textAlign: "left",
              }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, color: active ? "var(--text-1)" : "var(--text-2)", marginBottom: 1 }}>{coin}</div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: chg >= 0 ? "var(--bull)" : "var(--bear)", opacity: active ? 1 : 0.6 }}>
                  {chg >= 0 ? "+" : ""}{chg.toFixed(1)}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 10 }}>
          {/* Time ranges */}
          <div style={{ display: "flex", gap: 1, background: "var(--bg-raised)", borderRadius: 5, padding: 2 }}>
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

          <div style={{ width: 1, height: 18, background: "var(--border)" }} />

          {/* Indicators button + picker */}
          <div ref={pickerRef} style={{ position: "relative" }}>
            <button
              onClick={() => setIndicatorOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "3px 10px",
                background: indicatorOpen ? "var(--bg-surface)" : "var(--bg-raised)",
                border: `1px solid ${indicatorOpen ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 5, cursor: "pointer",
                fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600,
                color: indicatorOpen ? "var(--accent)" : "var(--text-2)",
                transition: "all 0.12s",
                height: 26,
              }}
            >
              <Activity size={11} />
              Indicators
              {activeIndicators.size > 0 && (
                <span style={{
                  background: "var(--accent)", color: "#fff",
                  borderRadius: "50%", width: 14, height: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 700, fontFamily: "var(--font-ui)",
                }}>{activeIndicators.size}</span>
              )}
              <ChevronDown size={9} style={{ transform: indicatorOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>

            {/* ── Indicator picker panel ── */}
            {indicatorOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 200,
                width: 340,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-2)",
                borderRadius: 10,
                boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
                    Select Indicators
                  </span>
                  <button onClick={() => setIndicatorOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0, display: "flex" }}>
                    <X size={13} />
                  </button>
                </div>

                {/* Two-column grid */}
                <div style={{ display: "flex" }}>
                  {(["Overlay", "Oscillator"] as const).map((cat, ci) => (
                    <div key={cat} style={{ flex: 1, borderRight: ci === 0 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ padding: "8px 12px 4px", fontFamily: "var(--font-ui)", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
                        {cat}
                      </div>
                      {INDICATORS.filter(ind => ind.cat === cat).map(ind => {
                        const on = activeIndicators.has(ind.id);
                        return (
                          <button
                            key={ind.id}
                            onClick={() => toggleInd(ind.id)}
                            style={{
                              display: "flex", alignItems: "center", gap: 8, width: "100%",
                              padding: "7px 12px",
                              background: on ? `${ind.color}14` : "none",
                              border: "none", cursor: "pointer", textAlign: "left",
                              transition: "background 0.1s",
                            }}
                          >
                            <div style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: on ? ind.color : "var(--border-2)",
                              flexShrink: 0, transition: "background 0.12s",
                              boxShadow: on ? `0 0 6px ${ind.color}80` : "none",
                            }} />
                            <span style={{
                              fontFamily: "var(--font-ui)", fontSize: 10,
                              color: on ? "var(--text-1)" : "var(--text-3)",
                              transition: "color 0.12s", flex: 1,
                            }}>{ind.label}</span>
                            {on && (
                              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Active chips footer */}
                {activeIndicators.size > 0 && (
                  <div style={{
                    padding: "8px 12px", borderTop: "1px solid var(--border)",
                    display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center",
                  }}>
                    {[...activeIndicators].map(id => {
                      const def = INDICATORS.find(d => d.id === id);
                      if (!def) return null;
                      return (
                        <div key={id} style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "2px 6px 2px 5px",
                          background: "var(--bg-raised)",
                          border: `1px solid ${def.color}50`,
                          borderRadius: 4,
                        }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: def.color }} />
                          <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{def.label}</span>
                          <button onClick={() => toggleInd(id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0, display: "flex", marginLeft: 1 }}>
                            <X size={9} />
                          </button>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setActiveIndicators(new Set())}
                      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--bear)", padding: "2px 4px", marginLeft: "auto" }}
                    >Clear all</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Price display ── */}
      <div style={{ padding: "8px 20px 6px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span ref={priceEl} style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>
            {formatPrice(coinPrice)}
          </span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: isUp ? "var(--bull)" : "var(--bear)" }}>
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
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)", marginLeft: 4 }}>
            {meta.name} · {activeRange}
          </span>
        </div>

        {/* MA strip + active overlay chips */}
        <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { label: "MA(7)",  val: maValues.ma7,  color: "#EAB308" },
            { label: "MA(25)", val: maValues.ma25, color: "#94A3B8" },
            { label: "MA(99)", val: maValues.ma99, color: "#60A5FA" },
          ].map(({ label, val, color }) => (
            <span key={label} style={{ fontFamily: "var(--font-data)", fontSize: 9, color }}>
              {label} {fmtMA(val)}
            </span>
          ))}
          {INDICATORS.filter(ind => ind.cat === "Overlay" && activeIndicators.has(ind.id)).map(ind => (
            <span key={ind.id} style={{
              fontFamily: "var(--font-data)", fontSize: 9,
              color: ind.color,
              background: `${ind.color}18`,
              padding: "1px 6px", borderRadius: 3,
              border: `1px solid ${ind.color}40`,
            }}>▸ {ind.label}</span>
          ))}
        </div>
      </div>

      {/* ── Main chart ── */}
      <div ref={chartRef} style={{ flex: 1, minHeight: 120, background: "var(--chart-bg)", overflow: "hidden" }} />

      {/* ── RSI pane ── */}
      {hasRSI && (
        <div style={{ flexShrink: 0, position: "relative", borderTop: "1px solid var(--border)" }}>
          <div style={{
            position: "absolute", top: 4, left: 10, zIndex: 10,
            fontFamily: "var(--font-data)", fontSize: 8, color: "#A78BFA",
            pointerEvents: "none", letterSpacing: "0.04em",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ opacity: 0.7 }}>RSI</span>
            <span style={{ color: "var(--text-3)" }}>(14)</span>
            <span style={{ color: "#A78BFA", fontWeight: 600 }}>{techInd?.rsi.toFixed(1) ?? "—"}</span>
          </div>
          <div ref={rsiRef} style={{ height: 88 }} />
        </div>
      )}

      {/* ── MACD pane ── */}
      {hasMACD && (
        <div style={{ flexShrink: 0, position: "relative", borderTop: "1px solid var(--border)" }}>
          <div style={{
            position: "absolute", top: 4, left: 10, zIndex: 10,
            fontFamily: "var(--font-data)", fontSize: 8, color: "#34D399",
            pointerEvents: "none", letterSpacing: "0.04em",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ opacity: 0.7 }}>MACD</span>
            <span style={{ color: "var(--text-3)" }}>(12,26,9)</span>
            <span style={{ color: "#34D399" }}>—</span>
            <span style={{ color: "#F87171" }}>—</span>
          </div>
          <div ref={macdRef} style={{ height: 88 }} />
        </div>
      )}

      {/* ── Stochastic pane ── */}
      {hasStoch && (
        <div style={{ flexShrink: 0, position: "relative", borderTop: "1px solid var(--border)" }}>
          <div style={{
            position: "absolute", top: 4, left: 10, zIndex: 10,
            fontFamily: "var(--font-data)", fontSize: 8, color: "#60A5FA",
            pointerEvents: "none", letterSpacing: "0.04em",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ opacity: 0.7 }}>STOCH</span>
            <span style={{ color: "#60A5FA" }}>%K</span>
            <span style={{ color: "#F59E0B" }}>%D</span>
          </div>
          <div ref={stochRef} style={{ height: 88 }} />
        </div>
      )}

      {/* ── Indicator strip ── */}
      <div style={{
        display: "flex", gap: 18, flexWrap: "nowrap", overflowX: "auto",
        padding: "7px 20px",
        borderTop: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        {strip.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", whiteSpace: "nowrap" }}>
              {s.label}
            </span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: s.color, whiteSpace: "nowrap" }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
