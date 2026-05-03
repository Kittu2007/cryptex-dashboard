import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Edit2, Check, X, Copy, Link2, LogOut, Key } from "lucide-react";
import { portfolio } from "../mockData";
import { useApp } from "../context/AppContext";

function EditableField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "13px 18px", borderBottom: "1px solid rgba(31,31,46,0.5)",
      transition: "background 0.1s"
    }}
      onMouseEnter={e => !editing && (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {editing ? (
          <>
            <input value={draft} onChange={e => setDraft(e.target.value)} autoFocus
              onKeyDown={e => { if (e.key === "Enter") { onSave(draft); setEditing(false); } if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
              style={{
                fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)",
                background: "var(--bg-raised)", border: "1px solid var(--accent)",
                borderRadius: 4, padding: "3px 8px", outline: "none", width: 200
              }} />
            <button onClick={() => { onSave(draft); setEditing(false); }} style={{
              width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--bull-bg)", border: "1px solid var(--bull)", borderRadius: 4, cursor: "pointer", color: "var(--bull)"
            }}><Check size={11} /></button>
            <button onClick={() => { setDraft(value); setEditing(false); }} style={{
              width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--bear-bg)", border: "1px solid var(--bear)", borderRadius: 4, cursor: "pointer", color: "var(--bear)"
            }}><X size={11} /></button>
          </>
        ) : (
          <>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>{value}</span>
            <button onClick={() => setEditing(true)} style={{
              width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer",
              color: "var(--text-3)", transition: "all 0.15s"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
            ><Edit2 size={10} /></button>
          </>
        )}
      </div>
    </div>
  );
}

type APIStatus = "connected" | "disconnected" | "error";
interface APIConnection { name: string; status: APIStatus; key: string; }

export default function ProfileView() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { profile, updateProfile, formatPrice } = useApp();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("Account");
  const [apis, setApis] = useState<APIConnection[]>([
    { name: "Binance", status: "connected", key: "bnb_key_••••••••••••3f8a" },
    { name: "Coinbase", status: "disconnected", key: "" },
    { name: "Kraken", status: "disconnected", key: "" },
    { name: "OKX", status: "error", key: "okx_key_••••••••••••7c2b" },
  ]);
  const [sessions] = useState([
    { device: "Chrome · MacOS", location: "Mumbai, IN", time: "Active now", current: true },
    { device: "Safari · iPhone", location: "Mumbai, IN", time: "2h ago", current: false },
    { device: "Firefox · Windows", location: "Delhi, IN", time: "3d ago", current: false },
  ]);
  const [revokedSessions, setRevokedSessions] = useState<Set<number>>(new Set());

  useEffect(() => {
    gsap.from(headerRef.current, { y: -16, opacity: 0, duration: 0.45, ease: "expo.out" });
    gsap.from(".profile-card", { y: 16, opacity: 0, stagger: 0.08, duration: 0.45, ease: "power2.out", delay: 0.1 });
  }, []);

  function handleCopyId() { setCopied(true); setTimeout(() => setCopied(false), 2000); }

  function toggleAPI(idx: number) {
    setApis(prev => prev.map((a, i) => {
      if (i !== idx) return a;
      const nextStatus: APIStatus = a.status === "connected" ? "disconnected" : "connected";
      return { ...a, status: nextStatus, key: nextStatus === "connected" ? `key_••••••••••••${Math.random().toString(36).slice(-4)}` : "" };
    }));
  }

  function revokeSession(i: number) {
    setRevokedSessions(prev => new Set([...prev, i]));
  }

  const statusColor = (s: APIStatus) => s === "connected" ? "var(--bull)" : s === "error" ? "var(--bear)" : "var(--text-3)";
  const statusBg = (s: APIStatus) => s === "connected" ? "var(--bull-bg)" : s === "error" ? "var(--bear-bg)" : "transparent";

  const tabs = ["Account", "API Keys", "Security", "Billing"];

  return (
    <div className="page-wrap" style={{ padding: "24px 28px" }}>
      <div ref={headerRef} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Profile</h1>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>Manage your account, API connections, and security</p>
      </div>

      <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>
        {/* Avatar card */}
        <div className="profile-card" style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "24px 20px", textAlign: "center"
        }}>
          <div style={{
            width: 76, height: 76, borderRadius: "50%",
            background: "var(--accent-dim)", border: "2px solid var(--accent)",
            margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative"
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--accent)" }}>
              {profile.displayName[0].toUpperCase()}
            </span>
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 3 }}>
            {profile.displayName}
          </div>
          <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-2)", marginBottom: 4 }}>@{profile.username}</div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)", marginBottom: 14 }}>{profile.email}</div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--bull)",
            background: "var(--bull-bg)", padding: "3px 10px", borderRadius: 3, marginBottom: 16
          }}>
            <div className="live-dot" style={{ width: 4, height: 4 }} />
            Pro Plan · Active
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
            {[
              { label: "Since", value: "Jan 2024" },
              { label: "Portfolios", value: "3" },
              { label: "Watchlists", value: "2" },
              { label: "Alerts", value: "5" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--bg-raised)", borderRadius: 6, padding: "8px" }}>
                <div className="section-label" style={{ marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--text-1)" }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--bg-raised)", borderRadius: 6, padding: "10px", marginBottom: 14 }}>
            <div className="section-label" style={{ marginBottom: 4 }}>PORTFOLIO VALUE</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--text-1)" }}>
              {formatPrice(portfolio.totalValue)}
            </div>
            <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--bull)", marginTop: 2 }}>
              +{portfolio.totalGainPct}% all time
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-3)", flex: 1, textAlign: "left" }}>
              ID: usr_a7f2b9c4
            </span>
            <button onClick={handleCopyId} style={{
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "var(--font-ui)", fontSize: 9,
              color: copied ? "var(--bull)" : "var(--text-3)",
              background: "none", border: "none", cursor: "pointer", transition: "color 0.15s"
            }}>
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <button style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bear)",
              background: "var(--bear-bg)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 6, padding: "8px", cursor: "pointer", transition: "border-color 0.15s"
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--bear)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)")}
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div>
          <div className="profile-card" style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                fontFamily: "var(--font-ui)", fontSize: 12,
                color: activeTab === t ? "var(--text-1)" : "var(--text-2)",
                background: "none", border: "none",
                borderBottom: activeTab === t ? "2px solid var(--accent)" : "2px solid transparent",
                padding: "8px 16px", cursor: "pointer", marginBottom: -1, transition: "color 0.15s"
              }}>{t}</button>
            ))}
          </div>

          {activeTab === "Account" && (
            <div className="profile-card" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "11px 18px", borderBottom: "1px solid var(--border)" }}>
                <span className="section-label">ACCOUNT INFORMATION</span>
              </div>
              <EditableField label="Display Name" value={profile.displayName} onSave={v => updateProfile("displayName", v)} />
              <EditableField label="Username" value={profile.username} onSave={v => updateProfile("username", v)} />
              <EditableField label="Email Address" value={profile.email} onSave={v => updateProfile("email", v)} />
              <EditableField label="Time Zone" value={profile.timezone} onSave={v => updateProfile("timezone", v)} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px" }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>Plan</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--bull)", background: "var(--bull-bg)", padding: "2px 8px", borderRadius: 3 }}>Pro</span>
                  <button style={{
                    fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--accent)",
                    background: "var(--accent-dim)", border: "1px solid var(--accent)",
                    borderRadius: 4, padding: "4px 10px", cursor: "pointer"
                  }}>Upgrade</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "API Keys" && (
            <div className="profile-card">
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ padding: "11px 18px", borderBottom: "1px solid var(--border)" }}>
                  <span className="section-label">EXCHANGE CONNECTIONS</span>
                </div>
                {apis.map((api, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px",
                    borderBottom: i < apis.length - 1 ? "1px solid rgba(31,31,46,0.5)" : "none",
                    transition: "background 0.1s"
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 6,
                        background: api.status === "connected" ? "var(--accent-dim)" : "var(--bg-raised)",
                        border: `1px solid ${api.status === "connected" ? "var(--accent)" : "var(--border-2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s"
                      }}>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: api.status === "connected" ? "var(--accent)" : "var(--text-2)" }}>
                          {api.name[0]}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-1)", fontWeight: 500, marginBottom: 2 }}>{api.name}</div>
                        <div style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-3)" }}>
                          {api.status === "connected" && api.key ? api.key : api.status === "error" ? "Connection error — re-authenticate" : "Not connected"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontFamily: "var(--font-ui)", fontSize: 9,
                        color: statusColor(api.status), background: statusBg(api.status),
                        padding: "2px 8px", borderRadius: 3
                      }}>
                        {api.status === "connected" ? "Connected" : api.status === "error" ? "Error" : "Disconnected"}
                      </span>
                      <button onClick={() => toggleAPI(i)} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        fontFamily: "var(--font-ui)", fontSize: 11,
                        color: api.status === "connected" ? "var(--bear)" : "var(--accent)",
                        background: api.status === "connected" ? "var(--bear-bg)" : "var(--accent-dim)",
                        border: `1px solid ${api.status === "connected" ? "rgba(239,68,68,0.3)" : "var(--accent)"}`,
                        borderRadius: 5, padding: "5px 12px", cursor: "pointer", transition: "all 0.15s"
                      }}>
                        <Link2 size={11} />
                        {api.status === "connected" ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 10
              }}>
                <Key size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", marginBottom: 2 }}>Generate Cryptex API Key</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-3)" }}>Use to connect third-party tools to your Cryptex account</div>
                </div>
                <button style={{
                  fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--accent)",
                  background: "var(--accent-dim)", border: "1px solid var(--accent)",
                  borderRadius: 5, padding: "6px 14px", cursor: "pointer"
                }}>Generate</button>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="profile-card" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "11px 18px", borderBottom: "1px solid var(--border)" }}>
                <span className="section-label">ACTIVE SESSIONS</span>
              </div>
              {sessions.map((s, i) => !revokedSessions.has(i) && (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 18px", borderBottom: "1px solid rgba(31,31,46,0.5)",
                  opacity: revokedSessions.has(i) ? 0.4 : 1, transition: "opacity 0.2s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 6,
                      background: s.current ? "var(--accent-dim)" : "var(--bg-raised)",
                      border: `1px solid ${s.current ? "var(--accent)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <span style={{ fontSize: 14 }}>{s.device.includes("iPhone") ? "📱" : s.device.includes("Safari") ? "🧭" : "💻"}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-1)", fontWeight: 500, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        {s.device}
                        {s.current && <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--accent)", background: "var(--accent-dim)", padding: "1px 6px", borderRadius: 2 }}>Current</span>}
                      </div>
                      <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-3)" }}>{s.location} · {s.time}</div>
                    </div>
                  </div>
                  {!s.current && (
                    <button onClick={() => revokeSession(i)} style={{
                      fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bear)",
                      background: "none", border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 4, padding: "4px 10px", cursor: "pointer", transition: "border-color 0.15s"
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--bear)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)")}
                    >Revoke</button>
                  )}
                </div>
              ))}
              {revokedSessions.size === sessions.filter(s => !s.current).length && (
                <div style={{ padding: "12px 18px", fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bull)" }}>
                  All other sessions revoked.
                </div>
              )}
              <div style={{ padding: "13px 18px", borderTop: "1px solid var(--border)" }}>
                <button onClick={() => setRevokedSessions(new Set(sessions.map((_, i) => i).filter(i => !sessions[i].current)))} style={{
                  fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bear)",
                  background: "var(--bear-bg)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 5, padding: "7px 16px", cursor: "pointer"
                }}>Revoke All Other Sessions</button>
              </div>
            </div>
          )}

          {activeTab === "Billing" && (
            <div className="profile-card">
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "20px 18px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Pro Plan</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-2)" }}>$19/month · Billed monthly</div>
                  </div>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--bull)", background: "var(--bull-bg)", padding: "3px 10px", borderRadius: 3 }}>Active</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "Next Billing", value: "Jun 3, 2026" },
                    { label: "Payment Method", value: "Visa ••••4242" },
                    { label: "Member Since", value: "Jan 2024" },
                    { label: "Invoices", value: "16 invoices" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "var(--bg-raised)", borderRadius: 6, padding: "10px 12px" }}>
                      <div className="section-label" style={{ marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-1)" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{
                    fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-1)",
                    background: "var(--bg-raised)", border: "1px solid var(--border-2)",
                    borderRadius: 5, padding: "7px 14px", cursor: "pointer"
                  }}>Update Payment</button>
                  <button style={{
                    fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bear)",
                    background: "none", border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 5, padding: "7px 14px", cursor: "pointer"
                  }}>Cancel Plan</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
