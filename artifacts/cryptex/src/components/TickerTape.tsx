import { tickerItems } from "../mockData";

export default function TickerTape() {
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="ticker-wrapper" style={{
      background: "var(--bg-void)",
      borderBottom: "1px solid var(--border)",
      height: 28,
      display: "flex",
      alignItems: "center",
      overflow: "hidden"
    }}>
      <div className="ticker-track">
        {doubled.map((item, i) => {
          const isUp = item.change.startsWith("+");
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 20px",
              borderRight: "1px solid var(--border)",
              whiteSpace: "nowrap",
              height: 28
            }}>
              <span style={{
                fontFamily: "var(--font-data)", fontSize: 10,
                color: "var(--text-2)", fontWeight: 600
              }}>{item.symbol}</span>
              <span style={{
                fontFamily: "var(--font-data)", fontSize: 10,
                color: "var(--text-1)"
              }}>{item.price}</span>
              <span style={{
                fontFamily: "var(--font-data)", fontSize: 10,
                color: isUp ? "var(--bull)" : "var(--bear)"
              }}>{item.change}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
