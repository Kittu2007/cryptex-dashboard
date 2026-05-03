import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import {
  createChart, ColorType,
  CandlestickSeries, HistogramSeries, LineSeries, AreaSeries,
} from "lightweight-charts";
import { ArrowLeft } from "lucide-react";
import { coins, generateCandles, computeIndicators } from "../mockData";
import { useApp } from "../context/AppContext";
import CoinIcon from "../components/CoinIcon";

// ── Static coin metadata ──────────────────────────────────────────────────────
const COIN_INFO: Record<string, {
  about: string; supply: string; maxSupply: string;
  ath: number; athDate: string; atl: number; atlDate: string;
  launchYear: number; consensus: string; tps: string; category: string;
  newsCategories: string[];
}> = {
  BTC: {
    about: "Bitcoin is the world's first decentralized cryptocurrency, created in 2009 by the pseudonymous Satoshi Nakamoto. It operates on a permissionless peer-to-peer network secured by proof-of-work consensus, with a hard-capped supply of 21 million coins enforced by protocol rules. Bitcoin pioneered the concept of digital scarcity and remains the global benchmark for the crypto asset class.",
    supply: "19.67M", maxSupply: "21M", ath: 73750, athDate: "Mar 14, 2024",
    atl: 65.53, atlDate: "Jul 5, 2013", launchYear: 2009,
    consensus: "Proof of Work", tps: "~7", category: "Layer 1",
    newsCategories: ["Bitcoin", "Markets"],
  },
  ETH: {
    about: "Ethereum is a programmable blockchain platform enabling smart contracts and decentralized applications. Founded by Vitalik Buterin in 2015, it transitioned from proof-of-work to proof-of-stake in 2022 (The Merge), dramatically reducing energy consumption. Ethereum's EVM is the standard execution environment for DeFi, NFTs, and Layer 2 scaling networks.",
    supply: "120.2M", maxSupply: "Unlimited", ath: 4878.26, athDate: "Nov 10, 2021",
    atl: 0.432979, atlDate: "Oct 21, 2015", launchYear: 2015,
    consensus: "Proof of Stake", tps: "~15 (L1)", category: "Layer 1",
    newsCategories: ["Ethereum", "Staking", "DeFi"],
  },
  SOL: {
    about: "Solana is a high-performance blockchain supporting thousands of transactions per second at sub-cent fees. Its unique Proof of History (PoH) consensus combined with Tower BFT enables parallel transaction processing. Solana has become a major hub for DeFi, NFTs, and consumer-grade applications.",
    supply: "454M", maxSupply: "Unlimited", ath: 259.96, athDate: "Nov 6, 2021",
    atl: 0.5052, atlDate: "May 11, 2020", launchYear: 2020,
    consensus: "Proof of History + PoS", tps: "~65,000", category: "Layer 1",
    newsCategories: ["DeFi", "Markets"],
  },
  BNB: {
    about: "BNB is the native token of the BNB Chain ecosystem, originally launched by Binance in 2017 as an ERC-20 token before migrating to its own chain. It powers transaction fees on BNB Smart Chain, participates in token sales via Launchpad, and provides trading fee discounts on the Binance exchange.",
    supply: "149.6M", maxSupply: "200M", ath: 686.31, athDate: "May 10, 2021",
    atl: 0.0398, atlDate: "Oct 19, 2017", launchYear: 2017,
    consensus: "Proof of Staked Authority", tps: "~300", category: "Layer 1",
    newsCategories: ["Markets", "Regulation"],
  },
  MATIC: {
    about: "Polygon (MATIC) is a leading Layer 2 scaling solution for Ethereum offering faster transactions at dramatically lower fees. Its ecosystem includes zkEVM rollups, Polygon PoS, and the AggLayer — a unified cross-chain interoperability protocol. MATIC tokens are used for staking, governance, and gas fees across the network.",
    supply: "9.28B", maxSupply: "10B", ath: 2.92, athDate: "Dec 27, 2021",
    atl: 0.00314, atlDate: "May 10, 2019", launchYear: 2019,
    consensus: "Proof of Stake", tps: "~65,000", category: "Layer 2",
    newsCategories: ["Layer2", "DeFi"],
  },
  ADA: {
    about: "Cardano is a third-generation proof-of-stake blockchain built on peer-reviewed academic research and formal verification. Founded by Charles Hoskinson, it uses the Ouroboros consensus protocol and focuses on security, scalability, and sustainability as core design principles.",
    supply: "35.4B", maxSupply: "45B", ath: 3.09, athDate: "Sep 2, 2021",
    atl: 0.01925, atlDate: "Oct 1, 2017", launchYear: 2017,
    consensus: "Ouroboros PoS", tps: "~250", category: "Layer 1",
    newsCategories: ["Regulation", "Macro"],
  },
  DOT: {
    about: "Polkadot is a sharded multichain network enabling blockchains to interoperate and share security through its relay chain and parachain architecture. Created by Ethereum co-founder Gavin Wood, it allows purpose-built blockchains to connect and transfer data, tokens, and assets seamlessly.",
    supply: "1.46B", maxSupply: "Unlimited", ath: 54.98, athDate: "Nov 4, 2021",
    atl: 2.69, atlDate: "Aug 20, 2020", launchYear: 2020,
    consensus: "Nominated PoS", tps: "~1,000", category: "Layer 1",
    newsCategories: ["Regulation", "Macro"],
  },
  LINK: {
    about: "Chainlink is a decentralized oracle network providing secure, tamper-proof data feeds and off-chain computation to smart contracts. Its CCIP protocol enables cross-chain value transfer. LINK is integrated into over 500 protocols spanning DeFi, insurance, gaming, and enterprise systems worldwide.",
    supply: "587M", maxSupply: "1B", ath: 52.88, athDate: "May 10, 2021",
    atl: 0.1263, atlDate: "Sep 23, 2017", launchYear: 2017,
    consensus: "Decentralized Oracle Network", tps: "N/A", category: "DeFi / Oracle",
    newsCategories: ["Altcoins", "DeFi"],
  },
};

const ANALYST_DATA: Record<string, { consensus: string; target: number; bull: number; neutral: number; bear: number }> = {
  BTC:   { consensus: "Strong Buy", target: 75000, bull: 84, neutral: 12, bear: 4  },
  ETH:   { consensus: "Buy",        target: 4800,  bull: 72, neutral: 18, bear: 10 },
  SOL:   { consensus: "Buy",        target: 220,   bull: 68, neutral: 22, bear: 10 },
  BNB:   { consensus: "Hold",       target: 640,   bull: 52, neutral: 33, bear: 15 },
  MATIC: { consensus: "Hold",       target: 1.20,  bull: 48, neutral: 30, bear: 22 },
  ADA:   { consensus: "Hold",       target: 0.72,  bull: 45, neutral: 38, bear: 17 },
  DOT:   { consensus: "Hold",       target: 11.50, bull: 46, neutral: 35, bear: 19 },
  LINK:  { consensus: "Buy",        target: 28.00, bull: 70, neutral: 20, bear: 10 },
};

const ON_CHAIN: Record<string, { addresses: string; txDay: string; fees: string; extra?: string }> = {
  BTC:   { addresses: "982K",   txDay: "421K",  fees: "$4.20",  extra: "Hash Rate: 624 EH/s" },
  ETH:   { addresses: "614K",   txDay: "1.2M",  fees: "$2.80",  extra: "Validators: 1.04M"  },
  SOL:   { addresses: "1.8M",   txDay: "52M",   fees: "$0.001", extra: "Validators: 2,000"  },
  BNB:   { addresses: "551K",   txDay: "4.8M",  fees: "$0.12",  extra: "Validators: 21"     },
  MATIC: { addresses: "281K",   txDay: "8.4M",  fees: "$0.01",  extra: "Stakers: 105K"      },
  ADA:   { addresses: "198K",   txDay: "88K",   fees: "$0.18",  extra: "Stake Pools: 3,100" },
  DOT:   { addresses: "142K",   txDay: "55K",   fees: "$0.10",  extra: "Parachains: 47"     },
  LINK:  { addresses: "94K",    txDay: "31K",   fees: "$1.20",  extra: "Node Ops: 800+"     },
};

// Related news (body + category for filtering)
const ALL_NEWS = [
  { id: 1,  source: "CoinDesk",       cat: "Bitcoin",    title: "MicroStrategy adds 15,000 BTC to treasury, total holdings cross 400,000 coins",           body: "MicroStrategy has once again topped up its Bitcoin treasury, crossing the 400,000 BTC milestone and cementing its position as the world's largest corporate holder.",         sentiment: 89, time: "1d ago"  },
  { id: 2,  source: "CoinDesk",       cat: "Markets",    title: "Bitcoin breaks $68K resistance as institutional demand surges ahead of halving",           body: "Bitcoin surged past key resistance levels as major institutions continue to accumulate. Analysts point to ETF inflows and macro uncertainty as primary drivers.",             sentiment: 78, time: "2h ago"  },
  { id: 3,  source: "Financial Times",cat: "Markets",    title: "BlackRock crypto AUM crosses $50B milestone driven by spot Bitcoin ETF inflows",           body: "BlackRock's crypto assets under management crossed a record $50 billion, driven primarily by its IBIT spot Bitcoin ETF which saw its largest week of inflows since launch.", sentiment: 76, time: "2d ago"  },
  { id: 4,  source: "The Block",      cat: "Ethereum",   title: "ETH staking yields compress as validator count hits new all-time high",                    body: "The Ethereum staking ecosystem now has over 1M validators, pushing annual yields slightly lower as competition intensifies.",                                                 sentiment: 42, time: "4h ago"  },
  { id: 5,  source: "Blockworks",     cat: "Regulation", title: "SEC approves spot Ethereum ETF options, opening $18B in institutional exposure",           body: "The SEC gave the green light for options trading on spot Ethereum ETFs, opening new derivatives exposure for institutional investors.",                                          sentiment: 83, time: "12h ago" },
  { id: 6,  source: "Blockworks",     cat: "Staking",    title: "Ethereum validator queue clears to zero as staking yields stabilize near 4.2% APR",       body: "The Ethereum validator queue has fully cleared for the first time since the Merge, a sign that staking demand has stabilized.",                                                sentiment: 55, time: "4d ago"  },
  { id: 7,  source: "Decrypt",        cat: "DeFi",       title: "Solana ecosystem records all-time DEX volume in Q1 2026, surpassing Ethereum",             body: "Solana-based DEXs processed over $180B in Q1 2026, the first time surpassing Ethereum DEX volume in the same period.",                                                          sentiment: 65, time: "6h ago"  },
  { id: 8,  source: "The Defiant",    cat: "DeFi",       title: "Uniswap v4 hooks drive $2B TVL migration within first week of mainnet launch",             body: "The Uniswap v4 mainnet launch sparked an unprecedented wave of TVL migration as developers deployed hundreds of custom hook-enabled pools within days.",                       sentiment: 74, time: "2d ago"  },
  { id: 9,  source: "Bloomberg",      cat: "Macro",      title: "Fed signals rate cuts could accelerate crypto rally through H2 2026",                      body: "Federal Reserve officials hinted at a faster pace of rate reductions, sending risk assets including Bitcoin and Ether sharply higher.",                                         sentiment: 71, time: "9h ago"  },
  { id: 10, source: "Reuters",        cat: "Regulation", title: "G20 agrees on crypto tax framework, placing pressure on offshore DeFi platforms",          body: "Finance ministers from G20 nations reached a preliminary agreement on unified crypto asset reporting requirements.",                                                             sentiment: 32, time: "1d ago"  },
  { id: 11, source: "CoinTelegraph",  cat: "Layer2",     title: "Ethereum L2 networks process 10× more daily transactions than mainnet for first time",     body: "Optimism, Arbitrum, Base and zkSync combined processed over 10 million daily transactions, far outpacing Ethereum mainnet.",                                                    sentiment: 68, time: "3d ago"  },
  { id: 12, source: "CoinTelegraph",  cat: "Altcoins",   title: "Chainlink CCIP adoption hits 500 protocols — analyst targets $30 by Q3",                  body: "Chainlink's cross-chain interoperability protocol has been integrated by over 500 protocols, prompting analysts to revise price targets sharply higher.",                    sentiment: 38, time: "1d ago"  },
];

const TIME_RANGES = ["15m", "1h", "4h", "1D", "1W", "1M"] as const;
type TimeRange  = typeof TIME_RANGES[number];
const CHART_TYPES = ["Candle", "Line", "Area"] as const;
type ChartType = typeof CHART_TYPES[number];

function sentColor(s: number) {
  return s >= 60 ? "var(--bull)" : s < 40 ? "var(--bear)" : "var(--accent)";
}
function sentLabel(s: number) {
  return s >= 60 ? "Bullish" : s < 40 ? "Bearish" : "Neutral";
}

interface Props { symbol: string; onBack: () => void; }

export default function CoinDetailView({ symbol, onBack }: Props) {
  const { livePrices, formatPrice } = useApp();

  const headerRef         = useRef<HTMLDivElement>(null);
  const mainRef           = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [range,     setRange]     = useState<TimeRange>("1D");
  const [chartType, setChartType] = useState<ChartType>("Candle");

  const coin     = coins.find(c => c.symbol === symbol);
  const lp       = livePrices[symbol];
  const info     = COIN_INFO[symbol];
  const analyst  = ANALYST_DATA[symbol];
  const onchain  = ON_CHAIN[symbol];

  const price     = lp?.price     ?? coin?.price    ?? 0;
  const change24h = lp?.change24h ?? coin?.change24h ?? 0;
  const change7d  = lp?.change7d  ?? coin?.change7d  ?? 0;
  const mktCapB   = lp?.marketCapB ?? 0;
  const volumeB   = lp?.volumeB   ?? 0;
  const isUp      = change24h >= 0;

  const candles    = useMemo(() => generateCandles(symbol, range), [symbol, range]);
  const indicators = useMemo(() => computeIndicators(candles), [candles]);

  const relatedNews = useMemo(() =>
    ALL_NEWS.filter(n => info?.newsCategories?.includes(n.cat) ?? false).slice(0, 4),
    [info]
  );

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(headerRef.current, { y: -20, opacity: 0, duration: 0.4, ease: "expo.out" })
      .from(".cd-main", { y: 14, opacity: 0, duration: 0.4, ease: "power2.out" }, "-=0.2");
  }, []);

  // Build lightweight chart
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const chart = createChart(container, {
      width:  container.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor:  "#5B5B7A",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize:   10,
      },
      grid: {
        vertLines: { color: "rgba(31,31,46,0.8)" },
        horzLines: { color: "rgba(31,31,46,0.8)" },
      },
      crosshair: {
        vertLine: { color: "#2A2A40", labelBackgroundColor: "#1A1A24" },
        horzLine: { color: "#2A2A40", labelBackgroundColor: "#1A1A24" },
      },
      rightPriceScale: { borderColor: "#1F1F2E" },
      timeScale: { borderColor: "#1F1F2E", timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
    });

    const candleData = candles.map(c => ({
      time:  c.time as Parameters<typeof chart.addSeries>[0] extends never ? never : number,
      open:  c.open,
      high:  c.high,
      low:   c.low,
      close: c.close,
    }));

    if (chartType === "Candle") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor:         "#34D399", downColor:        "#F87171",
        borderUpColor:   "#34D399", borderDownColor:  "#F87171",
        wickUpColor:     "#34D399", wickDownColor:    "#F87171",
      });
      series.setData(candleData as any);
    } else if (chartType === "Line") {
      const series = chart.addSeries(LineSeries, {
        color: "#A78BFA", lineWidth: 2, priceLineColor: "#A78BFA",
      });
      series.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: "#A78BFA", topColor: "rgba(167,139,250,0.28)",
        bottomColor: "rgba(167,139,250,0.0)", lineWidth: 2,
        priceLineColor: "#A78BFA",
      });
      series.setData(candles.map(c => ({ time: c.time as any, value: c.close })));
    }

    // Volume histogram in sub-scale
    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 }, borderVisible: false,
    });
    volSeries.setData(candles.map(c => ({
      time:  c.time as any,
      value: c.value,
      color: c.close >= c.open ? "rgba(52,211,153,0.22)" : "rgba(248,113,113,0.22)",
    })));

    chart.timeScale().fitContent();

    const obs = new ResizeObserver(() => {
      if (container) chart.applyOptions({ width: container.clientWidth });
    });
    obs.observe(container);

    return () => { chart.remove(); obs.disconnect(); };
  }, [candles, chartType]);

  // Derived stats
  const h24       = price * 1.018;
  const l24       = price * 0.982;
  const rangePct  = Math.max(0, Math.min(100, (price - l24) / (h24 - l24) * 100)).toFixed(0);
  const athDist   = info ? ((price - info.ath) / info.ath * 100).toFixed(1) : "0";
  const targetDist = analyst ? ((analyst.target - price) / price * 100).toFixed(1) : "0";
  const targetUp  = parseFloat(targetDist) >= 0;

  function fmt(b: number) {
    return b >= 1000 ? `$${(b / 1000).toFixed(2)}T` : b >= 1 ? `$${b.toFixed(1)}B` : `$${(b * 1000).toFixed(0)}M`;
  }

  return (
    <div>
      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <div ref={headerRef} style={{
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        padding: "11px 22px",
        background: "var(--bg-void)", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 30,
      }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
          fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)",
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "5px 12px", cursor: "pointer", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
        >
          <ArrowLeft size={12} /> Back
        </button>

        <div style={{ width: 1, height: 28, background: "var(--border)", flexShrink: 0 }} />

        <CoinIcon symbol={symbol} size={30} fallbackColor={coin?.avatar} />
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2 }}>
            {coin?.name ?? symbol}
          </div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>
            {symbol}/USD · {info?.category ?? "Crypto"}
          </div>
        </div>

        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            {formatPrice(price)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontFamily: "var(--font-data)", fontSize: 11,
              color: isUp ? "var(--bull)" : "var(--bear)",
              background: isUp ? "var(--bull-bg)" : "var(--bear-bg)",
              padding: "1px 6px", borderRadius: 3,
            }}>
              {isUp ? "+" : ""}{change24h.toFixed(2)}%
            </span>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>24H</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, marginLeft: 8, flexWrap: "wrap" }}>
          {[
            { label: "24H HIGH", value: formatPrice(h24),  color: "var(--bull)"   },
            { label: "24H LOW",  value: formatPrice(l24),  color: "var(--bear)"   },
            { label: "MKT CAP", value: fmt(mktCapB),       color: "var(--text-1)" },
            { label: "VOLUME",  value: fmt(volumeB),        color: "var(--text-1)" },
          ].map((s, i) => (
            <div key={i} style={{ flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 12, color: s.color, fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <div className="live-dot" />
          <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--bull)", letterSpacing: "0.12em" }}>LIVE</span>
        </div>
      </div>

      {/* ── Main 2-col grid ──────────────────────────────────────────────── */}
      <div className="cd-main" style={{ display: "grid", gridTemplateColumns: "1fr 290px" }}>

        {/* LEFT — chart + indicators + about + news */}
        <div style={{ borderRight: "1px solid var(--border)", minWidth: 0 }}>

          {/* Chart controls */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 18px", borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
          }}>
            <div style={{ display: "flex", gap: 2 }}>
              {TIME_RANGES.map(r => (
                <button key={r} onClick={() => setRange(r)} style={{
                  fontFamily: "var(--font-data)", fontSize: 10,
                  background: range === r ? "var(--accent-dim)" : "none",
                  color: range === r ? "var(--accent)" : "var(--text-3)",
                  border: range === r ? "1px solid rgba(139,92,246,0.4)" : "1px solid transparent",
                  borderRadius: 4, padding: "3px 9px", cursor: "pointer", transition: "all 0.15s",
                }}>{r}</button>
              ))}
            </div>
            <div style={{ width: 1, height: 16, background: "var(--border)" }} />
            <div style={{ display: "flex", gap: 1 }}>
              {CHART_TYPES.map(t => (
                <button key={t} onClick={() => setChartType(t)} style={{
                  fontFamily: "var(--font-ui)", fontSize: 10,
                  background: chartType === t ? "var(--bg-raised)" : "none",
                  color: chartType === t ? "var(--text-1)" : "var(--text-3)",
                  border: "none", borderRadius: 4, padding: "3px 9px", cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)" }}>
              {candles.length} bars
            </div>
          </div>

          {/* Chart canvas */}
          <div ref={chartContainerRef} style={{ background: "var(--bg-void)", width: "100%" }} />

          {/* Indicators strip */}
          <div style={{
            display: "flex", overflowX: "auto",
            borderTop: "1px solid var(--border)", background: "var(--bg-surface)",
          }}>
            {[
              {
                label: "RSI(14)",
                value: indicators.rsi.toFixed(1),
                color: indicators.rsi > 70 ? "var(--bear)" : indicators.rsi < 30 ? "var(--bull)" : "var(--text-2)",
                sub: indicators.rsi > 70 ? "Overbought" : indicators.rsi < 30 ? "Oversold" : "Neutral",
              },
              {
                label: "MACD",
                value: `${indicators.macd >= 0 ? "+" : ""}${indicators.macd.toFixed(0)}`,
                color: indicators.macd >= 0 ? "var(--bull)" : "var(--bear)",
                sub: `Hist ${indicators.macdHist >= 0 ? "+" : ""}${indicators.macdHist.toFixed(0)}`,
              },
              {
                label: "BB Upper",
                value: formatPrice(indicators.bbUpper),
                color: "var(--text-2)",
                sub: `Mid ${formatPrice(indicators.bbMid)}`,
              },
              {
                label: "BB Lower",
                value: formatPrice(indicators.bbLower),
                color: "var(--text-2)",
                sub: `ATR ${indicators.atr.toFixed(0)}`,
              },
              {
                label: "Signal",
                value: coin?.signal ?? "Neutral",
                color: coin?.signal === "Bullish" ? "var(--bull)" : coin?.signal === "Bearish" ? "var(--bear)" : "var(--text-2)",
                sub: `7D ${change7d >= 0 ? "+" : ""}${change7d.toFixed(2)}%`,
              },
            ].map((ind, i) => (
              <div key={i} style={{
                padding: "10px 18px", minWidth: 108, flexShrink: 0,
                borderRight: "1px solid var(--border)",
              }}>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 3 }}>{ind.label}</div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 13, fontWeight: 600, color: ind.color, marginBottom: 1 }}>{ind.value}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{ind.sub}</div>
              </div>
            ))}
          </div>

          {/* About section */}
          {info && (
            <div style={{ padding: "22px 24px", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>
                  About {coin?.name}
                </h3>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent)", background: "var(--accent-dim)", padding: "1px 7px", borderRadius: 3 }}>
                  Since {info.launchYear}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.75, marginBottom: 18 }}>
                {info.about}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { label: "Consensus",  value: info.consensus },
                  { label: "Throughput", value: info.tps       },
                  { label: "Category",   value: info.category  },
                  { label: "Max Supply", value: info.maxSupply },
                ].map((m, i) => (
                  <div key={i} style={{
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    borderRadius: 6, padding: "10px 12px",
                  }}>
                    <div className="section-label" style={{ marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-1)", fontWeight: 500 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related news */}
          <div style={{ padding: "0 24px 28px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0 12px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>
                Related News
              </h3>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)" }}>
                {relatedNews.length} articles
              </span>
            </div>
            {relatedNews.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {relatedNews.map(n => (
                  <div key={n.id} style={{
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "14px 16px", cursor: "pointer",
                    transition: "border-color 0.15s", display: "flex", flexDirection: "column",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{n.source}</span>
                      <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)" }}>{n.time}</span>
                    </div>
                    <h4 style={{
                      fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
                      color: "var(--text-1)", lineHeight: 1.5, marginBottom: 7, flex: 1,
                      display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{n.title}</h4>
                    <p style={{
                      fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)",
                      lineHeight: 1.55, marginBottom: 9,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{n.body}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 2, background: "var(--border)", borderRadius: 1, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${n.sentiment}%`, background: sentColor(n.sentiment) }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: sentColor(n.sentiment) }}>
                        {n.sentiment}% {sentLabel(n.sentiment)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "28px", textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-3)" }}>No related articles found</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — stats sidebar ──────────────────────────────────────────── */}
        <div>
          {/* Live price stats */}
          <div style={{ padding: "16px 16px 0" }}>
            <div className="section-label" style={{ marginBottom: 10 }}>LIVE STATS</div>

            {/* 24H range bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bear)" }}>{formatPrice(l24)}</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-3)", letterSpacing: "0.08em" }}>24H RANGE</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bull)" }}>{formatPrice(h24)}</span>
              </div>
              <div style={{ height: 5, background: "var(--bg-raised)", borderRadius: 3, position: "relative", overflow: "visible" }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, height: "100%", width: "100%",
                  background: "linear-gradient(90deg, rgba(248,113,113,0.2), rgba(52,211,153,0.2))",
                  borderRadius: 3,
                }} />
                <div style={{
                  position: "absolute", left: `${rangePct}%`, top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 10, height: 10, borderRadius: "50%",
                  background: "var(--bg-void)", border: "2px solid var(--accent)",
                  boxShadow: "0 0 7px rgba(139,92,246,0.6)",
                }} />
              </div>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)", textAlign: "center", marginTop: 5 }}>
                {rangePct}% of range
              </div>
            </div>

            {[
              { label: "Market Cap",   value: fmt(mktCapB),    color: "var(--text-1)"                                   },
              { label: "24H Volume",   value: fmt(volumeB),    color: "var(--text-1)"                                   },
              { label: "24H Change",   value: `${isUp ? "+" : ""}${change24h.toFixed(2)}%`, color: isUp ? "var(--bull)" : "var(--bear)" },
              { label: "7D Change",    value: `${change7d >= 0 ? "+" : ""}${change7d.toFixed(2)}%`, color: change7d >= 0 ? "var(--bull)" : "var(--bear)" },
            ].map((s, i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none",
              }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)" }}>{s.label}</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: s.color, fontWeight: 500 }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />

          {/* Supply & ATH */}
          {info && (
            <div style={{ padding: "0 16px" }}>
              <div className="section-label" style={{ marginBottom: 10 }}>SUPPLY & ATH</div>
              {[
                { label: "Circulating",  value: info.supply                                },
                { label: "Max Supply",   value: info.maxSupply                             },
                { label: "All-Time High",value: formatPrice(info.ath), color: "var(--bull)" },
                { label: "ATH Date",     value: info.athDate                               },
                { label: "From ATH",     value: `${athDist}%`, color: parseFloat(athDist) >= 0 ? "var(--bull)" : "var(--bear)" },
                { label: "All-Time Low", value: formatPrice(info.atl), color: "var(--bear)" },
                { label: "ATL Date",     value: info.atlDate                               },
              ].map((s, i, arr) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(31,31,46,0.4)" : "none",
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)" }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: (s as any).color ?? "var(--text-1)", fontWeight: 500 }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />

          {/* Analyst consensus */}
          {analyst && (
            <div style={{ padding: "0 16px" }}>
              <div className="section-label" style={{ marginBottom: 10 }}>ANALYST CONSENSUS</div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 12px", marginBottom: 11,
                background: "var(--bg-raised)", borderRadius: 6, border: "1px solid var(--border)",
              }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>
                  {analyst.consensus}
                </span>
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: 9,
                  color: targetUp ? "var(--bull)" : "var(--bear)",
                  background: targetUp ? "var(--bull-bg)" : "var(--bear-bg)",
                  padding: "2px 7px", borderRadius: 3,
                }}>
                  {targetUp ? "+" : ""}{targetDist}% target
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginBottom: 6 }}>
                Target: {formatPrice(analyst.target)}
              </div>
              <div style={{ height: 7, borderRadius: 4, overflow: "hidden", display: "flex", marginBottom: 6 }}>
                <div style={{ width: `${analyst.bull}%`,    height: "100%", background: "var(--bull)" }} />
                <div style={{ width: `${analyst.neutral}%`, height: "100%", background: "#A78BFA"      }} />
                <div style={{ flex: 1,                      height: "100%", background: "var(--bear)"  }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bull)" }}>Buy {analyst.bull}%</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "#A78BFA"     }}>Hold {analyst.neutral}%</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bear)" }}>Sell {analyst.bear}%</span>
              </div>
            </div>
          )}

          <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />

          {/* On-chain metrics */}
          {onchain && (
            <div style={{ padding: "0 16px 24px" }}>
              <div className="section-label" style={{ marginBottom: 10 }}>ON-CHAIN METRICS</div>
              {[
                { label: "Active Addresses",   value: onchain.addresses },
                { label: "Transactions / Day", value: onchain.txDay     },
                { label: "Avg Network Fee",    value: onchain.fees      },
                ...(onchain.extra ? [{ label: onchain.extra.split(":")[0], value: onchain.extra.split(":")[1]?.trim() ?? "" }] : []),
              ].map((m, i, arr) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(31,31,46,0.4)" : "none",
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)" }}>{m.label}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
