import type { CSSProperties } from "react";

/* ─── Brand-accurate SVG icon registry ───────────────────────────────────── */

function wrap(size: number, bg: string | string[], content: React.ReactNode, style?: CSSProperties) {
  const isGrad = Array.isArray(bg);
  const id = Array.isArray(bg) ? `g_${bg[0].replace("#", "")}` : "";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ borderRadius: "50%", flexShrink: 0, display: "block", ...style }}>
      <defs>
        {isGrad && (
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={(bg as string[])[0]} />
            <stop offset="100%" stopColor={(bg as string[])[1]} />
          </linearGradient>
        )}
      </defs>
      <circle cx="20" cy="20" r="20" fill={isGrad ? `url(#${id})` : (bg as string)} />
      {content}
    </svg>
  );
}

const icons: Record<string, (size: number) => React.ReactNode> = {

  BTC: (size) => wrap(size, "#F7931A", <>
    <text x="20" y="27" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="bold" fill="#fff" letterSpacing="-1">₿</text>
  </>),

  ETH: (size) => wrap(size, ["#2A4ADB", "#627EEA"], <>
    {/* Ethereum diamond */}
    <polygon points="20,7 27.5,20 20,24 12.5,20" fill="rgba(255,255,255,0.95)" />
    <polygon points="20,26 27.5,22 20,33 12.5,22" fill="rgba(255,255,255,0.65)" />
  </>),

  SOL: (size) => wrap(size, ["#9945FF", "#14F195"], <>
    {/* Solana — three horizontal bars angled */}
    <rect x="10" y="13" width="20" height="3.2" rx="1.6" fill="#fff" transform="skewX(-10)" />
    <rect x="10" y="18.4" width="20" height="3.2" rx="1.6" fill="rgba(255,255,255,0.75)" transform="skewX(-10)" />
    <rect x="10" y="23.8" width="20" height="3.2" rx="1.6" fill="#fff" transform="skewX(-10)" />
  </>),

  BNB: (size) => wrap(size, ["#D4971A", "#B47A0A"], <>
    {/* BNB — large white diamond outline + B letter */}
    <polygon points="20,8 32,20 20,32 8,20" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinejoin="round" />
    <text x="20" y="25" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="12" fontWeight="bold" fill="#fff">B</text>
  </>),

  MATIC: (size) => wrap(size, ["#7B3FE4", "#A855F7"], <>
    {/* Polygon — stylised angled P */}
    <polygon points="20,8 30,14 30,26 20,32 10,26 10,14" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinejoin="round" />
    <text x="20" y="25" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="12" fontWeight="bold" fill="#fff">P</text>
  </>),

  ADA: (size) => wrap(size, ["#0033AD", "#0052DB"], <>
    {/* Cardano — ∞ / loupe pattern using circles */}
    <circle cx="14.5" cy="20" r="5.5" fill="none" stroke="#fff" strokeWidth="2.2" />
    <circle cx="25.5" cy="20" r="5.5" fill="none" stroke="#fff" strokeWidth="2.2" />
    <circle cx="20" cy="13" r="2.2" fill="rgba(255,255,255,0.7)" />
    <circle cx="20" cy="27" r="2.2" fill="rgba(255,255,255,0.7)" />
  </>),

  DOT: (size) => wrap(size, ["#E6007A", "#BF0063"], <>
    {/* Polkadot — center dot + 6 satellites */}
    <circle cx="20" cy="20" r="4.5" fill="#fff" />
    {[0,60,120,180,240,300].map(deg => {
      const r = deg * Math.PI / 180;
      return <circle key={deg} cx={20 + Math.cos(r)*11} cy={20 + Math.sin(r)*11} r="3" fill="rgba(255,255,255,0.75)" />;
    })}
  </>),

  LINK: (size) => wrap(size, ["#2A5ADA", "#375BD2"], <>
    {/* Chainlink — hexagon outline + chain link L */}
    <polygon points="20,7 29,12.5 29,27.5 20,33 11,27.5 11,12.5" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinejoin="round" />
    <text x="20" y="26" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="bold" fill="#fff">⬡</text>
  </>),

  AVAX: (size) => wrap(size, ["#E84142", "#C0392B"], <>
    {/* Avalanche — white A triangle */}
    <polygon points="20,9 30.5,30 9.5,30" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinejoin="round" />
    <line x1="14.5" y1="26" x2="25.5" y2="26" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
  </>),

  XRP: (size) => wrap(size, ["#00AAE4", "#0088BB"], <>
    <text x="20" y="27" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="18" fontWeight="bold" fill="#fff">X</text>
  </>),

  /* ── Trending / newer coins ─────────────────────────────────────────────── */

  INJ: (size) => wrap(size, ["#00B2FE", "#0066FF"], <>
    {/* Injective — I with gradient glow */}
    <rect x="17.5" y="10" width="5" height="20" rx="2.5" fill="#fff" />
    <rect x="13" y="10" width="14" height="4" rx="2" fill="#fff" />
    <rect x="13" y="26" width="14" height="4" rx="2" fill="#fff" />
  </>),

  TIA: (size) => wrap(size, ["#7B2BF9", "#5B1AD9"], <>
    {/* Celestia — T for TIA + star burst */}
    <rect x="13" y="10" width="14" height="4" rx="2" fill="#fff" />
    <rect x="17.5" y="12" width="5" height="18" rx="2.5" fill="#fff" />
    <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.3)" />
  </>),

  ONDO: (size) => wrap(size, ["#6B48FF", "#4B28DF"], <>
    {/* Ondo — O ring */}
    <circle cx="20" cy="20" r="9.5" fill="none" stroke="#fff" strokeWidth="3.5" />
    <circle cx="20" cy="20" r="4.5" fill="rgba(255,255,255,0.25)" />
  </>),

  WIF: (size) => wrap(size, ["#E87B3A", "#C55A1A"], <>
    {/* dogwifhat — W */}
    <text x="20" y="27" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="17" fontWeight="bold" fill="#fff">W</text>
    {/* hat tip */}
    <ellipse cx="20" cy="12" rx="8" ry="3" fill="rgba(255,255,255,0.5)" />
  </>),

  JUP: (size) => wrap(size, ["#7DC94A", "#4DAA1A"], <>
    {/* Jupiter — J */}
    <text x="21" y="28" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="bold" fill="#fff">J</text>
    {/* orbital ring */}
    <ellipse cx="20" cy="20" rx="14" ry="5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
  </>),

  PEPE: (size) => wrap(size, ["#2EA847", "#1A7A32"], <>
    <text x="20" y="27" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="18" fontWeight="bold" fill="#fff">P</text>
  </>),

  DOGE: (size) => wrap(size, ["#C2A633", "#9A8020"], <>
    <text x="20" y="27" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="15" fontWeight="bold" fill="#fff">Ð</text>
  </>),

  LTC: (size) => wrap(size, ["#838383", "#555"], <>
    <text x="20" y="28" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="19" fontWeight="bold" fill="#fff">Ł</text>
  </>),
};

/* ─── Fallback: gradient circle with letter ─────────────────────────────── */
const FALLBACK_PALETTE = [
  "#3B82F6","#8B5CF6","#EC4899","#F97316","#22C55E",
  "#14B8A6","#EAB308","#EF4444","#06B6D4","#6366F1",
];
function hashColor(symbol: string): string {
  let h = 0;
  for (const c of symbol) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
}

function FallbackIcon({ symbol, size, color }: { symbol: string; size: number; color: string }) {
  const id = `fg_${symbol}`;
  const c2 = color + "BB";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ borderRadius: "50%", flexShrink: 0, display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill={`url(#${id})`} />
      <text
        x="20" y="26"
        textAnchor="middle"
        fontFamily="var(--font-display,'Inter',sans-serif)"
        fontSize="17"
        fontWeight="700"
        fill="#fff"
      >
        {symbol.slice(0, 2)}
      </text>
    </svg>
  );
}

/* ─── Public component ──────────────────────────────────────────────────── */
interface CoinIconProps {
  symbol: string;
  size?: number;
  fallbackColor?: string;
}

export default function CoinIcon({ symbol, size = 28, fallbackColor }: CoinIconProps) {
  const renderer = icons[symbol.toUpperCase()];
  if (renderer) return <>{renderer(size)}</>;
  const color = fallbackColor ?? hashColor(symbol);
  return <FallbackIcon symbol={symbol.slice(0, 2).toUpperCase()} size={size} color={color} />;
}
