import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  LayoutDashboard, TrendingUp, Briefcase, Star, Newspaper,
  Settings, User
} from "lucide-react";

export type NavId = "dashboard" | "markets" | "portfolio" | "watchlist" | "news" | "settings" | "profile";

const navItems: { icon: React.ElementType; label: string; id: NavId }[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: TrendingUp, label: "Markets", id: "markets" },
  { icon: Briefcase, label: "Portfolio", id: "portfolio" },
  { icon: Star, label: "Watchlist", id: "watchlist" },
  { icon: Newspaper, label: "News", id: "news" },
];

const bottomItems: { icon: React.ElementType; label: string; id: NavId }[] = [
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: User, label: "Profile", id: "profile" },
];

interface SidebarProps {
  active: NavId;
  onNav: (id: NavId) => void;
}

export default function Sidebar({ active, onNav }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(sidebarRef.current, {
      x: -64, opacity: 0, duration: 0.6, ease: "expo.out"
    });
  }, []);

  const NavButton = ({ icon: Icon, label, id }: { icon: React.ElementType; label: string; id: NavId }) => {
    const isActive = active === id;
    return (
      <button
        className={`nav-item ${isActive ? "active" : ""}`}
        onClick={() => onNav(id)}
        title={label}
        style={{
          width: "100%", height: 40,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "none", cursor: "pointer",
          color: isActive ? "var(--accent)" : "var(--text-3)",
          transition: "color 0.15s ease",
          position: "relative",
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--text-2)"; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--text-3)"; }}
      >
        <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
      </button>
    );
  };

  return (
    <div className="sidebar" ref={sidebarRef}>
      {/* Logo */}
      <div style={{ padding: "20px 0 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div
          onClick={() => onNav("dashboard")}
          style={{
            width: 32, height: 32,
            border: "2px solid var(--accent)",
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontSize: 16, fontWeight: 700,
            color: "var(--accent)",
            cursor: "pointer"
          }}>C</div>
        <span style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          fontFamily: "var(--font-ui)",
          fontSize: 7,
          letterSpacing: "0.22em",
          color: "var(--text-3)",
          textTransform: "uppercase",
          marginTop: 2
        }}>CRYPTEX</span>
      </div>

      <div style={{ width: "100%", height: 1, background: "var(--border)", margin: "0 0 8px" }} />

      {/* Main Nav */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 8 }}>
        {navItems.map(item => <NavButton key={item.id} {...item} />)}
      </div>

      {/* Bottom */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingBottom: 16 }}>
        <div style={{ width: "100%", height: 1, background: "var(--border)", margin: "4px 0 8px" }} />
        {bottomItems.map(item => <NavButton key={item.id} {...item} />)}
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div className="live-dot" />
          <span style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "var(--font-data)",
            fontSize: 7,
            color: "var(--bull)",
            letterSpacing: "0.15em"
          }}>LIVE</span>
        </div>
      </div>
    </div>
  );
}
