import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  LayoutDashboard, TrendingUp, Briefcase, Star, Newspaper,
  Settings, User,
} from "lucide-react";

export type NavId = "dashboard" | "markets" | "portfolio" | "watchlist" | "news" | "settings" | "profile";

const navItems: { icon: React.ElementType; label: string; id: NavId }[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: TrendingUp,      label: "Markets",   id: "markets"   },
  { icon: Briefcase,       label: "Portfolio", id: "portfolio" },
  { icon: Star,            label: "Watchlist", id: "watchlist" },
  { icon: Newspaper,       label: "News",      id: "news"      },
];

const bottomItems: { icon: React.ElementType; label: string; id: NavId }[] = [
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: User,     label: "Profile",  id: "profile"  },
];

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  id: NavId;
  active: NavId;
  onNav: (id: NavId) => void;
}

function NavButton({ icon: Icon, label, id, active, onNav }: NavButtonProps) {
  const isActive = active === id;
  const btnRef   = useRef<HTMLButtonElement>(null);
  const iconRef  = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (!isActive && iconRef.current) {
      gsap.fromTo(iconRef.current,
        { scale: 0.85 },
        { scale: 1, duration: 0.35, ease: "back.out(2.5)" }
      );
    }
    onNav(id);
  };

  const handleEnter = () => {
    setHovered(true);
    if (!isActive && iconRef.current) {
      gsap.to(iconRef.current, { scale: 1.18, duration: 0.2, ease: "back.out(1.7)" });
    }
  };

  const handleLeave = () => {
    setHovered(false);
    if (iconRef.current) {
      gsap.to(iconRef.current, { scale: 1, duration: 0.18, ease: "power2.out" });
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        ref={btnRef}
        className={`nav-item ${isActive ? "active" : ""}`}
        onClick={handleClick}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        aria-label={label}
        style={{
          width: "100%", height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isActive ? "rgba(59,130,246,0.1)" : "none",
          border: "none", cursor: "pointer",
          color: isActive ? "var(--accent)" : "var(--text-3)",
          transition: "color 0.18s, background 0.18s",
          position: "relative",
        }}
      >
        <div ref={iconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.5} />
        </div>
      </button>

      {/* Tooltip — slides in to the right */}
      {hovered && (
        <div style={{
          position: "absolute", left: "calc(100% + 12px)", top: "50%",
          transform: "translateY(-50%)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-2)",
          borderLeft: "2px solid var(--accent)",
          borderRadius: 6, padding: "5px 12px",
          fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 500,
          color: "var(--text-1)", whiteSpace: "nowrap",
          zIndex: 300, pointerEvents: "none",
          boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          animation: "tooltipIn 0.15s ease forwards",
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  active: NavId;
  onNav: (id: NavId) => void;
}

export default function Sidebar({ active, onNav }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logoRef    = useRef<HTMLDivElement>(null);
  const navRef     = useRef<HTMLDivElement>(null);
  const btmRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    tl.from(sidebarRef.current, { x: -64, opacity: 0, duration: 0.5 })
      .from(logoRef.current, { opacity: 0, scale: 0.8, duration: 0.35 }, "-=0.25")
      .from(
        navRef.current?.querySelectorAll(".nav-item") ?? [],
        { opacity: 0, x: -12, stagger: 0.07, duration: 0.3 },
        "-=0.15"
      )
      .from(
        btmRef.current?.querySelectorAll(".nav-item") ?? [],
        { opacity: 0, x: -10, stagger: 0.06, duration: 0.25 },
        "-=0.15"
      );
  }, []);

  const handleLogoHover = (enter: boolean) => {
    if (!logoRef.current) return;
    gsap.to(logoRef.current, {
      boxShadow: enter
        ? "0 0 18px rgba(59,130,246,0.45)"
        : "0 0 10px rgba(59,130,246,0.2)",
      duration: 0.25,
    });
  };

  return (
    <div className="sidebar" ref={sidebarRef} style={{ zIndex: 40 }}>

      {/* ── Logo ── */}
      <div
        onClick={() => onNav("dashboard")}
        style={{
          padding: "16px 0 12px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          cursor: "pointer", width: "100%",
        }}
      >
        <div
          ref={logoRef}
          onMouseEnter={() => handleLogoHover(true)}
          onMouseLeave={() => handleLogoHover(false)}
          style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(59,130,246,0.05))",
            border: "1.5px solid var(--accent)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontSize: 17, fontWeight: 800,
            color: "var(--accent)",
            boxShadow: "0 0 10px rgba(59,130,246,0.2)",
            transition: "border-color 0.2s",
          }}
        >C</div>

        <span style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          fontFamily: "var(--font-ui)",
          fontSize: 7,
          letterSpacing: "0.22em",
          color: "var(--text-3)",
          textTransform: "uppercase",
        }}>CRYPTEX</span>
      </div>

      {/* Divider */}
      <div style={{ width: 32, height: 1, background: "var(--border)", margin: "0 auto 4px" }} />

      {/* ── Main nav ── */}
      <div
        ref={navRef}
        style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", paddingTop: 8 }}
      >
        {navItems.map(item => (
          <NavButton key={item.id} {...item} active={active} onNav={onNav} />
        ))}
      </div>

      {/* ── Bottom nav ── */}
      <div
        ref={btmRef}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", paddingBottom: 14 }}
      >
        <div style={{ width: 32, height: 1, background: "var(--border)", margin: "4px auto 4px" }} />
        {bottomItems.map(item => (
          <NavButton key={item.id} {...item} active={active} onNav={onNav} />
        ))}

        {/* Live indicator */}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <div className="live-dot" />
          <span style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "var(--font-data)",
            fontSize: 7,
            color: "var(--bull)",
            letterSpacing: "0.15em",
          }}>LIVE</span>
        </div>
      </div>
    </div>
  );
}
