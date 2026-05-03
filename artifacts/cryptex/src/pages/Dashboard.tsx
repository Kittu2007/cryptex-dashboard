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
import { useApp, REFRESH_MS } from "../context/AppContext";
import { LayoutDashboard, TrendingUp, Briefcase, Star, Newspaper } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const INITIAL_PRICE = 67432.50;
const INITIAL_CHANGE = 2.4;

function DashboardMain({ livePrice, priceChange }: { livePrice: number; priceChange: number }) {
  return (
    <>
      <div className="hero-row" style={{
        display: "flex", borderBottom: "1px solid var(--border)",
        height: 460, minHeight: 0, overflow: "hidden"
      }}>
        <ChartPanel livePrice={livePrice} priceChange={priceChange} />
        <RightPanel />
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
  { icon: TrendingUp, label: "Markets", id: "markets" as NavId },
  { icon: Briefcase, label: "Portfolio", id: "portfolio" as NavId },
  { icon: Star, label: "Watchlist", id: "watchlist" as NavId },
  { icon: Newspaper, label: "News", id: "news" as NavId },
];

export default function Dashboard() {
  const { settings } = useApp();
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const [livePrice, setLivePrice] = useState(INITIAL_PRICE);
  const [priceChange, setPriceChange] = useState(INITIAL_CHANGE);
  const livePriceRef = useRef(INITIAL_PRICE);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settings.autoRefresh) return;

    const intervalMs = REFRESH_MS[settings.refreshRate];
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.488) * 60;
      const newPrice = livePriceRef.current + delta;
      livePriceRef.current = newPrice;
      const el = document.querySelector(".ribbon-live-price") as HTMLElement;
      if (el) {
        gsap.to(el, {
          color: delta > 0 ? "#34D399" : "#F87171", duration: 0.1,
          onComplete: () => gsap.to(el, { color: "var(--text-1)", duration: 0.8 })
        });
      }
      // Sound alert on large moves
      if (settings.soundAlerts && Math.abs(delta) > 40) {
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = delta > 0 ? 880 : 440;
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        } catch { /* AudioContext not available */ }
      }
      setLivePrice(newPrice);
      setPriceChange(prev => prev + delta * 0.0008);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshRate, settings.soundAlerts]);

  function handleNav(id: NavId) {
    if (id === activeNav) return;
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0, y: 8, duration: 0.15, ease: "power1.in",
        onComplete: () => {
          setActiveNav(id);
          if (contentRef.current) contentRef.current.scrollTop = 0;
          gsap.fromTo(contentRef.current,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
          );
        }
      });
    } else {
      setActiveNav(id);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)", transition: "background-color 0.3s ease" }}>
      <Sidebar active={activeNav} onNav={handleNav} />

      <div className="main-content" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <div style={{ flexShrink: 0 }}>
          <TopRibbon />
          <TickerTape />
        </div>

        <div ref={contentRef} style={{ flex: 1, overflowY: "auto" }}>
          {activeNav === "dashboard"  && <DashboardMain livePrice={livePrice} priceChange={priceChange} />}
          {activeNav === "markets"    && <MarketsView />}
          {activeNav === "portfolio"  && <PortfolioView />}
          {activeNav === "watchlist"  && <WatchlistView />}
          {activeNav === "news"       && <NewsView />}
          {activeNav === "settings"   && <SettingsView />}
          {activeNav === "profile"    && <ProfileView />}
        </div>
      </div>

      {!settings.autoRefresh && (
        <div style={{
          position: "fixed", bottom: 72, right: 16, zIndex: 100,
          background: "var(--bear-bg)", border: "1px solid var(--bear)",
          borderRadius: 6, padding: "6px 12px",
          fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bear)",
          display: "flex", alignItems: "center", gap: 6
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
