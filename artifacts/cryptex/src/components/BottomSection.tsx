import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Plus, Bell, BellOff, ExternalLink, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { transactions, watchlist, trending, news } from "../mockData";
import Sparkline from "./Sparkline";
import CoinIcon from "./CoinIcon";
import { useApp } from "../context/AppContext";

gsap.registerPlugin(ScrollTrigger);

const PAGE_SIZE = 8;

function PageNav({
  page, pageCount, onPrev, onNext,
}: { page: number; pageCount: number; onPrev: () => void; onNext: () => void }) {
  if (pageCount <= 1) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      paddingTop: 8, flexShrink: 0,
    }}>
      <button
        onClick={onPrev} disabled={page === 0}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 4,
          background: page === 0 ? "none" : "var(--bg-raised)",
          border: "1px solid var(--border)",
          cursor: page === 0 ? "not-allowed" : "pointer",
          color: page === 0 ? "var(--text-3)" : "var(--text-2)",
          opacity: page === 0 ? 0.4 : 1, transition: "all 0.15s",
        }}
      ><ChevronLeft size={12} /></button>

      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {Array.from({ length: pageCount }).map((_, i) => (
          <div key={i} style={{
            width: i === page ? 16 : 5, height: 5, borderRadius: 3,
            background: i === page ? "var(--accent)" : "var(--border)",
            transition: "all 0.2s",
          }} />
        ))}
      </div>

      <button
        onClick={onNext} disabled={page === pageCount - 1}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 4,
          background: page === pageCount - 1 ? "none" : "var(--bg-raised)",
          border: "1px solid var(--border)",
          cursor: page === pageCount - 1 ? "not-allowed" : "pointer",
          color: page === pageCount - 1 ? "var(--text-3)" : "var(--text-2)",
          opacity: page === pageCount - 1 ? 0.4 : 1, transition: "all 0.15s",
        }}
      ><ChevronRight size={12} /></button>

      <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)" }}>
        {page + 1} / {pageCount}
      </span>
    </div>
  );
}

function TransactionsCol() {
  const { formatPrice, livePrices } = useApp();
  const [filter, setFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [page, setPage] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const counts = {
    ALL:  transactions.length,
    BUY:  transactions.filter(t => t.type === "BUY").length,
    SELL: transactions.filter(t => t.type === "SELL").length,
  };

  const filtered    = filter === "ALL" ? transactions : transactions.filter(t => t.type === filter);
  const pageCount   = Math.ceil(filtered.length / PAGE_SIZE);
  const visible     = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const totalBought = transactions.filter(t => t.type === "BUY" && t.status !== "Failed").reduce((s, t) => s + t.total, 0);
  const totalSold   = transactions.filter(t => t.type === "SELL").reduce((s, t) => s + t.total, 0);

  const livePnL = transactions
    .filter(t => t.type === "BUY" && t.status !== "Failed")
    .reduce((sum, tx) => {
      const lp = livePrices[tx.symbol];
      const curPrice = lp?.price ?? tx.price;
      return sum + (curPrice - tx.price) * tx.amount;
    }, 0);

  useEffect(() => { setPage(0); }, [filter]);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll(".tx-row");
    if (items?.length) {
      gsap.from(items, { opacity: 0, x: -8, stagger: 0.03, duration: 0.3, ease: "power2.out" });
    }
  }, [filter, page]);

  return (
    <div className="bottom-col" style={{ padding: "20px 24px", borderRight: "1px solid var(--border)", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="section-label">TRANSACTIONS</span>
          <span style={{
            fontFamily: "var(--font-data)", fontSize: 9,
            background: "var(--bg-raised)", color: "var(--text-3)",
            padding: "1px 6px", borderRadius: 10,
          }}>{counts.ALL}</span>
        </div>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontSize: 10,
          color: "var(--accent)", display: "flex", alignItems: "center", gap: 2,
        }}>View all <ArrowUpRight size={10} /></button>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexShrink: 0 }}>
        {(["ALL", "BUY", "SELL"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: "var(--font-ui)", fontSize: 9,
            color: filter === f ? (f === "BUY" ? "var(--bull)" : f === "SELL" ? "var(--bear)" : "var(--accent)") : "var(--text-3)",
            background: filter === f ? (f === "BUY" ? "var(--bull-bg)" : f === "SELL" ? "var(--bear-bg)" : "var(--accent-dim)") : "none",
            border: `1px solid ${filter === f ? (f === "BUY" ? "rgba(52,211,153,0.4)" : f === "SELL" ? "rgba(248,113,113,0.4)" : "var(--accent)") : "var(--border)"}`,
            borderRadius: 3, padding: "2px 8px", cursor: "pointer", transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {f}
            <span style={{ fontFamily: "var(--font-data)", fontSize: 8, opacity: filter === f ? 1 : 0.5 }}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Paged list */}
      <div ref={listRef} style={{ flex: 1, overflowY: "auto", minHeight: 0, marginRight: -4, paddingRight: 4 }}>
        {visible.map((tx, i) => {
          const isBuy     = tx.type === "BUY";
          const isPending = tx.status === "Pending";
          const isFailed  = tx.status === "Failed";
          const lp        = livePrices[tx.symbol];
          const curPrice  = lp?.price ?? tx.price;
          const pnl       = isBuy && !isFailed ? (curPrice - tx.price) * tx.amount : null;
          const pnlPct    = pnl !== null ? ((curPrice - tx.price) / tx.price) * 100 : null;
          const pnlUp     = pnl !== null && pnl >= 0;

          return (
            <div key={`${tx.symbol}-${i}`} className="tx-row" style={{
              display: "grid", gridTemplateColumns: "auto auto 1fr auto",
              alignItems: "center", gap: 8, padding: "8px 0",
              borderBottom: i < visible.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none",
              opacity: isFailed ? 0.5 : 1,
            }}>
              <span style={{
                fontFamily: "var(--font-data)", fontSize: 8,
                color: isFailed ? "var(--text-3)" : isBuy ? "var(--bull)" : "var(--bear)",
                background: isFailed ? "var(--bg-raised)" : isBuy ? "var(--bull-bg)" : "var(--bear-bg)",
                padding: "2px 5px", borderRadius: 3, flexShrink: 0, letterSpacing: "0.05em",
              }}>
                {isFailed ? "FAILED" : tx.type}
              </span>

              <CoinIcon symbol={tx.symbol} size={22} fallbackColor="#A78BFA" />

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)", fontWeight: 600 }}>{tx.asset}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)" }}>{tx.symbol}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)" }}>{tx.date}</span>
                  {isPending
                    ? <div className="pending-dot" />
                    : isFailed
                      ? <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--bear)" }}>✕ failed</span>
                      : <div style={{ width: 4, height: 4, background: "var(--bull)", borderRadius: "50%", opacity: 0.7 }} />}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>
                  {tx.amount} {tx.symbol}
                </div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)", fontWeight: 600 }}>
                  {formatPrice(tx.total)}
                </div>
                {pnl !== null && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2,
                    fontFamily: "var(--font-data)", fontSize: 9,
                    color: pnlUp ? "var(--bull)" : "var(--bear)",
                  }}>
                    {pnlUp ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                    {pnlUp ? "+" : ""}{formatPrice(Math.abs(pnl))}
                    <span style={{ opacity: 0.8 }}>({pnlUp ? "+" : ""}{pnlPct!.toFixed(1)}%)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <PageNav page={page} pageCount={pageCount} onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />

      {/* Summary */}
      <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 2 }}>TOTAL BOUGHT</div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--bull)" }}>{formatPrice(totalBought)}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: 2 }}>NET P&L</div>
          <div style={{
            fontFamily: "var(--font-data)", fontSize: 11,
            color: livePnL >= 0 ? "var(--bull)" : "var(--bear)",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            {livePnL >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {livePnL >= 0 ? "+" : ""}{formatPrice(Math.abs(livePnL))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="section-label" style={{ marginBottom: 2 }}>TOTAL SOLD</div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--bear)" }}>{formatPrice(totalSold)}</div>
        </div>
      </div>
    </div>
  );
}

function WatchlistCol() {
  const { livePrices, formatPrice } = useApp();
  const [alerts, setAlerts] = useState<Record<string, boolean>>({ BTC: true, ETH: false, SOL: false, BNB: false, LINK: false, AVAX: false });
  const priceRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    for (const coin of watchlist) {
      const lp = livePrices[coin.symbol];
      if (!lp) continue;
      const el = priceRefs.current[coin.symbol];
      if (!el) continue;
      const up = lp.price >= lp.prevPrice;
      gsap.to(el, {
        color: up ? "#34D399" : "#F87171", duration: 0.08,
        onComplete: () => gsap.to(el, { color: "var(--text-1)", duration: 1 }),
      });
    }
  }, [livePrices]);

  return (
    <div className="bottom-col" style={{ padding: "20px 24px", borderRight: "1px solid var(--border)", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexShrink: 0 }}>
        <span className="section-label">WATCHLIST</span>
        <button style={{
          background: "none", border: "1px solid var(--border-2)", borderRadius: 4, cursor: "pointer",
          fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)",
          display: "flex", alignItems: "center", gap: 3, padding: "3px 8px",
        }}>
          <Plus size={10} /> Add
        </button>
      </div>

      {/* Coin list — natural height, evenly spaced */}
      <div style={{ flexShrink: 0 }}>
        {watchlist.map((coin, i) => {
          const lp       = livePrices[coin.symbol];
          const price    = lp?.price ?? coin.price;
          const change   = lp?.change24h ?? coin.change24h;
          const isUp     = change >= 0;
          const hasAlert = alerts[coin.symbol];

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 0",
              borderBottom: i < watchlist.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                <CoinIcon symbol={coin.symbol} size={26} fallbackColor="#A78BFA" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)", fontWeight: 600 }}>{coin.name}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-2)" }}>{coin.symbol}</div>
                </div>
              </div>
              <Sparkline data={coin.sparkData} width={46} height={22} />
              <div style={{ textAlign: "right", marginLeft: 8, minWidth: 88 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
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
                      transition: "color 0.15s",
                    }}
                  >
                    {hasAlert ? <Bell size={10} /> : <BellOff size={10} />}
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 2 }}>
                  {isUp ? <TrendingUp size={8} style={{ color: "var(--bull)" }} /> : <TrendingDown size={8} style={{ color: "var(--bear)" }} />}
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: isUp ? "var(--bull)" : "var(--bear)" }}>
                    {isUp ? "+" : ""}{change.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spacer pushes trending to bottom */}
      <div style={{ flex: 1 }} />

      {/* Trending — pinned to bottom */}
      <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>🔥 TRENDING</span>
        {trending.map((t, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "5px 0",
            borderBottom: i < trending.length - 1 ? "1px solid rgba(31,31,46,0.3)" : "none",
          }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <CoinIcon symbol={t.symbol} size={14} fallbackColor="#A78BFA" />
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", fontWeight: 600 }}>{t.symbol}</span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)" }}>{t.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
  const newsRef   = useRef<HTMLDivElement>(null);
  const cardsRef  = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hovered,  setHovered]  = useState<number | null>(null);
  const [page,     setPage]     = useState(0);

  const pageCount  = Math.ceil(news.length / PAGE_SIZE);
  const pageSlice  = news.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const sentimentLabel = (s: number) => s >= 65 ? "Bullish" : s < 40 ? "Bearish" : "Neutral";
  const sentimentColor = (s: number) => s >= 65 ? "var(--bull)" : s < 40 ? "var(--bear)" : "var(--accent)";
  const sentimentBg    = (s: number) => s >= 65 ? "var(--bull-bg)" : s < 40 ? "var(--bear-bg)" : "var(--accent-dim)";

  const avgSentiment = Math.round(news.reduce((s, n) => s + n.sentiment, 0) / news.length);

  useEffect(() => {
    const fills = newsRef.current?.querySelectorAll(".sentiment-fill");
    fills?.forEach((fill, i) => {
      gsap.from(fill, { scaleX: 0, transformOrigin: "left", duration: 0.65, ease: "power2.out", delay: 0.2 + i * 0.07 });
    });
  }, []);

  useEffect(() => {
    setExpanded(null);
    const cards = cardsRef.current?.querySelectorAll(".news-card");
    if (cards?.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [page]);

  return (
    <div className="bottom-col" ref={newsRef} style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexShrink: 0 }}>
        <span className="section-label">NEWS & SENTIMENT</span>
        <span style={{
          fontFamily: "var(--font-data)", fontSize: 9,
          color: sentimentColor(avgSentiment),
          background: sentimentBg(avgSentiment),
          padding: "2px 7px", borderRadius: 3,
        }}>
          Market: {sentimentLabel(avgSentiment)} {avgSentiment}%
        </span>
      </div>

      {/* Aggregate sentiment bar */}
      <div style={{ marginBottom: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", gap: 2, marginBottom: 4 }}>
          {news.map((item, i) => (
            <div key={i} className="sentiment-fill" style={{
              flex: 1, height: "100%", borderRadius: 2,
              background: sentimentColor(item.sentiment), opacity: 0.75,
            }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)" }}>Bearish</span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)" }}>Bullish</span>
        </div>
      </div>

      {/* News cards for this page */}
      <div ref={cardsRef} style={{ flex: 1, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {pageSlice.map((item, i) => {
          const globalIdx  = page * PAGE_SIZE + i;
          const isExpanded = expanded === globalIdx;
          const isHovered  = hovered  === globalIdx;
          const accent     = sentimentColor(item.sentiment);

          return (
            <div
              key={globalIdx}
              className="news-card"
              onClick={() => setExpanded(isExpanded ? null : globalIdx)}
              onMouseEnter={() => setHovered(globalIdx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flexShrink: 0, cursor: "pointer",
                background: isHovered ? "var(--bg-hover)" : "var(--bg-raised)",
                border: `1px solid ${isHovered ? accent + "55" : "var(--border)"}`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: 8,
                padding: "10px 12px",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              {/* Source + time */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontFamily: "var(--font-ui)", fontSize: 8, fontWeight: 700,
                    color: accent, textTransform: "uppercase", letterSpacing: "0.12em",
                  }}>{item.source}</span>
                  <span style={{
                    fontFamily: "var(--font-ui)", fontSize: 8,
                    color: "var(--accent)", background: "var(--accent-dim)",
                    padding: "1px 5px", borderRadius: 3,
                  }}>{item.category}</span>
                </div>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{item.time}</span>
              </div>

              {/* Headline */}
              <p style={{
                fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)",
                lineHeight: 1.5, margin: "0 0 8px",
                display: "-webkit-box", WebkitLineClamp: isExpanded ? 99 : 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
                transition: "all 0.2s",
              }}>
                {item.title}
              </p>

              {/* Sentiment row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div className="sentiment-fill" style={{
                    width: `${item.sentiment}%`, height: "100%",
                    background: accent, borderRadius: 2,
                  }} />
                </div>
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: 9, fontWeight: 600,
                  color: accent, background: sentimentBg(item.sentiment),
                  padding: "1px 6px", borderRadius: 3, flexShrink: 0,
                }}>
                  {item.sentiment}% {sentimentLabel(item.sentiment)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <PageNav page={page} pageCount={pageCount} onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />
    </div>
  );
}

export default function BottomSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(sectionRef.current, { y: 20, opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.2 });
  }, []);

  return (
    <div ref={sectionRef} className="bottom-three section" style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
      <TransactionsCol />
      <WatchlistCol />
      <NewsCol />
    </div>
  );
}
