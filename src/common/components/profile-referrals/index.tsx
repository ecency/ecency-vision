import React from 'react';

import { History } from 'history';

import isEqual from 'react-fast-compare';

import { Global } from '../../store/global/types';
import { Account } from '../../store/accounts/types';
import { ActiveUser } from '../../store/active-user/types';
import { FormControl } from 'react-bootstrap';
import { DynamicProps } from '../../store/dynamic-props/types';
import { OperationGroup, Transactions } from '../../store/transactions/types';
import BaseComponent from '../base';
import UserAvatar from '../user-avatar';
import ProfileLink from '../profile-link';
import MyPagination from '../pagination';
import Transfer, { TransferMode, TransferAsset } from '../transfer';
import LinearProgress from '../linear-progress';
import { shareVariantSvg } from '../../img/svg';
import {
  getReferrals,
  ReferralItem,
  getReferralsStats,
  ReferralStat,
} from '../../api/private-api';
import SearchBox from '../search-box';
// import clipboard from '../../util/clipboard';

import { _t } from '../../i18n';
import { success } from '../feedback';
import { Tsx } from '../../i18n/helper';
import moment from 'moment';

interface Props {
  history: History;
  global: Global;
  dynamicProps: DynamicProps;
  activeUser: ActiveUser | null;
  transactions: Transactions;
  account: Account;
  signingKey: string;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
  setSigningKey: (key: string) => void;
  fetchTransactions: (username: string, group?: OperationGroup | '') => void;
  fetchPoints: (username: string, type?: number) => void;
  updateWalletValues: () => void;
}

interface State {
  referrals: ReferralItem[];
  claimed_points: number;
  pending_points: number;
  filteredReferrals: ReferralItem[];
  filter: string;
  proxy: string | null;
  transfer: boolean;
  referred: string;
  transferMode: null | TransferMode;
  transferAsset: null | TransferAsset;
  loading: boolean;
  page: number;
}

export class ProfileReferrals extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    referred: '',
    filteredReferrals: [],
    filter: '',
    referrals: [],
    claimed_points: 0,
    pending_points: 0,
    proxy: '',
    transfer: false,
    transferAsset: 'HP',
    transferMode: 'delegate',
    page: 1,
  };
  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<{}>,
    snapshot?: any,
  ) {
    const { activeUser, account, history } = this.props;
    if (!activeUser || activeUser.username !== account.name) {
      history.push(`/@${account.name}`);
    }
  }

  componentDidMount() {
    this.load();
  }

  shouldComponentUpdate(
    nextProps: Readonly<Props>,
    nextState: Readonly<State>,
  ): boolean {
    return (
      !isEqual(this.props.account, nextProps.account) ||
      !isEqual(this.props.activeUser, nextProps.activeUser) ||
      !isEqual(this.state, nextState)
    );
  }

  load = async () => {
    this.stateSet({ loading: true });
    await this.getReferrals();
    await this._getReferralsStats();
  };

  getReferrals = async () => {
    try {
      const { activeUser } = this.props;
      // Fetch referrals
      const data = await getReferrals(activeUser?.username);
      this.stateSet({ referrals: data.data, loading: false });
    } catch (error) {
      console.log('Something went wrong: ', error);
    }
  };
  _getReferralsStats = async () => {
    const { activeUser } = this.props;
    const referralStats = await getReferralsStats(activeUser?.username);
    const earnedPoints = referralStats.rewarded * 100;
    const unearnedPoints = (referralStats.total - referralStats.rewarded) * 100;
    this.stateSet({
      claimed_points: earnedPoints,
      pending_points: unearnedPoints,
      loading: false,
    });
  };
  filterChanged = (
    e: React.ChangeEvent<typeof FormControl & HTMLInputElement>,
  ) => {
    this.setState({ filter: e.target.value });
    this.handleFilteredReferral(e.target.value);
  };
  copyToClipboard = (text: string) => {
    const textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    success(_t('profile-edit.copied'));
  };

  handleFilteredReferral = (username: string) => {
    const filteredRef = this.state.referrals.filter((item) => {
      return item.username.includes(username);
    });
    this.setState({ filteredReferrals: filteredRef });
  };

  openTransferDialog = (
    mode: TransferMode,
    asset: TransferAsset,
    user: string,
  ) => {
    this.stateSet({
      transfer: true,
      transferMode: mode,
      transferAsset: asset,
      referred: user,
    });
  };

  closeTransferDialog = () => {
    this.stateSet({ transfer: false, transferMode: null, transferAsset: null });
  };

  render() {
    const { global, activeUser } = this.props;
    const { referrals, filteredReferrals, filter, loading, page } = this.state;
    const pageSize = 8;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const sliced = referrals.slice(start, end);

    const table = (
      <>
        {filteredReferrals.length < 1 && filter.length > 0 ? (
          <h2 className='d-flex'>
            {_t('referral.filter-not-found', { filter })}
            {/* {_t('sign-up.success', { email })} */}
          </h2>
        ) : (
          <table className='table d-none d-sm-block d-flex flex-column'>
            <thead>
              <tr>
                <th className='col-rank'>{_t('referral.created')}</th>
                <th>{_t('referral.list-referral')}</th>
                <th className='col-version'>{_t('referral.rewarded')}</th>
                <th className='col-version'></th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length > 0 && filter.length > 0
                ? filteredReferrals.map((row, i) => {
                    var dateObj = new Date(row.created);
                    var momentObj = moment(dateObj);
                    var createdAt = momentObj.format('YYYY/MM/DD');
                    return (
                      <tr key={i}>
                        <td className='col-rank'>
                          <div className='witness-rank'>
                            <span className='rank-number'>{createdAt}</span>
                          </div>
                        </td>
                        <td>
                          {ProfileLink({
                            history: this.props.history,
                            addAccount: () => {},
                            username: row.username,
                            children: (
                              <a className='d-flex align-center gap-2'>
                                {UserAvatar({
                                  global: global,
                                  size: 'medium',
                                  username: row.username,
                                })}
                                <span className='d-block align-self-center ml-2'>
                                  {row.username}
                                </span>
                              </a>
                            ),
                          })}
                        </td>

                        <td className='align-middle'>
                          <span className='bg-secondary reward-wrapper py-1 px-3 circle'>
                            {row.rewarded === 0 ? 'No' : 'Yes'}
                          </span>
                        </td>
                        <td className='delegate-button'>
                          <button
                            className='btn btn-sm btn-primary'
                            onClick={() =>
                              this.openTransferDialog(
                                'delegate',
                                'HP',
                                row.username,
                              )
                            }
                          >
                            Delegate HP
                          </button>
                        </td>
                      </tr>
                    );
                  })
                : sliced.map((row, i) => {
                    var dateObj = new Date(row.created);
                    var momentObj = moment(dateObj);
                    var createdAt = momentObj.format('YYYY/MM/DD');
                    return (
                      <tr key={i}>
                        <td>
                          <div className='witness-rank'>
                            <span className='rank-number'>{createdAt}</span>
                          </div>
                        </td>
                        <td>
                          {ProfileLink({
                            history: this.props.history,
                            addAccount: () => {},
                            username: row.username,
                            children: (
                              <a className='d-flex align-center gap-2'>
                                {UserAvatar({
                                  global: global,
                                  size: 'medium',
                                  username: row.username,
                                })}
                                <span className='d-block align-self-center ml-2'>
                                  {row.username}
                                </span>
                              </a>
                            ),
                          })}
                        </td>

                        <td className='align-middle'>
                          <span className='bg-secondary reward-wrapper py-1 px-3 circle'>
                            {row.rewarded === 0 ? 'No' : 'Yes'}
                          </span>
                        </td>
                        <td className='delegate-button'>
                          <button
                            className='btn btn-sm btn-primary'
                            onClick={() =>
                              this.openTransferDialog(
                                'delegate',
                                'HP',
                                row.username,
                              )
                            }
                          >
                            Delegate HP
                          </button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        )}
        <div className='d-md-none'>
          {/* Mobile Screen */}
          {/* {referrals.map((row, i) => {
            return <ReferralCard
                    referral={row.name}
                    row={row}
                    key={i}
                    global={global}
                    />
        })} */}
        </div>
        {this.state.transfer && (
          <Transfer
            {...this.props}
            activeUser={this.props.activeUser!}
            to={this.state.referred}
            mode={this.state.transferMode!}
            asset={this.state.transferAsset!}
            onHide={this.closeTransferDialog}
          />
        )}
      </>
    );

    const header = (
      <div className='page-header mt-2 mb-2'>
        <div className='header-title text-left'>
          {_t('referral.page-title')}
        </div>

        <div className='d-flex mt-2'>
          <div>
            <h5 className='header-title text-left'>
              {this.state.claimed_points}
            </h5>
            <h6 className=' text-left'>Earned Points</h6>
          </div>
          <div>
            <h5 className='header-title text-left ml-3'>
              {this.state.pending_points}
            </h5>
            <h6 className=' text-left ml-3'>Pending Points</h6>
          </div>
          <div className='ml-5'>
            <button
              onClick={() =>
                this.copyToClipboard(
                  `https://ecency.com/signup?referral=${activeUser!.username}`,
                )
              }
              className='btn btn-primary'
            >
              Copy Link {shareVariantSvg}
            </button>
          </div>
        </div>
        <Tsx k='referral.page-description-long'>
          <div className='header-description text-left' />
        </Tsx>
        {/* <div className='w-25 mt-3'>
          <SearchBox
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            spellCheck='false'
            placeholder={_t('emoji-picker.filter-placeholder')}
            value={this.state.filter}
            onChange={this.filterChanged}
          />
        </div> */}
      </div>
    );
    let containerClasses = global.isElectron ? ' mt-0 pt-6' : '';
    if (activeUser) {
      return (
        <div
          className={'app-content witnesses-page mt-0 mx-0' + containerClasses}
        >
          {(() => {
            if (loading) {
              return (
                <>
                  {header}
                  <LinearProgress />
                </>
              );
            }

            return (
              <>
                {header}
                <div className='table-responsive witnesses-table'>{table}
                
                <MyPagination
                  className='mt-4'
                  dataLength={referrals.length}
                  pageSize={20}
                  maxItems={4}
                  page={page}
                  onPageChange={(page: number) => {
                    this.stateSet({ page });
                  }}
                />
                </div>
              </>
            );
          })()}
        </div>
      );
    }
    return null;
  }
}

export default (p: Props) => {
  const props: Props = {
    updateWalletValues: p.updateWalletValues,
    global: p.global,
    history: p.history,
    activeUser: p.activeUser,
    account: p.account,
    dynamicProps: p.dynamicProps,
    transactions: p.transactions,
    signingKey: p.signingKey,
    addAccount: p.addAccount,
    updateActiveUser: p.updateActiveUser,
    setSigningKey: p.setSigningKey,
    fetchTransactions: p.fetchTransactions,
    fetchPoints: p.fetchPoints,
  };

  return <ProfileReferrals {...props} />;
};
