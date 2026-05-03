import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import {
  Plus, Trash2, Bell, BellOff, TrendingUp, TrendingDown,
  Search, Target, LayoutGrid, List, Star, X,
} from "lucide-react";
import { coins } from "../mockData";
import Sparkline from "../components/Sparkline";
import CoinIcon from "../components/CoinIcon";
import { useApp } from "../context/AppContext";
import { useCoinNav } from "../context/CoinNavContext";

type ViewMode = "grid" | "list";
type SortMode = "default" | "gainers" | "losers" | "mcap" | "volume";

function generateSparkData(base: number, trend: number): number[] {
  const pts = [base];
  for (let i = 1; i < 12; i++) {
    const delta = (Math.random() - 0.47 + trend * 0.01) * base * 0.025;
    pts.push(pts[pts.length - 1] + delta);
  }
  return pts;
}

function fmtMktCap(b: number, sym: string): string {
  if (b >= 1000) return `${sym}${(b / 1000).toFixed(2)}T`;
  if (b >= 1)    return `${sym}${b.toFixed(1)}B`;
  if (b > 0)     return `${sym}${(b * 1000).toFixed(0)}M`;
  return "—";
}
function fmtVol(b: number, sym: string): string {
  if (b >= 1)  return `${sym}${b.toFixed(1)}B`;
  if (b > 0)   return `${sym}${(b * 1000).toFixed(0)}M`;
  return "—";
}

export default function WatchlistView() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { livePrices, formatPrice, currencySymbol } = useApp();

  const [watchlist, setWatchlist]       = useState(["btc", "eth", "sol", "link"]);
  const [alerts, setAlerts]             = useState<Record<string, boolean>>({ btc: true, eth: false, sol: false, link: true });
  const [alertTargets, setAlertTargets] = useState<Record<string, string>>({ btc: "70000", link: "20" });
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [draftTarget, setDraftTarget]   = useState("");
  const [showAdd, setShowAdd]           = useState(false);
  const [search, setSearch]             = useState("");
  const [addSearch, setAddSearch]       = useState("");
  const [sortMode, setSortMode]         = useState<SortMode>("default");
  const [viewMode, setViewMode]         = useState<ViewMode>("grid");

  const { navigateToCoin } = useCoinNav();
  const prevPrices = useRef<Record<string, number>>({});
  const cardRefs   = useRef<Record<string, HTMLElement | null>>({});

  const sparkData = useMemo(() => coins.reduce((acc, c) => {
    acc[c.id] = generateSparkData(c.price, c.change7d);
    return acc;
  }, {} as Record<string, number[]>), []);

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
    gsap.from(".wl-card", { y: 14, opacity: 0, stagger: 0.07, duration: 0.45, ease: "power2.out", delay: 0.1 });
  }, []);

  useEffect(() => {
    for (const sym of Object.keys(livePrices)) {
      const lp   = livePrices[sym];
      const prev = prevPrices.current[sym];
      if (prev !== undefined && prev !== lp.price) {
        const coinId = coins.find(c => c.symbol === sym)?.id;
        if (coinId) {
          const el = cardRefs.current[coinId];
          const priceEl = el?.querySelector?.(".wl-price");
          if (priceEl) {
            const isUp = lp.price > prev;
            gsap.fromTo(priceEl,
              { color: isUp ? "#22C55E" : "#EF4444" },
              { color: "var(--text-1)", duration: 1.1, ease: "power2.out" }
            );
          }
        }
      }
      prevPrices.current[sym] = lp.price;
    }
  }, [livePrices]);

  /* ── Build displayed list ── */
  let watched = coins.filter(c => watchlist.includes(c.id));
  if (search) {
    const q = search.toLowerCase();
    watched = watched.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
  }
  if (sortMode !== "default") {
    watched = [...watched].sort((a, b) => {
      const la = livePrices[a.symbol], lb = livePrices[b.symbol];
      if (sortMode === "gainers") return (lb?.change24h ?? b.change24h) - (la?.change24h ?? a.change24h);
      if (sortMode === "losers")  return (la?.change24h ?? a.change24h) - (lb?.change24h ?? b.change24h);
      if (sortMode === "mcap")    return (lb?.marketCapB ?? 0) - (la?.marketCapB ?? 0);
      if (sortMode === "volume")  return (lb?.volumeB ?? 0) - (la?.volumeB ?? 0);
      return 0;
    });
  }

  const unwatched = coins.filter(c => !watchlist.includes(c.id));
  const filteredUnwatched = addSearch
    ? unwatched.filter(c =>
        c.name.toLowerCase().includes(addSearch.toLowerCase()) ||
        c.symbol.toLowerCase().includes(addSearch.toLowerCase())
      )
    : unwatched;

  const activeAlerts = Object.entries(alerts).filter(([, v]) => v).length;
  const gainers      = watched.filter(c => (livePrices[c.symbol]?.change24h ?? c.change24h) > 0).length;
  const avgChange    = watched.length
    ? watched.reduce((s, c) => s + (livePrices[c.symbol]?.change24h ?? c.change24h), 0) / watched.length
    : 0;

  /* ── Handlers ── */
  function toggleAlert(id: string) {
    setAlerts(prev => ({ ...prev, [id]: !prev[id] }));
  }
  function removeFromWatchlist(id: string) {
    const el = cardRefs.current[id];
    if (el) {
      gsap.to(el, {
        opacity: 0, y: -8, scale: 0.97, duration: 0.22, ease: "power2.in",
        onComplete: () => setWatchlist(prev => prev.filter(x => x !== id)),
      });
    } else {
      setWatchlist(prev => prev.filter(x => x !== id));
    }
  }
  function addToWatchlist(id: string) {
    setWatchlist(prev => [...prev, id]);
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

  /* ── Alert progress ── */
  function alertProgress(coinId: string, symbol: string) {
    const target = parseFloat(alertTargets[coinId] ?? "");
    if (!target || !alerts[coinId]) return null;
    const price   = livePrices[symbol]?.price ?? coins.find(c => c.id === coinId)?.price ?? 0;
    const above   = price >= target;
    const diffPct = ((price - target) / target) * 100;
    const dist    = Math.abs(price - target) / target;
    const barPct  = Math.max(0, Math.min(100, (1 - dist) * 100));
    return { above, diffPct, barPct };
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
              Watchlist
            </h1>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
              {watchlist.length} asset{watchlist.length !== 1 ? "s" : ""} tracked · {activeAlerts} alert{activeAlerts !== 1 ? "s" : ""} active
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Grid / List toggle */}
            <div style={{ display: "flex", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              {([["grid", LayoutGrid], ["list", List]] as const).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  background: viewMode === mode ? "var(--accent-dim)" : "transparent",
                  color: viewMode === mode ? "var(--accent)" : "var(--text-3)",
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                }}>
                  <Icon size={13} />
                </button>
              ))}
            </div>
            <button onClick={() => { setShowAdd(v => !v); setAddSearch(""); }} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--accent)",
              background: "var(--accent-dim)",
              border: `1px solid ${showAdd ? "var(--accent)" : "rgba(59,130,246,0.4)"}`,
              borderRadius: 6, padding: "7px 14px", cursor: "pointer", transition: "all 0.15s",
            }}>
              <Plus size={13} /> Add Asset
            </button>
          </div>
        </div>

        {/* ── Add panel ── */}
        {showAdd && (
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border-2)",
            borderRadius: 10, padding: "16px", marginBottom: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="section-label">ADD TO WATCHLIST</span>
              <button onClick={() => setShowAdd(false)} style={{
                background: "none", border: "none", cursor: "pointer", color: "var(--text-3)",
                display: "flex", alignItems: "center",
              }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
              <input
                value={addSearch} onChange={e => setAddSearch(e.target.value)}
                placeholder="Search coins to add…" autoFocus
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "8px 8px 8px 28px",
                  background: "var(--bg-raised)", border: "1px solid var(--border)",
                  borderRadius: 6, color: "var(--text-1)", fontFamily: "var(--font-ui)", fontSize: 11, outline: "none",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            {filteredUnwatched.length === 0
              ? <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-3)", padding: "8px 0" }}>
                  {addSearch ? `No coins match "${addSearch}"` : "All assets are already in your watchlist."}
                </div>
              : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {filteredUnwatched.map(coin => {
                    const lp = livePrices[coin.symbol];
                    const ch = lp?.change24h ?? coin.change24h;
                    return (
                      <button key={coin.id} onClick={() => addToWatchlist(coin.id)} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "var(--bg-raised)", border: "1px solid var(--border)",
                        borderRadius: 6, padding: "7px 12px", cursor: "pointer",
                        fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)",
                        transition: "border-color 0.15s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                      >
                        <CoinIcon symbol={coin.symbol} size={18} fallbackColor={coin.avatar} />
                        <span style={{ fontWeight: 600 }}>{coin.symbol}</span>
                        <span style={{ color: "var(--text-2)" }}>{coin.name}</span>
                        <span style={{
                          fontFamily: "var(--font-data)", fontSize: 10,
                          color: ch >= 0 ? "var(--bull)" : "var(--bear)", marginLeft: 2,
                        }}>
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

        {/* ── Summary cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Tracked Assets",  value: `${watched.length}`,                                                       color: "var(--text-1)"  },
            { label: "Gainers Today",   value: `${gainers} / ${watched.length}`,                                          color: "var(--bull)"    },
            { label: "Avg 24H Change",  value: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`,                    color: avgChange >= 0 ? "var(--bull)" : "var(--bear)" },
            { label: "Active Alerts",   value: `${activeAlerts}`,                                                          color: "var(--accent)"  },
          ].map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "12px 16px",
            }}>
              <div className="section-label" style={{ marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Controls ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter watchlist…"
              style={{
                width: 170, padding: "7px 8px 7px 28px",
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-1)", fontFamily: "var(--font-ui)", fontSize: 11, outline: "none",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)", marginRight: 2 }}>Sort:</span>
            {([
              ["default", "Default"  ],
              ["gainers", "▲ Gainers"],
              ["losers",  "▼ Losers" ],
              ["mcap",    "Mkt Cap"  ],
              ["volume",  "Volume"   ],
            ] as const).map(([m, label]) => (
              <button key={m} onClick={() => setSortMode(m)} style={{
                fontFamily: "var(--font-ui)", fontSize: 10,
                background: sortMode === m ? "var(--accent-dim)" : "var(--bg-surface)",
                color: sortMode === m ? "var(--accent)" : "var(--text-3)",
                border: `1px solid ${sortMode === m ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 4, padding: "5px 9px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ GRID VIEW ══════════ */}
      {viewMode === "grid" && watched.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {watched.map(coin => {
            const lp        = livePrices[coin.symbol];
            const price     = lp?.price     ?? coin.price;
            const change24h = lp?.change24h ?? coin.change24h;
            const change7d  = lp?.change7d  ?? coin.change7d;
            const isUp      = change24h >= 0;
            const hasAlert  = !!alerts[coin.id];
            const mktCapB   = lp?.marketCapB ?? 0;
            const volumeB   = lp?.volumeB    ?? 0;
            const ap        = alertProgress(coin.id, coin.symbol);

            return (
              <div key={coin.id} className="wl-card"
                ref={el => { cardRefs.current[coin.id] = el; }}
                style={{
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onClick={e => {
                  if ((e.target as HTMLElement).closest("button, input")) return;
                  navigateToCoin(coin.symbol);
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = isUp ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)";
                  e.currentTarget.style.boxShadow   = isUp ? "0 0 0 1px rgba(34,197,94,0.08)" : "0 0 0 1px rgba(239,68,68,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow   = "none";
                }}
              >
                {/* Accent top stripe */}
                <div style={{ height: 3, background: isUp ? "var(--bull)" : "var(--bear)", opacity: 0.55 }} />

                <div style={{ padding: "16px 18px" }}>
                  {/* Coin info + action buttons */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CoinIcon symbol={coin.symbol} size={38} fallbackColor={coin.avatar} />
                      <div>
                        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{coin.name}</div>
                        <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <span>{coin.symbol}</span>
                          <span style={{ color: "var(--text-3)" }}>·</span>
                          <span style={{ color: coin.signal === "Bullish" ? "var(--bull)" : coin.signal === "Bearish" ? "var(--bear)" : "var(--text-3)" }}>
                            {coin.signal}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {/* Target */}
                      <button onClick={() => startEditAlert(coin.id)} title="Set price target" style={{
                        width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "none", border: "1px solid var(--border)",
                        borderRadius: 4, cursor: "pointer", color: "var(--text-3)", transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)";  (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                      ><Target size={12} /></button>
                      {/* Bell */}
                      <button onClick={() => toggleAlert(coin.id)} title={hasAlert ? "Mute alert" : "Enable alert"} style={{
                        width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                        background: hasAlert ? "var(--accent-dim)" : "none",
                        border: `1px solid ${hasAlert ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 4, cursor: "pointer", color: hasAlert ? "var(--accent)" : "var(--text-3)", transition: "all 0.15s",
                      }}>
                        {hasAlert ? <Bell size={12} /> : <BellOff size={12} />}
                      </button>
                      {/* Remove */}
                      <button onClick={() => removeFromWatchlist(coin.id)} title="Remove" style={{
                        width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "none", border: "1px solid var(--border)",
                        borderRadius: 4, cursor: "pointer", color: "var(--text-3)", transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--bear)"; (e.currentTarget as HTMLElement).style.color = "var(--bear)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                      ><Trash2 size={12} /></button>
                    </div>
                  </div>

                  {/* Price + sparkline */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                    <div>
                      <div className="wl-price" style={{
                        fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700,
                        color: "var(--text-1)", letterSpacing: "-0.5px", marginBottom: 4,
                      }}>
                        {formatPrice(price)}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {isUp
                          ? <TrendingUp  size={11} style={{ color: "var(--bull)" }} />
                          : <TrendingDown size={11} style={{ color: "var(--bear)" }} />}
                        <span style={{ fontFamily: "var(--font-data)", fontSize: 11, fontWeight: 600, color: isUp ? "var(--bull)" : "var(--bear)" }}>
                          {isUp ? "+" : ""}{change24h.toFixed(2)}% 24H
                        </span>
                        <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: change7d >= 0 ? "var(--bull)" : "var(--bear)", opacity: 0.7 }}>
                          · {change7d >= 0 ? "+" : ""}{change7d.toFixed(1)}% 7D
                        </span>
                      </div>
                    </div>
                    <Sparkline data={sparkData[coin.id]} width={90} height={42} />
                  </div>

                  {/* Alert target editor */}
                  {editingAlert === coin.id && (
                    <div style={{
                      marginBottom: 10, display: "flex", gap: 6, alignItems: "center",
                      padding: "8px 10px", background: "var(--bg-raised)",
                      borderRadius: 6, border: "1px solid var(--accent)",
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
                          background: "transparent", border: "none", outline: "none",
                        }}
                      />
                      <button onClick={() => saveAlertTarget(coin.id)} style={{
                        fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--bull)",
                        background: "var(--bull-bg)", border: "1px solid rgba(34,197,94,0.4)",
                        borderRadius: 4, padding: "3px 10px", cursor: "pointer",
                      }}>Set</button>
                      <button onClick={() => setEditingAlert(null)} style={{
                        fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)",
                        background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "3px 8px", cursor: "pointer",
                      }}>✕</button>
                    </div>
                  )}

                  {/* Alert badge with progress bar */}
                  {hasAlert && alertTargets[coin.id] && editingAlert !== coin.id && (
                    <div style={{ marginBottom: 10 }}>
                      <div
                        onClick={() => startEditAlert(coin.id)}
                        style={{
                          padding: "8px 10px", background: "var(--accent-dim)", borderRadius: 6,
                          border: "1px solid rgba(59,130,246,0.25)", cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ap ? 6 : 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Bell size={10} style={{ color: "var(--accent)" }} />
                            <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--accent)" }}>Price target</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontFamily: "var(--font-data)", fontSize: 10, fontWeight: 600, color: "var(--accent)" }}>
                              {currencySymbol}{parseFloat(alertTargets[coin.id]).toLocaleString()}
                            </span>
                            {ap && (
                              <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: ap.above ? "var(--bull)" : "var(--text-3)" }}>
                                {ap.above ? `+${ap.diffPct.toFixed(1)}% above` : `${Math.abs(ap.diffPct).toFixed(1)}% away`}
                              </span>
                            )}
                          </div>
                        </div>
                        {ap && (
                          <div style={{ height: 3, background: "rgba(59,130,246,0.15)", borderRadius: 2 }}>
                            <div style={{
                              height: "100%", borderRadius: 2,
                              width: `${ap.barPct}%`,
                              background: ap.above ? "var(--bull)" : "var(--accent)",
                              transition: "width 0.6s ease",
                            }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats footer */}
                  <div style={{ display: "flex", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    {[
                      { label: "Mkt Cap", value: fmtMktCap(mktCapB, currencySymbol), color: "var(--text-2)" },
                      { label: "Volume",  value: fmtVol(volumeB, currencySymbol),     color: "var(--text-2)" },
                      { label: "24H Hi",  value: formatPrice(price * 1.012), color: "var(--bull)" },
                      { label: "24H Lo",  value: formatPrice(price * 0.986), color: "var(--bear)" },
                    ].map((s, i) => (
                      <div key={i} style={{ flex: 1 }}>
                        <div className="section-label" style={{ marginBottom: 3 }}>{s.label}</div>
                        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ LIST VIEW ══════════ */}
      {viewMode === "list" && watched.length > 0 && (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Asset", "Price", "24H", "7D", "Mkt Cap", "Volume", "Signal", "Alert", ""].map((h, i) => (
                    <th key={i} align={i === 0 ? "left" : i >= 7 ? "center" : "right"} style={{
                      padding: "9px 14px", fontFamily: "var(--font-ui)", fontSize: 8,
                      fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {watched.map((coin, idx) => {
                  const lp        = livePrices[coin.symbol];
                  const price     = lp?.price     ?? coin.price;
                  const change24h = lp?.change24h ?? coin.change24h;
                  const change7d  = lp?.change7d  ?? coin.change7d;
                  const isUp      = change24h >= 0;
                  const hasAlert  = !!alerts[coin.id];
                  const mktCapB   = lp?.marketCapB ?? 0;
                  const volumeB   = lp?.volumeB    ?? 0;
                  return (
                    <tr key={coin.id}
                      ref={el => { cardRefs.current[coin.id] = el; }}
                      style={{ borderBottom: idx < watched.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", transition: "background 0.1s" }}
                      onClick={e => { if ((e.target as HTMLElement).closest("button")) return; navigateToCoin(coin.symbol); }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <CoinIcon symbol={coin.symbol} size={26} fallbackColor={coin.avatar} />
                          <div>
                            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>{coin.name}</div>
                            <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{coin.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td align="right" style={{ padding: "12px 14px" }}>
                        <div className="wl-price" style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>
                          {formatPrice(price)}
                        </div>
                      </td>
                      <td align="right" style={{ padding: "12px 14px", fontFamily: "var(--font-data)", fontSize: 11, fontWeight: 600, color: isUp ? "var(--bull)" : "var(--bear)" }}>
                        {isUp ? "+" : ""}{change24h.toFixed(2)}%
                      </td>
                      <td align="right" style={{ padding: "12px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: change7d >= 0 ? "var(--bull)" : "var(--bear)" }}>
                        {change7d >= 0 ? "+" : ""}{change7d.toFixed(1)}%
                      </td>
                      <td align="right" style={{ padding: "12px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                        {fmtMktCap(mktCapB, currencySymbol)}
                      </td>
                      <td align="right" style={{ padding: "12px 14px", fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-2)" }}>
                        {fmtVol(volumeB, currencySymbol)}
                      </td>
                      <td align="center" style={{ padding: "12px 14px" }}>
                        <span style={{
                          fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 600,
                          color: coin.signal === "Bullish" ? "var(--bull)" : coin.signal === "Bearish" ? "var(--bear)" : "var(--text-3)",
                          background: coin.signal === "Bullish" ? "var(--bull-bg)" : coin.signal === "Bearish" ? "var(--bear-bg)" : "var(--bg-raised)",
                          padding: "2px 7px", borderRadius: 4,
                        }}>{coin.signal}</span>
                      </td>
                      <td align="center" style={{ padding: "12px 14px" }}>
                        <button onClick={() => toggleAlert(coin.id)} title={hasAlert ? "Mute" : "Enable alert"} style={{
                          width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                          background: hasAlert ? "var(--accent-dim)" : "none",
                          border: `1px solid ${hasAlert ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: 4, cursor: "pointer", color: hasAlert ? "var(--accent)" : "var(--text-3)", transition: "all 0.15s",
                        }}>
                          {hasAlert ? <Bell size={11} /> : <BellOff size={11} />}
                        </button>
                      </td>
                      <td align="center" style={{ padding: "12px 14px" }}>
                        <button onClick={() => removeFromWatchlist(coin.id)} title="Remove" style={{
                          width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                          background: "none", border: "1px solid var(--border)",
                          borderRadius: 4, cursor: "pointer", color: "var(--text-3)", transition: "all 0.15s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--bear)"; (e.currentTarget as HTMLElement).style.color = "var(--bear)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {watched.length === 0 && (
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "60px 40px", textAlign: "center",
        }}>
          <div style={{ marginBottom: 14, opacity: 0.15 }}>
            <Star size={44} style={{ margin: "0 auto" }} color="var(--text-1)" />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-2)", marginBottom: 6 }}>
            {search ? "No results found" : "Your watchlist is empty"}
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-3)", marginBottom: 18 }}>
            {search ? `No assets match "${search}"` : "Track favourite assets and get notified at your target price"}
          </div>
          {!search && (
            <button onClick={() => setShowAdd(true)} style={{
              fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--accent)",
              background: "var(--accent-dim)", border: "1px solid rgba(59,130,246,0.4)",
              borderRadius: 6, padding: "8px 18px", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Plus size={12} /> Add your first asset
            </button>
          )}
        </div>
      )}
    </div>
  );
}
