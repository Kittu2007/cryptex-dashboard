# CRYPTEX — Cryptocurrency Analytics Dashboard
## Product Requirements Document · HackStreet 2K26 · Problem Statement 2
### Single Winning Design · Emergent (Opus 4) Build Target

---

## 0. Research Synthesis

### What Real Crypto Dashboards Look Like (Kraken Pro, Coinbase Advanced, Binance)
- **Left sidebar navigation** — icon + label, 60–72px wide collapsed, 200px expanded
- **Top ribbon** — sticky, shows selected pair + last price + 24h change + volume + high/low
- **Center dominates** — the TradingView chart takes 50–60% of the viewport
- **Right panel** — order book or watchlist or market stats
- **Bottom strip** — recent transactions / open orders table
- **Color language**: dark background (#0D0D0D–#141414), white text, green = up, red = down. No neon. Muted, desaturated signal colors.
- **Data density** — these interfaces are DENSE. Lots of numbers, small font sizes (11–13px for data), generous use of monospace.

### What Awwwards-Level Means on TOP of That
- **Typography that elevates** — a distinguished display font for the hero price, not just system mono
- **Spatial intentionality** — every gap is deliberate. No cramped cards floating on gradients.
- **Micro-detail polish** — hover states, skeleton loaders, smooth number transitions
- **One signature visual moment** — something memorable. In this design: the full-bleed candlestick chart as the page's visual center of gravity, with a subtle area fill that glows copper.
- **Animation that serves data** — GSAP used for enters, count-ups, bar reveals. Not decorative.

---

## 1. Design Direction

**"Vaulto Meets Kraken Pro"** — the functional density of a real trading terminal, elevated to editorial quality through typography, spacing, and restraint.

### The ONE Design

**Layout**: Left sidebar (collapsed icon nav, 64px) + Main content area. No top navbar clutter.

**Background**: `#0D0D10` — near-black with a barely perceptible blue-black depth. Not pure black (too flat), not #111 (too common).

**Surfaces**:
- Cards/panels: `#13131A` 
- Elevated: `#1A1A24`
- Borders: `#1F1F2E` (1px)
- Active border: `#2A2A40`

**Text**:
- Primary: `#E8E6F0` — warm off-white with a purple tint. Not cold white.
- Secondary: `#6B6882`
- Tertiary: `#38364A`
- Accent: `#A78BFA` — a refined, muted violet. This is the ONE accent color. Not neon purple. Like ink on parchment.

**Signal colors** (desaturated, professional):
- Bullish: `#34D399` — soft teal-green
- Bearish: `#F87171` — dusty rose-red  
- Bullish bg: `rgba(52,211,153,0.08)`
- Bearish bg: `rgba(248,113,113,0.08)`

**Fonts** (Google Fonts):
- `Sora` — the hero price, stat numbers (modern geometric, premium feel)
- `Inter` — all UI labels, nav, descriptions (refined, legible at small sizes)
- `JetBrains Mono` — ALL data: prices in tables, percentages, timestamps, order values

---

## 2. Full Page Layout Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR (64px fixed)  │  MAIN CONTENT AREA                   │
│                       │                                       │
│  [Logo]               │  TOP RIBBON (40px sticky)            │
│  ─────────            │  BTC/USDT  $67,432  +2.4%  Vol:38.2B│
│  [Dashboard icon]     │  ─────────────────────────────────── │
│  [Markets icon]       │                                       │
│  [Portfolio icon]     │  HERO ROW (2 cols: chart + sidebar)  │
│  [Watchlist icon]     │  ┌────────────────────┬───────────┐  │
│  [News icon]          │  │  CHART AREA        │ MARKET    │  │
│  ─────────            │  │  (TradingView-     │ STATS     │  │
│  [Settings icon]      │  │   style candlestick│ PANEL     │  │
│  [Profile icon]       │  │   with GSAP area   │           │  │
│                       │  │   fill reveal)     │ Portfolio │  │
│  ─────────            │  │                    │ Donut     │  │
│  [Live indicator]     │  │  Coin tabs  |Range │           │  │
│                       │  └────────────────────┴───────────┘  │
│                       │                                       │
│                       │  MARKET TABLE (full width)            │
│                       │  [sortable, 8 cols, skeleton→data]   │
│                       │                                       │
│                       │  BOTTOM ROW (3 cols)                  │
│                       │  [Transactions] [Watchlist] [News]   │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Section Specifications

### SECTION 0 — CSS Design Tokens

```css
:root {
  /* Backgrounds */
  --bg-void:     #0D0D10;
  --bg-surface:  #13131A;
  --bg-raised:   #1A1A24;
  --bg-hover:    #1F1F2C;

  /* Borders */
  --border:      #1F1F2E;
  --border-2:    #2A2A40;

  /* Text */
  --text-1:      #E8E6F0;
  --text-2:      #6B6882;
  --text-3:      #38364A;

  /* Accent */
  --accent:      #A78BFA;
  --accent-dim:  rgba(167,139,250,0.1);

  /* Signals */
  --bull:        #34D399;
  --bear:        #F87171;
  --bull-bg:     rgba(52,211,153,0.08);
  --bear-bg:     rgba(248,113,113,0.08);

  /* Chart */
  --chart-bg:    #0A0A0E;
  --chart-grid:  #13131A;
  --chart-line:  #A78BFA;
  --chart-area:  rgba(167,139,250,0.06);

  /* Typography */
  --font-display: 'Sora', sans-serif;
  --font-ui:     'Inter', sans-serif;
  --font-data:   'JetBrains Mono', monospace;

  /* Spacing system (8px base) */
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px;
  --s5: 20px; --s6: 24px; --s8: 32px; --s10: 40px;

  /* Border radius */
  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 12px;
}
```

---

### SECTION 1 — Left Sidebar

**Width**: 64px fixed, `position: fixed; left: 0; top: 0; height: 100vh; z-index: 50`  
**Background**: `var(--bg-surface)` with `border-right: 1px solid var(--border)`

**Logo**: 32×32 centered at top. A geometric `C` mark in `var(--accent)`. Below it: `CRYPTEX` text rotated 90deg, `var(--text-3)`, 8px Inter, letter-spacing .2em.

**Nav icons** (centered, gap 4px between icon and label):
Each icon: 40×40 area, centered. Icon SVG 18px. Default: `var(--text-3)`. Hover: `var(--text-2)`. Active: `var(--accent)` icon + left border `2px solid var(--accent)`.

Nav items: Dashboard, Markets, Portfolio, Watchlist, News
Bottom: Settings, Profile

**Live indicator** at bottom: 6px pulsing dot `var(--bull)` + "LIVE" text 8px vertical.

**GSAP**: `gsap.from(".sidebar", { x: -64, opacity: 0, duration: 0.6, ease: "expo.out" })`

---

### SECTION 2 — Top Ribbon (Market Pair Strip)

**Height**: 40px. `position: sticky; top: 0; z-index: 40; background: var(--bg-surface); border-bottom: 1px solid var(--border);`  
**Left margin**: 64px (sidebar offset)

**Left cluster**: 
- Pair selector: `BTC / USDT` — Sora 14px bold `var(--text-1)` + dropdown chevron in `var(--text-3)`. Click opens coin switcher overlay.
- Price: `$67,432.50` — JetBrains Mono 15px `var(--text-1)`. This number TICKS live every 3s with GSAP.
- Change: `+2.4% (+$1,840)` — JetBrains Mono 12px `var(--bull)` with `var(--bull-bg)` pill (4px padding, 4px radius).

**Middle data points** (separated by 1px `var(--border)` vertical dividers):
Each: label (Inter 8px `var(--text-3)` uppercase) + value (JetBrains Mono 11px `var(--text-1)`)
- 24h High: `$68,910`
- 24h Low: `$65,230`  
- 24h Vol: `$38.2B`
- Mkt Cap: `$1.32T`
- Dominance: `52.4%`

**Right**: Connect Wallet button — Inter 10px, border `1px solid var(--border-2)`, background `var(--bg-raised)`, 4px radius, hover: `var(--accent)` border.

**GSAP**: Ribbon slides down from -40px on load.

---

### SECTION 3 — Main Chart + Right Panel (Hero Row)

**Layout**: `display: grid; grid-template-columns: 1fr 280px; gap: 0; border-bottom: 1px solid var(--border);`

#### 3A — Chart Area (Left)

**Outer padding**: 20px 24px 0

**Coin Tabs Row**:
- Tabs: `BTC  ETH  SOL  BNB  MATIC` — Inter 12px. Default `var(--text-2)`. Active: `var(--text-1)` + `border-bottom: 2px solid var(--accent)`. Hover: `var(--text-1)`.
- Right: Time range tabs `15m | 1h | 4h | 1D | 1W | 1M` — JetBrains Mono 10px. Active: `background: var(--bg-raised); color: var(--text-1); border-radius: 4px;`
- Chart type: Line / Candle / Bar — icon buttons, 28px square.

**Price display** (above chart, left):
- Big price: `$67,432.50` — Sora 36px, weight 600, `var(--text-1)`. This is the largest text on the page.
- Change: `+$1,840.20 · +2.4%` — JetBrains Mono 13px, `var(--bull)`.
- MA indicator pills: `MA(7) 65,820` `MA(25) 64,102` `MA(99) 61,440` — 9px JetBrains Mono, each in their respective colors (amber, gray, slate), no backgrounds.

**Chart Canvas**:
- Background: `var(--chart-bg)` — deepest black. The chart floats in void.
- Height: `280px` on desktop.
- Implemented with **lightweight-charts** (TradingView). 
- Candlestick colors: `upColor: '#34D399', downColor: '#F87171', wickUpColor: '#34D399', wickDownColor: '#F87171'`
- Grid: `var(--chart-grid)`. Crosshair: muted `#2A2A40`.
- Area fill: violet gradient (`rgba(167,139,250,0.15)` → transparent) when in Line mode.
- Volume bars at bottom (40px height), same signal colors, 30% opacity.

**GSAP — Chart reveal**:
```js
// Chart area fades in with SVG path draw effect (CSS animation on the line path)
gsap.from(".chart-area", { opacity: 0, duration: 0.8, delay: 0.4, ease: "power2.out" })
// Animate the price counter from a lower number
gsap.from(priceEl, { textContent: 60000, duration: 1.8, ease: "expo.out", 
  snap: { textContent: 1 }, onUpdate: () => { priceEl.textContent = '$' + Math.round(+priceEl.textContent).toLocaleString() }})
```

**Indicator Row** (below chart, border-top `var(--border)`):
`display: flex; gap: 24px; padding: 12px 0;`
Each: label 8px Inter uppercase `var(--text-3)` + value 11px JetBrains Mono `var(--text-1)`.
RSI, MACD, Bollinger, ATR, Fear/Greed Index

#### 3B — Right Stats Panel

`background: var(--bg-surface); border-left: 1px solid var(--border); padding: 20px 16px;`

**Section: Market Stats**
4 stat blocks, each `padding: 12px 0; border-bottom: 1px solid var(--border)`:
- Label: Inter 8px uppercase `var(--text-3)`
- Value: Sora 18px `var(--text-1)` — these count up with GSAP ScrollTrigger
- Sub-label: JetBrains Mono 10px `var(--text-2)`

Stats: Mkt Cap · 24h Volume · Circulating Supply · All-Time High

**Section: Portfolio Snapshot** (`margin-top: 20px`)
- Label: `YOUR PORTFOLIO` Inter 8px uppercase `var(--text-3)`
- Total value: Sora 24px `var(--text-1)` → `$42,820.40`
- P&L: JetBrains Mono 12px `var(--bull)` → `+$11,820 (+38.2%)`
- Donut chart: 120px diameter, CSS/Canvas. Segments in muted colors (no neon).
  - BTC 48%: `#A78BFA` (accent)
  - ETH 30%: `#6B7280`
  - SOL 14%: `#34D399` (50% opacity)
  - Other 8%: `#38364A`
- Legend: icon + name + percent, 3 rows

**GSAP — Stats count-up**:
```js
gsap.utils.toArray("[data-count]").forEach(el => {
  ScrollTrigger.create({ trigger: el, start: "top 85%", once: true,
    onEnter: () => gsap.to(el, { textContent: el.dataset.count, duration: 1.6, ease: "power2.out", snap: { textContent: el.dataset.snap || 1 } })
  });
});
```

---

### SECTION 4 — Market Table

`border-bottom: 1px solid var(--border); padding: 0 24px 0 24px;`

**Header row** (Inter 8px uppercase `var(--text-3)`, `border-bottom: 1px solid var(--border)`, padding 10px 0):
`#  |  Asset  |  Price  |  24h  |  7d  |  Mkt Cap  |  Vol  |  Signal`

Numeric columns: right-align. Sortable headers with chevron indicators.

**Each data row** (border-bottom: `var(--border)` at 20% opacity, padding: 10px 0):
- `#`: JetBrains Mono 10px `var(--text-3)`
- Asset: 28px circle avatar (letter initial, muted bg matching coin palette) + name (Inter 12px `var(--text-1)` bold) + symbol (Inter 9px `var(--text-2)`)
- Price: JetBrains Mono 12px `var(--text-1)` right-align
- 24h: JetBrains Mono 11px `var(--bull)` or `var(--bear)`, right-align. Prefix `+` or `−`.
- 7d: same treatment with small 40px sparkline SVG inline.
- Mkt Cap: JetBrains Mono 11px `var(--text-2)` right-align.
- Vol: JetBrains Mono 11px `var(--text-2)` right-align.
- Signal: Inter 9px. `Bullish` in `var(--bull)`, background `var(--bull-bg)`, 3px padding, 3px radius. `Bearish` in `var(--bear)`, background `var(--bear-bg)`. `Neutral` in `var(--text-2)`, no background.

**Row hover**: `background: var(--bg-hover)` — 0.15s transition. No lift, no glow.

**Skeleton loaders**: Show 8 rows × hairline shimmer bars for 1.2s. Shimmer moves right using a keyframe animation in the muted purple-dark tone.

**GSAP — Row stagger enter**:
```js
gsap.from(".mkt-row", { 
  opacity: 0, y: 8, stagger: 0.04, duration: 0.5, ease: "power2.out",
  scrollTrigger: { trigger: ".market-table", start: "top 80%" }
});
```

---

### SECTION 5 — Bottom Three-Column Row

`display: grid; grid-template-columns: 1fr 1fr 1fr; border-top: 1px solid var(--border);`

#### Col A — Recent Transactions

`padding: 20px 24px; border-right: 1px solid var(--border);`

**Header**: `TRANSACTIONS` + `View all →` link in `var(--accent)`.

Each transaction row (border-bottom very subtle):
- Type tag: `BUY` (var(--bull-bg) + var(--bull) text) or `SELL` (var(--bear-bg) + var(--bear) text) — 9px JetBrains Mono, 3px padding.
- Asset: Inter 11px `var(--text-1)` + symbol `var(--text-2)` 
- Amount: JetBrains Mono 11px right-align
- Price: JetBrains Mono 10px `var(--text-2)` right-align
- Date: Inter 9px `var(--text-3)` right-align
- Status dot: 5px circle. Completed = `var(--text-3)`. Pending = `var(--accent)` with 2px pulse animation.

#### Col B — Watchlist

`padding: 20px 24px; border-right: 1px solid var(--border);`

**Header**: `WATCHLIST` + `+ Add` button.

Each row: coin name + symbol + sparkline (60px SVG) + current price + 24h % — all on one line, same typographic treatment as market table.

**Trending section** (5px border-top `var(--border)`, margin-top 12px): `TRENDING` label + 3 trending coins with volume change indicator.

#### Col C — News & Sentiment

`padding: 20px 24px;`

3 news cards, each:
- Source: Inter 8px `var(--text-3)` uppercase + timestamp right-aligned.
- Title: Inter 13px `var(--text-1)`, line-height 1.5. Max 2 lines.
- Sentiment bar: 1px height, `var(--border)` background, fill with `var(--bull)` or `var(--bear)` at sentiment %. Width animates in with GSAP.
- Tag: category tag in `var(--accent-dim)` + `var(--accent)` text, 8px Inter, 3px padding.

---

## 4. Animation System (GSAP Master Plan)

### Load Sequence (Timeline, no scroll)
```js
const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

tl.from(".sidebar",       { x: -64, opacity: 0, duration: 0.5 })
  .from(".top-ribbon",    { y: -40, opacity: 0, duration: 0.4 }, "-=0.2")
  .from(".hero-price",    { y: 20, opacity: 0, duration: 0.9 }, "-=0.2")
  .from(".chart-area",    { opacity: 0, duration: 0.7 }, "-=0.5")
  .from(".right-panel",   { x: 20, opacity: 0, duration: 0.6 }, "-=0.5")
```

### Scroll Animations
```js
// Section reveals
gsap.utils.toArray(".section").forEach(el => {
  gsap.from(el, { y: 30, opacity: 0, duration: 0.7, ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 85%" }
  });
});

// Portfolio bars
gsap.from(".pf-bar-fill", { scaleX: 0, transformOrigin: "left", stagger: 0.08, duration: 0.8,
  scrollTrigger: { trigger: ".portfolio", start: "top 80%" }
});

// Sentiment bars
gsap.from(".sentiment-fill", { scaleX: 0, transformOrigin: "left", stagger: 0.12, duration: 0.6,
  scrollTrigger: { trigger: ".news-col", start: "top 82%" }
});
```

### Horizontal Scroll — Ticker Tape (CSS)
```css
.ticker-track { 
  display: flex; animation: marquee 60s linear infinite; width: max-content;
}
@keyframes marquee { 
  0% { transform: translateX(0); } 
  100% { transform: translateX(-50%); } 
}
```

### Text Animations
**Split text on hero price** — use GSAP SplitText (or manual char spans):
```js
// Each digit of the price animates in individually, staggered
const digits = document.querySelectorAll(".hero-price .digit");
gsap.from(digits, { y: 20, opacity: 0, stagger: 0.04, duration: 0.6, ease: "back.out(1.4)" });
```

**Live price tick**:
```js
setInterval(() => {
  const delta = (Math.random() - 0.488) * 60;
  currentPrice += delta;
  const formatted = '$' + currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  gsap.to(".live-price", { textContent: formatted, duration: 0.6, ease: "power1.inOut",
    onUpdate: function() { /* format on each update */ }
  });
  // Flash background briefly
  gsap.to(".live-price", { color: delta > 0 ? '#34D399' : '#F87171', duration: 0.1,
    onComplete: () => gsap.to(".live-price", { color: '#E8E6F0', duration: 0.8 })
  });
}, 3000);
```

---

## 5. Tech Stack for Emergent

```
Framework:    React 18 + Vite
Styling:      Tailwind CSS (custom config with design tokens) + CSS custom properties
Charts:       lightweight-charts (TradingView) v4 — candlestick + area + volume
Animations:   GSAP 3 + ScrollTrigger + (SplitText if available, else manual)
Fonts:        Google Fonts — Sora + Inter + JetBrains Mono
Data:         Static mock JSON files (mockData.js) — all simulated, no real API
Icons:        Lucide React (clean, consistent line icons)
Build:        Vite for fast HMR during dev
Responsive:   Mobile-first. Sidebar collapses to bottom tab bar on <768px.
```

---

## 6. Mock Data Schema

```js
// mockData.js
export const coins = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", price: 67432.50, change24h: 2.4, change7d: 8.1, 
    volume: "38.2B", marketCap: "1.32T", signal: "Bullish", avatar: "#A78BFA" },
  { id: "eth", name: "Ethereum", symbol: "ETH", price: 3891.20, change24h: 1.8, change7d: -2.3,
    volume: "18.4B", marketCap: "468B", signal: "Neutral", avatar: "#6B7280" },
  { id: "sol", name: "Solana", symbol: "SOL", price: 182.40, change24h: -0.6, change7d: 12.4,
    volume: "4.2B", marketCap: "82B", signal: "Bullish", avatar: "#34D399" },
  { id: "bnb", name: "BNB", symbol: "BNB", price: 601.20, change24h: 3.1, change7d: 5.6,
    volume: "2.8B", marketCap: "91B", signal: "Bullish", avatar: "#EAB308" },
  { id: "matic", name: "Polygon", symbol: "MATIC", price: 0.892, change24h: -1.2, change7d: -4.8,
    volume: "0.8B", marketCap: "8.9B", signal: "Bearish", avatar: "#8B5CF6" },
  { id: "ada", name: "Cardano", symbol: "ADA", price: 0.612, change24h: 0.4, change7d: 2.1,
    volume: "0.5B", marketCap: "21.4B", signal: "Neutral", avatar: "#6B7280" },
  { id: "dot", name: "Polkadot", symbol: "DOT", price: 9.82, change24h: -2.1, change7d: -6.3,
    volume: "0.4B", marketCap: "14.2B", signal: "Bearish", avatar: "#F87171" },
  { id: "link", name: "Chainlink", symbol: "LINK", price: 18.40, change24h: 4.2, change7d: 11.8,
    volume: "0.9B", marketCap: "11.8B", signal: "Bullish", avatar: "#60A5FA" },
];

export const portfolio = {
  totalValue: 42820.40,
  totalGain: 11820,
  totalGainPct: 38.2,
  holdings: [
    { symbol: "BTC", name: "Bitcoin", allocation: 48, value: 20554, gain: 8200, gainPct: 66.4 },
    { symbol: "ETH", name: "Ethereum", allocation: 30, value: 12846, gain: 4100, gainPct: 46.9 },
    { symbol: "SOL", name: "Solana", allocation: 14, value: 5995, gain: -800, gainPct: -11.8 },
    { symbol: "Other", name: "Other", allocation: 8, value: 3425, gain: 320, gainPct: 10.3 },
  ]
};

export const transactions = [
  { type: "BUY", asset: "Bitcoin", symbol: "BTC", amount: 0.05, price: 64200, total: 3210, date: "2h ago", status: "Completed" },
  { type: "SELL", asset: "Ethereum", symbol: "ETH", amount: 1.2, price: 3850, total: 4620, date: "1d ago", status: "Completed" },
  { type: "BUY", asset: "Solana", symbol: "SOL", amount: 10, price: 185, total: 1850, date: "2d ago", status: "Pending" },
];

export const news = [
  { source: "CoinDesk", category: "Markets", title: "Bitcoin breaks $68K resistance as institutional demand surges ahead of halving", sentiment: 78, time: "2h ago" },
  { source: "The Block", category: "Ethereum", title: "ETH staking yields compress as validator count hits new all-time high", sentiment: 42, time: "4h ago" },
  { source: "Decrypt", category: "DeFi", title: "Solana ecosystem records all-time DEX volume in Q1 2026, surpassing Ethereum", sentiment: 65, time: "6h ago" },
];

// Generate realistic OHLCV candle data
export function generateCandles(count = 180, basePrice = 60000) {
  const candles = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);
  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.025;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;
    const volume = Math.random() * 1000 + 200;
    candles.push({ time: now - i * 3600, open, high, low, close, value: volume });
    price = close;
  }
  return candles;
}
```

---

## 7. Emergent Prompt (Single Master Prompt)

Paste this verbatim into Emergent with Claude Opus 4:

---

```
Build a complete cryptocurrency analytics dashboard in React + Vite + Tailwind called "Cryptex". 
This is for a hackathon — I need Awwwards-level quality. Use the exact design system below.

## Design Tokens (add to tailwind.config.js AND CSS :root)
Background void: #0D0D10
Surface: #13131A
Raised: #1A1A24
Hover: #1F1F2C
Border: #1F1F2E
Border active: #2A2A40
Text primary: #E8E6F0
Text secondary: #6B6882
Text tertiary: #38364A
Accent: #A78BFA
Accent dim: rgba(167,139,250,0.1)
Bullish: #34D399
Bearish: #F87171
Chart bg: #0A0A0E

## Fonts (load from Google Fonts in index.html)
Sora — hero prices, stat numbers
Inter — all UI labels
JetBrains Mono — ALL data values, prices in tables, percentages

## Layout
Fixed left sidebar (64px wide). Rest is main content.
Sidebar: logo at top, 5 nav icons (Dashboard, Markets, Portfolio, Watchlist, News), settings + profile at bottom, pulsing LIVE dot.
Top ribbon (sticky, 40px): coin pair selector | live price | 24h change | 24h high/low | volume | market cap | dominance | wallet button

## Main Content Sections
1. CHART + RIGHT PANEL: CSS Grid 1fr 280px
   Left: Coin tabs (BTC ETH SOL BNB MATIC) + time range (15m 1h 4h 1D 1W 1M) + TradingView lightweight-charts candlestick (280px height, dark theme) + MA overlay lines + volume bars + indicator row (RSI MACD Bollinger ATR Fear/Greed)
   Right panel: Market stats (4 stat blocks counting up) + Portfolio donut + P&L

2. MARKET TABLE: Full width, 8 cols, sortable. Columns: # Asset Price 24h 7d MktCap Vol Signal. Signal = "Bullish"/"Bearish"/"Neutral" pill with muted colors. Skeleton loader → stagger reveal.

3. BOTTOM 3 COLS: Recent Transactions | Watchlist + Trending | News + Sentiment bars

## GSAP Animations (install gsap + @gsap/react)
1. Page load timeline: sidebar x:-64 → 0, ribbon y:-40 → 0, hero price y:20 → 0, chart opacity 0→1, right panel x:20→0
2. Stats count-up with ScrollTrigger
3. Table rows stagger in (y:8, opacity 0→1, stagger 0.04)
4. Portfolio allocation bars: scaleX 0→actual% on scroll
5. Sentiment bars: scaleX 0→sentiment% on scroll
6. Live price tick every 3s: GSAP animates the number, brief color flash (green/red) then back to white
7. Horizontal ticker tape (CSS marquee animation) below the top ribbon: BTC $67,432 +2.4% | ETH... (duplicated for seamless loop)

## Mock Data (mockData.js)
8 coins with realistic data. Portfolio with 4 holdings. 3 transactions. 3 news items. generateCandles() function returning 180 hourly OHLCV candles starting at $60,000.

## Quality requirements
- Zero console errors
- Responsive: sidebar collapses to bottom tabs on mobile
- Hover states on ALL interactive elements (rows, tabs, buttons)
- Skeleton shimmer (custom CSS keyframe, dark purple shimmer tone, not blue)
- All numbers in tables use font-variant-numeric: tabular-nums
- Smooth transitions (0.15s ease) on all state changes
- The big price in the chart section should be 36px Sora bold and TICK live
- DO NOT use neon colors, gradients, glassmorphism, or glowing effects anywhere
- This should look like a real professional trading terminal with elevated typography
```

---

## 8. Execution Timeline (for Emergent with Opus 4)

```
PROMPT 1 (this prompt): Full build — Emergent + Opus 4 handles everything in one shot.
Expected output: Full working React app.

After output:
• Verify chart renders (lightweight-charts)  
• Verify GSAP timeline fires on load
• Verify live price ticks every 3s
• Test mobile: sidebar collapses
• Check font loading (Sora/Inter/JetBrains Mono)
• Zero neon/glow anywhere

If anything is missing, send a targeted fix prompt.
```

---

## 9. Winning Factors Checklist

- [ ] Sidebar nav with icon + active accent state
- [ ] Sticky top ribbon with live-ticking price
- [ ] Marquee ticker tape below ribbon
- [ ] TradingView chart dark-themed with violet area fill
- [ ] Coin tabs + time range tabs (text-based, not pills)
- [ ] Volume bars below chart
- [ ] Technical indicator row (RSI, MACD, etc.)
- [ ] Right panel: stat count-ups + portfolio donut
- [ ] Market table sortable with skeleton → stagger reveal
- [ ] Signal pills: Bullish/Bearish/Neutral (muted, not neon)
- [ ] Sparklines in 7d column
- [ ] Transactions section with BUY/SELL tags (muted colors)
- [ ] Watchlist section with trending
- [ ] News section with sentiment bars (animated)
- [ ] GSAP load timeline (all 5 elements)
- [ ] Scroll-triggered animations (count-up, bar fills, row stagger)
- [ ] Live price ticking with color flash
- [ ] Fonts: Sora on prices, JetBrains Mono on all data
- [ ] Mobile responsive (sidebar → bottom tabs)
- [ ] Zero neon/glow/gradient anywhere
- [ ] Design looks like a real product, not a hackathon template

---

*PRD FINAL — Cryptex Dashboard · HackStreet 2K26 · Built for Emergent + Claude Opus 4*
