import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { Plus, Trash2, Bell, BellOff, TrendingUp, TrendingDown, Search, Target } from "lucide-react";
import { coins } from "../mockData";
import Sparkline from "../components/Sparkline";
import { useApp } from "../context/AppContext";

function generateSparkData(base: number, trend: number): number[] {
  const pts = [base];
  for (let i = 1; i < 12; i++) {
    const delta = (Math.random() - 0.47 + trend * 0.01) * base * 0.025;
    pts.push(pts[pts.length - 1] + delta);
  }
  return pts;
}

export default function WatchlistView() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { livePrices, formatPrice } = useApp();

  const [watchlist, setWatchlist]       = useState(["btc", "eth", "sol", "link"]);
  const [alerts, setAlerts]             = useState<Record<string, boolean>>({ btc: true, eth: false, sol: false, link: true });
  const [alertTargets, setAlertTargets] = useState<Record<string, string>>({ btc: "70000", link: "20" });
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [draftTarget, setDraftTarget]   = useState("");
  const [showAdd, setShowAdd]           = useState(false);
  const [search, setSearch]             = useState("");
  const [sortMode, setSortMode]         = useState<"default" | "gainers" | "losers">("default");

  const prevPrices = useRef<Record<string, number>>({});
  const cardRefs   = useRef<Record<string, HTMLDivElement | null>>({});

  // Stable spark data — computed once per mount, not on every render
  const sparkData = useMemo(() => coins.reduce((acc, c) => {
    acc[c.id] = generateSparkData(c.price, c.change7d);
    return acc;
  }, {} as Record<string, number[]>), []);

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
    gsap.from(".wl-card", { y: 14, opacity: 0, stagger: 0.07, duration: 0.45, ease: "power2.out", delay: 0.1 });
  }, []);

  // Flash the live-price element when price changes
  useEffect(() => {
    for (const sym of Object.keys(livePrices)) {
      const lp   = livePrices[sym];
      const prev = prevPrices.current[sym];
      if (prev !== undefined && prev !== lp.price) {
        const coinId = coins.find(c => c.symbol === sym)?.id;
        if (coinId) {
          const priceEl = cardRefs.current[coinId]?.querySelector(".wl-price");
          if (priceEl) {
            const isUp = lp.price > prev;
            gsap.fromTo(priceEl,
              { color: isUp ? "#34D399" : "#F87171" },
              { color: "var(--text-1)", duration: 1.1, ease: "power2.out" }
            );
          }
        }
      }
      prevPrices.current[sym] = lp.price;
    }
  }, [livePrices]);

  // Build the displayed list with search + sort
  let watched = coins.filter(c => watchlist.includes(c.id));
  if (search) {
    const q = search.toLowerCase();
    watched = watched.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
  }
  if (sortMode === "gainers") {
    watched = [...watched].sort((a, b) =>
      (livePrices[b.symbol]?.change24h ?? b.change24h) - (livePrices[a.symbol]?.change24h ?? a.change24h)
    );
  } else if (sortMode === "losers") {
    watched = [...watched].sort((a, b) =>
      (livePrices[a.symbol]?.change24h ?? a.change24h) - (livePrices[b.symbol]?.change24h ?? b.change24h)
    );
  }

  const unwatched    = coins.filter(c => !watchlist.includes(c.id));
  const activeAlerts = Object.entries(alerts).filter(([, v]) => v).length;
  const gainers      = watched.filter(c => (livePrices[c.symbol]?.change24h ?? c.change24h) > 0).length;
  const avgChange    = watched.length
    ? (watched.reduce((s, c) => s + (livePrices[c.symbol]?.change24h ?? c.change24h), 0) / watched.length).toFixed(2)
    : "0.00";

  function toggleAlert(id: string) {
    setAlerts(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function removeFromWatchlist(id: string) {
    const el = cardRefs.current[id];
    if (el) {
      gsap.to(el, {
        opacity: 0, y: -8, scale: 0.97, duration: 0.22, ease: "power2.in",
        onComplete: () => setWatchlist(prev => prev.filter(x => x !== id))
      });
    } else {
      setWatchlist(prev => prev.filter(x => x !== id));
    }
  }

  function addToWatchlist(id: string) {
    setWatchlist(prev => [...prev, id]);
    setShowAdd(false);
    setTimeout(() => {
      const el = cardRefs.current[id];
      if (el) gsap.from(el, { opacity: 0, y: 10, scale: 0.97, duration: 0.3, ease: "back.out(1.4)" });
    }, 50);
  }

  function startEditAlert(id: string) {
    setEditingAlert(id);
    setDraftTarget(alertTargets[id] ?? "");
  }

  function saveAlertTarget(id: string) {
    if (draftTarget.trim()) {
      setAlertTargets(prev => ({ ...prev, [id]: draftTarget.trim() }));
      setAlerts(prev => ({ ...prev, [id]: true }));
    }
    setEditingAlert(null);
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Watchlist</h1>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
              {watchlist.length} assets tracked · {activeAlerts} alert{activeAlerts !== 1 ? "s" : ""} active
            </p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} style={{
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--accent)",
            background: "var(--accent-dim)", border: `1px solid ${showAdd ? "var(--accent)" : "rgba(139,92,246,0.4)"}`,
            borderRadius: 6, padding: "7px 14px", cursor: "pointer", transition: "all 0.15s"
          }}>
            <Plus size={13} /> Add Asset
          </button>
        </div>

        {/* Add panel */}
        {showAdd && (
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-2)",
            borderRadius: 8, padding: "16px", marginBottom: 16
          }}>
            <div className="section-label" style={{ marginBottom: 10 }}>ADD TO WATCHLIST</div>
            {unwatched.length === 0
              ? <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-3)" }}>
                  All available assets are already in your watchlist.
                </div>
              : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {unwatched.map(coin => {
                    const lp = livePrices[coin.symbol];
                    const ch = lp?.change24h ?? coin.change24h;
                    return (
                      <button key={coin.id} onClick={() => addToWatchlist(coin.id)} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "var(--bg-raised)", border: "1px solid var(--border)",
                        borderRadius: 6, padding: "7px 14px", cursor: "pointer",
                        fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)",
                        transition: "border-color 0.15s"
                      }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: coin.avatar }} />
                        <span style={{ fontWeight: 600 }}>{coin.symbol}</span>
                        <span style={{ color: "var(--text-2)" }}>· {coin.name}</span>
                        <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: ch >= 0 ? "var(--bull)" : "var(--bear)", marginLeft: 4 }}>
                          {ch >= 0 ? "+" : ""}{ch.toFixed(2)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              )
            }
          </div>
        )}

        {/* Summary + controls row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 10, marginBottom: 20, alignItems: "center" }}>
          {[
            { label: "Gainers Today",  value: `${gainers} / ${watched.length}`,                                                      color: "var(--bull)" },
            { label: "Avg 24H Change", value: `${Number(avgChange) >= 0 ? "+" : ""}${avgChange}%`, color: Number(avgChange) >= 0 ? "var(--bull)" : "var(--bear)" },
            { label: "Active Alerts",  value: `${activeAlerts}`,                                                                      color: "var(--accent)" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
              <div className="section-label" style={{ marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: s.color }}>{s.value}</div>
            </div>
          ))}

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter…"
              style={{
                width: 130, padding: "8px 8px 8px 28px",
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-1)", fontFamily: "var(--font-ui)", fontSize: 11, outline: "none"
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Sort */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["default", "gainers", "losers"] as const).map(m => (
              <button key={m} onClick={() => setSortMode(m)} style={{
                fontFamily: "var(--font-ui)", fontSize: 10,
                background: sortMode === m ? "var(--accent-dim)" : "var(--bg-surface)",
                color: sortMode === m ? "var(--accent)" : "var(--text-3)",
                border: `1px solid ${sortMode === m ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 4, padding: "5px 9px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap"
              }}>
                {m === "default" ? "Default" : m === "gainers" ? "▲ Gainers" : "▼ Losers"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {watched.map(coin => {
          const lp        = livePrices[coin.symbol];
          const price     = lp?.price      ?? coin.price;
          const change24h = lp?.change24h  ?? coin.change24h;
          const change7d  = lp?.change7d   ?? coin.change7d;
          const isUp      = change24h >= 0;
          const hasAlert  = !!alerts[coin.id];
          const mktCapB   = lp?.marketCapB ?? 0;
          const volumeB   = lp?.volumeB    ?? 0;

          return (
            <div key={coin.id} className="wl-card"
              ref={el => { cardRefs.current[coin.id] = el; }}
              style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "18px 20px", transition: "border-color 0.15s"
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              {/* Top: coin info + action buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: coin.avatar + "20", border: `1px solid ${coin.avatar}40`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: coin.avatar }}>
                      {coin.symbol[0]}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{coin.name}</div>
                    <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>
                      {coin.symbol} ·{" "}
                      <span style={{ color: coin.signal === "Bullish" ? "var(--bull)" : coin.signal === "Bearish" ? "var(--bear)" : "var(--text-3)" }}>
                        {coin.signal}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 4 }}>
                  {/* Set price target */}
                  <button onClick={() => startEditAlert(coin.id)} title="Set price target"
                    style={{
                      width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "none", border: "1px solid var(--border)",
                      borderRadius: 4, cursor: "pointer", color: "var(--text-3)", transition: "all 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)";  (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                  >
                    <Target size={12} />
                  </button>

                  {/* Bell toggle */}
                  <button onClick={() => toggleAlert(coin.id)} title={hasAlert ? "Mute" : "Enable alert"}
                    style={{
                      width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                      background: hasAlert ? "var(--accent-dim)" : "none",
                      border: `1px solid ${hasAlert ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 4, cursor: "pointer", color: hasAlert ? "var(--accent)" : "var(--text-3)",
                      transition: "all 0.15s"
                    }}>
                    {hasAlert ? <Bell size={12} /> : <BellOff size={12} />}
                  </button>

                  {/* Remove */}
                  <button onClick={() => removeFromWatchlist(coin.id)} title="Remove"
                    style={{
                      width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "none", border: "1px solid var(--border)",
                      borderRadius: 4, cursor: "pointer", color: "var(--text-3)", transition: "all 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--bear)"; (e.currentTarget as HTMLElement).style.color = "var(--bear)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Price + sparkline */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                <div>
                  <div className="wl-price" style={{
                    fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600,
                    color: "var(--text-1)", letterSpacing: "-0.5px", marginBottom: 3
                  }}>
                    {price < 1
                      ? `$${price.toFixed(4)}`
                      : `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isUp
                      ? <TrendingUp  size={11} style={{ color: "var(--bull)" }} />
                      : <TrendingDown size={11} style={{ color: "var(--bear)" }} />}
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: isUp ? "var(--bull)" : "var(--bear)" }}>
                      {isUp ? "+" : ""}{change24h.toFixed(2)}% 24H
                    </span>
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: change7d >= 0 ? "var(--bull)" : "var(--bear)", opacity: 0.7 }}>
                      · {change7d >= 0 ? "+" : ""}{change7d.toFixed(1)}% 7D
                    </span>
                  </div>
                </div>
                <Sparkline data={sparkData[coin.id]} width={84} height={38} />
              </div>

              {/* Inline price-target editor */}
              {editingAlert === coin.id && (
                <div style={{
                  marginBottom: 10, display: "flex", gap: 6, alignItems: "center",
                  padding: "8px 10px", background: "var(--bg-raised)",
                  borderRadius: 6, border: "1px solid var(--accent)"
                }}>
                  <Target size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--accent)", flexShrink: 0 }}>Target $</span>
                  <input
                    value={draftTarget}
                    onChange={e => setDraftTarget(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveAlertTarget(coin.id); if (e.key === "Escape") setEditingAlert(null); }}
                    autoFocus type="number"
                    style={{
                      flex: 1, fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)",
                      background: "transparent", border: "none", outline: "none"
                    }}
                  />
                  <button onClick={() => saveAlertTarget(coin.id)} style={{
                    fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--bull)",
                    background: "var(--bull-bg)", border: "1px solid rgba(52,211,153,0.4)",
                    borderRadius: 4, padding: "3px 10px", cursor: "pointer"
                  }}>Set</button>
                  <button onClick={() => setEditingAlert(null)} style={{
                    fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)",
                    background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "3px 8px", cursor: "pointer"
                  }}>✕</button>
                </div>
              )}

              {/* Alert badge (click to edit) */}
              {hasAlert && alertTargets[coin.id] && editingAlert !== coin.id && (
                <div
                  onClick={() => startEditAlert(coin.id)}
                  style={{
                    marginBottom: 10, padding: "6px 10px",
                    background: "var(--accent-dim)", borderRadius: 5,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer", border: "1px solid rgba(139,92,246,0.25)"
                  }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--accent)" }}>🔔 Alert at</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--accent)", fontWeight: 600 }}>
                    ${parseFloat(alertTargets[coin.id]).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Stats footer */}
              <div style={{ display: "flex", gap: 16, paddingTop: 10, borderTop: "1px solid rgba(31,31,46,0.5)" }}>
                <div>
                  <div className="section-label" style={{ marginBottom: 2 }}>Mkt Cap</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>
                    {mktCapB >= 1000 ? `$${(mktCapB / 1000).toFixed(2)}T` : mktCapB >= 1 ? `$${mktCapB.toFixed(1)}B` : `$${(mktCapB * 1000).toFixed(0)}M`}
                  </div>
                </div>
                <div>
                  <div className="section-label" style={{ marginBottom: 2 }}>Volume</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>
                    {volumeB >= 1 ? `$${volumeB.toFixed(1)}B` : `$${(volumeB * 1000).toFixed(0)}M`}
                  </div>
                </div>
                <div>
                  <div className="section-label" style={{ marginBottom: 2 }}>24H High</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--bull)" }}>
                    {formatPrice(price * 1.012)}
                  </div>
                </div>
                <div>
                  <div className="section-label" style={{ marginBottom: 2 }}>24H Low</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--bear)" }}>
                    {formatPrice(price * 0.986)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {watched.length === 0 && (
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "52px", textAlign: "center"
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-2)", marginBottom: 8 }}>
            {search ? "No results found" : "Your watchlist is empty"}
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-3)" }}>
            {search ? `No assets match "${search}"` : 'Click "Add Asset" above to start tracking'}
          </div>
        </div>
      )}
    </div>
  );
}
