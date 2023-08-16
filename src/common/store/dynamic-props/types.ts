export interface DynamicProps {
  hivePerMVests: number;
  base: number;
  quote: number;
  fundRewardBalance: number;
  fundRecentClaims: number;
  hbdPrintRate: number;
  hbdInterestRate: number;
  headBlock: number;
  totalVestingFund: number;
  totalVestingShares: number;
  virtualSupply: number;
  vestingRewardPercent: number;
  accountCreationFee: string;
}

export type State = DynamicProps;

export enum ActionTypes {
  FETCHED = "@dynamic-props/FETCHED"
}

export interface FetchedAction {
  type: ActionTypes.FETCHED;
  props: DynamicProps;
}

export type Actions = FetchedAction; // |..|..æ
