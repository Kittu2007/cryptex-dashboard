# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the CRYPTEX cryptocurrency analytics dashboard built for HackStreet 2K26.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9

## Artifacts

### Cryptex Dashboard (`artifacts/cryptex`)
React 18 + Vite + Tailwind CSS custom props, GSAP 3 (ScrollTrigger), TradingView lightweight-charts v4, Lucide React, wouter routing. Frontend-only, no backend — all data is mock with live price simulation via AppContext.

**Pages / Views:**
- `Dashboard` (`/`) — SPA shell; hosts sidebar nav + all views
- `DashboardMain` — Main chart (ChartPanel) + RightPanel stats + MarketTable + BottomSection
- `MarketsView` — Full markets table with live prices, category filter, dominance bar, sorting
- `PortfolioView` — Portfolio value (live), History tab (15 transactions + filter/pagination), Analytics tab (win rate, risk metrics)
- `WatchlistView` — Live-price cards, search, sort, GSAP flash, price-target editor, alert badges
- `NewsView` — 14 articles, sentiment bar, 3-col layout (featured + grid + sidebar), topic tags
- `CoinDetailView` — Deep-view: candlestick/line/area chart + volume histogram, time range switcher, technical indicators strip, stats sidebar (24H range, supply, ATH, analyst consensus, on-chain metrics), About section, related news grid
- `SettingsView`, `ProfileView`

**SPA Navigation architecture:**
- `Dashboard.tsx` manages two state values: `activeNav: NavId` (sidebar) and `activeCoin: string | null`
- `CoinNavContext` provides `navigateToCoin(symbol)` to all descendant components
- Clicking any coin row/card in MarketTable, MarketsView, or WatchlistView calls `navigateToCoin(symbol)` which sets `activeCoin` and triggers a GSAP page transition
- CoinDetailView's Back button clears `activeCoin` with a reverse GSAP slide transition
- All transitions are animated with `gsap.to/fromTo` on the shared `contentRef` scroll container

**Key files:**
- `src/context/AppContext.tsx` — live prices, liveMarket, formatPrice, settings
- `src/context/CoinNavContext.tsx` — coin detail navigation context
- `src/mockData.ts` — coins, news, generateCandles, computeIndicators, COIN_META
- `src/components/Sidebar.tsx` — NavId type, GSAP sidebar animation
- `src/components/ChartPanel.tsx` — TradingView chart with indicators panel
- `src/pages/CoinDetailView.tsx` — coin deep-view page

**Mobile responsive:**
- Breakpoints: ≤1100px (tablet), ≤768px (mobile), ≤480px (extra-small)
- Sidebar becomes a fixed drawer (hamburger in TopRibbon), slides in with backdrop
- Bottom nav bar (5 icons) replaces sidebar on mobile
- All 4-col stat grids → 2-col on mobile (`.mkt-summary-grid`, `.news-stat-grid`, `.pf-stat-grid`)
- 2-col page layouts collapse to single column on mobile (`.pf-overview-grid`, `.pf-analytics-grid`, `.news-main-grid`, `.news-article-grid`, `.profile-grid`, `.cd-main-grid`)
- Markets table gets `overflow-x: auto` horizontal scroll on mobile
- CoinDetailView chart height: 400px desktop → 240px mobile
- CoinDetail right sidebar stacks below chart on mobile
- TopRibbon: shows only currency symbol + hamburger + price on mobile; hides theme toggle + wallet on very small screens
- Settings section hints hidden on mobile; SettingRow wraps label above control on ≤480px
- `.page-wrap` class reduces padding on mobile (24px→14px, →10px on xs)
- CSS classes used for all overrides (with `!important`) so inline styles in JSX don't conflict

## Key Commands

- `pnpm run typecheck` — full typecheck (pre-existing TS errors in ChartPanel.tsx only)
- `pnpm --filter @workspace/cryptex run dev` — run dashboard locally

See the `pnpm-workspace` skill for workspace structure details.
