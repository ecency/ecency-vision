import React, { Component } from 'react';

import moment from 'moment';

import { History } from 'history';

import { FormControl, Button } from 'react-bootstrap';

import { DynamicProps } from '../../store/dynamic-props/types';
import { OperationGroup, Transaction, Transactions } from '../../store/transactions/types';
import { Account } from '../../store/accounts/types';

import LinearProgress from '../linear-progress';
import EntryLink from '../entry-link';

import parseAsset from '../../helper/parse-asset';
import parseDate from '../../helper/parse-date';
import { vestsToHp } from '../../helper/vesting';

import formattedNumber from '../../util/formatted-number';

import {
  ticketSvg,
  commentSvg,
  compareHorizontalSvg,
  cashMultiple,
  reOrderHorizontalSvg,
  pickAxeSvg,
  closeSvg,
  exchangeSvg,
  cashCoinSvg,
  powerDownSvg,
  powerUpSvg,
  starsSvg,
  chevronUpSvgForVote,
  chevronDownSvgForSlider,
  starSvg
} from '../../img/svg';

import { _t } from '../../i18n';
import { Tsx } from '../../i18n/helper';

interface RowProps {
  history: History;
  dynamicProps: DynamicProps;
  transaction: Transaction;
}

export class TransactionRow extends Component<RowProps> {
  render() {
    const { dynamicProps, transaction: tr } = this.props;
    const { hivePerMVests } = dynamicProps;

    let flag = false;
    let icon = ticketSvg;
    let numbers = null;
    let details = null;

    if (tr.type === 'curation_reward') {
      flag = true;
      icon = cashCoinSvg;

      numbers = (
        <>
          {formattedNumber(vestsToHp(parseAsset(tr.reward).amount, hivePerMVests), {
            suffix: 'HP'
          })}
        </>
      );
      details = EntryLink({
        ...this.props,
        entry: {
          category: 'history',
          author: tr.comment_author,
          permlink: tr.comment_permlink
        },
        children: (
          <span>
            {'@'}
            {tr.comment_author}/{tr.comment_permlink}
          </span>
        )
      });
    }

    if (tr.type === 'author_reward' || tr.type === 'comment_benefactor_reward') {
      flag = true;
      icon = cashCoinSvg;

      const hbd_payout = parseAsset(tr.hbd_payout);
      const hive_payout = parseAsset(tr.hive_payout);
      const vesting_payout = parseAsset(tr.vesting_payout);
      numbers = (
        <>
          {hbd_payout.amount > 0 && (
            <span className="number">{formattedNumber(hbd_payout.amount, { suffix: 'HBD' })}</span>
          )}
          {hive_payout.amount > 0 && (
            <span className="number">
              {formattedNumber(hive_payout.amount, { suffix: 'HIVE' })}
            </span>
          )}
          {vesting_payout.amount > 0 && (
            <span className="number">
              {formattedNumber(vestsToHp(vesting_payout.amount, hivePerMVests), { suffix: 'HP' })}{' '}
            </span>
          )}
        </>
      );

      details = EntryLink({
        ...this.props,
        entry: {
          category: 'history',
          author: tr.author,
          permlink: tr.permlink
        },
        children: (
          <span>
            {'@'}
            {tr.author}/{tr.permlink}
          </span>
        )
      });
    }

    if (tr.type === 'comment_benefactor_reward') {
      icon = commentSvg;
    }

    if (tr.type === 'claim_reward_balance') {
      flag = true;

      const reward_hbd = parseAsset(tr.reward_hbd);
      const reward_hive = parseAsset(tr.reward_hive);
      const reward_vests = parseAsset(tr.reward_vests);

      numbers = (
        <>
          {reward_hbd.amount > 0 && (
            <span className="number">{formattedNumber(reward_hbd.amount, { suffix: 'HBD' })}</span>
          )}
          {reward_hive.amount > 0 && (
            <span className="number">
              {formattedNumber(reward_hive.amount, { suffix: 'HIVE' })}
            </span>
          )}
          {reward_vests.amount > 0 && (
            <span className="number">
              {formattedNumber(vestsToHp(reward_vests.amount, hivePerMVests), { suffix: 'HP' })}
            </span>
          )}
        </>
      );
    }

    if (
      tr.type === 'transfer' ||
      tr.type === 'transfer_to_vesting' ||
      tr.type === 'transfer_to_savings'
    ) {
      flag = true;
      icon = tr.type === 'transfer_to_vesting' ? powerUpSvg : compareHorizontalSvg;

      details = (
        <span>
          {tr.memo ? (
            <>
              {tr.memo} <br /> <br />
            </>
          ) : null}
          <>
            <strong>@{tr.from}</strong> -&gt; <strong>@{tr.to}</strong>
          </>
        </span>
      );

      numbers = <span className="number">{tr.amount}</span>;
    }

    if (tr.type === 'recurrent_transfer' || tr.type === 'fill_recurrent_transfer') {
      flag = true;
      icon = compareHorizontalSvg;

      details = (
        <span>
          {tr.memo ? (
            <>
              {tr.memo} <br /> <br />
            </>
          ) : null}
          {tr.type === 'recurrent_transfer' ? (
            <>
              <Tsx
                k="transactions.type-recurrent_transfer-detail"
                args={{ executions: tr.executions, recurrence: tr.recurrence }}
              >
                <span />
              </Tsx>
              <br />
              <br />
              <strong>@{tr.from}</strong> -&gt; <strong>@{tr.to}</strong>
            </>
          ) : (
            <>
              <Tsx
                k="transactions.type-fill_recurrent_transfer-detail"
                args={{ remaining_executions: tr.remaining_executions }}
              >
                <span />
              </Tsx>
              <br />
              <br />
              <strong>@{tr.from}</strong> -&gt; <strong>@{tr.to}</strong>
            </>
          )}
        </span>
      );
      let aam = tr.amount;
      if (tr.type === 'fill_recurrent_transfer') {
        const t = parseAsset(tr.amount);
        aam = `${t.amount} ${t.symbol}`;
      }
      numbers = <span className="number">{aam}</span>;
    }

    if (tr.type === 'cancel_transfer_from_savings') {
      flag = true;
      icon = closeSvg;

      details = (
        <Tsx
          k="transactions.type-cancel_transfer_from_savings-detail"
          args={{ from: tr.from, request: tr.request_id }}
        >
          <span />
        </Tsx>
      );
    }

    if (tr.type === 'withdraw_vesting') {
      flag = true;
      icon = powerDownSvg;

      const vesting_shares = parseAsset(tr.vesting_shares);
      numbers = (
        <span className="number">
          {formattedNumber(vestsToHp(vesting_shares.amount, hivePerMVests), { suffix: 'HP' })}
        </span>
      );

      details = tr.acc ? (
        <span>
          <strong>@{tr.acc}</strong>
        </span>
      ) : null;
    }

    if (tr.type === 'delegate_vesting_shares') {
      flag = true;
      icon = starSvg;

      const vesting_shares = parseAsset(tr.vesting_shares);
      numbers = (
        <span className="number">
          {formattedNumber(vestsToHp(vesting_shares.amount, hivePerMVests), { suffix: 'HP' })}
        </span>
      );

      details = tr.delegatee ? (
        <span>
          <>
            <strong>@{tr.delegator}</strong> -&gt; <strong>@{tr.delegatee}</strong>
          </>
        </span>
      ) : null;
    }

    if (tr.type === 'fill_vesting_withdraw') {
      flag = true;
      icon = powerDownSvg;

      numbers = <span className="number">{tr.deposited}</span>;

      details = tr.from_account ? (
        <span>
          <strong>
            @{tr.from_account} -&gt; @{tr.to_account}
          </strong>
        </span>
      ) : null;
    }

    if (tr.type === 'fill_order') {
      flag = true;
      icon = reOrderHorizontalSvg;

      numbers = (
        <span className="number">
          {tr.current_pays} = {tr.open_pays}
        </span>
      );
    }

    if (tr.type === 'limit_order_create') {
      flag = true;
      icon = reOrderHorizontalSvg;

      numbers = (
        <span className="number">
          {tr.amount_to_sell} = {tr.min_to_receive}
        </span>
      );
    }

    if (tr.type === 'producer_reward') {
      flag = true;
      icon = pickAxeSvg;

      numbers = (
        <>
          {formattedNumber(vestsToHp(parseAsset(tr.vesting_shares).amount, hivePerMVests), {
            suffix: 'HP'
          })}
        </>
      );
    }

    if (tr.type === 'interest') {
      flag = true;
      icon = cashMultiple;

      numbers = <span className="number">{tr.interest}</span>;
    }

    if (tr.type === 'fill_convert_request') {
      flag = true;
      icon = reOrderHorizontalSvg;

      numbers = (
        <span className="number">
          {tr.amount_in} = {tr.amount_out}
        </span>
      );
    }

    if (tr.type === 'fill_collateralized_convert_request') {
      flag = true;
      icon = reOrderHorizontalSvg;

      numbers = (
        <span className="number">
          {tr.amount_in} = {tr.amount_out}
        </span>
      );
      details = (
        <Tsx
          k="transactions.type-fill_collateralized_convert-detail"
          args={{ request: tr.requestid, returned: tr.excess_collateral }}
        >
          <span />
        </Tsx>
      );
    }

    if (tr.type === 'return_vesting_delegation') {
      flag = true;
      icon = powerUpSvg;

      numbers = (
        <>
          {formattedNumber(vestsToHp(parseAsset(tr.vesting_shares).amount, hivePerMVests), {
            suffix: 'HP'
          })}
        </>
      );
    }

    if (tr.type === 'proposal_pay') {
      flag = true;
      icon = ticketSvg;

      numbers = <span className="number">{tr.payment}</span>;
    }

    if (tr.type === 'update_proposal_votes') {
      flag = true;
      icon = tr.approve ? chevronUpSvgForVote : chevronDownSvgForSlider;

      details = (
        <Tsx k="transactions.type-update_proposal_vote-detail" args={{ pid: tr.proposal_ids }}>
          <span />
        </Tsx>
      );
    }

    if (tr.type === 'comment_payout_update') {
      flag = true;
      icon = starsSvg;

      details = EntryLink({
        ...this.props,
        entry: {
          category: 'history',
          author: tr.author,
          permlink: tr.permlink
        },
        children: (
          <span>
            {'@'}
            {tr.author}/{tr.permlink}
          </span>
        )
      });
    }

    if (tr.type === 'comment_reward') {
      flag = true;
      icon = cashCoinSvg;

      const payout = parseAsset(tr.payout);

      numbers = (
        <>
          {payout.amount > 0 && (
            <span className="number">{formattedNumber(payout.amount, { suffix: 'HBD' })}</span>
          )}
        </>
      );

      details = EntryLink({
        ...this.props,
        entry: {
          category: 'history',
          author: tr.author,
          permlink: tr.permlink
        },
        children: (
          <span>
            {'@'}
            {tr.author}/{tr.permlink}
          </span>
        )
      });
    }

    if (tr.type === 'collateralized_convert') {
      flag = true;
      icon = exchangeSvg;
      const amount = parseAsset(tr.amount);

      numbers = (
        <>
          {amount.amount > 0 && (
            <span className="number">{formattedNumber(amount.amount, { suffix: 'HIVE' })}</span>
          )}
        </>
      );

      details = (
        <Tsx k="transactions.type-collateralized_convert-detail" args={{ request: tr.requestid }}>
          <span />
        </Tsx>
      );
    }

    if (tr.type === 'effective_comment_vote') {
      flag = true;

      const payout = parseAsset(tr.pending_payout);

      numbers = (
        <>
          {payout.amount > 0 && (
            <span className="number">{formattedNumber(payout.amount, { suffix: 'HBD' })}</span>
          )}
        </>
      );

      details = EntryLink({
        ...this.props,
        entry: {
          category: 'history',
          author: tr.author,
          permlink: tr.permlink
        },
        children: (
          <span>
            {'@'}
            {tr.author}/{tr.permlink}
          </span>
        )
      });
    }

    if (flag) {
      const transDate = parseDate(tr.timestamp);

      return (
        <div className="transaction-list-item">
          <div className="transaction-icon">{icon}</div>
          <div className="transaction-title">
            <div className="transaction-name">{_t(`transactions.type-${tr.type}`)}</div>
            <div className="transaction-date">{moment(transDate).fromNow()}</div>
          </div>
          <div className="transaction-numbers">{numbers}</div>
          <div className="transaction-details">{details}</div>
        </div>
      );
    }

    return (
      <div className="transaction-list-item transaction-list-item-raw">
        <div className="raw-code">{JSON.stringify(tr)}</div>
      </div>
    );
  }
}

interface Props {
  history: History;
  dynamicProps: DynamicProps;
  transactions: Transactions;
  account: Account;
  fetchTransactions: (
    username: string,
    group?: OperationGroup | '',
    start?: number,
    limit?: number
  ) => void;
}

interface State {
  loadingLoadMore: boolean;
  transactionsList: any[];
}

export class TransactionList extends Component<Props> {
  state: State = {
    loadingLoadMore: false,
    transactionsList: []
  };

  componentDidMount() {
    const { account, fetchTransactions } = this.props;
    account && account.name && fetchTransactions(account.name);
  }

  componentDidUpdate(prevProps: any) {
    const { transactionsList } = this.state;
    const { transactions } = this.props;
    if (prevProps.transactions.list !== transactions.list) {
      const new_transactions = [
        ...(prevProps.transactions.group === transactions.group ? transactionsList : []),
        ...transactions.list
      ];
      this.setState({ transactionsList: new_transactions });
    }
  }

  typeChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { account, fetchTransactions } = this.props;
    const group = e.target.value;

    this.setState({ ...this.state });

    fetchTransactions(account.name, group as OperationGroup);
  };

  loadMore = () => {
    const {
      account,
      fetchTransactions,
      transactions: { list, group }
    } = this.props;
    if (list.length > 0) {
      const last_num = list[list.length - 1].num - 1;
      fetchTransactions(account.name, group as OperationGroup, last_num);
    }
  };

  render() {
    const { loadingLoadMore, transactionsList } = this.state;
    const { transactions } = this.props;
    const { list, loading, group } = transactions;

    const hasMore = !loading && list.length > 0;

    return (
      <div className="transaction-list">
        <div className="transaction-list-header">
          <h2>{_t('transactions.title')} </h2>
          <FormControl as="select" value={group} onChange={this.typeChanged}>
            <option value="">{_t('transactions.group-all')}</option>
            {['transfers', 'market-orders', 'interests', 'stake-operations', 'rewards'].map((x) => (
              <option key={x} value={x}>
                {_t(`transactions.group-${x}`)}
              </option>
            ))}
          </FormControl>
        </div>
        {loading && <LinearProgress />}
        {transactionsList.map((x, k) => (
          <TransactionRow {...this.props} key={k} transaction={x} />
        ))}
        {!loading && transactionsList.length === 0 && (
          <p className="text-muted empty-list">{_t('g.empty-list')}</p>
        )}
        {!loading && hasMore && transactionsList.length > 0 && (
          <Button disabled={loadingLoadMore} block={true} onClick={this.loadMore} className="mt-2">
            {_t('g.load-more')}
          </Button>
        )}
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    dynamicProps: p.dynamicProps,
    transactions: p.transactions,
    account: p.account,
    fetchTransactions: p.fetchTransactions
  };

  return <TransactionList {...props} />;
};
