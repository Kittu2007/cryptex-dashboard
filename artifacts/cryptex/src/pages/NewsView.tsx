import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink, Search, TrendingUp, Flame } from "lucide-react";
import { trending } from "../mockData";
import CoinIcon from "../components/CoinIcon";

gsap.registerPlugin(ScrollTrigger);

/* ── Data ─────────────────────────────────────────────────────────────────── */
const allNews = [
  { id: 1,  source: "CoinDesk",       category: "Markets",    title: "Bitcoin breaks $68K resistance as institutional demand surges ahead of halving",          body: "Bitcoin surged past key resistance levels as major institutions continue to accumulate. Analysts point to ETF inflows and macro uncertainty as primary drivers of the move.",                                                                        sentiment: 78, time: "2h ago",  featured: true  },
  { id: 2,  source: "The Block",      category: "Ethereum",   title: "ETH staking yields compress as validator count hits new all-time high",                   body: "The Ethereum staking ecosystem continues to grow with over 1M validators now securing the network, pushing annual yields slightly lower as competition intensifies.",                                                                             sentiment: 42, time: "4h ago",  featured: false },
  { id: 3,  source: "Decrypt",        category: "DeFi",       title: "Solana ecosystem records all-time DEX volume in Q1 2026, surpassing Ethereum",            body: "Solana-based decentralized exchanges processed over $180B in volume during Q1 2026, the first time it surpassed Ethereum in the same period.",                                                                                                   sentiment: 65, time: "6h ago",  featured: false },
  { id: 4,  source: "Bloomberg",      category: "Macro",      title: "Fed signals rate cuts could accelerate crypto rally through H2 2026",                     body: "Federal Reserve officials hinted at a faster pace of rate reductions in their latest minutes, sending risk assets including Bitcoin and Ether sharply higher.",                                                                                     sentiment: 71, time: "9h ago",  featured: false },
  { id: 5,  source: "Blockworks",     category: "Regulation", title: "SEC approves spot Ethereum ETF options, opening $18B in institutional exposure",          body: "The SEC gave the green light for options trading on spot Ethereum ETFs, a watershed moment that analysts say could unlock billions in additional institutional flows.",                                                                            sentiment: 83, time: "12h ago", featured: false },
  { id: 6,  source: "CoinTelegraph", category: "Altcoins",   title: "Chainlink CCIP adoption hits 500 protocols — analyst targets $30 by Q3",                 body: "Chainlink's cross-chain interoperability protocol has now been integrated by over 500 protocols, prompting several analysts to revise their price targets sharply higher.",                                                                       sentiment: 38, time: "1d ago",  featured: false },
  { id: 7,  source: "CoinDesk",      category: "Bitcoin",    title: "MicroStrategy adds 15,000 BTC to treasury, total holdings cross 400,000 coins",          body: "MicroStrategy has once again topped up its Bitcoin treasury, crossing the 400,000 BTC milestone and cementing its position as the world's largest corporate holder.",                                                                            sentiment: 89, time: "1d ago",  featured: false },
  { id: 8,  source: "Reuters",       category: "Macro",      title: "G20 agrees on crypto tax framework, placing pressure on offshore DeFi platforms",         body: "Finance ministers from G20 nations reached a preliminary agreement on unified crypto asset reporting requirements, raising concerns over the future of permissionless DeFi.",                                                                    sentiment: 32, time: "1d ago",  featured: false },
  { id: 9,  source: "The Defiant",   category: "DeFi",       title: "Uniswap v4 hooks drive $2B TVL migration within first week of mainnet launch",            body: "The Uniswap v4 mainnet launch sparked an unprecedented wave of TVL migration as developers deployed hundreds of custom hook-enabled pools within days.",                                                                                         sentiment: 74, time: "2d ago",  featured: false },
  { id: 10, source: "Financial Times",category: "Macro",     title: "BlackRock crypto AUM crosses $50B milestone driven by spot Bitcoin ETF inflows",          body: "BlackRock's crypto assets under management crossed a record $50 billion, driven primarily by its IBIT spot Bitcoin ETF which saw its largest week of inflows since launch.",                                                                    sentiment: 76, time: "2d ago",  featured: false },
  { id: 11, source: "CoinTelegraph", category: "Layer2",     title: "Ethereum L2 networks process 10× more daily transactions than mainnet for first time",    body: "Optimism, Arbitrum, Base and zkSync combined processed over 10 million daily transactions, far outpacing Ethereum mainnet for the first time in history.",                                                                                    sentiment: 68, time: "3d ago",  featured: false },
  { id: 12, source: "Watcher.Guru",  category: "XRP",        title: "XRP futures open interest surges 340% as SEC ETF decision deadline approaches",           body: "Derivatives markets are pricing in an imminent SEC decision on XRP spot ETF applications, with open interest exploding across major exchanges in the past week.",                                                                               sentiment: 29, time: "3d ago",  featured: false },
  { id: 13, source: "Blockworks",    category: "Staking",    title: "Ethereum validator queue clears to zero as staking yields stabilize near 4.2% APR",      body: "The Ethereum validator queue has fully cleared for the first time since the Merge, a sign that staking demand has stabilized and that yields may remain steady going forward.",                                                                    sentiment: 55, time: "4d ago",  featured: false },
  { id: 14, source: "Decrypt",       category: "Gaming",     title: "Web3 gaming daily active wallets double in 2026, surpassing 12M across all chains",       body: "Blockchain gaming crossed the 12 million daily active wallet milestone in early 2026, doubling year-on-year as AAA titles integrate on-chain economies for the first time.",                                                                    sentiment: 61, time: "4d ago",  featured: false },
];

const newsCategories = ["All", "Markets", "Bitcoin", "Ethereum", "DeFi", "Macro", "Regulation", "Layer2", "Altcoins", "Staking", "Gaming", "XRP"];

/* ── Category color palette ─────────────────────────────────────────────── */
const CAT_COLOR: Record<string, string> = {
  Markets:    "#3B82F6",
  Bitcoin:    "#F7931A",
  Ethereum:   "#627EEA",
  DeFi:       "#14B8A6",
  Macro:      "#F59E0B",
  Regulation: "#EF4444",
  Layer2:     "#8B5CF6",
  Altcoins:   "#EC4899",
  Staking:    "#22C55E",
  Gaming:     "#6366F1",
  XRP:        "#00B4D8",
};

/* ── Source initials badge color ─────────────────────────────────────────── */
const SRC_COLOR: Record<string, string> = {
  "CoinDesk":       "#3B82F6",
  "The Block":      "#6366F1",
  "Decrypt":        "#F59E0B",
  "Bloomberg":      "#22C55E",
  "Blockworks":     "#EC4899",
  "CoinTelegraph":  "#F7931A",
  "Reuters":        "#EF4444",
  "The Defiant":    "#14B8A6",
  "Financial Times":"#8B5CF6",
  "Watcher.Guru":   "#00B4D8",
};

function srcInitials(src: string) {
  return src.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function readTime(body: string) {
  return `${Math.max(1, Math.round(body.split(" ").length / 200))} min read`;
}

/* ── Sentiment helpers ───────────────────────────────────────────────────── */
function sentimentColor(s: number) {
  if (s >= 60) return "var(--bull)";
  if (s < 40)  return "var(--bear)";
  return "var(--accent)";
}
function sentimentBg(s: number) {
  if (s >= 60) return "rgba(34,197,94,0.12)";
  if (s < 40)  return "rgba(239,68,68,0.12)";
  return "rgba(59,130,246,0.12)";
}
function sentimentLabel(s: number) {
  if (s >= 60) return "Bullish";
  if (s < 40)  return "Bearish";
  return "Neutral";
}

/* ── Source Avatar ───────────────────────────────────────────────────────── */
function SourceBadge({ source, size = 28 }: { source: string; size?: number }) {
  const color = SRC_COLOR[source] ?? "#6B7280";
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: `${color}22`, border: `1px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: size * 0.38, fontWeight: 700, color }}>{srcInitials(source)}</span>
    </div>
  );
}

/* ── Category Pill ───────────────────────────────────────────────────────── */
function CatPill({ category, onClick, active }: { category: string; onClick?: () => void; active?: boolean }) {
  const color = CAT_COLOR[category] ?? "#6B7280";
  return (
    <button onClick={onClick} style={{
      fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 600,
      color: active ? "#fff" : color,
      background: active ? color : `${color}18`,
      border: `1px solid ${color}44`,
      borderRadius: 4, padding: "2px 7px", cursor: onClick ? "pointer" : "default",
      letterSpacing: "0.04em", transition: "all 0.15s", whiteSpace: "nowrap",
    }}>{category}</button>
  );
}

/* ── Sentiment Score Badge ───────────────────────────────────────────────── */
function SentimentBadge({ score }: { score: number }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      background: sentimentBg(score),
      border: `1px solid ${sentimentColor(score)}33`,
      borderRadius: 5, padding: "3px 8px",
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: sentimentColor(score), flexShrink: 0 }} />
      <span style={{ fontFamily: "var(--font-data)", fontSize: 10, fontWeight: 600, color: sentimentColor(score) }}>
        {score}
      </span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: sentimentColor(score), opacity: 0.8 }}>
        {sentimentLabel(score)}
      </span>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function NewsView() {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef  = useRef<HTMLDivElement>(null);

  const [category,  setCategory]  = useState("All");
  const [sentFilter, setSentFilter] = useState<"All" | "Bullish" | "Neutral" | "Bearish">("All");
  const [search,    setSearch]    = useState("");
  const [sortMode,  setSortMode]  = useState<"newest" | "bullish" | "bearish">("newest");

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
  }, []);

  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll(".news-card");
    gsap.from(cards, { opacity: 0, y: 12, stagger: 0.04, duration: 0.4, ease: "power2.out" });
  }, [category, sentFilter, search, sortMode]);

  /* ── Filtering + sorting ── */
  let filtered = allNews.filter(n => {
    const q = search.toLowerCase();
    const matchSearch = !search || n.title.toLowerCase().includes(q) || n.source.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
    const catMatch  = category === "All" || n.category === category;
    const sentMatch =
      sentFilter === "All" ||
      (sentFilter === "Bullish" && n.sentiment >= 60) ||
      (sentFilter === "Neutral" && n.sentiment >= 40 && n.sentiment < 60) ||
      (sentFilter === "Bearish" && n.sentiment < 40);
    return matchSearch && catMatch && sentMatch;
  });

  if (sortMode === "bullish") filtered = [...filtered].sort((a, b) => b.sentiment - a.sentiment);
  else if (sortMode === "bearish") filtered = [...filtered].sort((a, b) => a.sentiment - b.sentiment);

  const featured = filtered.find(n => n.featured) ?? filtered[0];
  const rest     = filtered.filter(n => n.id !== featured?.id);

  /* ── Sentiment analytics ── */
  const bullCount = allNews.filter(n => n.sentiment >= 60).length;
  const bearCount = allNews.filter(n => n.sentiment < 40).length;
  const neutCount = allNews.length - bullCount - bearCount;
  const avgSent   = Math.round(allNews.reduce((s, n) => s + n.sentiment, 0) / allNews.length);
  const total     = allNews.length;

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
              News &amp; Sentiment
            </h1>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
              {allNews.length} articles · AI sentiment analysis · updated live
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="live-dot" />
            <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--bull)", letterSpacing: "0.1em" }}>LIVE</span>
          </div>
        </div>

        {/* ── Sentiment overview ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Avg Score",    value: `${avgSent}`, sub: sentimentLabel(avgSent),   color: sentimentColor(avgSent) },
            { label: "Bullish",      value: `${bullCount}`, sub: `${Math.round(bullCount/total*100)}% of articles`, color: "var(--bull)" },
            { label: "Neutral",      value: `${neutCount}`, sub: `${Math.round(neutCount/total*100)}% of articles`, color: "var(--accent)" },
            { label: "Bearish",      value: `${bearCount}`, sub: `${Math.round(bearCount/total*100)}% of articles`, color: "var(--bear)" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "13px 16px", position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                background: s.color, opacity: 0.5,
              }} />
              <div className="section-label" style={{ marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 2 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Sentiment distribution bar ── */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "12px 18px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span className="section-label" style={{ flexShrink: 0, minWidth: 130 }}>MARKET SENTIMENT</span>
          <div style={{ flex: 1, height: 8, background: "var(--bg-raised)", borderRadius: 4, overflow: "hidden", display: "flex", gap: 2 }}>
            <div style={{ width: `${bullCount/total*100}%`, height: "100%", background: "var(--bull)", borderRadius: "4px 0 0 4px", transition: "width 0.5s" }} />
            <div style={{ width: `${neutCount/total*100}%`, height: "100%", background: "var(--accent)", transition: "width 0.5s" }} />
            <div style={{ flex: 1, height: "100%", background: "var(--bear)", borderRadius: "0 4px 4px 0" }} />
          </div>
          <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
            {[
              { label: "Bull", pct: Math.round(bullCount/total*100), color: "var(--bull)"  },
              { label: "Neut", pct: Math.round(neutCount/total*100), color: "var(--accent)"},
              { label: "Bear", pct: Math.round(bearCount/total*100), color: "var(--bear)"  },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: s.color, fontWeight: 600 }}>{s.pct}%</span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news…"
              style={{
                width: 190, padding: "7px 10px 7px 28px",
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-1)", fontFamily: "var(--font-ui)", fontSize: 11, outline: "none",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <button onClick={() => setCategory("All")} style={{
              fontFamily: "var(--font-ui)", fontSize: 10,
              background: category === "All" ? "var(--accent-dim)" : "var(--bg-surface)",
              color: category === "All" ? "var(--accent)" : "var(--text-2)",
              border: `1px solid ${category === "All" ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 4, padding: "4px 9px", cursor: "pointer", transition: "all 0.15s",
            }}>All</button>
            {newsCategories.filter(c => c !== "All").map(c => {
              const color = CAT_COLOR[c] ?? "#6B7280";
              const active = category === c;
              return (
                <button key={c} onClick={() => setCategory(c)} style={{
                  fontFamily: "var(--font-ui)", fontSize: 10,
                  background: active ? `${color}22` : "var(--bg-surface)",
                  color: active ? color : "var(--text-2)",
                  border: `1px solid ${active ? `${color}66` : "var(--border)"}`,
                  borderRadius: 4, padding: "4px 9px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                }}>{c}</button>
              );
            })}
          </div>

          {/* Sentiment + sort */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ display: "flex", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              {(["All", "Bullish", "Neutral", "Bearish"] as const).map(s => {
                const color = s === "Bullish" ? "var(--bull)" : s === "Bearish" ? "var(--bear)" : s === "Neutral" ? "var(--accent)" : "var(--text-2)";
                return (
                  <button key={s} onClick={() => setSentFilter(s)} style={{
                    fontFamily: "var(--font-ui)", fontSize: 10,
                    background: sentFilter === s ? (s === "All" ? "var(--bg-raised)" : sentimentBg(s === "Bullish" ? 80 : s === "Bearish" ? 20 : 50)) : "transparent",
                    color: sentFilter === s ? color : "var(--text-3)",
                    border: "none", padding: "5px 10px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                  }}>{s}</button>
                );
              })}
            </div>
            <div style={{ display: "flex", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              {([["newest","Latest"],["bullish","▲ Bull"],["bearish","▼ Bear"]] as const).map(([m, label]) => (
                <button key={m} onClick={() => setSortMode(m)} style={{
                  fontFamily: "var(--font-ui)", fontSize: 10,
                  background: sortMode === m ? "var(--bg-raised)" : "transparent",
                  color: sortMode === m ? "var(--text-1)" : "var(--text-3)",
                  border: "none", padding: "5px 10px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 256px", gap: 16, alignItems: "start" }}>

        {/* Left: featured + grid */}
        <div ref={cardsRef}>
          {filtered.length === 0 ? (
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "60px", textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-2)", marginBottom: 6 }}>No articles found</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-3)" }}>Try adjusting your filters or search</div>
            </div>
          ) : (
            <>
              {/* ── Featured card ── */}
              {featured && (
                <div className="news-card" style={{
                  background: "var(--bg-surface)", border: "1px solid var(--border-2)",
                  borderRadius: 12, overflow: "hidden", marginBottom: 12,
                  cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(59,130,246,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Category accent bar */}
                  <div style={{ height: 3, background: CAT_COLOR[featured.category] ?? "var(--accent)", opacity: 0.7 }} />

                  <div style={{ padding: "20px 24px" }}>
                    {/* Top meta row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <SourceBadge source={featured.source} size={30} />
                        <div>
                          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, color: "var(--text-1)" }}>{featured.source}</div>
                          <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)" }}>{featured.time} · {readTime(featured.body)}</div>
                        </div>
                        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
                        <span style={{
                          fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 700,
                          color: "var(--accent)", background: "var(--accent-dim)",
                          padding: "2px 8px", borderRadius: 3, letterSpacing: "0.08em",
                        }}>FEATURED</span>
                        <CatPill category={featured.category} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <SentimentBadge score={featured.sentiment} />
                        <ExternalLink size={13} style={{ color: "var(--text-3)" }} />
                      </div>
                    </div>

                    {/* Title */}
                    <h2 style={{
                      fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700,
                      color: "var(--text-1)", lineHeight: 1.5, marginBottom: 10,
                    }}>{featured.title}</h2>

                    {/* Body */}
                    <p style={{
                      fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)",
                      lineHeight: 1.7, marginBottom: 16,
                    }}>{featured.body}</p>

                    {/* Sentiment bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 4, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${featured.sentiment}%`,
                          background: sentimentColor(featured.sentiment), borderRadius: 2, transition: "width 0.6s ease",
                        }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)", flexShrink: 0 }}>
                        Sentiment {featured.sentiment}/100
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Article grid ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {rest.map(item => {
                  const sentCol = sentimentColor(item.sentiment);
                  const catColor = CAT_COLOR[item.category] ?? "#6B7280";
                  return (
                    <div key={item.id} className="news-card" style={{
                      background: "var(--bg-surface)", border: "1px solid var(--border)",
                      borderRadius: 10, overflow: "hidden",
                      cursor: "pointer", transition: "border-color 0.15s, transform 0.15s",
                      display: "flex", flexDirection: "column",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {/* Left-side sentiment stripe */}
                      <div style={{ display: "flex", flex: 1 }}>
                        <div style={{ width: 3, background: sentCol, opacity: 0.6, flexShrink: 0 }} />

                        <div style={{ flex: 1, padding: "14px 14px 12px" }}>
                          {/* Meta row */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <SourceBadge source={item.source} size={22} />
                              <div>
                                <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 600, color: "var(--text-2)" }}>{item.source}</div>
                                <div style={{ fontFamily: "var(--font-data)", fontSize: 8, color: "var(--text-3)" }}>{item.time}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <span style={{
                                fontFamily: "var(--font-data)", fontSize: 9, fontWeight: 700,
                                color: sentCol, background: sentimentBg(item.sentiment),
                                border: `1px solid ${sentCol}33`,
                                padding: "1px 6px", borderRadius: 4,
                              }}>{item.sentiment}</span>
                              <ExternalLink size={10} style={{ color: "var(--text-3)" }} />
                            </div>
                          </div>

                          {/* Title */}
                          <h3 style={{
                            fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
                            color: "var(--text-1)", lineHeight: 1.55, marginBottom: 7, flex: 1,
                            display: "-webkit-box" as any, WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as any, overflow: "hidden",
                          }}>{item.title}</h3>

                          {/* Body snippet */}
                          <p style={{
                            fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)",
                            lineHeight: 1.55, marginBottom: 10,
                            display: "-webkit-box" as any, WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden",
                          }}>{item.body}</p>

                          {/* Footer */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <CatPill category={item.category} />
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ height: 3, width: 48, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${item.sentiment}%`, background: sentCol }} />
                              </div>
                              <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: sentCol, fontWeight: 600 }}>
                                {sentimentLabel(item.sentiment)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Trending */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <Flame size={12} style={{ color: "var(--warning)" }} />
              <span className="section-label">TRENDING NOW</span>
            </div>
            {trending.map((t, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 0",
                borderBottom: i < trending.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)", width: 12, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <CoinIcon symbol={t.symbol} size={24} />
                  <div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, color: "var(--text-1)" }}>{t.symbol}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{t.name}</div>
                  </div>
                </div>
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: 11, fontWeight: 700, color: "var(--bull)",
                  background: "var(--bull-bg)", padding: "2px 7px", borderRadius: 4,
                }}>{t.change}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <div className="section-label" style={{ marginBottom: 10 }}>FILTERED</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>
              {filtered.length}
            </div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)", marginBottom: 12 }}>
              of {allNews.length} articles
            </div>
            {filtered.length > 0 && (
              <div>
                <div className="section-label" style={{ marginBottom: 6 }}>FILTERED AVG SCORE</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 5, background: "var(--bg-raised)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.round(filtered.reduce((s, n) => s + n.sentiment, 0) / filtered.length)}%`,
                      background: sentimentColor(Math.round(filtered.reduce((s, n) => s + n.sentiment, 0) / filtered.length)),
                      borderRadius: 3, transition: "width 0.5s",
                    }} />
                  </div>
                  <span style={{
                    fontFamily: "var(--font-data)", fontSize: 11, fontWeight: 700,
                    color: sentimentColor(Math.round(filtered.reduce((s, n) => s + n.sentiment, 0) / filtered.length)),
                  }}>
                    {Math.round(filtered.reduce((s, n) => s + n.sentiment, 0) / filtered.length)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Top sources */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <div className="section-label" style={{ marginBottom: 12 }}>TOP SOURCES</div>
            {(["CoinDesk","Blockworks","Decrypt","CoinTelegraph","The Block"] as const).map((src, i) => {
              const count    = allNews.filter(n => n.source === src).length;
              const srcColor = SRC_COLOR[src] ?? "#6B7280";
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <SourceBadge source={src} size={22} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)" }}>{src}</span>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-data)", fontSize: 10, fontWeight: 600, color: srcColor,
                    background: `${srcColor}18`, border: `1px solid ${srcColor}33`,
                    padding: "1px 7px", borderRadius: 4,
                  }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Topic tags */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <div className="section-label" style={{ marginBottom: 10 }}>TOPICS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {newsCategories.filter(c => c !== "All").map((tag, i) => {
                const cnt = allNews.filter(n => n.category === tag).length;
                return (
                  <button key={i} onClick={() => setCategory(prev => prev === tag ? "All" : tag)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    <div style={{
                      fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 600,
                      color: category === tag ? "#fff" : CAT_COLOR[tag] ?? "#6B7280",
                      background: category === tag ? (CAT_COLOR[tag] ?? "#6B7280") : `${CAT_COLOR[tag] ?? "#6B7280"}18`,
                      border: `1px solid ${CAT_COLOR[tag] ?? "#6B7280"}44`,
                      borderRadius: 4, padding: "3px 7px", transition: "all 0.15s",
                    }}>
                      {tag} <span style={{ opacity: 0.65 }}>({cnt})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top bullish / bearish */}
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <div className="section-label" style={{ marginBottom: 10 }}>
              <TrendingUp size={10} style={{ display: "inline", marginRight: 4, color: "var(--bull)" }} />
              MOST BULLISH
            </div>
            {[...allNews].sort((a, b) => b.sentiment - a.sentiment).slice(0, 3).map((n, i) => (
              <div key={i} style={{
                padding: "8px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-3)" }}>{n.source}</span>
                  <span style={{
                    fontFamily: "var(--font-data)", fontSize: 9, fontWeight: 700, color: "var(--bull)",
                    background: "var(--bull-bg)", padding: "1px 5px", borderRadius: 3,
                  }}>{n.sentiment}</span>
                </div>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-2)", lineHeight: 1.5,
                  display: "-webkit-box" as any, WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden",
                }}>{n.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
