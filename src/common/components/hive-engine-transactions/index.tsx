import React, { useEffect, useState } from 'react'
import { Button, FormControl } from 'react-bootstrap'
import { _t } from '../../i18n'
import { cashCoinSvg } from "../../img/svg";
import TwoUserAvatar from "../two-user-avatar";

import {
    getTransactions,
    getOtherTransactions    
  } from "../../api/hive-engine";
import LinearProgress from '../linear-progress';

export const EngineTransactionList = (props: any) => {

    const { global, account, params } = props

    const [transactions, setTransactions] = useState([])
    const [otherTransactions, setOtherTransactions] = useState([])
    const [loading, setLoading] = useState(false);
    const [loadLimit, setLoadLimit] = useState(10)

    useEffect(() => {
        otherTokenTransactions();
        getMainTransactions()
    }, [])

    const getMainTransactions = async () => {
        const transactions = await getTransactions(params, account.name, 200);
        console.log(transactions)
        
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
        return date.toDateString();
    }

    const loadMore = () => {  
        const moreItems = loadLimit + 10;
        setLoadLimit(moreItems);
      };

      const optionChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        console.log(e.target)
      }

  return (
    <div className="transaction-list">
      <div className="transaction-list-header">
        <h2>{_t("transactions.title")} </h2>
        <FormControl as="select" value="group" onChange={optionChanged} >
          <option value="">{_t("transactions.group-all")}</option>
          {["transfers", "market-orders", "interests", "stake-operations", "rewards"].map((x) => (
            <option key={x} value={x}>
              {_t(`transactions.group-${x}`)}
            </option>
          ))}
        </FormControl>
      </div>
      {loading && <LinearProgress />}
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
          {!loading && otherTransactions.length > loadLimit && 
          <Button disabled={false} block={true} onClick={loadMore} className="mt-2">
            {_t("g.load-more")}
          </Button>}
    </div>
  )
}
