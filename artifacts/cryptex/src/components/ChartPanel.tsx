import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries, AreaSeries, BarSeries } from "lightweight-charts";
import { BarChart2, TrendingUp, AlignLeft, AreaChart } from "lucide-react";
import { generateCandles, coinTabs, timeRanges, indicators } from "../mockData";
import { useApp } from "../context/AppContext";

interface ChartPanelProps {
  livePrice: number;
  priceChange: number;
}

const BASE_PRICES: Record<string, number> = {
  BTC: 60000, ETH: 3500, SOL: 160, BNB: 560, MATIC: 0.8
};

export default function ChartPanel({ livePrice, priceChange }: ChartPanelProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const [activeCoin, setActiveCoin] = useState("BTC");
  const [activeRange, setActiveRange] = useState("1D");
  const { settings, formatPrice } = useApp();
  const [activeChartType, setActiveChartType] = useState(settings.chartType);

  // Sync chart type when global default changes
  useEffect(() => {
    setActiveChartType(settings.chartType);
  }, [settings.chartType]);

  useEffect(() => {
    gsap.from(priceRef.current, { y: 20, opacity: 0, duration: 0.9, ease: "expo.out", delay: 0.5 });
    gsap.from(chartRef.current, { opacity: 0, duration: 0.8, ease: "power2.out", delay: 0.6 });
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = "";

    const isDark = document.documentElement.getAttribute("data-theme") !== "light";

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? "#0A0A0E" : "#F8F8FC" },
        textColor: isDark ? "#38364A" : "#A09CB8",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: isDark ? "#13131A" : "#EDEDF5" },
        horzLines: { color: isDark ? "#13131A" : "#EDEDF5" },
      },
      crosshair: {
        vertLine: { color: "#2A2A40", labelBackgroundColor: isDark ? "#1A1A24" : "#F0F0F8" },
        horzLine: { color: "#2A2A40", labelBackgroundColor: isDark ? "#1A1A24" : "#F0F0F8" },
      },
      rightPriceScale: { borderColor: isDark ? "#1F1F2E" : "#E0DFF0", textColor: isDark ? "#38364A" : "#A09CB8" },
      timeScale: { borderColor: isDark ? "#1F1F2E" : "#E0DFF0", textColor: isDark ? "#38364A" : "#A09CB8" },
      handleScroll: true,
      handleScale: true,
    });

    const candles = generateCandles(180, BASE_PRICES[activeCoin] ?? 60000);

    const type = activeChartType;
    if (type === "Candlestick" || type === "Bar") {
      if (type === "Bar") {
        const series = chart.addSeries(BarSeries, {
          upColor: "#34D399",
          downColor: "#F87171",
        });
        series.setData(candles.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));
      } else {
        const series = chart.addSeries(CandlestickSeries, {
          upColor: "#34D399", downColor: "#F87171",
          borderUpColor: "#34D399", borderDownColor: "#F87171",
          wickUpColor: "#34D399", wickDownColor: "#F87171",
        });
        series.setData(candles.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));
      }
    } else if (type === "Line") {
      const series = chart.addSeries(LineSeries, {
        color: "#A78BFA", lineWidth: 2,
        priceLineColor: "#A78BFA",
      });
      series.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
    } else if (type === "Area") {
      const series = chart.addSeries(AreaSeries, {
        lineColor: "#A78BFA", lineWidth: 2,
        topColor: "rgba(167,139,250,0.3)",
        bottomColor: "rgba(167,139,250,0.02)",
      });
      series.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
    }

    const volSeries = chart.addSeries(HistogramSeries, {
      color: "rgba(52,211,153,0.3)",
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volSeries.setData(candles.map(c => ({
      time: c.time as any, value: c.value,
      color: c.close >= c.open ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"
    })));

    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth });
    });
    if (chartRef.current) observer.observe(chartRef.current);
    return () => { chart.remove(); observer.disconnect(); };
  }, [activeCoin, activeRange, activeChartType, settings.theme]);

  const isUp = priceChange >= 0;
  const maColors = ["#EAB308", "#6B7280", "#60A5FA"];

  const chartButtons = [
    { type: "Line" as const, icon: TrendingUp, label: "Line" },
    { type: "Area" as const, icon: AreaChart, label: "Area" },
    { type: "Candlestick" as const, icon: BarChart2, label: "Candle" },
    { type: "Bar" as const, icon: AlignLeft, label: "Bar" },
  ];

  return (
    <div style={{ padding: "20px 24px 0", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 20 }}>
          {coinTabs.map(coin => (
            <button key={coin} onClick={() => setActiveCoin(coin)} className="coin-tab" style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-ui)", fontSize: 12,
              color: activeCoin === coin ? "var(--text-1)" : "var(--text-2)",
              borderBottom: activeCoin === coin ? "2px solid var(--accent)" : "2px solid transparent",
              paddingBottom: 4, paddingLeft: 0, paddingRight: 0
            }}>{coin}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {timeRanges.map(r => (
              <button key={r} onClick={() => setActiveRange(r)} className="range-tab" style={{
                background: activeRange === r ? "var(--bg-raised)" : "none",
                border: "none", cursor: "pointer",
                fontFamily: "var(--font-data)", fontSize: 10,
                color: activeRange === r ? "var(--text-1)" : "var(--text-2)",
                borderRadius: 4, padding: "3px 8px"
              }}>{r}</button>
            ))}
          </div>
          <div className="v-divider" />
          {chartButtons.map(({ type, icon: Icon, label }) => (
            <button key={type} onClick={() => setActiveChartType(type)} title={label} style={{
              width: 28, height: 28,
              background: activeChartType === type ? "var(--bg-raised)" : "none",
              border: activeChartType === type ? "1px solid var(--border-2)" : "1px solid transparent",
              borderRadius: 4, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: activeChartType === type ? "var(--text-1)" : "var(--text-3)"
            }}><Icon size={13} /></button>
          ))}
        </div>
      </div>

      <div ref={priceRef} style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--text-1)" }}>
            {formatPrice(livePrice)}
          </span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: 13, color: isUp ? "var(--bull)" : "var(--bear)" }}>
            {isUp ? "+" : ""}${Math.abs(priceChange * 673).toFixed(2)} · {isUp ? "+" : ""}{priceChange.toFixed(1)}%
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
          {["MA(7) 65,820", "MA(25) 64,102", "MA(99) 61,440"].map((ma, i) => (
            <span key={i} style={{ fontFamily: "var(--font-data)", fontSize: 9, color: maColors[i] }}>{ma}</span>
          ))}
        </div>
      </div>

      <div ref={chartRef} className="chart-container chart-area" style={{
        background: "var(--chart-bg)", borderRadius: "4px 4px 0 0", overflow: "hidden"
      }} />

      <div style={{ display: "flex", gap: 24, padding: "10px 0", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
        {indicators.map((ind, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span className="section-label">{ind.label}</span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>{ind.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
