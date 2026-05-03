import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const allNews = [
  { id: 1, source: "CoinDesk", category: "Markets", title: "Bitcoin breaks $68K resistance as institutional demand surges ahead of halving", body: "Bitcoin surged past key resistance levels as major institutions continue to accumulate. Analysts point to ETF inflows and macro uncertainty as primary drivers.", sentiment: 78, time: "2h ago", featured: true },
  { id: 2, source: "The Block", category: "Ethereum", title: "ETH staking yields compress as validator count hits new all-time high", body: "The Ethereum staking ecosystem continues to grow with over 1M validators now securing the network, pushing annual yields slightly lower.", sentiment: 42, time: "4h ago", featured: false },
  { id: 3, source: "Decrypt", category: "DeFi", title: "Solana ecosystem records all-time DEX volume in Q1 2026, surpassing Ethereum", body: "Solana-based decentralized exchanges processed over $180B in volume during Q1 2026, a new record and the first time it surpassed Ethereum.", sentiment: 65, time: "6h ago", featured: false },
  { id: 4, source: "CryptoSlate", category: "Regulation", title: "SEC approves spot Ethereum ETF options — market reacts positively", body: "The SEC gave the green light for options trading on spot Ethereum ETFs, opening up new derivatives exposure for institutional investors.", sentiment: 82, time: "8h ago", featured: false },
  { id: 5, source: "Blockworks", category: "Bitcoin", title: "MicroStrategy adds another 12,000 BTC to corporate treasury in latest purchase", body: "MicroStrategy has increased its Bitcoin holdings once again, maintaining its position as the largest corporate holder of the asset.", sentiment: 71, time: "10h ago", featured: false },
  { id: 6, source: "The Defiant", category: "DeFi", title: "Uniswap v4 hooks ecosystem explodes — 200+ custom pools now live", body: "The Uniswap v4 launch has sparked an explosion of innovation with developers deploying hundreds of custom liquidity pool configurations.", sentiment: 68, time: "12h ago", featured: false },
  { id: 7, source: "CoinTelegraph", category: "Markets", title: "Altcoin season index hits 78 — rotation out of BTC accelerating", body: "Data shows capital flowing from Bitcoin into altcoins at the highest rate since late 2021, suggesting a potential altseason is underway.", sentiment: 74, time: "1d ago", featured: false },
  { id: 8, source: "Reuters", category: "Regulation", title: "G20 nations agree on framework for crypto asset reporting standards", body: "Finance ministers from G20 nations reached a preliminary agreement on unified crypto asset reporting requirements for financial institutions.", sentiment: 55, time: "1d ago", featured: false },
];

const categories = ["All", "Markets", "Bitcoin", "Ethereum", "DeFi", "Regulation"];
const sentimentFilters = ["All", "Bullish", "Neutral", "Bearish"];

export default function NewsView() {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState("All");
  const [sentiment, setSentiment] = useState("All");

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
  }, []);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".news-card");
      gsap.from(cards, { opacity: 0, y: 12, stagger: 0.06, duration: 0.5, ease: "power2.out" });
    }
  }, [category, sentiment]);

  const filtered = allNews.filter(n => {
    const catMatch = category === "All" || n.category === category;
    const sentMatch = sentiment === "All"
      || (sentiment === "Bullish" && n.sentiment >= 60)
      || (sentiment === "Neutral" && n.sentiment >= 40 && n.sentiment < 60)
      || (sentiment === "Bearish" && n.sentiment < 40);
    return catMatch && sentMatch;
  });

  const featured = filtered.find(n => n.featured) || filtered[0];
  const rest = filtered.filter(n => n.id !== featured?.id);

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
            News & Sentiment
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
            Latest crypto news with AI sentiment analysis
          </p>
        </div>

        {/* Sentiment overview bar */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "14px 20px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 16
        }}>
          <span className="section-label" style={{ flexShrink: 0 }}>MARKET SENTIMENT</span>
          <div style={{ flex: 1, height: 6, background: "var(--bg-raised)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "65%", background: "linear-gradient(90deg, var(--bull), #A78BFA)", borderRadius: 3 }} />
          </div>
          <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 2 }}>BULLISH</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--bull)" }}>65%</div>
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: 2 }}>NEUTRAL</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>20%</div>
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: 2 }}>BEARISH</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--bear)" }}>15%</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                fontFamily: "var(--font-ui)", fontSize: 11,
                background: category === c ? "var(--accent-dim)" : "var(--bg-surface)",
                color: category === c ? "var(--accent)" : "var(--text-2)",
                border: `1px solid ${category === c ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 4, padding: "4px 10px", cursor: "pointer", transition: "all 0.15s"
              }}>{c}</button>
            ))}
          </div>
          <div className="v-divider" style={{ margin: "0 4px" }} />
          <div style={{ display: "flex", gap: 4 }}>
            {sentimentFilters.map(s => (
              <button key={s} onClick={() => setSentiment(s)} style={{
                fontFamily: "var(--font-ui)", fontSize: 11,
                background: sentiment === s ? "var(--bg-raised)" : "none",
                color: sentiment === s ? "var(--text-1)" : "var(--text-3)",
                border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer"
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div ref={cardsRef}>
        {/* Featured article */}
        {featured && (
          <div className="news-card" style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-2)",
            borderRadius: 8, padding: "20px 24px", marginBottom: 16,
            cursor: "pointer", transition: "border-color 0.15s"
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{
                  fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--accent)",
                  background: "var(--accent-dim)", padding: "2px 8px", borderRadius: 3
                }}>FEATURED</span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)", textTransform: "uppercase" }}>
                  {featured.source} · {featured.category}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{featured.time}</span>
                <ExternalLink size={11} style={{ color: "var(--text-3)" }} />
              </div>
            </div>
            <h2 style={{
              fontFamily: "var(--font-ui)", fontSize: 16, fontWeight: 600,
              color: "var(--text-1)", lineHeight: 1.4, marginBottom: 8
            }}>{featured.title}</h2>
            <p style={{
              fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)",
              lineHeight: 1.6, marginBottom: 12
            }}>{featured.body}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 2, background: "var(--border)", borderRadius: 1, overflow: "hidden", position: "relative" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${featured.sentiment}%`,
                  background: featured.sentiment >= 60 ? "var(--bull)" : featured.sentiment < 40 ? "var(--bear)" : "var(--accent)",
                  borderRadius: 1
                }} />
              </div>
              <span style={{
                fontFamily: "var(--font-data)", fontSize: 10,
                color: featured.sentiment >= 60 ? "var(--bull)" : featured.sentiment < 40 ? "var(--bear)" : "var(--text-2)"
              }}>{featured.sentiment}% Bullish</span>
            </div>
          </div>
        )}

        {/* News grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {rest.map(item => {
            const isBull = item.sentiment >= 60;
            const isBear = item.sentiment < 40;
            return (
              <div key={item.id} className="news-card" style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "16px 18px",
                cursor: "pointer", transition: "border-color 0.15s"
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{
                    fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)",
                    textTransform: "uppercase", letterSpacing: "0.1em"
                  }}>{item.source} · {item.category}</span>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{item.time}</span>
                </div>
                <h3 style={{
                  fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
                  color: "var(--text-1)", lineHeight: 1.5, marginBottom: 10,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                }}>{item.title}</h3>
                <div style={{ height: 1, background: "var(--border)", marginBottom: 8, position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, height: "100%",
                    width: `${item.sentiment}%`,
                    background: isBull ? "var(--bull)" : isBear ? "var(--bear)" : "var(--accent)"
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--accent)",
                    background: "var(--accent-dim)", padding: "2px 6px", borderRadius: 3
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
    </div>
  );
}
