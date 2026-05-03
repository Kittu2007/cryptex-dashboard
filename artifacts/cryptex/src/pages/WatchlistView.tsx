import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Plus, Trash2, Bell, BellOff, TrendingUp, TrendingDown } from "lucide-react";
import { coins } from "../mockData";
import Sparkline from "../components/Sparkline";

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
  const [watchlist, setWatchlist] = useState(["btc", "eth", "sol", "link"]);
  const [alerts, setAlerts] = useState<Record<string, boolean>>({ btc: true, eth: false, sol: false, link: true });
  const [showAdd, setShowAdd] = useState(false);

  const sparkData = coins.reduce((acc, c) => {
    acc[c.id] = generateSparkData(c.price, c.change7d);
    return acc;
  }, {} as Record<string, number[]>);

  useEffect(() => {
    gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.5, ease: "expo.out" });
  }, []);

  const watched = coins.filter(c => watchlist.includes(c.id));
  const unwatched = coins.filter(c => !watchlist.includes(c.id));

  function toggleAlert(id: string) {
    setAlerts(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function removeFromWatchlist(id: string) {
    setWatchlist(prev => prev.filter(x => x !== id));
  }

  function addToWatchlist(id: string) {
    setWatchlist(prev => [...prev, id]);
    setShowAdd(false);
  }

  // Mock alert levels
  const alertLevels: Record<string, { price: number; dir: string }> = {
    btc: { price: 70000, dir: "above" },
    link: { price: 20, dir: "above" },
  };

  return (
    <div style={{ padding: "24px 28px" }}>
      <div ref={headerRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
            Watchlist
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>
            {watched.length} assets · {Object.values(alerts).filter(Boolean).length} alerts active
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--accent)",
            background: "var(--accent-dim)", border: "1px solid var(--accent)",
            borderRadius: 6, padding: "7px 14px", cursor: "pointer"
          }}>
          <Plus size={13} /> Add Asset
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border-2)",
          borderRadius: 8, padding: "16px", marginBottom: 16
        }}>
          <div className="section-label" style={{ marginBottom: 10 }}>ADD TO WATCHLIST</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {unwatched.map(coin => (
              <button key={coin.id} onClick={() => addToWatchlist(coin.id)} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--bg-raised)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "6px 12px", cursor: "pointer",
                fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)",
                transition: "border-color 0.15s"
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: coin.avatar }} />
                {coin.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Gainers Today", value: `${watched.filter(c => c.change24h > 0).length}/${watched.length}`, color: "var(--bull)" },
          { label: "Avg 24H Change", value: `${(watched.reduce((s, c) => s + c.change24h, 0) / (watched.length || 1)).toFixed(1)}%`, color: "var(--text-1)" },
          { label: "Active Alerts", value: `${Object.values(alerts).filter(Boolean).length}`, color: "var(--accent)" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "14px 16px"
          }}>
            <div className="section-label" style={{ marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Watchlist cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {watched.map(coin => {
          const isUp = coin.change24h >= 0;
          const hasAlert = alerts[coin.id];
          const alertLevel = alertLevels[coin.id];
          return (
            <div key={coin.id} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "16px 20px",
              transition: "border-color 0.15s"
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: coin.avatar + "20", border: `1px solid ${coin.avatar}40`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: coin.avatar }}>
                      {coin.symbol[0]}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{coin.name}</div>
                    <div style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-2)" }}>{coin.symbol} · {coin.signal}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => toggleAlert(coin.id)}
                    title={hasAlert ? "Disable alert" : "Enable alert"}
                    style={{
                      width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                      background: hasAlert ? "var(--accent-dim)" : "none",
                      border: `1px solid ${hasAlert ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 4, cursor: "pointer",
                      color: hasAlert ? "var(--accent)" : "var(--text-3)"
                    }}>
                    {hasAlert ? <Bell size={12} /> : <BellOff size={12} />}
                  </button>
                  <button
                    onClick={() => removeFromWatchlist(coin.id)}
                    title="Remove"
                    style={{
                      width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "none", border: "1px solid var(--border)",
                      borderRadius: 4, cursor: "pointer", color: "var(--text-3)",
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--bear)"; e.currentTarget.style.color = "var(--bear)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>
                    ${coin.price < 1 ? coin.price.toFixed(3) : coin.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {isUp ? <TrendingUp size={11} style={{ color: "var(--bull)" }} /> : <TrendingDown size={11} style={{ color: "var(--bear)" }} />}
                    <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: isUp ? "var(--bull)" : "var(--bear)" }}>
                      {isUp ? "+" : ""}{coin.change24h.toFixed(1)}% (24H)
                    </span>
                  </div>
                </div>
                <Sparkline data={sparkData[coin.id]} width={80} height={36} />
              </div>

              {hasAlert && alertLevel && (
                <div style={{
                  marginTop: 12, padding: "6px 10px",
                  background: "var(--accent-dim)", borderRadius: 4,
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--accent)" }}>Alert: price {alertLevel.dir}</span>
                  <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--accent)" }}>
                    ${alertLevel.price.toLocaleString()}
                  </span>
                </div>
              )}

              <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
                <div>
                  <div className="section-label" style={{ marginBottom: 2 }}>Mkt Cap</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>${coin.marketCap}</div>
                </div>
                <div>
                  <div className="section-label" style={{ marginBottom: 2 }}>Volume</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)" }}>${coin.volume}</div>
                </div>
                <div>
                  <div className="section-label" style={{ marginBottom: 2 }}>7D</div>
                  <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: coin.change7d >= 0 ? "var(--bull)" : "var(--bear)" }}>
                    {coin.change7d >= 0 ? "+" : ""}{coin.change7d.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {watched.length === 0 && (
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "48px", textAlign: "center"
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-2)", marginBottom: 8 }}>
            Your watchlist is empty
          </div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-3)" }}>
            Click "Add Asset" to track cryptocurrencies
          </div>
        </div>
      )}
    </div>
  );
}
