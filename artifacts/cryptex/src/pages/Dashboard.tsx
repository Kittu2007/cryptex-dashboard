import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Sidebar, { NavId } from "../components/Sidebar";
import TopRibbon from "../components/TopRibbon";
import TickerTape from "../components/TickerTape";
import ChartPanel from "../components/ChartPanel";
import RightPanel from "../components/RightPanel";
import MarketTable from "../components/MarketTable";
import BottomSection from "../components/BottomSection";
import MarketsView from "./MarketsView";
import PortfolioView from "./PortfolioView";
import WatchlistView from "./WatchlistView";
import NewsView from "./NewsView";
import { LayoutDashboard, TrendingUp, Briefcase, Star, Newspaper } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const INITIAL_PRICE = 67432.50;
const INITIAL_CHANGE = 2.4;

function SettingsView() {
  return (
    <div style={{ padding: "24px 28px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Settings</h1>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)", marginBottom: 24 }}>Configure your Cryptex dashboard preferences</p>
      {[
        { section: "DISPLAY", items: [
          { label: "Currency", value: "USD", type: "select" },
          { label: "Theme", value: "Dark", type: "select" },
          { label: "Compact Mode", value: false, type: "toggle" },
        ]},
        { section: "NOTIFICATIONS", items: [
          { label: "Price Alerts", value: true, type: "toggle" },
          { label: "News Alerts", value: false, type: "toggle" },
          { label: "Portfolio Updates", value: true, type: "toggle" },
        ]},
        { section: "DATA", items: [
          { label: "Refresh Rate", value: "3s", type: "select" },
          { label: "Historical Range", value: "1Y", type: "select" },
        ]},
      ].map((group, gi) => (
        <div key={gi} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
            <span className="section-label">{group.section}</span>
          </div>
          {group.items.map((item, ii) => (
            <div key={ii} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "13px 16px",
              borderBottom: ii < group.items.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none"
            }}>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-1)" }}>{item.label}</span>
              {item.type === "toggle" ? (
                <div style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: item.value ? "var(--accent)" : "var(--bg-raised)",
                  border: "1px solid var(--border-2)",
                  position: "relative", cursor: "pointer"
                }}>
                  <div style={{
                    position: "absolute", top: 2,
                    left: item.value ? 17 : 2,
                    width: 14, height: 14, borderRadius: "50%",
                    background: "var(--text-1)",
                    transition: "left 0.2s ease"
                  }} />
                </div>
              ) : (
                <span style={{
                  fontFamily: "var(--font-data)", fontSize: 11,
                  color: "var(--text-2)",
                  background: "var(--bg-raised)", border: "1px solid var(--border)",
                  borderRadius: 4, padding: "3px 10px"
                }}>{item.value as string}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProfileView() {
  return (
    <div style={{ padding: "24px 28px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Profile</h1>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)", marginBottom: 24 }}>Manage your account and API connections</p>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px 20px", textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--accent-dim)", border: "2px solid var(--accent)",
            margin: "0 auto 12px",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>A</span>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Alex Trader</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-2)", marginBottom: 16 }}>alex@cryptex.io</div>
          <div style={{
            display: "inline-block",
            fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--bull)",
            background: "var(--bull-bg)", padding: "3px 10px", borderRadius: 3
          }}>Pro Plan · Active</div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[{ label: "Member Since", value: "Jan 2024" }, { label: "Portfolios", value: "3" }, { label: "Watchlists", value: "2" }, { label: "Alerts", value: "5" }].map((s, i) => (
              <div key={i} style={{ background: "var(--bg-raised)", borderRadius: 6, padding: "8px" }}>
                <div className="section-label" style={{ marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "ACCOUNT INFO", fields: [{ k: "Username", v: "alex_trader" }, { k: "Email", v: "alex@cryptex.io" }, { k: "Time Zone", v: "UTC+5:30" }] },
            { label: "API CONNECTIONS", fields: [{ k: "Binance", v: "Connected ✓" }, { k: "Coinbase", v: "Not connected" }, { k: "Kraken", v: "Not connected" }] },
          ].map((group, gi) => (
            <div key={gi} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                <span className="section-label">{group.label}</span>
              </div>
              {group.fields.map((f, fi) => (
                <div key={fi} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: fi < group.fields.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none"
                }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>{f.k}</span>
                  <span style={{
                    fontFamily: "var(--font-data)", fontSize: 11,
                    color: f.v.includes("✓") ? "var(--bull)" : "var(--text-1)"
                  }}>{f.v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardMain({ livePrice, priceChange }: { livePrice: number; priceChange: number }) {
  return (
    <>
      {/* Hero Row: Chart + Right Panel */}
      <div className="hero-row" style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
        <ChartPanel livePrice={livePrice} priceChange={priceChange} />
        <RightPanel />
      </div>

      {/* Market Table */}
      <div className="section">
        <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid var(--border)" }}>
          <span className="section-label">MARKET OVERVIEW</span>
        </div>
        <MarketTable />
      </div>

      {/* Bottom 3 cols */}
      <BottomSection />
    </>
  );
}

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" as NavId },
  { icon: TrendingUp, label: "Markets", id: "markets" as NavId },
  { icon: Briefcase, label: "Portfolio", id: "portfolio" as NavId },
  { icon: Star, label: "Watchlist", id: "watchlist" as NavId },
  { icon: Newspaper, label: "News", id: "news" as NavId },
];

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const [livePrice, setLivePrice] = useState(INITIAL_PRICE);
  const [priceChange, setPriceChange] = useState(INITIAL_CHANGE);
  const livePriceRef = useRef(INITIAL_PRICE);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.488) * 60;
      const newPrice = livePriceRef.current + delta;
      livePriceRef.current = newPrice;
      const el = document.querySelector(".ribbon-live-price") as HTMLElement;
      if (el) {
        gsap.to(el, { color: delta > 0 ? "#34D399" : "#F87171", duration: 0.1, onComplete: () => gsap.to(el, { color: "#E8E6F0", duration: 0.8 }) });
      }
      setLivePrice(newPrice);
      setPriceChange(prev => prev + delta * 0.0008);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animate content on nav switch
  function handleNav(id: NavId) {
    if (id === activeNav) return;
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0, y: 8, duration: 0.15, ease: "power1.in",
        onComplete: () => {
          setActiveNav(id);
          if (contentRef.current) contentRef.current.scrollTop = 0;
          gsap.fromTo(contentRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
        }
      });
    } else {
      setActiveNav(id);
    }
  }

  const showRibbon = activeNav === "dashboard";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Sidebar active={activeNav} onNav={handleNav} />

      <div className="main-content" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Ribbon + Ticker always visible */}
        <div style={{ flexShrink: 0 }}>
          <TopRibbon livePrice={livePrice} priceChange={priceChange} />
          <TickerTape />
        </div>

        {/* Scrollable content area */}
        <div ref={contentRef} style={{ flex: 1, overflowY: "auto" }}>
          {activeNav === "dashboard" && <DashboardMain livePrice={livePrice} priceChange={priceChange} />}
          {activeNav === "markets" && <MarketsView />}
          {activeNav === "portfolio" && <PortfolioView />}
          {activeNav === "watchlist" && <WatchlistView />}
          {activeNav === "news" && <NewsView />}
          {activeNav === "settings" && <SettingsView />}
          {activeNav === "profile" && <ProfileView />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {mobileNavItems.map(({ icon: Icon, label, id }) => (
          <button key={id} onClick={() => handleNav(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer",
            color: activeNav === id ? "var(--accent)" : "var(--text-3)",
            padding: "4px 12px", transition: "color 0.15s"
          }}>
            <Icon size={18} strokeWidth={activeNav === id ? 2 : 1.5} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 9 }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
