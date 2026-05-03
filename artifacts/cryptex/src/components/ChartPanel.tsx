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
import CoinIcon from "./CoinIcon";
import { useApp } from "../context/AppContext";

interface ChartPanelProps { livePrice: number; priceChange: number; }
type ChartType = "Candlestick" | "Line" | "Bar" | "Area";

// ── Indicator definitions with editable params ────────────────────────────────
interface ParamDef { key: string; label: string; min: number; max: number; step: number; default: number; }
interface IndicatorDef {
  id: string; label: string; cat: "Overlay" | "Oscillator"; color: string;
  params: ParamDef[];
}

const INDICATORS: IndicatorDef[] = [
  { id: "sma7",   label: "SMA",            cat: "Overlay",    color: "#EAB308",
    params: [{ key: "period", label: "Period", min: 2, max: 500, step: 1,   default: 7   }] },
  { id: "sma20",  label: "SMA",            cat: "Overlay",    color: "#94A3B8",
    params: [{ key: "period", label: "Period", min: 2, max: 500, step: 1,   default: 20  }] },
  { id: "sma50",  label: "SMA",            cat: "Overlay",    color: "#60A5FA",
    params: [{ key: "period", label: "Period", min: 2, max: 500, step: 1,   default: 50  }] },
  { id: "sma200", label: "SMA",            cat: "Overlay",    color: "#F87171",
    params: [{ key: "period", label: "Period", min: 2, max: 500, step: 1,   default: 200 }] },
  { id: "ema9",   label: "EMA",            cat: "Overlay",    color: "#34D399",
    params: [{ key: "period", label: "Period", min: 2, max: 500, step: 1,   default: 9   }] },
  { id: "ema21",  label: "EMA",            cat: "Overlay",    color: "#A78BFA",
    params: [{ key: "period", label: "Period", min: 2, max: 500, step: 1,   default: 21  }] },
  { id: "bb",     label: "Bollinger Bands",cat: "Overlay",    color: "#818CF8",
    params: [
      { key: "period", label: "Period",  min: 2,   max: 200, step: 1,   default: 20 },
      { key: "mult",   label: "Std Dev", min: 0.5, max: 5,   step: 0.5, default: 2  },
    ] },
  { id: "vwap",   label: "VWAP",           cat: "Overlay",    color: "#F59E0B", params: [] },
  { id: "rsi",    label: "RSI",            cat: "Oscillator", color: "#A78BFA",
    params: [{ key: "period", label: "Period", min: 2, max: 50, step: 1,   default: 14  }] },
  { id: "macd",   label: "MACD",           cat: "Oscillator", color: "#34D399",
    params: [
      { key: "fast",   label: "Fast",   min: 2,  max: 50,  step: 1, default: 12 },
      { key: "slow",   label: "Slow",   min: 5,  max: 100, step: 1, default: 26 },
      { key: "signal", label: "Signal", min: 2,  max: 30,  step: 1, default: 9  },
    ] },
  { id: "stoch",  label: "Stochastic",     cat: "Oscillator", color: "#60A5FA",
    params: [
      { key: "k", label: "%K Period", min: 2, max: 50, step: 1, default: 14 },
      { key: "d", label: "%D Period", min: 2, max: 20, step: 1, default: 3  },
    ] },
];

type IndParamsMap = Record<string, Record<string, number>>;

const DEFAULT_PARAMS: IndParamsMap = Object.fromEntries(
  INDICATORS.map(i => [i.id, Object.fromEntries(i.params.map(p => [p.key, p.default]))])
);

const IND_COLOR: Record<string, string> = Object.fromEntries(INDICATORS.map(i => [i.id, i.color]));

function getIndLabel(id: string, params: IndParamsMap): string {
  const p = params[id] ?? DEFAULT_PARAMS[id] ?? {};
  if (id.startsWith("sma")) return `SMA (${p.period ?? "?"})`;
  if (id.startsWith("ema")) return `EMA (${p.period ?? "?"})`;
  if (id === "bb")    return `BB (${p.period ?? 20}, ${p.mult ?? 2})`;
  if (id === "vwap")  return "VWAP";
  if (id === "rsi")   return `RSI (${p.period ?? 14})`;
  if (id === "macd")  return `MACD (${p.fast ?? 12},${p.slow ?? 26},${p.signal ?? 9})`;
  if (id === "stoch") return `Stoch (${p.k ?? 14},${p.d ?? 3})`;
  return id.toUpperCase();
}

const CHART_BUTTONS: { type: ChartType; icon: React.ElementType; label: string }[] = [
  { type: "Candlestick", icon: BarChart2,  label: "Candle" },
  { type: "Line",        icon: TrendingUp, label: "Line"   },
  { type: "Area",        icon: AreaChart,  label: "Area"   },
  { type: "Bar",         icon: AlignLeft,  label: "Bar"    },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function ChartPanel({ livePrice: _lp, priceChange: _pc }: ChartPanelProps) {
  const chartRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInst   = useRef<ReturnType<typeof createChart> | null>(null);
  const rsiRef      = useRef<HTMLDivElement>(null);
  const macdRef     = useRef<HTMLDivElement>(null);
  const stochRef    = useRef<HTMLDivElement>(null);
  const rsiInst     = useRef<ReturnType<typeof createChart> | null>(null);
  const macdInst    = useRef<ReturnType<typeof createChart> | null>(null);
  const stochInst   = useRef<ReturnType<typeof createChart> | null>(null);
  const pickerRef   = useRef<HTMLDivElement>(null);
  const priceEl     = useRef<HTMLSpanElement>(null);
  const prevCoin    = useRef("");
  // Live-update refs — hold the active price series and last candle without triggering rebuild
  const priceSeriesRef   = useRef<any>(null);
  const lastCandleRef    = useRef<any>(null);
  const chartTypeRef     = useRef<ChartType>("Candlestick");

  const [activeRange,      setActiveRange]      = useState("1D");
  const [activeChartType,  setActiveChartType]  = useState<ChartType>("Candlestick");
  const [maValues,         setMaValues]         = useState({ ma7: 0, ma25: 0, ma99: 0 });
  const [techInd,          setTechInd]          = useState<TechIndicators | null>(null);
  const [activeIndicators, setActiveIndicators] = useState(new Set(["sma20", "sma50"]));
  const [indicatorOpen,    setIndicatorOpen]    = useState(false);
  const [indParams,        setIndParams]        = useState<IndParamsMap>(DEFAULT_PARAMS);

  const { settings, formatPrice, livePrices, liveMarket, activePair, setActivePair } = useApp();

  const coinLive   = livePrices[activePair];
  const coinPrice  = coinLive?.price     ?? COIN_BASE_PRICES[activePair] ?? 60000;
  const coinChange = coinLive?.change24h ?? 0;
  const isUp  = coinChange >= 0;
  const meta  = COIN_META[activePair] ?? { name: activePair };

  const hasRSI   = activeIndicators.has("rsi");
  const hasMACD  = activeIndicators.has("macd");
  const hasStoch = activeIndicators.has("stoch");

  // Rebuild key — changes when indicators toggled OR when any active param changes
  const indKey = [...activeIndicators].sort().join(",") + "|" + JSON.stringify(
    Object.fromEntries([...activeIndicators].sort().map(id => [id, indParams[id] ?? {}]))
  );

  const fmtMA = (v: number) =>
    v > 0 ? (v < 1 ? v.toFixed(4) : v.toLocaleString("en-US", { maximumFractionDigits: 0 })) : "—";

  // Helper to read a param value (falls back to default)
  const p = (id: string, key: string, fallback: number) =>
    indParams[id]?.[key] ?? DEFAULT_PARAMS[id]?.[key] ?? fallback;

  // ── Sync chart type ────────────────────────────────────────────────────────
  useEffect(() => {
    setActiveChartType(settings.chartType as ChartType);
  }, [settings.chartType]);

  // ── Close picker on outside click ─────────────────────────────────────────
  useEffect(() => {
    if (!indicatorOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setIndicatorOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [indicatorOpen]);

  // ── Animate price on coin switch ───────────────────────────────────────────
  useEffect(() => {
    if (prevCoin.current !== activePair && priceEl.current) {
      prevCoin.current = activePair;
      gsap.fromTo(priceEl.current,
        { opacity: 0.3, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [activePair, coinPrice]);

  // ── Sub-chart factory ──────────────────────────────────────────────────────
  function makeSubChart(el: HTMLDivElement, isDark: boolean) {
    return createChart(el, {
      width: el.clientWidth, height: el.clientHeight || 88,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? "#0A0A0E" : "#F8F8FC" },
        textColor: isDark ? "#4A4860" : "#A09CB8",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
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
      handleScroll: true, handleScale: true,
    });
  }

  // ── Build all charts ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return;

    [chartInst, rsiInst, macdInst, stochInst].forEach(r => {
      if (r.current) { try { r.current.remove(); } catch { /* */ } r.current = null; }
    });
    chartRef.current.innerHTML = "";
    if (rsiRef.current)   rsiRef.current.innerHTML   = "";
    if (macdRef.current)  macdRef.current.innerHTML  = "";
    if (stochRef.current) stochRef.current.innerHTML = "";

    const isDark = document.documentElement.getAttribute("data-theme") !== "light";

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight || 220,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? "#0A0A0E" : "#F8F8FC" },
        textColor: isDark ? "#4A4860" : "#A09CB8",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
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
      handleScroll: true, handleScale: true,
    });
    chartInst.current = chart;

    const candles = generateCandles(activePair, activeRange);
    setMaValues({ ma7: computeMA(candles, 7), ma25: computeMA(candles, 25), ma99: computeMA(candles, 99) });
    setTechInd(computeIndicators(candles));

    // Track chart type for live updates
    chartTypeRef.current = activeChartType;
    priceSeriesRef.current = null;
    lastCandleRef.current  = null;

    // Price series
    if (activeChartType === "Candlestick") {
      const s = chart.addSeries(CandlestickSeries, {
        upColor: "#34D399", downColor: "#F87171",
        borderUpColor: "#34D399", borderDownColor: "#F87171",
        wickUpColor: "#34D399", wickDownColor: "#F87171",
      });
      s.setData(candles.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));
      priceSeriesRef.current = s;
      lastCandleRef.current  = { ...candles[candles.length - 1] };
    } else if (activeChartType === "Bar") {
      const s = chart.addSeries(BarSeries, { upColor: "#34D399", downColor: "#F87171" });
      s.setData(candles.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));
      priceSeriesRef.current = s;
      lastCandleRef.current  = { ...candles[candles.length - 1] };
    } else if (activeChartType === "Line") {
      const s = chart.addSeries(LineSeries, { color: "#A78BFA", lineWidth: 2 });
      s.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
      priceSeriesRef.current = s;
      lastCandleRef.current  = { ...candles[candles.length - 1] };
    } else {
      const s = chart.addSeries(AreaSeries, {
        lineColor: "#A78BFA", lineWidth: 2,
        topColor: "rgba(167,139,250,0.22)", bottomColor: "rgba(167,139,250,0.01)",
      });
      s.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
      priceSeriesRef.current = s;
      lastCandleRef.current  = { ...candles[candles.length - 1] };
    }

    // Volume histogram
    const vol = chart.addSeries(HistogramSeries, { color: "rgba(52,211,153,0.3)", priceFormat: { type: "volume" }, priceScaleId: "vol" });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    vol.setData(candles.map(c => ({
      time: c.time as any, value: c.value,
      color: c.close >= c.open ? "rgba(52,211,153,0.28)" : "rgba(248,113,113,0.28)",
    })));

    // ── Overlay indicators (use configured params) ─────────────────────────
    const addLine = (data: { time: number; value: number }[], color: string, width: 1 | 2 = 1) => {
      const s = chart.addSeries(LineSeries, { color, lineWidth: width, lastValueVisible: false, priceLineVisible: false });
      s.setData(data.map(d => ({ time: d.time as any, value: d.value })));
    };

    if (activeIndicators.has("sma7"))   addLine(smaSeries(candles, p("sma7",   "period", 7)),   IND_COLOR.sma7);
    if (activeIndicators.has("sma20"))  addLine(smaSeries(candles, p("sma20",  "period", 20)),  IND_COLOR.sma20);
    if (activeIndicators.has("sma50"))  addLine(smaSeries(candles, p("sma50",  "period", 50)),  IND_COLOR.sma50,  2);
    if (activeIndicators.has("sma200")) addLine(smaSeries(candles, p("sma200", "period", 200)), IND_COLOR.sma200, 2);
    if (activeIndicators.has("ema9"))   addLine(emaSeries(candles, p("ema9",   "period", 9)),   IND_COLOR.ema9);
    if (activeIndicators.has("ema21"))  addLine(emaSeries(candles, p("ema21",  "period", 21)),  IND_COLOR.ema21,  2);
    if (activeIndicators.has("vwap"))   addLine(vwapSeries(candles),                            IND_COLOR.vwap,   2);

    if (activeIndicators.has("bb")) {
      const bb = bbSeries(candles, p("bb", "period", 20), p("bb", "mult", 2));
      addLine(bb.map(d => ({ time: d.time, value: d.upper })), IND_COLOR.bb);
      addLine(bb.map(d => ({ time: d.time, value: d.mid   })), IND_COLOR.bb + "88");
      addLine(bb.map(d => ({ time: d.time, value: d.lower })), IND_COLOR.bb);
    }

    chart.timeScale().fitContent();

    // ── Oscillator sub-charts ──────────────────────────────────────────────
    const subCharts: ReturnType<typeof createChart>[] = [];

    if (hasRSI && rsiRef.current) {
      const rc = makeSubChart(rsiRef.current, isDark);
      rsiInst.current = rc;
      subCharts.push(rc);
      const rp = p("rsi", "period", 14);
      const data = rsiSeries(candles, rp);
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

    if (hasMACD && macdRef.current) {
      const mc = makeSubChart(macdRef.current, isDark);
      macdInst.current = mc;
      subCharts.push(mc);
      const { line, signalLine, hist } = macdSeries(
        candles,
        p("macd", "fast",   12),
        p("macd", "slow",   26),
        p("macd", "signal", 9),
      );
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

    if (hasStoch && stochRef.current) {
      const sc = makeSubChart(stochRef.current, isDark);
      stochInst.current = sc;
      subCharts.push(sc);
      const { k, d } = stochSeries(candles, p("stoch", "k", 14), p("stoch", "d", 3));
      if (k.length > 0) {
        const kl = sc.addSeries(LineSeries, { color: "#60A5FA", lineWidth: 1, lastValueVisible: true, priceLineVisible: false });
        kl.setData(k.map(pt => ({ time: pt.time as any, value: pt.value })));
      }
      if (d.length > 0) {
        const dl = sc.addSeries(LineSeries, { color: "#F59E0B", lineWidth: 1, lastValueVisible: true, priceLineVisible: false });
        dl.setData(d.map(pt => ({ time: pt.time as any, value: pt.value })));
      }
      sc.priceScale("right").applyOptions({ autoScale: false, minimum: 0, maximum: 100 });
      sc.timeScale().fitContent();
    }

    // ── Time-scale sync ────────────────────────────────────────────────────
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

    // ── Resize observer ────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (chartRef.current && chartInst.current)
        chartInst.current.applyOptions({ width: chartRef.current.clientWidth });
      ([
        [rsiRef, rsiInst], [macdRef, macdInst], [stochRef, stochInst],
      ] as [React.RefObject<HTMLDivElement | null>, React.RefObject<ReturnType<typeof createChart> | null>][]).forEach(([ref, inst]) => {
        if (ref.current && inst.current)
          inst.current.applyOptions({ width: ref.current.clientWidth });
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

  // ── Live price → last candle update (no chart rebuild) ─────────────────────
  useEffect(() => {
    const series = priceSeriesRef.current;
    const lc     = lastCandleRef.current;
    if (!series || !lc) return;

    const price       = coinPrice;
    const updatedHigh = Math.max(lc.high, price);
    const updatedLow  = Math.min(lc.low,  price);

    // Mutate the ref so next tick builds on the updated candle
    lastCandleRef.current = { ...lc, close: price, high: updatedHigh, low: updatedLow };

    try {
      if (chartTypeRef.current === "Candlestick" || chartTypeRef.current === "Bar") {
        series.update({
          time:  lc.time as any,
          open:  lc.open,
          high:  updatedHigh,
          low:   updatedLow,
          close: price,
        });
      } else {
        series.update({ time: lc.time as any, value: price });
      }
    } catch {
      // Series may have been destroyed during a chart rebuild — safe to ignore
    }
  }, [coinPrice]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleInd = (id: string) =>
    setActiveIndicators(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const updateParam = (id: string, key: string, raw: string, min: number, max: number, step: number) => {
    const val = step % 1 === 0
      ? Math.max(min, Math.min(max, parseInt(raw) || 1))
      : Math.max(min, Math.min(max, parseFloat(raw) || min));
    setIndParams(prev => ({ ...prev, [id]: { ...(prev[id] ?? DEFAULT_PARAMS[id] ?? {}), [key]: val } }));
  };

  // Indicator strip data
  const fg      = liveMarket.fearGreed;
  const fgLabel = fg >= 75 ? "Extreme Greed" : fg >= 55 ? "Greed" : fg >= 45 ? "Neutral" : fg >= 25 ? "Fear" : "Extreme Fear";
  const fgColor = fg >= 55 ? "#EAB308" : fg >= 45 ? "var(--text-2)" : "var(--bear)";
  const rsiVal  = techInd?.rsi ?? 0;
  const rsiClr  = rsiVal >= 70 ? "var(--bear)" : rsiVal <= 30 ? "var(--bull)" : "var(--accent)";
  const macdVal = techInd?.macd ?? 0;
  const rawVol  = techInd?.volume24h ?? 0;
  const volB    = rawVol / 1_000_000;
  const volStr  = volB >= 1000 ? `${(volB/1000).toFixed(1)}T` : volB >= 1 ? `${volB.toFixed(1)}B` : `${(rawVol/1000).toFixed(0)}M`;
  const strip = [
    { label: `RSI(${p("rsi","period",14)})`, value: rsiVal.toFixed(1),                                 color: rsiClr },
    { label: "MACD",                          value: `${macdVal >= 0 ? "+" : ""}${macdVal.toFixed(2)}`, color: macdVal >= 0 ? "var(--bull)" : "var(--bear)" },
    { label: "BB Upper",                      value: fmtMA(techInd?.bbUpper ?? 0),                      color: "var(--text-1)" },
    { label: "ATR(14)",                       value: fmtMA(techInd?.atr ?? 0),                          color: "var(--text-1)" },
    { label: "Fear/Greed",                    value: `${fg} ${fgLabel}`,                                color: fgColor },
    { label: "Vol",                           value: volStr,                                             color: "var(--text-2)" },
  ];

  // ── Input style helper ─────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: 52, padding: "3px 6px",
    background: "var(--bg-raised)",
    border: "1px solid var(--border-2)",
    borderRadius: 4,
    color: "var(--text-1)",
    fontFamily: "var(--font-data)", fontSize: 10,
    textAlign: "center",
    outline: "none",
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>

      {/* ── Controls toolbar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px 0", borderBottom: "1px solid var(--border)", flexShrink: 0,
      }}>
        {/* Coin tabs */}
        <div style={{ display: "flex" }}>
          {coinTabs.map(coin => {
            const chg = livePrices[coin]?.change24h ?? 0;
            const active = activePair === coin;
            return (
              <button key={coin} onClick={() => setActivePair(coin)} style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0 12px 10px",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1, textAlign: "left",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <CoinIcon symbol={coin} size={18} fallbackColor={chg >= 0 ? "#34D399" : "#F87171"} />
                <div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, color: active ? "var(--text-1)" : "var(--text-2)", marginBottom: 1 }}>{coin}</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: chg >= 0 ? "var(--bull)" : "var(--bear)", opacity: active ? 1 : 0.6 }}>
                    {chg >= 0 ? "+" : ""}{chg.toFixed(1)}%
                  </div>
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
                display: "flex", alignItems: "center", gap: 5, height: 26, padding: "0 10px",
                background: indicatorOpen ? "var(--bg-surface)" : "var(--bg-raised)",
                border: `1px solid ${indicatorOpen ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 5, cursor: "pointer",
                fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600,
                color: indicatorOpen ? "var(--accent)" : "var(--text-2)",
                transition: "all 0.12s",
              }}
            >
              <Activity size={11} />
              Indicators
              {activeIndicators.size > 0 && (
                <span style={{
                  background: "var(--accent)", color: "#fff", borderRadius: "50%",
                  width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 700,
                }}>{activeIndicators.size}</span>
              )}
              <ChevronDown size={9} style={{ transform: indicatorOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>

            {/* ── Picker panel ── */}
            {indicatorOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 200,
                width: 360,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-2)",
                borderRadius: 10,
                boxShadow: "0 14px 48px rgba(0,0,0,0.5)",
                overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
                    Indicators &amp; Parameters
                  </span>
                  <button onClick={() => setIndicatorOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0, display: "flex" }}>
                    <X size={13} />
                  </button>
                </div>

                {/* Scrollable indicator list */}
                <div style={{ maxHeight: 420, overflowY: "auto" }}>
                  {(["Overlay", "Oscillator"] as const).map(cat => (
                    <div key={cat}>
                      {/* Category header */}
                      <div style={{
                        padding: "8px 14px 4px",
                        fontFamily: "var(--font-ui)", fontSize: 8, fontWeight: 700,
                        letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)",
                        background: "var(--bg-raised)",
                        borderBottom: "1px solid var(--border)",
                        borderTop: cat === "Oscillator" ? "1px solid var(--border)" : "none",
                      }}>
                        {cat} Indicators
                      </div>

                      {INDICATORS.filter(ind => ind.cat === cat).map(ind => {
                        const on = activeIndicators.has(ind.id);
                        const currentLabel = getIndLabel(ind.id, indParams);
                        return (
                          <div key={ind.id} style={{ borderBottom: "1px solid var(--border)" }}>
                            {/* Toggle row */}
                            <div
                              onClick={() => toggleInd(ind.id)}
                              style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "8px 14px",
                                background: on ? `${ind.color}10` : "transparent",
                                cursor: "pointer",
                                transition: "background 0.1s",
                              }}
                            >
                              <div style={{
                                width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                                background: on ? ind.color : "var(--border-2)",
                                boxShadow: on ? `0 0 7px ${ind.color}90` : "none",
                                transition: "all 0.15s",
                              }} />
                              <span style={{
                                fontFamily: "var(--font-ui)", fontSize: 10, flex: 1,
                                color: on ? "var(--text-1)" : "var(--text-3)",
                                transition: "color 0.12s",
                              }}>
                                {currentLabel}
                              </span>
                              {on && (
                                <span style={{
                                  fontFamily: "var(--font-data)", fontSize: 8,
                                  color: "var(--text-3)", marginRight: 4,
                                }}>
                                  {ind.params.length > 0 ? "▾ edit params" : "active"}
                                </span>
                              )}
                              {on ? (
                                <button
                                  onClick={e => { e.stopPropagation(); toggleInd(ind.id); }}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0, display: "flex" }}
                                >
                                  <X size={11} />
                                </button>
                              ) : (
                                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>+ Add</span>
                              )}
                            </div>

                            {/* ── Param editor (shown when active and has params) ── */}
                            {on && ind.params.length > 0 && (
                              <div
                                onClick={e => e.stopPropagation()}
                                style={{
                                  display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end",
                                  padding: "6px 14px 10px 31px",
                                  background: `${ind.color}08`,
                                  borderTop: `1px solid ${ind.color}25`,
                                }}
                              >
                                {ind.params.map(param => (
                                  <div key={param.key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <label style={{
                                      fontFamily: "var(--font-ui)", fontSize: 8, fontWeight: 600,
                                      letterSpacing: "0.08em", textTransform: "uppercase",
                                      color: ind.color, opacity: 0.8,
                                    }}>
                                      {param.label}
                                    </label>
                                    <input
                                      type="number"
                                      min={param.min}
                                      max={param.max}
                                      step={param.step}
                                      value={indParams[ind.id]?.[param.key] ?? param.default}
                                      onChange={e => updateParam(ind.id, param.key, e.target.value, param.min, param.max, param.step)}
                                      onClick={e => e.stopPropagation()}
                                      style={inputStyle}
                                    />
                                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 7, color: "var(--text-3)", textAlign: "center" }}>
                                      {param.min}–{param.max}
                                    </span>
                                  </div>
                                ))}
                                <button
                                  onClick={() => setIndParams(prev => ({
                                    ...prev,
                                    [ind.id]: Object.fromEntries(ind.params.map(pr => [pr.key, pr.default])),
                                  }))}
                                  style={{
                                    background: "none", border: `1px solid ${ind.color}40`,
                                    borderRadius: 4, cursor: "pointer", padding: "3px 8px",
                                    fontFamily: "var(--font-ui)", fontSize: 8, color: ind.color,
                                    opacity: 0.7, marginBottom: 15,
                                  }}
                                >
                                  Reset
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Footer: active count + clear all */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 14px",
                  borderTop: "1px solid var(--border)",
                  background: "var(--bg-raised)",
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>
                    {activeIndicators.size} indicator{activeIndicators.size !== 1 ? "s" : ""} active
                  </span>
                  <button
                    onClick={() => setActiveIndicators(new Set())}
                    style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--bear)", padding: 0 }}
                  >
                    Clear all
                  </button>
                </div>
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

        {/* MA strip + active overlay chips with actual param values */}
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
              fontFamily: "var(--font-data)", fontSize: 9, color: ind.color,
              background: `${ind.color}18`, padding: "1px 6px", borderRadius: 3,
              border: `1px solid ${ind.color}40`,
            }}>
              ▸ {getIndLabel(ind.id, indParams)}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main chart ── */}
      <div ref={chartRef} style={{ flex: 1, minHeight: 120, background: "var(--chart-bg)", overflow: "hidden" }} />

      {/* ── RSI pane ── */}
      {hasRSI && (
        <div style={{ flexShrink: 0, position: "relative", borderTop: "1px solid var(--border)" }}>
          <div style={{
            position: "absolute", top: 4, left: 10, zIndex: 10, pointerEvents: "none",
            fontFamily: "var(--font-data)", fontSize: 8, color: "#A78BFA",
            display: "flex", alignItems: "center", gap: 4, letterSpacing: "0.04em",
          }}>
            <span style={{ opacity: 0.7 }}>{getIndLabel("rsi", indParams)}</span>
            <span style={{ fontWeight: 600 }}>{techInd?.rsi.toFixed(1) ?? "—"}</span>
            <span style={{ color: "rgba(248,113,113,0.7)", fontSize: 7 }}>70</span>
            <span style={{ color: "rgba(52,211,153,0.7)",  fontSize: 7 }}>30</span>
          </div>
          <div ref={rsiRef} style={{ height: 88 }} />
        </div>
      )}

      {/* ── MACD pane ── */}
      {hasMACD && (
        <div style={{ flexShrink: 0, position: "relative", borderTop: "1px solid var(--border)" }}>
          <div style={{
            position: "absolute", top: 4, left: 10, zIndex: 10, pointerEvents: "none",
            fontFamily: "var(--font-data)", fontSize: 8,
            display: "flex", alignItems: "center", gap: 5, letterSpacing: "0.04em",
          }}>
            <span style={{ color: "#34D399", opacity: 0.8 }}>{getIndLabel("macd", indParams)}</span>
            <span style={{ color: "#34D399", fontSize: 7 }}>MACD</span>
            <span style={{ color: "#F87171", fontSize: 7 }}>Signal</span>
          </div>
          <div ref={macdRef} style={{ height: 88 }} />
        </div>
      )}

      {/* ── Stochastic pane ── */}
      {hasStoch && (
        <div style={{ flexShrink: 0, position: "relative", borderTop: "1px solid var(--border)" }}>
          <div style={{
            position: "absolute", top: 4, left: 10, zIndex: 10, pointerEvents: "none",
            fontFamily: "var(--font-data)", fontSize: 8,
            display: "flex", alignItems: "center", gap: 5, letterSpacing: "0.04em",
          }}>
            <span style={{ color: "#60A5FA", opacity: 0.8 }}>{getIndLabel("stoch", indParams)}</span>
            <span style={{ color: "#60A5FA", fontSize: 7 }}>%K</span>
            <span style={{ color: "#F59E0B", fontSize: 7 }}>%D</span>
          </div>
          <div ref={stochRef} style={{ height: 88 }} />
        </div>
      )}

      {/* ── Indicator strip ── */}
      <div style={{
        display: "flex", gap: 18, flexWrap: "nowrap", overflowX: "auto",
        padding: "7px 20px", borderTop: "1px solid var(--border)", flexShrink: 0,
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
