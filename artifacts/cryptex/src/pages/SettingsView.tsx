import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Check, Bell, Monitor, Database, Shield, RefreshCw } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Currency, Theme, FontSize, ChartType, RefreshRate } from "../context/AppContext";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 38, height: 22, borderRadius: 11,
        background: value ? "var(--accent)" : "var(--bg-raised)",
        border: `1px solid ${value ? "var(--accent)" : "var(--border-2)"}`,
        position: "relative", cursor: "pointer",
        transition: "background 0.2s ease, border-color 0.2s ease",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: value ? 18 : 3,
        width: 14, height: 14, borderRadius: "50%",
        background: value ? "#fff" : "var(--text-3)",
        transition: "left 0.2s ease, background 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)"
      }} />
    </div>
  );
}

function SelectField({ value, options, onChange }: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0, minWidth: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right, minWidth: r.width });
    }
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div>
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        style={{
          fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)",
          background: "var(--bg-raised)", border: `1px solid ${open ? "var(--accent)" : "var(--border-2)"}`,
          borderRadius: 5, padding: "4px 28px 4px 12px", cursor: "pointer",
          position: "relative", transition: "border-color 0.15s", whiteSpace: "nowrap",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
        onMouseLeave={e => !open && (e.currentTarget.style.borderColor = "var(--border-2)")}
      >
        {value}
        <span style={{
          position: "absolute", right: 8, top: "50%",
          transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
          color: "var(--text-3)", fontSize: 8, transition: "transform 0.15s",
        }}>▼</span>
      </button>
      {open && createPortal(
        <div
          ref={dropRef}
          style={{
            position: "fixed", top: pos.top, right: pos.right, minWidth: pos.minWidth,
            background: "var(--bg-surface)", border: "1px solid var(--border-2)",
            borderRadius: 8, zIndex: 9999,
            boxShadow: "0 12px 36px rgba(0,0,0,0.55)",
            overflow: "hidden",
          }}
        >
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: "9px 16px",
                fontFamily: "var(--font-data)", fontSize: 11,
                color: opt === value ? "var(--accent)" : "var(--text-1)",
                background: opt === value ? "var(--accent-dim)" : "transparent",
                cursor: "pointer", transition: "background 0.1s",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={e => { if (opt !== value) e.currentTarget.style.background = "var(--bg-raised)"; }}
              onMouseLeave={e => { if (opt !== value) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 12, display: "flex", alignItems: "center" }}>
                {opt === value && <Check size={10} style={{ color: "var(--accent)" }} />}
              </span>
              {opt}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

function SettingRow({ label, desc, control, last }: {
  label: string; desc: string; control: React.ReactNode; last?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: last ? "none" : "1px solid rgba(31,31,46,0.5)",
      transition: "background 0.1s"
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-1)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)" }}>{desc}</div>
      </div>
      {control}
    </div>
  );
}

export default function SettingsView() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { settings, updateSetting } = useApp();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    gsap.from(headerRef.current, { y: -16, opacity: 0, duration: 0.45, ease: "expo.out" });
    gsap.from(".settings-section", {
      y: 16, opacity: 0, stagger: 0.07, duration: 0.45, ease: "power2.out", delay: 0.1
    });
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    updateSetting("currency", "USD");
    updateSetting("theme", "Dark");
    updateSetting("compactMode", false);
    updateSetting("fontSize", "Medium");
    updateSetting("chartType", "Candlestick");
    updateSetting("priceAlerts", true);
    updateSetting("newsAlerts", false);
    updateSetting("portfolioUpdates", true);
    updateSetting("emailDigest", false);
    updateSetting("soundAlerts", true);
    updateSetting("refreshRate", "3s");
    updateSetting("historicalRange", "1Y");
    updateSetting("dataProvider", "CoinGecko");
    updateSetting("autoRefresh", true);
    updateSetting("analytics", true);
    updateSetting("crashReports", true);
    updateSetting("twoFactor", false);
    updateSetting("sessionTimeout", "30 min");
  }

  const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "JPY", "INR"];
  const THEMES: Theme[] = ["Dark", "Light", "System"];
  const FONTSIZES: FontSize[] = ["Small", "Medium", "Large"];
  const CHARTTYPES: ChartType[] = ["Candlestick", "Line", "Bar", "Area"];
  const RATES: RefreshRate[] = ["1s", "3s", "5s", "10s", "30s"];

  const sections = [
    {
      icon: Monitor, label: "DISPLAY",
      hint: "Theme + currency apply instantly",
      rows: [
        {
          label: "Currency", desc: "Live prices convert across the entire dashboard",
          control: <SelectField value={settings.currency} options={CURRENCIES} onChange={v => updateSetting("currency", v as Currency)} />
        },
        {
          label: "Theme", desc: "Switch between Dark, Light, or system default",
          control: <SelectField value={settings.theme} options={THEMES} onChange={v => updateSetting("theme", v as Theme)} />
        },
        {
          label: "Font Size", desc: "Adjusts all labels and data text size",
          control: <SelectField value={settings.fontSize} options={FONTSIZES} onChange={v => updateSetting("fontSize", v as FontSize)} />
        },
        {
          label: "Default Chart Type", desc: "Sets the initial chart visualization on load",
          control: <SelectField value={settings.chartType} options={CHARTTYPES} onChange={v => updateSetting("chartType", v as ChartType)} />
        },
        {
          label: "Compact Mode", desc: "Reduces spacing for a denser layout",
          control: <Toggle value={settings.compactMode} onChange={v => updateSetting("compactMode", v)} />
        },
      ]
    },
    {
      icon: Bell, label: "NOTIFICATIONS",
      hint: "Control which events trigger alerts",
      rows: [
        { label: "Price Alerts", desc: "Notify when watchlist coins hit target price", control: <Toggle value={settings.priceAlerts} onChange={v => updateSetting("priceAlerts", v)} /> },
        { label: "News Alerts", desc: "Breaking crypto news push notifications", control: <Toggle value={settings.newsAlerts} onChange={v => updateSetting("newsAlerts", v)} /> },
        { label: "Portfolio Updates", desc: "Daily P&L and performance summaries", control: <Toggle value={settings.portfolioUpdates} onChange={v => updateSetting("portfolioUpdates", v)} /> },
        { label: "Email Digest", desc: "Weekly market summary sent to your email", control: <Toggle value={settings.emailDigest} onChange={v => updateSetting("emailDigest", v)} /> },
        { label: "Sound Alerts", desc: "Subtle audio cue on significant price spikes", control: <Toggle value={settings.soundAlerts} onChange={v => updateSetting("soundAlerts", v)} /> },
      ]
    },
    {
      icon: Database, label: "DATA & PERFORMANCE",
      hint: "Refresh rate changes take effect immediately",
      rows: [
        {
          label: "Refresh Rate", desc: "How often live prices update",
          control: <SelectField value={settings.refreshRate} options={RATES} onChange={v => updateSetting("refreshRate", v as RefreshRate)} />
        },
        {
          label: "Historical Range", desc: "Default time range for charts",
          control: <SelectField value={settings.historicalRange} options={["1W", "1M", "3M", "6M", "1Y", "All"]} onChange={v => updateSetting("historicalRange", v)} />
        },
        {
          label: "Data Provider", desc: "Primary source for price data",
          control: <SelectField value={settings.dataProvider} options={["CoinGecko", "CoinMarketCap", "Binance"]} onChange={v => updateSetting("dataProvider", v)} />
        },
        {
          label: "Auto Refresh", desc: "Toggle off to freeze all live prices",
          control: <Toggle value={settings.autoRefresh} onChange={v => updateSetting("autoRefresh", v)} />
        },
      ]
    },
    {
      icon: Shield, label: "PRIVACY & SECURITY",
      hint: "Manage your data and account security",
      rows: [
        { label: "Analytics", desc: "Share anonymous usage data to improve Cryptex", control: <Toggle value={settings.analytics} onChange={v => updateSetting("analytics", v)} /> },
        { label: "Crash Reports", desc: "Automatically send crash diagnostics", control: <Toggle value={settings.crashReports} onChange={v => updateSetting("crashReports", v)} /> },
        { label: "Two-Factor Auth", desc: "Require 2FA on every login", control: <Toggle value={settings.twoFactor} onChange={v => updateSetting("twoFactor", v)} /> },
        {
          label: "Session Timeout", desc: "Auto-logout after period of inactivity",
          control: <SelectField value={settings.sessionTimeout} options={["15 min", "30 min", "1 hr", "4 hr", "Never"]} onChange={v => updateSetting("sessionTimeout", v)} />
        },
      ]
    },
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 780 }}>
      <div ref={headerRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Settings</h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>Changes apply instantly across the entire dashboard</p>
        </div>
        <button onClick={handleSave} style={{
          display: "flex", alignItems: "center", gap: 7,
          fontFamily: "var(--font-ui)", fontSize: 12,
          color: saved ? "var(--bull)" : "var(--text-1)",
          background: saved ? "var(--bull-bg)" : "var(--bg-raised)",
          border: `1px solid ${saved ? "var(--bull)" : "var(--border-2)"}`,
          borderRadius: 6, padding: "8px 16px", cursor: "pointer", transition: "all 0.2s ease"
        }}>
          {saved ? <Check size={13} /> : <RefreshCw size={13} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {sections.map((section, si) => {
        const Icon = section.icon;
        return (
          <div key={si} className="settings-section" style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 8, marginBottom: 12, overflow: "hidden",
            transition: "background-color 0.3s ease"
          }}>
            <div style={{
              padding: "11px 18px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon size={13} style={{ color: "var(--accent)" }} />
                <span className="section-label">{section.label}</span>
              </div>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)" }}>{section.hint}</span>
            </div>
            {section.rows.map((row, ri) => (
              <SettingRow
                key={ri}
                label={row.label}
                desc={row.desc}
                control={row.control}
                last={ri === section.rows.length - 1}
              />
            ))}
          </div>
        );
      })}

      <div className="settings-section" style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "16px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-1)", marginBottom: 2 }}>Reset to Defaults</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)" }}>Restore all settings to their original values</div>
        </div>
        <button onClick={handleReset} style={{
          fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bear)",
          background: "var(--bear-bg)", border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: 5, padding: "6px 14px", cursor: "pointer", transition: "all 0.15s"
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--bear)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)")}
        >
          Reset All
        </button>
      </div>
    </div>
  );
}
