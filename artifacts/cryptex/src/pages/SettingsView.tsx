import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Check, Bell, Monitor, Database, Shield, RefreshCw } from "lucide-react";

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
        position: "absolute",
        top: 3,
        left: value ? 18 : 3,
        width: 14, height: 14, borderRadius: "50%",
        background: value ? "#fff" : "var(--text-3)",
        transition: "left 0.2s ease, background 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)"
      }} />
    </div>
  );
}

function SelectField({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontFamily: "var(--font-data)", fontSize: 11,
          color: "var(--text-1)",
          background: "var(--bg-raised)", border: "1px solid var(--border-2)",
          borderRadius: 5, padding: "4px 28px 4px 12px",
          cursor: "pointer", position: "relative",
          transition: "border-color 0.15s"
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
        onMouseLeave={e => !open && (e.currentTarget.style.borderColor = "var(--border-2)")}
      >
        {value}
        <span style={{
          position: "absolute", right: 8, top: "50%", transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
          color: "var(--text-3)", fontSize: 8, transition: "transform 0.15s"
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 4px)",
          background: "var(--bg-raised)", border: "1px solid var(--border-2)",
          borderRadius: 6, zIndex: 100, minWidth: "100%", overflow: "hidden"
        }}>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: "7px 14px",
                fontFamily: "var(--font-data)", fontSize: 11,
                color: opt === value ? "var(--accent)" : "var(--text-1)",
                background: opt === value ? "var(--accent-dim)" : "transparent",
                cursor: "pointer", transition: "background 0.1s", display: "flex", alignItems: "center", gap: 8
              }}
              onMouseEnter={e => { if (opt !== value) e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={e => { if (opt !== value) e.currentTarget.style.background = "transparent"; }}
            >
              {opt === value && <Check size={10} style={{ color: "var(--accent)" }} />}
              {opt !== value && <span style={{ width: 10 }} />}
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsView() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);

  // Display
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("Dark");
  const [compactMode, setCompactMode] = useState(false);
  const [fontSize, setFontSize] = useState("Medium");
  const [chartType, setChartType] = useState("Candlestick");

  // Notifications
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(false);
  const [portfolioUpdates, setPortfolioUpdates] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Data
  const [refreshRate, setRefreshRate] = useState("3s");
  const [historicalRange, setHistoricalRange] = useState("1Y");
  const [dataProvider, setDataProvider] = useState("CoinGecko");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Privacy
  const [analytics, setAnalytics] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30 min");

  useEffect(() => {
    gsap.from(headerRef.current, { y: -16, opacity: 0, duration: 0.45, ease: "expo.out" });
    gsap.from(".settings-section", { y: 16, opacity: 0, stagger: 0.07, duration: 0.45, ease: "power2.out", delay: 0.1 });
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const sections = [
    {
      icon: Monitor, label: "DISPLAY",
      rows: [
        { label: "Currency", desc: "Default display currency for prices", control: <SelectField value={currency} options={["USD", "EUR", "GBP", "JPY", "INR"]} onChange={setCurrency} /> },
        { label: "Theme", desc: "Interface color scheme", control: <SelectField value={theme} options={["Dark", "Light", "System"]} onChange={setTheme} /> },
        { label: "Font Size", desc: "Data table and label font size", control: <SelectField value={fontSize} options={["Small", "Medium", "Large"]} onChange={setFontSize} /> },
        { label: "Default Chart Type", desc: "Preferred chart visualization", control: <SelectField value={chartType} options={["Candlestick", "Line", "Bar", "Area"]} onChange={setChartType} /> },
        { label: "Compact Mode", desc: "Reduce spacing for denser layout", control: <Toggle value={compactMode} onChange={setCompactMode} /> },
      ]
    },
    {
      icon: Bell, label: "NOTIFICATIONS",
      rows: [
        { label: "Price Alerts", desc: "Notify when watchlist coins hit target", control: <Toggle value={priceAlerts} onChange={setPriceAlerts} /> },
        { label: "News Alerts", desc: "Breaking crypto news notifications", control: <Toggle value={newsAlerts} onChange={setNewsAlerts} /> },
        { label: "Portfolio Updates", desc: "Daily P&L and performance summary", control: <Toggle value={portfolioUpdates} onChange={setPortfolioUpdates} /> },
        { label: "Email Digest", desc: "Weekly market summary via email", control: <Toggle value={emailDigest} onChange={setEmailDigest} /> },
        { label: "Sound Alerts", desc: "Audio cues for significant price moves", control: <Toggle value={soundAlerts} onChange={setSoundAlerts} /> },
      ]
    },
    {
      icon: Database, label: "DATA & PERFORMANCE",
      rows: [
        { label: "Refresh Rate", desc: "How often prices update", control: <SelectField value={refreshRate} options={["1s", "3s", "5s", "10s", "30s"]} onChange={setRefreshRate} /> },
        { label: "Historical Range", desc: "Default chart time range", control: <SelectField value={historicalRange} options={["1W", "1M", "3M", "6M", "1Y", "All"]} onChange={setHistoricalRange} /> },
        { label: "Data Provider", desc: "Price data source", control: <SelectField value={dataProvider} options={["CoinGecko", "CoinMarketCap", "Binance"]} onChange={setDataProvider} /> },
        { label: "Auto Refresh", desc: "Automatically refresh market data", control: <Toggle value={autoRefresh} onChange={setAutoRefresh} /> },
      ]
    },
    {
      icon: Shield, label: "PRIVACY & SECURITY",
      rows: [
        { label: "Analytics", desc: "Share anonymous usage data", control: <Toggle value={analytics} onChange={setAnalytics} /> },
        { label: "Crash Reports", desc: "Send automatic crash reports", control: <Toggle value={crashReports} onChange={setCrashReports} /> },
        { label: "Two-Factor Auth", desc: "Require 2FA on login", control: <Toggle value={twoFactor} onChange={setTwoFactor} /> },
        { label: "Session Timeout", desc: "Auto-logout after inactivity", control: <SelectField value={sessionTimeout} options={["15 min", "30 min", "1 hr", "4 hr", "Never"]} onChange={setSessionTimeout} /> },
      ]
    },
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 760 }}>
      <div ref={headerRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Settings</h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>Configure your Cryptex dashboard preferences</p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            fontFamily: "var(--font-ui)", fontSize: 12,
            color: saved ? "var(--bull)" : "var(--text-1)",
            background: saved ? "var(--bull-bg)" : "var(--bg-raised)",
            border: `1px solid ${saved ? "var(--bull)" : "var(--border-2)"}`,
            borderRadius: 6, padding: "8px 16px", cursor: "pointer",
            transition: "all 0.2s ease"
          }}>
          {saved ? <Check size={13} /> : <RefreshCw size={13} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {sections.map((section, si) => {
        const Icon = section.icon;
        return (
          <div key={si} className="settings-section" style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 8, marginBottom: 12, overflow: "hidden"
          }}>
            <div style={{
              padding: "11px 18px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 8
            }}>
              <Icon size={13} style={{ color: "var(--accent)" }} />
              <span className="section-label">{section.label}</span>
            </div>
            {section.rows.map((row, ri) => (
              <div key={ri} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: ri < section.rows.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none",
                transition: "background 0.1s"
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-1)", marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)" }}>{row.desc}</div>
                </div>
                {row.control}
              </div>
            ))}
          </div>
        );
      })}

      {/* Reset section */}
      <div className="settings-section" style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "16px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-1)", marginBottom: 2 }}>Reset to Defaults</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)" }}>Restore all settings to their original values</div>
        </div>
        <button style={{
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
