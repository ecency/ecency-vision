import {
  HEUnstakeDone,
  UnstakeDone,
  HETokensUnstake,
  TokensUnstake,
  HEFineTransaction,
  HEAuthorReward,
  HECurationReward,
  AuthorReward,
  CurationReward,
  TokensIssue,
  HETokensIssue,
  HECoarseTransaction,
  HETokensTransfer,
  Transfer,
  Transaction,
  HECoarseBaseTransaction,
  MarketSell,
  HEMarketSell,
  TransferToVesting,
  HETokensStake,
  UnstakeStart,
  HEUnstakeStart,
  HECancelUnstake,
  CancelUnstake,
  HEMarketPlaceOrder,
  MarketPlaceOrder,
  HEMarketCancel,
  MarketCancel,
  validateOrderType,
  HEMarketExpire,
  MarketExpire
} from "./types";
import FormattedNumber from "../../util/formatted-number";
import { HIVE_HUMAN_NAME } from "../../api/hive";
export const HEFineTransactionToHiveTransactions = (r: Array<HEFineTransaction>) => {
  try {
    const mapped: Transaction[] = r.map((x: HEFineTransaction): AuthorReward | CurationReward => {
      const { id, type, timestamp, trx } = x;
      if (x.type == "curation_reward") {
        const y: HECurationReward = x as HECurationReward;
        const z: CurationReward = {
          type: "curation_reward",
          num: id,
          timestamp,
          trx_id: "",
          comment_author: x.author,
          comment_permlink: x.permlink,
          curator: x.account,
          reward: FormattedNumber(x.int_amount * Math.pow(10, -x.precision), {
            maximumFractionDigits: x.precision,
            suffix: x.token
          })
        };
        return z;
      } else if (x.type === "author_reward") {
        const y: HEAuthorReward = x as HEAuthorReward;
        const z: AuthorReward = {
          author: x.author,
          num: id,
          type: "author_reward",
          timestamp,
          trx_id: "",
          permlink: x.permlink,
          he_payout: FormattedNumber(x.int_amount * Math.pow(10, -x.precision), {
            maximumFractionDigits: x.precision,
            suffix: x.token
          }),
          hbd_payout: "0",
          hive_payout: "0",
          vesting_payout: "0 VESTS"
        };
        return z;
      }
      return {
        type: "curation_reward",
        num: 9,
        timestamp: "2070-01-01T00:00:00Z",
        trx_id: "",
        comment_author: "null",
        comment_permlink: type,
        curator: "null",
        reward: "0 POB"
      };
    });
    const transactions: Transaction[] = mapped
      .filter((x) => x !== null)
      .sort((a: any, b: any) => b.num - a.num);
    return transactions;
  } catch (e) {
    console.log(e);
  }
  return [];
};
export function HEB2B(t: HECoarseBaseTransaction): {
  num: number;
  trx_id: string;
  timestamp: string;
} {
  const { _id, symbol, transactionId, timestamp, operation } = t;
  const d = new Date(1000 * t.timestamp);
  const b = Buffer.from(_id, "hex");
  const ret = {
    num: b.readInt32LE(0),
    trx_id: transactionId,
    timestamp: d.toISOString().split(".")[0]
  };
  return ret;
}
export function HEToHTokensUnstake(x: HETokensUnstake): TokensUnstake {
  const t: TokensUnstake = {
    type: "tokens_unstake",
    ...HEB2B(x),
    amount: FormattedNumber(x.quantity, { suffix: x.symbol }),
    account: x.account
  };
  return t;
}
export function HEToHTransfer(x: HETokensTransfer): Transfer {
  const t: Transfer = {
    type: "transfer",
    ...HEB2B(x),
    amount: FormattedNumber(x.quantity, { suffix: x.symbol }),
    from: x.from,
    to: x.to,
    memo: x.memo || ""
  };
  return t;
}
export function HEtoHTokensIssue(het: HETokensIssue): TokensIssue {
  const ht = {
    type: "tokens_issue",
    ...HEB2B(het),
    to: het.to,
    amount: FormattedNumber(het.quantity, { suffix: het.symbol })
  };
  // @ts-ignore
  return ht;
}
export function HETokensStakeToTransferToVesting(het: HETokensStake): TransferToVesting {
  const ht: TransferToVesting = {
    ...HEB2B(het),
    type: "transfer_to_vesting",
    amount: FormattedNumber(het.quantity, { suffix: het.symbol }),
    from: het.from,
    to: het.to
  };
  return ht;
}
export function HEToHMarketSell(het: HEMarketSell, fractionDigits: number = 8): MarketSell {
  const { account, to, quantityHive, quantityTokens } = het;
  return {
    type: "market_sell",
    ...HEB2B(het),
    account,
    to,
    base: FormattedNumber(het.quantityHive, {
      fractionDigits: 3,
      suffix: HIVE_HUMAN_NAME
    }),
    quote: quantityTokens
      ? FormattedNumber(quantityTokens, {
          fractionDigits,
          suffix: het.symbol
        })
      : "0"
  };
}
export function HEToHUnstakeStart(t: HEUnstakeStart, fractionDigits = 8): UnstakeStart {
  return {
    type: "tokens_unstakeStart",
    ...HEB2B(t),
    account: t.account,
    amount: FormattedNumber(t.quantity, { fractionDigits, suffix: t.symbol })
  };
}
export function HEToHUnstakeDone(t: HEUnstakeDone, fractionDigits = 8): UnstakeDone {
  return {
    type: "tokens_unstakeDone",
    ...HEB2B(t),
    account: t.account,
    amount: FormattedNumber(t.quantity, { fractionDigits, suffix: t.symbol })
  };
}
export function HEToHCancelUnstake(t: HECancelUnstake): CancelUnstake {
  return {
    type: "tokens_CancelUnstake",
    ...HEB2B(t),
    unstakeTxID: t.unstakeTxID,
    amount: FormattedNumber(t.quantityReturned, {
      maximumFractionDigits: 8,
      suffix: t.symbol
    })
  };
}
export function HEToHMarketPlaceOrder(t: HEMarketPlaceOrder): MarketPlaceOrder {
  const { account, orderType, price, quantityLocked, symbol } = t;
  validateOrderType(orderType);
  const ret: MarketPlaceOrder = {
    type: "market_placeOrder",
    ...HEB2B(t),
    account,
    orderType: orderType as "buy" | "sell",
    price: price
      ? FormattedNumber(price, {
          maximumFractionDigits: 16,
          minimumFractionDigits: 0,
          suffix: symbol + "/" + HIVE_HUMAN_NAME
        })
      : price,
    quantityLocked: FormattedNumber(quantityLocked, {
      maximumFractionDigits: 16,
      minimumFractionDigits: 0,
      suffix: orderType === "buy" ? HIVE_HUMAN_NAME : symbol
    })
  };
  return ret;
}
function HEToHMarketCancel(t: HEMarketCancel): MarketCancel {
  const { orderId, orderType, account, quantityReturned } = t;
  validateOrderType(orderType);
  return {
    type: "market_cancel",
    ...HEB2B(t),
    account,
    orderId,
    orderType,
    amount: FormattedNumber(quantityReturned, { suffix: t.symbol })
  };
}
export function HEToHMarketExpire(t: HEMarketExpire): MarketExpire {
  const { symbol, orderID, orderType, quantityUnlocked } = t;
  validateOrderType(orderType);
  return {
    type: "market_expireOrder",
    amountUnlocked: FormattedNumber(quantityUnlocked, {
      suffix: symbol,
      maximumFractionDigits: 8
    }),
    orderID,
    orderType,
    ...HEB2B(t)
  };
}
export function HEToHTransaction(t: HECoarseTransaction): Transaction | null {
  switch (t.operation) {
    case "tokens_unstake":
      return HEToHTokensUnstake(t);
    case "tokens_transfer":
      return HEToHTransfer(t);
    case "tokens_issue":
      return HEtoHTokensIssue(t);
    case "tokens_stake":
      return HETokensStakeToTransferToVesting(t);
    case "market_sell":
      return HEToHMarketSell(t);
    case "tokens_unstakeStart":
      return HEToHUnstakeStart(t);
    case "tokens_unstakeDone":
      return HEToHUnstakeDone(t);
    case "tokens_cancelUnstake":
      return HEToHCancelUnstake(t);
    case "market_placeOrder":
      return HEToHMarketPlaceOrder(t);
    case "market_cancel":
      return HEToHMarketCancel(t);
    case "tokens_undelegateDone":
      return {
        type: "tokens_undelegateDone",
        ...HEB2B(t),
        account: t.account
      };
    case "tokens_undelegateStart":
      return {
        type: "tokens_undelegateStart",
        ...HEB2B(t),
        account: t.account,
        from: t.from,
        amount: FormattedNumber(t.quantity, { suffix: t.symbol })
      };
    case "tokens_delegate":
      return {
        type: "tokens_delegate",
        ...HEB2B(t),
        account: t.account,
        to: t.to,
        amount: FormattedNumber(t.quantity, { suffix: t.symbol })
      };
    case "market_closeOrder":
      return {
        type: "market_closeOrder",
        orderType: t.orderType,
        ...HEB2B(t)
      };
    case "market_buy":
      return {
        type: "market_buy",
        ...HEB2B(t),
        account: t.account,
        from: t.from,
        base: FormattedNumber(t.quantityHive ?? "0", { suffix: HIVE_HUMAN_NAME }),
        quote: FormattedNumber(t.quantityTokens, { suffix: t.symbol })
      };
    case "market_expire":
      return HEToHMarketExpire(t);
  } // switch
  console.log("unhandled type:", t.operation, t);
  //throw Error("Unhandled type:" + t.operation);
  return null;
}
