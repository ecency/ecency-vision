import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../../core";
import { MarketAsset } from "../market-pair";
import { getCurrencyTokenRate } from "../../../api/private-api";
import { useMappedStore } from "../../../store/use-mapped-store";

export function useCurrencyRateQuery(fromAsset: MarketAsset, toAsset: MarketAsset) {
  const { global } = useMappedStore();

  /**
   * Show value till 2 digits in fraction
   * @param value – source
   * @returns formatted number
   */
  const formatTillPresentDigits = (value: number) => {
    const magnitude = -Math.floor(Math.log10(value) + 1);
    return +value.toFixed(magnitude + 2);
  };

  return useQuery(
    [QueryIdentifiers.SWAP_FORM_CURRENCY_RATE, global.currency, fromAsset, toAsset],
    async () => {
      const fromAccountRate = await getCurrencyTokenRate(global.currency, fromAsset);
      const toAccountRate = await getCurrencyTokenRate(global.currency, toAsset);
      return [formatTillPresentDigits(fromAccountRate), formatTillPresentDigits(toAccountRate)];
    },
    {
      refetchInterval: 30000 // in ms
    }
  );
}
