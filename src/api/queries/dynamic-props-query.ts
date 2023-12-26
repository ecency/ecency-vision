import { useQuery } from "@tanstack/react-query";
import { DynamicProps } from "@/entities";
import { QueryIdentifiers } from "@/core/react-query";
import { getDynamicProps } from "@/api/hive";

export function useDynamicPropsQuery() {
  return useQuery<DynamicProps>({
    queryKey: [QueryIdentifiers.DYNAMIC_PROPS],
    queryFn: async () => getDynamicProps(),
    initialData: {
      hivePerMVests: 1,
      base: 1,
      quote: 1,
      fundRecentClaims: 1,
      fundRewardBalance: 1,
      hbdPrintRate: 1,
      hbdInterestRate: 1,
      headBlock: 1,
      totalVestingFund: 1,
      totalVestingShares: 1,
      virtualSupply: 1,
      vestingRewardPercent: 1,
      accountCreationFee: "3.000 HIVE"
    }
  });
}
