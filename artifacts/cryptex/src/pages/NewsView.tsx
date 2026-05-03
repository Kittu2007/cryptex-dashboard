import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink, Search } from "lucide-react";
import { trending } from "../mockData";

gsap.registerPlugin(ScrollTrigger);

const allNews = [
  { id: 1,  source: "CoinDesk",       category: "Markets",    title: "Bitcoin breaks $68K resistance as institutional demand surges ahead of halving",           body: "Bitcoin surged past key resistance levels as major institutions continue to accumulate. Analysts point to ETF inflows and macro uncertainty as primary drivers of the move.",                                                                        sentiment: 78, time: "2h ago",  featured: true  },
  { id: 2,  source: "The Block",       category: "Ethereum",   title: "ETH staking yields compress as validator count hits new all-time high",                    body: "The Ethereum staking ecosystem continues to grow with over 1M validators now securing the network, pushing annual yields slightly lower as competition intensifies.",                                                                             sentiment: 42, time: "4h ago",  featured: false },
  { id: 3,  source: "Decrypt",         category: "DeFi",       title: "Solana ecosystem records all-time DEX volume in Q1 2026, surpassing Ethereum",             body: "Solana-based decentralized exchanges processed over $180B in volume during Q1 2026, the first time it surpassed Ethereum in the same period.",                                                                                                   sentiment: 65, time: "6h ago",  featured: false },
  { id: 4,  source: "Bloomberg",       category: "Macro",      title: "Fed signals rate cuts could accelerate crypto rally through H2 2026",                      body: "Federal Reserve officials hinted at a faster pace of rate reductions in their latest minutes, sending risk assets including Bitcoin and Ether sharply higher.",                                                                                     sentiment: 71, time: "9h ago",  featured: false },
  { id: 5,  source: "Blockworks",      category: "Regulation", title: "SEC approves spot Ethereum ETF options, opening $18B in institutional exposure",           body: "The SEC gave the green light for options trading on spot Ethereum ETFs, a watershed moment that analysts say could unlock billions in additional institutional flows.",                                                                            sentiment: 83, time: "12h ago", featured: false },
  { id: 6,  source: "CoinTelegraph",   category: "Altcoins",   title: "Chainlink CCIP adoption hits 500 protocols — analyst targets $30 by Q3",                  body: "Chainlink's cross-chain interoperability protocol has now been integrated by over 500 protocols, prompting several analysts to revise their price targets sharply higher.",                                                                       sentiment: 38, time: "1d ago",  featured: false },
  { id: 7,  source: "CoinDesk",        category: "Bitcoin",    title: "MicroStrategy adds 15,000 BTC to treasury, total holdings cross 400,000 coins",           body: "MicroStrategy has once again topped up its Bitcoin treasury, crossing the 400,000 BTC milestone and cementing its position as the world's largest corporate holder.",                                                                            sentiment: 89, time: "1d ago",  featured: false },
  { id: 8,  source: "Reuters",         category: "Macro",      title: "G20 agrees on crypto tax framework, placing pressure on offshore DeFi platforms",          body: "Finance ministers from G20 nations reached a preliminary agreement on unified crypto asset reporting requirements, raising concerns over the future of permissionless DeFi.",                                                                    sentiment: 32, time: "1d ago",  featured: false },
  { id: 9,  source: "The Defiant",     category: "DeFi",       title: "Uniswap v4 hooks drive $2B TVL migration within first week of mainnet launch",             body: "The Uniswap v4 mainnet launch sparked an unprecedented wave of TVL migration as developers deployed hundreds of custom hook-enabled pools within days.",                                                                                         sentiment: 74, time: "2d ago",  featured: false },
  { id: 10, source: "Financial Times", category: "Macro",      title: "BlackRock crypto AUM crosses $50B milestone driven by spot Bitcoin ETF inflows",           body: "BlackRock's crypto assets under management crossed a record $50 billion, driven primarily by its IBIT spot Bitcoin ETF which saw its largest week of inflows since launch.",                                                                    sentiment: 76, time: "2d ago",  featured: false },
  { id: 11, source: "CoinTelegraph",   category: "Layer2",     title: "Ethereum L2 networks process 10× more daily transactions than mainnet for first time",     body: "Optimism, Arbitrum, Base and zkSync combined processed over 10 million daily transactions, far outpacing Ethereum mainnet for the first time in history.",                                                                                    sentiment: 68, time: "3d ago",  featured: false },
  { id: 12, source: "Watcher.Guru",    category: "XRP",        title: "XRP futures open interest surges 340% as SEC ETF decision deadline approaches",            body: "Derivatives markets are pricing in an imminent SEC decision on XRP spot ETF applications, with open interest exploding across major exchanges in the past week.",                                                                               sentiment: 29, time: "3d ago",  featured: false },
  { id: 13, source: "Blockworks",      category: "Staking",    title: "Ethereum validator queue clears to zero as staking yields stabilize near 4.2% APR",       body: "The Ethereum validator queue has fully cleared for the first time since the Merge, a sign that staking demand has stabilized and that yields may remain steady going forward.",                                                                    sentiment: 55, time: "4d ago",  featured: false },
  { id: 14, source: "Decrypt",         category: "Gaming",     title: "Web3 gaming daily active wallets double in 2026, surpassing 12M across all chains",        body: "Blockchain gaming crossed the 12 million daily active wallet milestone in early 2026, doubling year-on-year as AAA titles integrate on-chain economies for the first time.",                                                                    sentiment: 61, time: "4d ago",  featured: false },
];

const newsCategories = ["All", "Markets", "Bitcoin", "Ethereum", "DeFi", "Macro", "Regulation", "Layer2", "Altcoins", "Staking", "Gaming", "XRP"];
const sentimentFilters = ["All", "Bullish", "Neutral", "Bearish"];

function sentimentColor(s: number) {
  if (s >= 60) return "var(--bull)";
  if (s < 40)  return "var(--bear)";
  return "var(--accent)";
}
function sentimentLabel(s: number) {
  if (s >= 60) return "Bullish";
  if (s < 40)  return "Bearish";
  return "Neutral";
}

export default function NewsView() {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef  = useRef<HTMLDivElement>(null);
  const [category,  setCategory]  = useState("All");
  const [sentiment, setSentiment] = useState("All");
  const [search, setSearch]       = useState("");

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
  }, []);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".news-card");
      gsap.from(cards, { opacity: 0, y: 12, stagger: 0.05, duration: 0.45, ease: "power2.out" });
    }
  }, [category, sentiment, search]);

  const filtered = allNews.filter(n => {
    const q        = search.toLowerCase();
    const matchSearch = !search || n.title.toLowerCase().includes(q) || n.source.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
    const catMatch = category === "All" || n.category === category;
    const sentMatch =
      sentiment === "All" ||
      (sentiment === "Bullish" && n.sentiment >= 60) ||
      (sentiment === "Neutral" && n.sentiment >= 40 && n.sentiment < 60) ||
      (sentiment === "Bearish" && n.sentiment < 40);
    return matchSearch && catMatch && sentMatch;
  });

  const featured = filtered.find(n => n.featured) ?? filtered[0];
  const rest     = filtered.filter(n => n.id !== featured?.id);

  // Compute overall sentiment from filtered items
  const avgSent   = filtered.length ? Math.round(filtered.reduce((s, n) => s + n.sentiment, 0) / filtered.length) : 0;
  const bullCount = filtered.filter(n => n.sentiment >= 60).length;
  const bearCount = filtered.filter(n => n.sentiment < 40).length;
  const neutCount = filtered.length - bullCount - bearCount;
  const total     = filtered.length || 1;

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
            News & Sentiment
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
            {allNews.length} articles · AI sentiment analysis · updated live
          </p>
        </div>

        {/* Sentiment bar */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "13px 20px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 16
        }}>
          <span className="section-label" style={{ flexShrink: 0 }}>MARKET SENTIMENT</span>
          <div style={{ flex: 1, height: 6, background: "var(--bg-raised)", borderRadius: 3, overflow: "hidden", display: "flex", gap: 1 }}>
            <div style={{ width: `${bullCount / total * 100}%`, height: "100%", background: "var(--bull)", transition: "width 0.4s" }} />
            <div style={{ width: `${neutCount / total * 100}%`, height: "100%", background: "#A78BFA", transition: "width 0.4s" }} />
            <div style={{ flex: 1, height: "100%", background: "var(--bear)", transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
            {[
              { label: "BULLISH", val: `${Math.round(bullCount / total * 100)}%`, color: "var(--bull)" },
              { label: "NEUTRAL", val: `${Math.round(neutCount / total * 100)}%`, color: "#A78BFA"      },
              { label: "BEARISH", val: `${Math.round(bearCount / total * 100)}%`, color: "var(--bear)"  },
              { label: "AVG SCORE",  val: `${avgSent}`,                            color: sentimentColor(avgSent) },
            ].map((s, i) => (
              <div key={i}>
                <div className="section-label" style={{ marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news…"
              style={{
                width: 185, padding: "7px 10px 7px 28px",
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-1)", fontFamily: "var(--font-ui)", fontSize: 11, outline: "none"
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Category tabs (scrollable) */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {newsCategories.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                fontFamily: "var(--font-ui)", fontSize: 10,
                background: category === c ? "var(--accent-dim)" : "var(--bg-surface)",
                color: category === c ? "var(--accent)" : "var(--text-2)",
                border: `1px solid ${category === c ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 4, padding: "4px 9px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap"
              }}>{c}</button>
            ))}
          </div>

          {/* Sentiment filter */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
            {sentimentFilters.map(s => (
              <button key={s} onClick={() => setSentiment(s)} style={{
                fontFamily: "var(--font-ui)", fontSize: 10,
                background: sentiment === s ? "var(--bg-raised)" : "none",
                color: sentiment === s ? "var(--text-1)" : "var(--text-3)",
                border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer"
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-column layout: [main content (2/3)] + [sidebar (1/3)] */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>

        {/* Left: featured + grid */}
        <div ref={cardsRef}>
          {featured ? (
            <>
              {/* Featured article */}
              <div className="news-card" style={{
                background: "var(--bg-surface)", border: "1px solid var(--border-2)",
                borderRadius: 8, padding: "20px 24px", marginBottom: 14,
                cursor: "pointer", transition: "border-color 0.15s"
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{
                      fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--accent)",
                      background: "var(--accent-dim)", padding: "2px 8px", borderRadius: 3, letterSpacing: "0.08em"
                    }}>FEATURED</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {featured.source} · {featured.category}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{featured.time}</span>
                    <ExternalLink size={11} style={{ color: "var(--text-3)" }} />
                  </div>
                </div>
                <h2 style={{
                  fontFamily: "var(--font-ui)", fontSize: 17, fontWeight: 600,
                  color: "var(--text-1)", lineHeight: 1.45, marginBottom: 9
                }}>{featured.title}</h2>
                <p style={{
                  fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)",
                  lineHeight: 1.65, marginBottom: 14
                }}>{featured.body}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${featured.sentiment}%`,
                      background: sentimentColor(featured.sentiment), borderRadius: 2, transition: "width 0.5s"
                    }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: sentimentColor(featured.sentiment), flexShrink: 0 }}>
                    {featured.sentiment}% {sentimentLabel(featured.sentiment)}
                  </span>
                </div>
              </div>

              {/* 2-col news grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {rest.map(item => (
                  <div key={item.id} className="news-card" style={{
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "14px 16px",
                    cursor: "pointer", transition: "border-color 0.15s", display: "flex", flexDirection: "column"
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{
                        fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)",
                        textTransform: "uppercase", letterSpacing: "0.08em"
                      }}>{item.source}</span>
                      <span style={{ fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--text-3)" }}>{item.time}</span>
                    </div>
                    <h3 style={{
                      fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
                      color: "var(--text-1)", lineHeight: 1.5, marginBottom: 7, flex: 1,
                      display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
                    }}>{item.title}</h3>
                    <p style={{
                      fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)",
                      lineHeight: 1.55, marginBottom: 10,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                    }}>{item.body}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 2, background: "var(--border)", borderRadius: 1, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${item.sentiment}%`,
                          background: sentimentColor(item.sentiment)
                        }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 8, color: sentimentColor(item.sentiment), flexShrink: 0 }}>
                        {item.sentiment}%
                      </span>
                      <span style={{
                        fontFamily: "var(--font-ui)", fontSize: 8, color: "var(--accent)",
                        background: "var(--accent-dim)", padding: "1px 5px", borderRadius: 2, flexShrink: 0
                      }}>{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--text-3)", fontFamily: "var(--font-ui)", fontSize: 13 }}>
                  No articles match your filters
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--text-3)", fontFamily: "var(--font-ui)", fontSize: 13 }}>
              No articles match your filters
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          {/* Trending */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "16px", marginBottom: 14
          }}>
            <div className="section-label" style={{ marginBottom: 12 }}>TRENDING NOW</div>
            {trending.map((t, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0",
                borderBottom: i < trending.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)", width: 14 }}>#{i + 1}</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{t.symbol}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)" }}>{t.name}</div>
                  </div>
                </div>
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: 11, fontWeight: 600, color: "var(--bull)"
                }}>{t.change}</span>
              </div>
            ))}
          </div>

          {/* Article count */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "14px 16px", marginBottom: 14
          }}>
            <div className="section-label" style={{ marginBottom: 10 }}>FILTERED RESULTS</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              {filtered.length}
            </div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)" }}>
              articles of {allNews.length} total
            </div>
          </div>

          {/* Top sources */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "14px 16px", marginBottom: 14
          }}>
            <div className="section-label" style={{ marginBottom: 10 }}>TOP SOURCES</div>
            {(["CoinDesk", "Blockworks", "Decrypt", "CoinTelegraph", "The Block"] as const).map((src, i) => {
              const count = allNews.filter(n => n.source === src).length;
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: i < 4 ? "1px solid rgba(31,31,46,0.4)" : "none"
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)" }}>{src}</span>
                  <span style={{
                    fontFamily: "var(--font-data)", fontSize: 10, color: "var(--accent)",
                    background: "var(--accent-dim)", padding: "1px 7px", borderRadius: 3
                  }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Topic tags */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
            <div className="section-label" style={{ marginBottom: 10 }}>TOPICS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Bitcoin", "Ethereum", "DeFi", "Macro", "Layer2", "Regulation", "Altcoins", "Staking", "Gaming", "XRP"].map((tag, i) => {
                const cnt = allNews.filter(n => n.category === tag).length;
                return (
                  <button key={i} onClick={() => setCategory(prev => prev === tag ? "All" : tag)} style={{
                    fontFamily: "var(--font-ui)", fontSize: 9,
                    background: category === tag ? "var(--accent-dim)" : "var(--bg-raised)",
                    color: category === tag ? "var(--accent)" : "var(--text-3)",
                    border: `1px solid ${category === tag ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 4, padding: "3px 8px", cursor: "pointer", transition: "all 0.15s"
                  }}>
                    {tag} <span style={{ opacity: 0.6 }}>({cnt})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
