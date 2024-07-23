import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import {
  getChainProps,
  getDynamicGlobalProperties,
  getFeedHistory,
  getRewardFund
} from "@/api/hive";
import { DynamicProps } from "@/entities";
import { parseAsset } from "@/utils";

export const getDynamicPropsQuery = () =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.DYNAMIC_PROPS],
    refetchInterval: 60000,
    queryFn: async (): Promise<DynamicProps> => {
      const globalDynamic = await getDynamicGlobalProperties();
      const feedHistory = await getFeedHistory();
      const chainProps = await getChainProps();
      const rewardFund = await getRewardFund();

      const hivePerMVests =
        (parseAsset(globalDynamic.total_vesting_fund_hive).amount /
          parseAsset(globalDynamic.total_vesting_shares).amount) *
        1e6;
      const base = parseAsset(feedHistory.current_median_history.base).amount;
      const quote = parseAsset(feedHistory.current_median_history.quote).amount;
      const fundRecentClaims = parseFloat(rewardFund.recent_claims);
      const fundRewardBalance = parseAsset(rewardFund.reward_balance).amount;
      const hbdPrintRate = globalDynamic.hbd_print_rate;
      const hbdInterestRate = globalDynamic.hbd_interest_rate;
      const headBlock = globalDynamic.head_block_number;
      const totalVestingFund = parseAsset(globalDynamic.total_vesting_fund_hive).amount;
      const totalVestingShares = parseAsset(globalDynamic.total_vesting_shares).amount;
      const virtualSupply = parseAsset(globalDynamic.virtual_supply).amount;
      const vestingRewardPercent = globalDynamic.vesting_reward_percent;
      const accountCreationFee = chainProps.account_creation_fee;

      return {
        hivePerMVests,
        base,
        quote,
        fundRecentClaims,
        fundRewardBalance,
        hbdPrintRate,
        hbdInterestRate,
        headBlock,
        totalVestingFund,
        totalVestingShares,
        virtualSupply,
        vestingRewardPercent,
        accountCreationFee
      };
    },
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
