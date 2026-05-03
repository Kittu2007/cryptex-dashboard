import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Sidebar from "../components/Sidebar";
import TopRibbon from "../components/TopRibbon";
import TickerTape from "../components/TickerTape";
import ChartPanel from "../components/ChartPanel";
import RightPanel from "../components/RightPanel";
import MarketTable from "../components/MarketTable";
import BottomSection from "../components/BottomSection";
import { LayoutDashboard, TrendingUp, Briefcase, Star, Newspaper } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const INITIAL_PRICE = 67432.50;
const INITIAL_CHANGE = 2.4;

export default function Dashboard() {
  const [livePrice, setLivePrice] = useState(INITIAL_PRICE);
  const [priceChange, setPriceChange] = useState(INITIAL_CHANGE);
  const livePriceRef = useRef(INITIAL_PRICE);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.488) * 60;
      const newPrice = livePriceRef.current + delta;
      livePriceRef.current = newPrice;

      // Flash the ribbon price element
      const el = document.querySelector(".ribbon-live-price") as HTMLElement;
      if (el) {
        gsap.to(el, {
          color: delta > 0 ? "#34D399" : "#F87171",
          duration: 0.1,
          onComplete: () => gsap.to(el, { color: "#E8E6F0", duration: 0.8 })
        });
      }

      setLivePrice(newPrice);
      setPriceChange(prev => prev + delta * 0.001);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      <Sidebar />
      <div className="main-content">
        <TopRibbon livePrice={livePrice} priceChange={priceChange} />
        <TickerTape />

        {/* Hero Row: Chart + Right Panel */}
        <div className="hero-row" style={{
          display: "flex",
          borderBottom: "1px solid var(--border)"
        }}>
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
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {[
          { icon: LayoutDashboard, label: "Dashboard" },
          { icon: TrendingUp, label: "Markets" },
          { icon: Briefcase, label: "Portfolio" },
          { icon: Star, label: "Watchlist" },
          { icon: Newspaper, label: "News" },
        ].map(({ icon: Icon, label }, i) => (
          <button key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer",
            color: i === 0 ? "var(--accent)" : "var(--text-3)",
            padding: "4px 12px"
          }}>
            <Icon size={18} strokeWidth={i === 0 ? 2 : 1.5} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 9 }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
