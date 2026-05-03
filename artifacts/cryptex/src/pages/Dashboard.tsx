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
import SettingsView from "./SettingsView";
import ProfileView from "./ProfileView";
import CoinDetailView from "./CoinDetailView";
import { CoinNavContext } from "../context/CoinNavContext";
import { useApp, REFRESH_MS } from "../context/AppContext";
import { LayoutDashboard, TrendingUp, Briefcase, Star, Newspaper } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const INITIAL_PRICE  = 67432.50;
const INITIAL_CHANGE = 2.4;

function DashboardMain({ livePrice, priceChange }: { livePrice: number; priceChange: number }) {
  return (
    <>
      <div className="hero-row" style={{
        display: "flex", borderBottom: "1px solid var(--border)", alignItems: "stretch",
      }}>
        <ChartPanel livePrice={livePrice} priceChange={priceChange} />
        <div className="right-panel-outer">
          <RightPanel />
        </div>
      </div>
      <div className="section">
        <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid var(--border)" }}>
          <span className="section-label">MARKET OVERVIEW</span>
        </div>
        <MarketTable />
      </div>
      <BottomSection />
    </>
  );
}

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" as NavId },
  { icon: TrendingUp,      label: "Markets",   id: "markets"   as NavId },
  { icon: Briefcase,       label: "Portfolio", id: "portfolio" as NavId },
  { icon: Star,            label: "Watchlist", id: "watchlist" as NavId },
  { icon: Newspaper,       label: "News",      id: "news"      as NavId },
];

const SIDEBAR_COLLAPSED = 64;
const SIDEBAR_EXPANDED  = 192;

export default function Dashboard() {
  const { settings } = useApp();
  const [activeNav,       setActiveNav]       = useState<NavId>("dashboard");
  const [activeCoin,      setActiveCoin]      = useState<string | null>(null);
  const [livePrice,       setLivePrice]       = useState(INITIAL_PRICE);
  const [priceChange,     setPriceChange]     = useState(INITIAL_CHANGE);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobile,        setIsMobile]        = useState(() => window.innerWidth <= 768);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const livePriceRef = useRef(INITIAL_PRICE);
  const contentRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!settings.autoRefresh) return;
    const intervalMs = REFRESH_MS[settings.refreshRate];
    const interval = setInterval(() => {
      const delta    = (Math.random() - 0.488) * 60;
      const newPrice = livePriceRef.current + delta;
      livePriceRef.current = newPrice;
      const el = document.querySelector(".ribbon-live-price") as HTMLElement;
      if (el) {
        gsap.to(el, {
          color: delta > 0 ? "#22C55E" : "#EF4444", duration: 0.1,
          onComplete: () => gsap.to(el, { color: "var(--text-1)", duration: 0.8 }),
        });
      }
      if (settings.soundAlerts && Math.abs(delta) > 40) {
        try {
          const ctx  = new AudioContext();
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = delta > 0 ? 880 : 440;
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(); osc.stop(ctx.currentTime + 0.2);
        } catch { /* AudioContext not available */ }
      }
      setLivePrice(newPrice);
      setPriceChange(prev => prev + delta * 0.0008);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshRate, settings.soundAlerts]);

  // ── Animated page transition helper ──────────────────────────────────────
  function animateOut(cb: () => void) {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0, y: 8, duration: 0.15, ease: "power1.in",
        onComplete: () => {
          cb();
          if (contentRef.current) contentRef.current.scrollTop = 0;
          gsap.fromTo(contentRef.current,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
          );
        },
      });
    } else {
      cb();
    }
  }

  function handleNav(id: NavId) {
    if (id === activeNav && !activeCoin) return;
    animateOut(() => { setActiveCoin(null); setActiveNav(id); });
  }

  // Called by any coin-clickable element in any view
  function navigateToCoin(symbol: string) {
    if (activeCoin === symbol) return;
    animateOut(() => setActiveCoin(symbol));
  }

  // Back button in CoinDetailView
  function handleBack() {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0, y: -8, duration: 0.15, ease: "power1.in",
        onComplete: () => {
          setActiveCoin(null);
          if (contentRef.current) contentRef.current.scrollTop = 0;
          gsap.fromTo(contentRef.current,
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
          );
        },
      });
    } else {
      setActiveCoin(null);
    }
  }

  const sidebarW = isMobile ? 0 : (sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)", transition: "background-color 0.3s ease" }}>
      {/* Mobile sidebar backdrop */}
      <div
        className={`sidebar-backdrop${mobileMenuOpen ? " open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <Sidebar
        active={activeNav}
        onNav={handleNav}
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(v => !v)}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="main-content" style={{ display: "flex", flexDirection: "column", height: "100vh", marginLeft: sidebarW }}>
        <div style={{ flexShrink: 0 }}>
          <TopRibbon onMenuOpen={() => setMobileMenuOpen(true)} />
          <TickerTape />
        </div>

        <CoinNavContext.Provider value={{ navigateToCoin }}>
          <div ref={contentRef} style={{ flex: 1, overflowY: "auto" }}>
            {activeCoin ? (
              <CoinDetailView symbol={activeCoin} onBack={handleBack} />
            ) : (
              <>
                {activeNav === "dashboard" && <DashboardMain livePrice={livePrice} priceChange={priceChange} />}
                {activeNav === "markets"   && <MarketsView />}
                {activeNav === "portfolio" && <PortfolioView />}
                {activeNav === "watchlist" && <WatchlistView />}
                {activeNav === "news"      && <NewsView />}
                {activeNav === "settings"  && <SettingsView />}
                {activeNav === "profile"   && <ProfileView />}
              </>
            )}
          </div>
        </CoinNavContext.Provider>
      </div>

      {!settings.autoRefresh && (
        <div style={{
          position: "fixed", bottom: 72, right: 16, zIndex: 100,
          background: "var(--bear-bg)", border: "1px solid var(--bear)",
          borderRadius: 6, padding: "6px 12px",
          fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bear)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--bear)", display: "inline-block" }} />
          Live prices paused
        </div>
      )}

      <nav className="bottom-nav">
        {mobileNavItems.map(({ icon: Icon, label, id }) => (
          <button key={id} onClick={() => handleNav(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer",
            color: activeNav === id && !activeCoin ? "var(--accent)" : "var(--text-3)",
            padding: "4px 12px", transition: "color 0.15s",
          }}>
            <Icon size={18} strokeWidth={activeNav === id && !activeCoin ? 2 : 1.5} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 9 }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
