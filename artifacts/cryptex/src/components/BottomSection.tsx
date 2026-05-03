import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Plus, Bell, BellOff, ExternalLink } from "lucide-react";
import { transactions, watchlist, trending, news } from "../mockData";
import Sparkline from "./Sparkline";
import { useApp } from "../context/AppContext";

gsap.registerPlugin(ScrollTrigger);

function TransactionsCol() {
  const { formatPrice } = useApp();
  const [filter, setFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const visible = filter === "ALL" ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div className="bottom-col" style={{ padding: "20px 24px", borderRight: "1px solid var(--border)", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span className="section-label">TRANSACTIONS</span>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontSize: 10,
          color: "var(--accent)", display: "flex", alignItems: "center", gap: 2
        }}>View all <ArrowUpRight size={10} /></button>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {(["ALL", "BUY", "SELL"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: "var(--font-ui)", fontSize: 9,
            color: filter === f ? (f === "BUY" ? "var(--bull)" : f === "SELL" ? "var(--bear)" : "var(--accent)") : "var(--text-3)",
            background: filter === f ? (f === "BUY" ? "var(--bull-bg)" : f === "SELL" ? "var(--bear-bg)" : "var(--accent-dim)") : "none",
            border: `1px solid ${filter === f ? (f === "BUY" ? "var(--bull)" : f === "SELL" ? "var(--bear)" : "var(--accent)") : "var(--border)"}`,
            borderRadius: 3, padding: "2px 8px", cursor: "pointer", transition: "all 0.15s"
          }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {visible.map((tx, i) => {
          const isBuy = tx.type === "BUY";
          const isPending = tx.status === "Pending";
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto",
              alignItems: "center", gap: 10, padding: "9px 0",
              borderBottom: i < visible.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none"
            }}>
              <span style={{
                fontFamily: "var(--font-data)", fontSize: 9,
                color: isBuy ? "var(--bull)" : "var(--bear)",
                background: isBuy ? "var(--bull-bg)" : "var(--bear-bg)",
                padding: "2px 5px", borderRadius: 3, flexShrink: 0
              }}>{tx.type}</span>
              <div>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)" }}>{tx.asset} </span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-2)" }}>{tx.symbol}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>
                  {tx.amount} {tx.symbol}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>
                    {formatPrice(tx.price)}
                  </span>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{tx.date}</span>
                  {isPending
                    ? <div className="pending-dot" />
                    : <div style={{ width: 5, height: 5, background: "var(--bull)", borderRadius: "50%", opacity: 0.6 }} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div className="section-label" style={{ marginBottom: 2 }}>TOTAL BOUGHT</div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--bull)" }}>
            {formatPrice(transactions.filter(t => t.type === "BUY").reduce((s, t) => s + t.total, 0))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="section-label" style={{ marginBottom: 2 }}>TOTAL SOLD</div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--bear)" }}>
            {formatPrice(transactions.filter(t => t.type === "SELL").reduce((s, t) => s + t.total, 0))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WatchlistCol() {
  const { livePrices, formatPrice } = useApp();
  const [alerts, setAlerts] = useState<Record<string, boolean>>({ BTC: true, ETH: false, SOL: false, AVAX: false });
  const priceRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // Flash price on update
  useEffect(() => {
    for (const coin of watchlist) {
      const lp = livePrices[coin.symbol];
      if (!lp) continue;
      const el = priceRefs.current[coin.symbol];
      if (!el) continue;
      const up = lp.price >= lp.prevPrice;
      gsap.to(el, {
        color: up ? "#34D399" : "#F87171", duration: 0.08,
        onComplete: () => gsap.to(el, { color: "var(--text-1)", duration: 1 })
      });
    }
  }, [livePrices]);

  return (
    <div className="bottom-col" style={{ padding: "20px 24px", borderRight: "1px solid var(--border)", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span className="section-label">WATCHLIST</span>
        <button style={{
          background: "none", border: "1px solid var(--border-2)", borderRadius: 4, cursor: "pointer",
          fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)",
          display: "flex", alignItems: "center", gap: 3, padding: "3px 8px"
        }}>
          <Plus size={10} /> Add
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {watchlist.map((coin, i) => {
          const lp = livePrices[coin.symbol];
          const price = lp?.price ?? coin.price;
          const change = lp?.change24h ?? coin.change24h;
          const isUp = change >= 0;
          const hasAlert = alerts[coin.symbol];

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 0",
              borderBottom: i < watchlist.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)", fontWeight: 600 }}>{coin.name}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-2)" }}>{coin.symbol}</div>
                </div>
              </div>
              <Sparkline data={coin.sparkData} width={52} height={22} />
              <div style={{ textAlign: "right", marginLeft: 10, minWidth: 90 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  <span
                    ref={el => { priceRefs.current[coin.symbol] = el; }}
                    style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}
                  >
                    {formatPrice(price)}
                  </span>
                  <button
                    onClick={() => setAlerts(a => ({ ...a, [coin.symbol]: !a[coin.symbol] }))}
                    title={hasAlert ? "Alert on" : "Alert off"}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                      color: hasAlert ? "var(--accent)" : "var(--text-3)",
                      transition: "color 0.15s"
                    }}
                  >
                    {hasAlert ? <Bell size={10} /> : <BellOff size={10} />}
                  </button>
                </div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: isUp ? "var(--bull)" : "var(--bear)" }}>
                  {isUp ? "+" : ""}{change.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trending */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>🔥 TRENDING</span>
        {trending.map((t, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0",
            borderBottom: i < trending.length - 1 ? "1px solid rgba(31,31,46,0.3)" : "none"
          }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", fontWeight: 600 }}>{t.symbol}</span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)" }}>{t.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--bull)", fontWeight: 600 }}>{t.change}</span>
              <ExternalLink size={9} style={{ color: "var(--text-3)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsCol() {
  const newsRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const fills = newsRef.current?.querySelectorAll(".sentiment-fill");
    fills?.forEach((fill, i) => {
      gsap.from(fill, {
        scaleX: 0, transformOrigin: "left", duration: 0.7, ease: "power2.out",
        delay: 0.3 + i * 0.1,
      });
    });
  }, []);

  const sentimentLabel = (s: number) => s >= 65 ? "Bullish" : s < 40 ? "Bearish" : "Neutral";
  const sentimentColor = (s: number) => s >= 65 ? "var(--bull)" : s < 40 ? "var(--bear)" : "var(--accent)";

  // Sentiment overview summary
  const avgSentiment = Math.round(news.reduce((s, n) => s + n.sentiment, 0) / news.length);

  return (
    <div className="bottom-col" ref={newsRef} style={{ padding: "20px 24px", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span className="section-label">NEWS & SENTIMENT</span>
        <span style={{
          fontFamily: "var(--font-data)", fontSize: 9,
          color: sentimentColor(avgSentiment),
          background: avgSentiment >= 65 ? "var(--bull-bg)" : avgSentiment < 40 ? "var(--bear-bg)" : "var(--accent-dim)",
          padding: "2px 7px", borderRadius: 3
        }}>
          Market: {sentimentLabel(avgSentiment)} {avgSentiment}%
        </span>
      </div>

      {/* Aggregate sentiment bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", height: 3, borderRadius: 2, overflow: "hidden", gap: 1, marginBottom: 4 }}>
          {news.map((item, i) => (
            <div key={i} className="sentiment-fill" style={{
              flex: 1, height: "100%",
              background: sentimentColor(item.sentiment),
              opacity: 0.7,
              width: `${item.sentiment}%`
            }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)" }}>Bearish</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)" }}>Bullish</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {news.map((item, i) => {
          const isExpanded = expanded === i;
          return (
            <div key={i} style={{ cursor: "pointer" }} onClick={() => setExpanded(isExpanded ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: sentimentColor(item.sentiment), textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {item.source}
                </span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{item.time}</span>
              </div>
              <p style={{
                fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)",
                lineHeight: 1.5, marginBottom: 7,
                display: "-webkit-box", WebkitLineClamp: isExpanded ? 99 : 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
                transition: "all 0.2s"
              }}>
                {item.title}
              </p>
              {/* Sentiment bar */}
              <div style={{ height: 2, background: "var(--border)", borderRadius: 1, marginBottom: 6, overflow: "hidden" }}>
                <div className="sentiment-fill" style={{
                  width: `${item.sentiment}%`, height: "100%",
                  background: sentimentColor(item.sentiment),
                  borderRadius: 1
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontFamily: "var(--font-ui)", fontSize: 8,
                  color: "var(--accent)", background: "var(--accent-dim)",
                  padding: "2px 6px", borderRadius: 3
                }}>{item.category}</span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: sentimentColor(item.sentiment) }}>
                  {item.sentiment}% {sentimentLabel(item.sentiment)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BottomSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(sectionRef.current, {
      y: 20, opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.2
    });
  }, []);

  return (
    <div ref={sectionRef} className="bottom-three section" style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
      <TransactionsCol />
      <WatchlistCol />
      <NewsCol />
    </div>
  );
}
