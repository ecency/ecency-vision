import React, { useEffect, useState } from 'react'
import { Button, FormControl } from 'react-bootstrap'
import { _t } from '../../i18n'
import { cashCoinSvg } from "../../img/svg";
import TwoUserAvatar from "../two-user-avatar";
import { OperationGroup, Transaction, Transactions } from "../../store/transactions/types";
import { usePrevious } from "../../util/use-previous";
// import { fetchTransactions } from "../../../../store/transactions/fetchTransactions";
import { fetchTransactions } from '../../store/transactions';

import {
    getTransactions,
    getOtherTransactions    
  } from "../../api/hive-engine";
import LinearProgress from '../linear-progress';
import { dateToFullRelative } from "../../helper/parse-date";
import { DynamicProps } from '../../store/dynamic-props/types';
import { Account } from '../../store/accounts/types';

interface Props {
  history: History;
  global: Global;
  dynamicProps: DynamicProps;
  transactions: Transactions;
  account: Account;
  // fetchTransactions: (
  //   username: string,
  //   group?: OperationGroup | "",
  //   start?: number,
  //   limit?: number
  // ) => void;
}

export const EngineTransactionList = (props: any) => {
  
  const { global, account, params } = props

  const [loadingLoadMore, setLoadingLoadMore] = useState(false);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [otherTransactions, setOtherTransactions] = useState<any>([])
  const [loading, setLoading] = useState(false);
  const [loadLimit, setLoadLimit] = useState(10)
  
  const previousTransactions = usePrevious(props.transactions);
    
    useEffect(() => {
      const { account,
        //  fetchTransactions 
      } = props;
      account && account.name && fetchTransactions(account.name);
      otherTokenTransactions();
      getMainTransactions();
    }, []);
  
    useEffect(() => {
      const { transactions } = props;
      if (previousTransactions && previousTransactions.list !== transactions.list) {
        const txs = [
          ...(previousTransactions?.group === transactions?.group ? transactionsList : []),
          ...transactions.list
        ];
        console.log(txs)
        const uniqueTxs = [...new Map(txs.map((item) => [item["num"], item])).values()];
        console.log(uniqueTxs)
        setOtherTransactions(uniqueTxs);
      }
    }, [props.transactions]);
    
    const getMainTransactions = async () => {
        const transactions = await getTransactions(params.toUpperCase(), account.name, 200);
        const otherTransactions = await getOtherTransactions(account.name, 200, params.toUpperCase());
        const mappedTransactions = [...transactions, ...otherTransactions]
        const test = mappedTransactions.sort((a: any, b:any) => a.timestamp - b.timestamp)
        console.log(transactions)
        // console.log(otherTransactions) 
    };

    const otherTokenTransactions = async () => {
        setLoading(true)
        const otherTransactions = await getOtherTransactions(account.name, 200, params.toUpperCase());
        console.log(otherTransactions)
        setOtherTransactions(otherTransactions);
        setLoading(false)
    }

    const getTransactionTime = (timestamp: number) => {
        let date: any = new Date(timestamp * 1000)
        return dateToFullRelative(date.toJSON());
    };

    const loadMore = () => {  
        const moreItems = loadLimit + 10;
        setLoadLimit(moreItems);
      };

  const  optionChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { account, 
      // fetchTransactions 
    } = props;
    const group: any = e.target.value;

    // setLoadingLoadMore(loadingLoadMore);
    setOtherTransactions(otherTransactions);
    console.log(otherTransactions)

    console.log(group)

    fetchTransactions(account.name, group as OperationGroup);
  };

  return (
    <div className="transaction-list">
      <div className="transaction-list-header">
        <h2>{_t("transactions.title")} </h2>
        <FormControl as="select" value={props.transactions?.group} onChange={ optionChanged}>
          <option value="">{_t("transactions.group-all")}</option>
          {["transfers", "market-orders", "interests", "stake-operations", "rewards"].map((x) => (
            <option key={x} value={x}>
              {_t(`transactions.group-${x}`)}
            </option>
          ))}
        </FormControl>
      </div>
      {otherTransactions?.slice(0, loadLimit).map((t: any) => {
        return ( 
          otherTransactions?.length === 0 ? <p key={t?.id} className="text-muted empty-list">{_t("g.empty-list")}</p> :
        <div className="transaction-list-item" key={t?.id}>
          <div className="transaction-icon">
            {t?.operation === "tokens_transfer" || t?.operation === "tokens_stake" || t?.operation === "tokens_delegate" ? 
            TwoUserAvatar({ global: global, from: t?.from, to: t?.to, size: "small" }) :
             cashCoinSvg }
          </div>
          <div className="transaction-title">
            <div className="transaction-name">{t?.operation.replace("_", " ")}</div>
            <div className="transaction-date">{getTransactionTime(t?.timestamp)}</div>
          </div>
          <div className="transaction-numbers">{`${t?.quantity} ${t?.symbol}`}</div>
          <div className="transaction-details">
            {t?.memo}
            <p>
            {t?.operation === "tokens_transfer" ? 
            <span>                
                <strong>@{t.from}</strong> -&gt; <strong>@{t.to}</strong> 
            </span> : 
            <span>
                <strong>{`Txn Id: ${t.transactionId}`}</strong>
                <p className='mt-2'>
                <strong>{`Block Id: ${t.blockNumber}`}</strong>
                </p>
            </span>
            }
            </p>
          </div>
        </div>
        )
      })}
      {!props.transactions?.loading && transactionsList?.length === 0 && (
        <p className="text-muted empty-list">{_t("g.empty-list")}</p>
      )}
      {!props.transactions?.loading &&
        !props.transactions?.loading &&
        props.transactions?.list.length > 0 &&
        transactionsList?.length > 0 && (
          <Button disabled={loadingLoadMore} block={true} onClick={loadMore} className="mt-2">
            {_t("g.load-more")}
          </Button>
        )}
    </div>
  );
};
export default (p: Props) => {
  const props: Props = {
    history: p.history,
    global: p.global,
    dynamicProps: p.dynamicProps,
    transactions: p.transactions,
    account: p.account,
    // fetchTransactions: p.fetchTransactions
  };

  return <EngineTransactionList {...props} />;
};
