# CRYPTEX — Cryptocurrency Analytics Dashboard

> Built for **HackStreet 2K26 · Problem Statement 2**

A professional-grade, Awwwards-level crypto analytics dashboard built entirely on the frontend — no backend, no database, no Tailwind. Pure React 18 + Vite with hand-crafted CSS custom properties, GSAP animations, and TradingView charts.

![Dashboard Preview](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite) ![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)

---

## Features

### Pages & Views

| Page | Description |
|------|-------------|
| **Dashboard** | Live candlestick/area chart (TradingView), technical indicators strip (RSI, MACD, BB, ATR, Fear & Greed), market stats, scrolling ticker tape |
| **Markets** | Full sortable coin table, category filters, dominance bar, 24H summary stat cards |
| **Portfolio** | Live P&L tracking, donut allocation chart, holdings table, transaction history with pagination, analytics tab with win rate & risk metrics (Sharpe, Sortino, Beta, Drawdown) |
| **Watchlist** | Grid + list view, price target alerts with progress bars, GSAP flash on tick, add/remove coins |
| **Coin Detail** | Deep-dive: candlestick + volume histogram, time range switcher, on-chain metrics, analyst consensus, about section, related news |
| **News** | 14 articles, sentiment bar, featured + grid + sidebar layout, topic tag filters |
| **Settings** | Theme, currency, notifications, auto-refresh, data display preferences |
| **Profile** | User stats, activity timeline, achievement badges |

### Technical Highlights

- **Live price simulation** — AppContext ticks all coin prices every 2 seconds with realistic random walks, flashing GSAP colour transitions on change
- **5 currencies** — USD, EUR, GBP, JPY, INR; all prices convert in real time via a top-ribbon dropdown
- **GSAP animations** — page entry animations, ScrollTrigger bars, price flash tweens, sidebar drawer, staggered card reveals
- **TradingView lightweight-charts v4** — candlestick, area, and volume series with full crosshair + ResizeObserver
- **SPA navigation** — wouter routing + `CoinNavContext` for coin deep-links from any table or card, with animated slide transitions
- **Fully mobile-responsive** — hamburger sidebar drawer, bottom nav bar, responsive grids (4-col → 2-col → 1-col), horizontal table scroll, adaptive chart heights

---

## Stack

```
React 18          UI framework
Vite 5            Build tool & dev server
TypeScript 5.9    Type safety
GSAP 3            Animations & ScrollTrigger
lightweight-charts v4   TradingView charting
Lucide React      Icon library
wouter            Client-side routing
pnpm workspaces   Monorepo management
```

No Tailwind. No UI kit. No backend. All styles are hand-written CSS custom properties.

---

## Project Structure

```
artifacts/
└── cryptex/
    └── src/
        ├── components/
        │   ├── BottomSection.tsx    Market stats + Fear/Greed
        │   ├── ChartPanel.tsx       TradingView main chart
        │   ├── CoinIcon.tsx         SVG coin avatars
        │   ├── MarketTable.tsx      Live sortable coin table
        │   ├── RightPanel.tsx       Right stats sidebar
        │   ├── Sidebar.tsx          Nav drawer
        │   ├── Sparkline.tsx        Mini SVG sparklines
        │   ├── TickerTape.tsx       Scrolling price ribbon
        │   └── TopRibbon.tsx        Header bar
        ├── context/
        │   ├── AppContext.tsx        Live prices, settings, formatPrice
        │   └── CoinNavContext.tsx    Coin detail navigation
        ├── pages/
        │   ├── Dashboard.tsx
        │   ├── CoinDetailView.tsx
        │   ├── MarketsView.tsx
        │   ├── NewsView.tsx
        │   ├── PortfolioView.tsx
        │   ├── ProfileView.tsx
        │   ├── SettingsView.tsx
        │   └── WatchlistView.tsx
        ├── mockData.ts              All mock data + candle generator
        ├── index.css                All styles (CSS custom properties)
        └── main.tsx
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/cryptex.git
cd cryptex

# Install dependencies
pnpm install

# Start the dev server
pnpm --filter @workspace/cryptex run dev
```

The app will be available at `http://localhost:5173` (or whichever port Vite assigns).

### Typecheck

```bash
pnpm run typecheck
```

> Note: There is one pre-existing TypeScript error in `ChartPanel.tsx` related to a `minimum` property on TradingView's `PriceScaleOptions` type — this is a known upstream type mismatch and does not affect runtime behaviour.

---

## Design System

All design tokens live in `src/index.css` as CSS custom properties. Two themes are supported — **Light** (default) and **Dark** — toggled from the top ribbon.

```css
--bg-base        /* Page background    */
--bg-surface     /* Card background    */
--bg-raised      /* Elevated elements  */
--text-1         /* Primary text       */
--text-2         /* Secondary text     */
--text-3         /* Muted / labels     */
--accent         /* Brand blue         */
--bull           /* Green (up)         */
--bear           /* Red (down)         */
--border         /* Default border     */
--font-display   /* Headings           */
--font-data      /* Numbers / mono     */
--font-ui        /* UI labels          */
```

---

## Mobile Responsiveness

| Breakpoint | Behaviour |
|------------|-----------|
| > 1100px | Full desktop layout |
| ≤ 1100px | Tablet — narrower sidebar columns |
| ≤ 768px  | Mobile — hamburger drawer, bottom nav, stacked grids, horizontal table scroll |
| ≤ 480px  | Extra-small — further padding reduction, stacked settings rows |

---

## License

MIT — feel free to fork, adapt, and build on top of this for your own projects.
