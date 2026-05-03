import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import {
  LayoutDashboard, TrendingUp, Briefcase, Star, Newspaper,
  Settings, User, ChevronLeft, ChevronRight,
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

/* ── Nav button ──────────────────────────────────────────────────────────── */
interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  id: NavId;
  active: NavId;
  onNav: (id: NavId) => void;
  expanded: boolean;
}

function NavButton({ icon: Icon, label, id, active, onNav, expanded }: NavButtonProps) {
  const isActive = active === id;
  const iconRef  = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  function handleClick() {
    if (!isActive && iconRef.current) {
      gsap.fromTo(iconRef.current, { scale: 0.82 }, { scale: 1, duration: 0.32, ease: "back.out(2.5)" });
    }
    onNav(id);
  }
  function handleEnter() {
    setHovered(true);
    if (!isActive && iconRef.current)
      gsap.to(iconRef.current, { scale: 1.14, duration: 0.2, ease: "back.out(1.7)" });
  }
  function handleLeave() {
    setHovered(false);
    if (iconRef.current) gsap.to(iconRef.current, { scale: 1, duration: 0.18, ease: "power2.out" });
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        className={`nav-item ${isActive ? "active" : ""}`}
        onClick={handleClick}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        aria-label={label}
        style={{
          width: "100%", height: 40,
          display: "flex", alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          gap: 10,
          paddingLeft: expanded ? 18 : 0,
          paddingRight: expanded ? 14 : 0,
          background: isActive
            ? "rgba(59,130,246,0.1)"
            : hovered ? "rgba(59,130,246,0.05)" : "none",
          border: "none", cursor: "pointer",
          color: isActive ? "var(--accent)" : hovered ? "var(--text-2)" : "var(--text-3)",
          transition: "color 0.15s, background 0.15s",
          position: "relative",
        }}
      >
        <div ref={iconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} strokeWidth={isActive ? 2.2 : 1.6} />
        </div>
        {expanded && (
          <span style={{
            fontFamily: "var(--font-ui)", fontSize: 12,
            fontWeight: isActive ? 600 : 400,
            whiteSpace: "nowrap", overflow: "hidden",
          }}>{label}</span>
        )}
      </button>

      {/* Tooltip — collapsed only */}
      {!expanded && hovered && (
        <div style={{
          position: "absolute", left: "calc(100% + 10px)", top: "50%",
          transform: "translateY(-50%)",
          background: "var(--bg-surface)", border: "1px solid var(--border-2)",
          borderLeft: "2px solid var(--accent)",
          borderRadius: 6, padding: "5px 12px",
          fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 500,
          color: "var(--text-1)", whiteSpace: "nowrap",
          zIndex: 300, pointerEvents: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          animation: "tooltipIn 0.14s ease forwards",
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
export interface SidebarProps {
  active: NavId;
  onNav: (id: NavId) => void;
  expanded: boolean;
  onToggle: () => void;
}

export default function Sidebar({ active, onNav, expanded, onToggle }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logoRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(sidebarRef.current, { x: -64, opacity: 0, duration: 0.48 })
      .from(logoRef.current,    { opacity: 0, scale: 0.82, duration: 0.3 }, "-=0.22")
      .from(".nav-item",        { opacity: 0, x: -10, stagger: 0.06, duration: 0.28 }, "-=0.14");
  }, []);

  const [toggleHovered, setToggleHovered] = useState(false);

  return (
    <div
      ref={sidebarRef}
      className="sidebar"
      style={{
        width: expanded ? 192 : 64,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        alignItems: "stretch",
        zIndex: 40,
      }}
    >
      {/* ── Logo ── */}
      <div
        onClick={() => onNav("dashboard")}
        style={{
          height: 56,
          display: "flex", alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          gap: 10, padding: expanded ? "0 14px 0 16px" : "0",
          cursor: "pointer", flexShrink: 0,
        }}
      >
        <div
          ref={logoRef}
          style={{
            width: 32, height: 32, flexShrink: 0,
            background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.04))",
            border: "1.5px solid var(--accent)", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "var(--accent)",
            boxShadow: "0 0 14px rgba(59,130,246,0.22)",
          }}
        >C</div>

        {expanded && (
          <div style={{ overflow: "hidden" }}>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700,
              color: "var(--text-1)", whiteSpace: "nowrap", letterSpacing: "0.02em",
            }}>CRYPTEX</div>
            <div style={{
              fontFamily: "var(--font-data)", fontSize: 8,
              color: "var(--text-3)", whiteSpace: "nowrap", letterSpacing: "0.1em",
            }}>Analytics Pro</div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "0 10px 4px" }} />

      {/* ── Main nav ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", paddingTop: 4 }}>
        {navItems.map(item => (
          <NavButton key={item.id} {...item} active={active} onNav={onNav} expanded={expanded} />
        ))}
      </div>

      {/* ── Bottom ── */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ height: 1, background: "var(--border)", margin: "0 10px 2px" }} />

        {bottomItems.map(item => (
          <NavButton key={item.id} {...item} active={active} onNav={onNav} expanded={expanded} />
        ))}

        {/* Collapse / Expand toggle */}
        <div style={{ height: 1, background: "var(--border)", margin: "2px 10px 2px" }} />
        <button
          onClick={onToggle}
          onMouseEnter={() => setToggleHovered(true)}
          onMouseLeave={() => setToggleHovered(false)}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            width: "100%", height: 36,
            display: "flex", alignItems: "center",
            justifyContent: expanded ? "flex-start" : "center",
            gap: 10, paddingLeft: expanded ? 18 : 0, paddingRight: expanded ? 14 : 0,
            background: toggleHovered ? "rgba(59,130,246,0.05)" : "none",
            border: "none", cursor: "pointer",
            color: toggleHovered ? "var(--text-2)" : "var(--text-3)",
            transition: "color 0.15s, background 0.15s",
          }}
        >
          {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          {expanded && (
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, whiteSpace: "nowrap" }}>Collapse</span>
          )}
        </button>

        {/* Live indicator */}
        <div style={{
          height: 36, display: "flex", alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          gap: 7, paddingLeft: expanded ? 19 : 0,
          paddingBottom: 6,
        }}>
          <div className="live-dot" style={{ flexShrink: 0 }} />
          {expanded && (
            <span style={{
              fontFamily: "var(--font-data)", fontSize: 9,
              color: "var(--bull)", letterSpacing: "0.12em", whiteSpace: "nowrap",
            }}>LIVE</span>
          )}
        </div>
      </div>
    </div>
  );
}
