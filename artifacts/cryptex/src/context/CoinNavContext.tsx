import { createContext, useContext } from "react";

interface CoinNavContextType {
  navigateToCoin: (symbol: string) => void;
}

export const CoinNavContext = createContext<CoinNavContextType>({
  navigateToCoin: () => {},
});

export function useCoinNav() {
  return useContext(CoinNavContext);
}
