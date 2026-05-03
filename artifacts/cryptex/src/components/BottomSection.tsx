import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Plus } from "lucide-react";
import { transactions, watchlist, trending, news } from "../mockData";
import Sparkline from "./Sparkline";

gsap.registerPlugin(ScrollTrigger);

function TransactionsCol() {
  return (
    <div className="bottom-col" style={{ padding: "20px 24px", borderRight: "1px solid var(--border)", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span className="section-label">TRANSACTIONS</span>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontSize: 10,
          color: "var(--accent)", display: "flex", alignItems: "center", gap: 2
        }}>
          View all <ArrowUpRight size={10} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {transactions.map((tx, i) => {
          const isBuy = tx.type === "BUY";
          const isPending = tx.status === "Pending";
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              alignItems: "center",
              gap: 10,
              padding: "9px 0",
              borderBottom: i < transactions.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none"
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
                    ${tx.price.toLocaleString()}
                  </span>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{tx.date}</span>
                  {isPending
                    ? <div className="pending-dot" />
                    : <div style={{ width: 5, height: 5, background: "var(--text-3)", borderRadius: "50%" }} />
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WatchlistCol() {
  return (
    <div className="bottom-col" style={{ padding: "20px 24px", borderRight: "1px solid var(--border)", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span className="section-label">WATCHLIST</span>
        <button style={{
          background: "none", border: "1px solid var(--border-2)",
          borderRadius: 4, cursor: "pointer",
          fontFamily: "var(--font-ui)", fontSize: 10,
          color: "var(--text-2)", display: "flex", alignItems: "center", gap: 3,
          padding: "3px 8px"
        }}>
          <Plus size={10} /> Add
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {watchlist.map((coin, i) => {
          const isUp = coin.change24h >= 0;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: i < watchlist.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none"
            }}>
              <div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)", fontWeight: 600 }}>{coin.name}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-2)" }}>{coin.symbol}</div>
              </div>
              <Sparkline data={coin.sparkData} width={60} height={22} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>
                  ${coin.price < 10 ? coin.price.toFixed(2) : coin.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: isUp ? "var(--bull)" : "var(--bear)" }}>
                  {isUp ? "+" : ""}{coin.change24h.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trending */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>TRENDING</span>
        {trending.map((t, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "5px 0"
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", fontWeight: 600 }}>{t.symbol}</span>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)" }}>{t.name}</span>
            </div>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--bull)" }}>{t.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsCol() {
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fills = newsRef.current?.querySelectorAll(".sentiment-fill");
    fills?.forEach(fill => {
      gsap.from(fill, {
        scaleX: 0,
        transformOrigin: "left",
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: newsRef.current,
          start: "top 85%",
          once: true
        }
      });
    });
  }, []);

  return (
    <div className="bottom-col" ref={newsRef} style={{ padding: "20px 24px", flex: 1 }}>
      <span className="section-label" style={{ display: "block", marginBottom: 14 }}>NEWS & SENTIMENT</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {news.map((item, i) => {
          const isBull = item.sentiment >= 60;
          const isBear = item.sentiment < 40;
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {item.source}
                </span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{item.time}</span>
              </div>
              <p style={{
                fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)",
                lineHeight: 1.5, marginBottom: 8,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
              }}>
                {item.title}
              </p>
              <div className="sentiment-bar-bg" style={{ marginBottom: 6 }}>
                <div
                  className="sentiment-fill"
                  style={{
                    width: `${item.sentiment}%`,
                    height: "100%",
                    background: isBull ? "var(--bull)" : isBear ? "var(--bear)" : "var(--accent)"
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontFamily: "var(--font-ui)", fontSize: 8,
                  color: "var(--accent)",
                  background: "var(--accent-dim)",
                  padding: "2px 6px", borderRadius: 3
                }}>{item.category}</span>
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: 9,
                  color: isBull ? "var(--bull)" : isBear ? "var(--bear)" : "var(--text-2)"
                }}>{item.sentiment}% {isBull ? "Bullish" : isBear ? "Bearish" : "Neutral"}</span>
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
      y: 30, opacity: 0, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true }
    });
  }, []);

  return (
    <div ref={sectionRef} className="bottom-three section" style={{
      display: "flex",
      borderTop: "1px solid var(--border)"
    }}>
      <TransactionsCol />
      <WatchlistCol />
      <NewsCol />
    </div>
  );
}
