import { useState } from "react";

// Free CDN — cryptocurrency-icons covers BTC, ETH, SOL, BNB, ADA, DOT, LINK, MATIC, AVAX, etc.
const iconUrl = (symbol: string) =>
  `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/${symbol.toLowerCase()}.png`;

interface CoinIconProps {
  symbol: string;
  size?: number;
  fallbackColor?: string;
}

export default function CoinIcon({ symbol, size = 28, fallbackColor = "#A78BFA" }: CoinIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: fallbackColor + "22",
        border: `1px solid ${fallbackColor}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: Math.round(size * 0.4),
          fontWeight: 700,
          color: fallbackColor,
          lineHeight: 1,
        }}>
          {symbol[0]}
        </span>
      </div>
    );
  }

  return (
    <img
      src={iconUrl(symbol)}
      alt={symbol}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      draggable={false}
      style={{ borderRadius: "50%", flexShrink: 0, display: "block", objectFit: "contain" }}
    />
  );
}
