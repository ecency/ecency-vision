import { useQuery } from "@tanstack/react-query";
import { MarketAsset } from "../market-pair";
import { useGlobalStore } from "@/core/global-store";
import { QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";

const getCurrencyTokenRate = (currency: string, token: string): Promise<number> =>
  appAxios
    .get(apiBase(`/private-api/market-data/${currency === "hbd" ? "usd" : currency}/${token}`))
    .then((resp: any) => resp.data);

export function useCurrencyRateQuery(fromAsset: MarketAsset, toAsset: MarketAsset) {
  const currency = useGlobalStore((s) => s.currency);
  /**
   * Show value till 2 digits in fraction
   * @param value – source
   * @returns formatted number
   */
  const formatTillPresentDigits = (value: number) => {
    const magnitude = -Math.floor(Math.log10(value) + 1);
    return +value.toFixed(magnitude + 2);
  };

  return useQuery({
    queryKey: [QueryIdentifiers.SWAP_FORM_CURRENCY_RATE, currency, fromAsset, toAsset],
    queryFn: async () => {
      const fromAccountRate = await getCurrencyTokenRate(currency, fromAsset);
      const toAccountRate = await getCurrencyTokenRate(currency, toAsset);
      return [formatTillPresentDigits(fromAccountRate), formatTillPresentDigits(toAccountRate)];
    },
    refetchInterval: 30000 // in ms
  });
}
